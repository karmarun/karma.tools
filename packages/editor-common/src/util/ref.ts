import {Ref} from '@karma.run/sdk'

export function refToString(ref: Ref): string {
  return ref.join('/')
}

export function stringToRef(refString: string): Ref {
  const ref = refString.split('/')
  if (ref.length < 2) throw new Error('Invalid ref string!')
  return ref as Ref
}

export function refToPrettyString(ref: Ref): string {
  return ref.join(' / ')
}

export function isRefEqual(refA: Ref, refB: Ref) {
  return refA[0] === refB[0] && refA[1] === refB[1]
}

export class RefMap<V> extends Map<string, V> {
  public constructor(iterable?: Iterable<[Ref | string, V]>) {
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

  public get(ref: Ref | string) {
    if (typeof ref === 'string') return super.get(ref)
    return super.get(refToString(ref))
  }

  public has(ref: Ref | string) {
    if (typeof ref === 'string') return super.has(ref)
    return super.has(refToString(ref))
  }

  public delete(ref: Ref | string) {
    if (typeof ref === 'string') return super.delete(ref)
    return super.delete(refToString(ref))
  }

  public set(ref: Ref | string, value: V) {
    if (typeof ref === 'string') return super.set(ref, value)
    return super.set(refToString(ref), value)
  }
}

export interface ReadonlyRefMap<V> extends ReadonlyMap<string, V> {
  get(ref: string | Ref): V | undefined
  has(ref: string | Ref): boolean
}
