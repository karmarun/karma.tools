import {ClientPlugin} from '@karma.run/editor-client'
import {name, version} from './version'

export * from './field'
export * from './input'

// TODO: Add in draft server plugin
// const draftJSPath = require.resolve('draft-js')
// const draftJSCSSPath = path.join(path.dirname(draftJSPath), '../dist/Draft.css')
// router.get(`${basePath}/css/draft-js.css`, (_, res) => {
//   return res.sendFile(draftJSCSSPath, cacheOptions)
// })

//<link href={`${basePath}/css/draft-js.css`} rel="stylesheet" />

export class DraftJSPlugin implements ClientPlugin {
  public readonly name = name
  public readonly version = version
}
