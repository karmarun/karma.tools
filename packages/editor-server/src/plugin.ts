import express from 'express'

export interface PluginContext {
  karmaDataURL: string
}

export interface ServerPlugin {
  readonly name: string
  readonly version: string

  registerRoutes?(context: PluginContext, router: express.Router): void
}
