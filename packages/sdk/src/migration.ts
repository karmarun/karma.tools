import * as xpr from './expression'
import {AdminSession} from './transport'
import {
  BuiltInTag,
  ObjectMap,
  Metarialized,
  objectValues,
  RefTuple,
  filterObject,
  mapStructure,
  mapStrings,
  mapObject
} from './utility'
import {MigrationError} from './error'

export type DatabaseImage = ObjectMap<ObjectMap<any>>
export type TagMap = ObjectMap<string>

export type TransformationFn = (
  image: DatabaseImage,
  oldTags: TagMap,
  newTags: TagMap
) => DatabaseImage

export async function migrate(
  sourceSession: AdminSession,
  targetSession: AdminSession,
  transformation: TransformationFn
) {
  await sourceSession.refresh()
  await targetSession.refresh()

  let image: DatabaseImage = {}
  const sourceModels: Metarialized[] = await sourceSession.do(
    xpr
      .tag(BuiltInTag.Model)
      .all()
      .mapList((_idx, arg) => arg.metarialize())
  )

  for (const ref of sourceModels.map(m => m.id)) {
    let offset = 0
    let more = true

    const id = ref[1]
    const length = 1000

    while (more) {
      const metarializedAll: Metarialized[] = await sourceSession.do(
        xpr
          .model(id)
          .all()
          .mapList((_idx, arg) => arg.metarialize())
          .slice(offset, length)
      )

      const contentMap: ObjectMap<any> = image[id] || {}

      metarializedAll.forEach(m => {
        contentMap[m.id[1]] = m.value
      })

      image[id] = contentMap

      if (metarializedAll.length < length) {
        more = false
      } else {
        offset += length
      }
    }
  }

  const oldTagMap: ObjectMap<string> = {}
  const oldTagModelID: string = (await sourceSession.do(xpr.tag(BuiltInTag.Tag)))[1]

  for (const key in image[oldTagModelID]) {
    const obj = image[oldTagModelID][key]
    oldTagMap[obj.tag] = obj.model[1]
  }

  const builtInTags: BuiltInTag[] = objectValues(BuiltInTag)
  const builtInIDs = objectValues(BuiltInTag).map(tag => oldTagMap[tag])

  const oldMetaModelID = oldTagMap[BuiltInTag.Model]
  const oldUserModelID = oldTagMap[BuiltInTag.User]
  const oldRoleModelID = oldTagMap[BuiltInTag.Role]

  image[oldMetaModelID] = filterObject(
    image[oldMetaModelID],
    (_, key) => builtInIDs.indexOf(key) === -1
  )

  image[oldTagModelID] = filterObject(
    image[oldTagModelID],
    value => builtInTags.indexOf(value.tag) === -1
  )

  image[oldUserModelID] = filterObject(image[oldUserModelID], value => value.username !== 'admin')
  image[oldRoleModelID] = filterObject(image[oldRoleModelID], value => value.name !== 'admins')

  await targetSession.resetDatabase()

  const targetTags: {model: RefTuple; tag: string}[] = await targetSession.do(
    xpr.tag(BuiltInTag.Tag).all()
  )
  const idRewriteMap: ObjectMap<string> = {}

  for (let obj of targetTags) {
    idRewriteMap[oldTagMap[obj.tag]] = obj.model[1]
  }

  image = mapStructure(image, value => {
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      let mapped: ObjectMap<any> = {}

      for (let key in value) {
        mapped[key in idRewriteMap ? idRewriteMap[key] : key] = value[key]
      }

      return mapped
    }

    if (typeof value === 'string') {
      value = value in idRewriteMap ? idRewriteMap[value] : value
    }

    return value
  })

  const newTagMap: ObjectMap<string> = {}

  for (let obj of targetTags) {
    newTagMap[obj.tag] = obj.model[1]
  }

  const newMetaModelID = newTagMap[BuiltInTag.Model]

  image = transformation(image, oldTagMap, newTagMap)

  const targetModels = targetTags.map(m => m.model[1])

  for (const id in image) {
    if (!(id in image[newMetaModelID]) && targetModels.indexOf(id) === -1) {
      throw new Error('content for id ' + id + ' provided but no corresponding model')
    }
  }

  let dependencyMap: ObjectMap<string[]> = {}

  for (const id in image[newMetaModelID]) {
    if (!(id in dependencyMap)) {
      dependencyMap[id] = []
    }

    mapStructure(image[newMetaModelID][id], value => {
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null &&
        Object.keys(value).length === 1
      ) {
        let caze = Object.keys(value)[0]
        if (caze === 'ref') {
          let deps = dependencyMap[id] || []
          if (deps.indexOf(value[caze][1]) === -1) {
            deps.push(value[caze][1])
          }
          dependencyMap[id] = deps
        }
      }
      return value
    })
  }

  const todo: ObjectMap<boolean> = {}

  for (const key in dependencyMap) {
    todo[key] = true
  }

  const done: ObjectMap<boolean> = {}

  for (const value of targetTags) {
    done[value.model[1]] = true
  }

  let topoOrder: string[] = []

  for (let i = 0, l = Object.keys(todo).length; i < l; i++) {
    for (const mid in todo) {
      if (dependencyMap[mid].every(d => d in done || d === mid)) {
        topoOrder.push(mid)
        done[mid] = true
        delete todo[mid]
      }
    }
  }

  if (Object.keys(todo).length > 0) {
    for (const id in todo) {
      console.log(id, dependencyMap[id].filter(d => !(d in done)))
    }
    throw new Error('cyclic model dependencies unsupported')
  }

  // Ensure default models included and in right order
  const defaultModels = [
    BuiltInTag.Model,
    BuiltInTag.Tag,
    BuiltInTag.Expression,
    BuiltInTag.Migration,
    BuiltInTag.Role,
    BuiltInTag.User
  ].map(tag => newTagMap[tag])

  dependencyMap[defaultModels[0]] = [defaultModels[0]]
  topoOrder = defaultModels.concat(topoOrder.filter(mid => defaultModels.indexOf(mid) === -1))

  for (const mid of topoOrder) {
    if (!(mid in image)) {
      image[mid] = {}
    }
  }

  const persistedIdMap: ObjectMap<string> = {}

  for (const mid of targetModels) {
    persistedIdMap[mid] = mid
  }

  for (const mid of topoOrder) {
    if (Object.keys(image[mid]).length === 0) {
      continue // Skip empty models
    }

    const chunks: ObjectMap<any>[] = []
    const selfReferential = mid in dependencyMap && dependencyMap[mid].indexOf(mid) !== -1

    if (selfReferential) {
      // Self-referential, need to post at once
      chunks.push(image[mid])
    } else {
      let chunk: ObjectMap<any> = {}
      let keys = Object.keys(image[mid])

      for (let i = 0, l = keys.length; i < l; i++) {
        chunk[keys[i]] = image[mid][keys[i]]

        if (i % 100 === 0 || i === l - 1) {
          if (Object.keys(chunk).length > 0) {
            chunks.push(chunk)
            chunk = {}
          }
        }
      }
    }

    let targetMid = ''
    if (mid in persistedIdMap) {
      targetMid = persistedIdMap[mid]
    } else {
      throw new Error('unexpected model id ' + mid)
    }

    const model = await targetSession.getModel(targetMid)

    for (let payload of chunks) {
      // Rewire refs
      payload = mapStrings(payload, str => (str in persistedIdMap ? persistedIdMap[str] : str))
      payload = mapObject(payload, value => (refs: xpr.Scope) => {
        return xpr.data(
          model
            .decode(value)
            .toDataConstructor()
            .transform(c => {
              if (c instanceof xpr.RefConstructor) {
                if (c.id in payload) {
                  return new xpr.ExprConstructor(refs.field(c.id))
                }
              }
              return c
            })
        )
      })

      const query = xpr.model(targetMid).createMultiple(payload)

      try {
        const map = await targetSession.do(query)
        for (const k in map) {
          persistedIdMap[k] = map[k][1]
        }
      } catch (err) {
        throw new MigrationError(err, query.toValue().toJSON())
      }
    }
  }

  return persistedIdMap
}
