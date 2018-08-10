import {ClientPlugin} from '@karma.run/editor-client'

import {name, version} from '../common/version'
import {DraftJSField} from './field'

export * from './field'
export * from './input'

export class DraftJSClientPlugin implements ClientPlugin {
  public readonly name = name
  public readonly version = version

  public registerFields() {
    return [DraftJSField]
  }
}
