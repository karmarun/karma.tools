import {RefValue} from '../util/ref'

export interface ModelGroup {
  name: string
  models: (string | RefValue)[]
}
