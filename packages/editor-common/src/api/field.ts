export interface FieldOptions {
  readonly label?: string
  readonly [key: string]: any
}

export interface TypedFieldOptions extends FieldOptions {
  readonly type?: string
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
