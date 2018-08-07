import {Ref} from '@karma.run/sdk'
import {KeyPath, TypedFieldOptions} from './field'

export interface ViewContextOptions {
  readonly name?: string
  readonly description?: string
  readonly slug?: string
  readonly color?: string
  readonly field?: TypedFieldOptions
  readonly displayKeyPaths?: KeyPath[]
}

export interface ViewContextOptionsWithModel extends ViewContextOptions {
  readonly model: string | Ref
}
