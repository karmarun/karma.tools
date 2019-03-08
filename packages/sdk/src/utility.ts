import * as xpr from './expression'
import * as mdl from './model'

export enum Tag {
  Model = '_model',
  Tag = '_tag',
  Role = '_role',
  Migration = '_migration',
  User = '_user',
  Expression = '_expression'
}

export enum Header {
  Codec = 'X-Karma-Codec',
  Signature = 'X-Karma-Signature'
}

export type ObjectMap<T = any> = {[key: string]: T}
export type ModelMap = ObjectMap<mdl.Model>

export function createModel(model: mdl.Model, key: string = 'this') {
  return createModels({[key]: model})
}

export function createModels(modelMap: ModelMap) {
  return xpr.tag(Tag.Model).createMultiple(
    mapObject(modelMap, model => {
      return (models: xpr.Scope) =>
        xpr.data(
          model.toDataConstructor(
            mapObject(modelMap, (_, key) => {
              return models.field(key)
            })
          )
        )
    })
  )
}

export function mapObject<T, R>(obj: ObjectMap<T>, mapper: (value: T, key: string) => R) {
  const mappedObject: ObjectMap<R> = {}

  for (const key in obj) {
    mappedObject[key] = mapper(obj[key], key)
  }

  return mappedObject
}
