import {Unpromisify} from './types'

export type ObjectMap<V> = {[key: string]: V}
export type MapObjectCallbackFn<T, R> = (item: T, key: string) => R

/**
 * Map Object keys/item to a new Object.
 *
 * @param obj Object to iterate
 * @param callback Callback function
 */
export function mapObject<V, R>(obj: ObjectMap<V>, callback: MapObjectCallbackFn<V, R>) {
  return Object.entries(obj).reduce(
    (result, [key, item]) => {
      const value = callback(item, key)
      result[key] = value
      return result
    },
    {} as {[K in keyof typeof obj]: R}
  )
}

export type MapObjectAsyncCallbackFn<T, R> = (item: T, key: string) => Promise<R>

/**
 * Map Object keys/item to a new Object.
 *
 * @param obj Object to iterate
 * @param callback Callback function
 */
export async function mapObjectAsync<V, R>(
  obj: ObjectMap<V>,
  callback: MapObjectCallbackFn<V, R>
): Promise<ObjectMap<Unpromisify<R>>> {
  const entries = Object.entries(obj)
  const result = {} as {[K in keyof typeof obj]: R}

  for (const [key, item] of entries) {
    const value = await callback(item, key)
    result[key] = value
  }

  return result as any
}

/**
 * Creates a new Object with all null and undefined values removed, doesn't work recursivly.
 */
export function deleteNullValues<T>(obj: T): T {
  const objCopy = {...(obj as any)}

  for (const key in objCopy) {
    if (objCopy[key] == undefined) {
      delete objCopy[key]
    }
  }

  return objCopy
}

export function firstKey(obj: object) {
  const keys = Object.keys(obj)
  if (keys.length <= 0) throw new Error('Atleast one key expected!')
  return keys[0]
}

export function firstKeyOptional(obj: object): string | undefined {
  const keys = Object.keys(obj)
  return keys[0]
}

export function mirrorObject<T extends ObjectMap<void>>(map: T): {[K in keyof T]: K} {
  return mapObject(map, (_value, key) => {
    return key
  }) as any
}

/**
 * Typed Object.keys.
 *
 * @param obj Object to return keys
 */
export function objectKeys<T>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}
