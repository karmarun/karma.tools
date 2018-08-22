export type ObjectMap<T = any> = {[key: string]: T}

export function mapObject<T, R>(obj: ObjectMap<T>, mapper: (value: T, key: string) => R) {
  const mappedObject: ObjectMap<R> = {}

  for (const key in obj) {
    mappedObject[key] = mapper(obj[key], key)
  }

  return mappedObject
}
