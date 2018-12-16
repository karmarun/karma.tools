export type RefValue = [string, string]

export function isRef(ref: any): ref is RefValue {
  return Array.isArray(ref) && typeof ref[0] === 'string' && typeof ref[1] === 'string'
}

export function refToString(ref: RefValue): string {
  return ref.join('/')
}

export function stringToRef(refString: string): RefValue {
  const ref = refString.split('/')
  if (ref.length < 2) throw new Error('Invalid ref string!')
  return ref as RefValue
}

export function refToPrettyString(ref: RefValue): string {
  return ref.join(' / ')
}

export function isRefEqual(refA: RefValue, refB: RefValue) {
  return refA[0] === refB[0] && refA[1] === refB[1]
}

export class RefMap<V> extends Map<string, V> {
  public constructor(iterable?: Iterable<[RefValue | string, V]>) {
    const mappedEntries: [string, V][] = []

    if (iterable) {
      for (const tuple of iterable) {
        const ref = tuple[0]
        const stringRef = typeof ref !== 'string' ? refToString(ref) : ref
        const value = tuple[1]

        mappedEntries.push([stringRef, value])
      }
    }

    super(mappedEntries)
  }

  public get(ref: RefValue | string) {
    if (typeof ref === 'string') return super.get(ref)
    return super.get(refToString(ref))
  }

  public has(ref: RefValue | string) {
    if (typeof ref === 'string') return super.has(ref)
    return super.has(refToString(ref))
  }

  public delete(ref: RefValue | string) {
    if (typeof ref === 'string') return super.delete(ref)
    return super.delete(refToString(ref))
  }

  public set(ref: RefValue | string, value: V) {
    if (typeof ref === 'string') return super.set(ref, value)
    return super.set(refToString(ref), value)
  }
}

export interface ReadonlyRefMap<V> extends ReadonlyMap<string, V> {
  get(ref: string | RefValue): V | undefined
  has(ref: string | RefValue): boolean
}
