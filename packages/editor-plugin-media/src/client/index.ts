import {ClientPlugin} from '@karma.run/editor-client'

import {name, version} from '../common/version'
import {MediaField} from './field'

export * from './component'

export class MediaClientPlugin implements ClientPlugin {
  public name: string = name
  public version: string = version

  public registerFields() {
    return [MediaField]
  }
}

export default MediaClientPlugin
