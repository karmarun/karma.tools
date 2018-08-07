import {Router} from 'express'
import {ServerPlugin, PluginContext} from '@karma.run/editor-server'

import {name, version} from '../common/version'
import {mediaMiddleware} from './middleware'
import {MediaType} from '../common/interface'
import {MediaBackend} from '../server/backend'

export * from './middleware'
export * from './backend'
export * from './action'

export interface MediaPluginOptions {
  hostname: string
  backend: MediaBackend
  allowedRoles: string[]
  allowedMediaTypes?: MediaType[]
  tempDirPath?: string
}

export class MediaServerPlugin implements ServerPlugin {
  public name: string = name
  public version: string = version

  private options: MediaPluginOptions

  public constructor(opts: MediaPluginOptions) {
    this.options = opts
  }

  public registerRoutes(context: PluginContext, router: Router) {
    router.use(
      mediaMiddleware({
        ...this.options,
        karmaDataURL: context.karmaDataURL,
        hostname: `${this.options.hostname}/api/plugin/${name}`
      })
    )
  }
}

export default MediaServerPlugin
