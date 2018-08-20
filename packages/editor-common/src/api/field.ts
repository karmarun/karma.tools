export interface FieldOptions {
  readonly label?: string
  readonly [key: string]: any
}

export interface TypedFieldOptions extends FieldOptions {
  readonly type?: string
}

export const enum StorageType {
  Float = 'float',
  Int8 = 'int8',
  Int16 = 'int16',
  Int32 = 'int32',
  Int64 = 'int64',
  UInt8 = 'uint8',
  UInt16 = 'uint16',
  UInt32 = 'uint32',
  UInt64 = 'uint64'
}

export type KeyPath = (string | number)[]
export function keyPathToString(keyPath: KeyPath) {
  return ['root', ...keyPath].join('.')
}

export function isKeyPathEqual(keyPathA: KeyPath | string, keyPathB: KeyPath | string) {
  let keyPathStringA = typeof keyPathA === 'string' ? keyPathA : keyPathToString(keyPathA)
  let keyPathStringB = typeof keyPathB === 'string' ? keyPathB : keyPathToString(keyPathB)

  return keyPathStringA === keyPathStringB
}
