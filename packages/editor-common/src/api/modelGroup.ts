import {Ref} from '@karma.run/sdk'

export interface ModelGroup {
  name: string
  models: (string | Ref)[]
}
