import {AnyFieldConstructor} from './api/field'

export interface ClientPlugin {
  readonly name: string
  readonly version: string

  registerFields?(): AnyFieldConstructor[]
}
