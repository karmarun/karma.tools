import {Router} from 'express'
import {ServerPlugin, PluginContext} from '@karma.run/editor-server'

import {name, version} from '../common/version'
import {MediaType} from '../common/interface'

import {mediaMiddleware} from './middleware'
import {StorageAdapter} from './action'

export * from './middleware'
export * from './adapter'
export * from './action'

export interface MediaPluginOptions {
  hostname?: string
  storageAdapter: StorageAdapter
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
        hostname: `${this.options.hostname || ''}/api/plugin/${name}`
      })
    )
  }
}

export default MediaServerPlugin
