import * as xpr from './expression'
import * as mdl from './model'

export enum BuiltInTag {
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

export enum Codec {
  JSON = 'json'
}

export enum Endpoint {
  Query = '/',
  Authenticate = '/auth',
  AdminReset = '/admin/reset',
  AdminImport = '/admin/import',
  AdminExport = '/admin/export'
}

export const adminUsername = 'admin'

export type ObjectMap<T = any> = {[key: string]: T}
export type ModelMap = ObjectMap<mdl.Model>
export type TagMap = ObjectMap<RefTuple>

export type RefTuple = [string, string]
export interface Metarialized<T = any> {
  id: RefTuple
  model: RefTuple
  created: string
  updated: string
  value: T
}

export function isRefTuple(ref: any): ref is RefTuple {
  return Array.isArray(ref) && typeof ref[0] === 'string' && typeof ref[1] === 'string'
}

export function createModel(model: mdl.Model, key: string = 'this') {
  return xpr.tag(BuiltInTag.Model).create(self => xpr.data(model.toDataConstructor({[key]: self})))
}

export function createTag(tag: string, modelRef: RefTuple) {
  return xpr.tag(BuiltInTag.Tag).create(() =>
    xpr.data(d =>
      d.struct({
        tag: d.string(tag),
        model: d.ref(modelRef)
      })
    )
  )
}

export function createModels(modelMap: ModelMap) {
  return xpr.tag(BuiltInTag.Model).createMultiple(
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

export function createTags(tagMap: TagMap) {
  return xpr.tag(BuiltInTag.Tag).createMultiple(
    mapObject(tagMap, (modelRef, tag) => {
      return () =>
        xpr.data(d =>
          d.struct({
            tag: d.string(tag),
            model: d.ref(modelRef)
          })
        )
    })
  )
}

export function createModelsAndTags(modelMap: ModelMap) {
  return xpr.with_(createModels(modelMap), modelRefs =>
    xpr.tag(BuiltInTag.Tag).createMultiple(
      mapObject(modelMap, (_, key) => () =>
        xpr.data(d =>
          d.struct({
            tag: d.string(key),
            model: d.expr(modelRefs.field(key))
          })
        )
      )
    )
  )
}

export function mapStrings(obj: any, mapFn: (value: string) => string): any {
  return mapStructure(obj, value => (typeof value === 'string' ? mapFn(value) : value))
}

export function mapStructure(obj: any, mapFn: (value: any) => any): any {
  if (Array.isArray(obj)) {
    return mapFn(obj.map(v => mapStructure(v, mapFn)))
  }

  if (typeof obj === 'object' && obj !== null) {
    let mappedObj: ObjectMap<any> = {}

    for (let key of Object.keys(obj)) {
      mappedObj[key] = mapStructure(obj[key], mapFn)
    }

    return mapFn(mappedObj)
  }

  return mapFn(obj)
}

export function filterObject<T>(
  obj: ObjectMap<T>,
  filterFn: (value: T, key: string) => boolean
): ObjectMap<T> {
  let filteredObj: {[key: string]: any} = {}

  for (const key in obj) {
    if (filterFn(obj[key], key)) filteredObj[key] = obj[key]
  }

  return filteredObj
}

export function reduceObject<T, R>(
  obj: ObjectMap<T>,
  reduceFn: (accumulator: R, value: T, key: string) => R,
  initial: R
) {
  let accumulator = initial

  for (const key in obj) {
    accumulator = reduceFn(accumulator, obj[key], key)
  }

  return accumulator
}

export function mapObject<T, R>(
  obj: ObjectMap<T>,
  mapFn: (value: T, key: string) => R
): ObjectMap<R> {
  const mappedObj: ObjectMap<R> = {}

  for (const key in obj) {
    mappedObj[key] = mapFn(obj[key], key)
  }

  return mappedObj
}

export function normalizeBaseURL(url: string): string {
  while (url.substr(-1) === '/' && url.length !== 0) {
    url = url.substr(0, url.length - 1)
  }

  return url
}

export function objectValues(obj: {}): any[]
export function objectValues<T>(obj: ObjectMap<T>): T[] {
  return Object.keys(obj).map(key => obj[key])
}
