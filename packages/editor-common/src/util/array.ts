import {ObjectMap} from './object'

export function lastItem<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined
  return arr[arr.length - 1]
}

export function lastItemThrow<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error('Atleast one element expected.')
  return arr[arr.length - 1]
}

export function firstItem<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined
  return arr[0]
}

export function firstItemThrow<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error('Atleast one element expected.')
  return arr[0]
}

export function reduceToMirrorMap<T>(arr: T[]): ObjectMap<T> {
  return arr.reduce(
    (prev, value) => {
      prev[String(value)] = value
      return prev
    },
    {} as ObjectMap<T>
  )
}

export type KeyValueTuple<V> = [string | number, V]
export type ReduceCallbackFn<T, V> = (item: T, index: number) => KeyValueTuple<V>

export function reduceToMap<T, V>(arr: T[], callback: ReduceCallbackFn<T, V>): ObjectMap<V> {
  return arr.reduce(
    (prev, item, index) => {
      const [key, value] = callback(item, index)
      prev[key] = value
      return prev
    },
    {} as ObjectMap<V>
  )
}

export function uniqueFilter(value: any, index: number, array: any[]) {
  return array.indexOf(value) === index
}

export function flatMap<T, R>(arr: T[], callback: (value: T) => R[]): R[] {
  return arr.reduce((acc, value) => acc.concat(callback(value)), [] as R[])
}
