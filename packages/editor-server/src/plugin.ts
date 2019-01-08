import React from 'react'
import express from 'express'

export interface PluginContext {
  basePath: string
  karmaDataURL: string
  pluginBasePath: string
}

export interface VirtualHost {
  host: string
  handler: (req: express.Request, res: express.Response) => void
}

export interface ServerPlugin {
  readonly name: string
  readonly version: string

  registerHeaderElements?(context: PluginContext): React.ReactNode
  registerRoutes?(context: PluginContext, router: express.Router): void
  registerVirtualHosts?(context: PluginContext): VirtualHost | [VirtualHost]
}
