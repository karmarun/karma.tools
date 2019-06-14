/**
 * @module @karma.run/editor-server
 * @license MIT
 *
 * Copyright (c) 2018, karma.run AG.
 */
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import path from 'path'
import express from 'express'
import proxy from 'express-http-proxy'

import {
  name as sdkModuleName,
  version as sdkModuleVersion,
  Remote,
  UserSession
} from '@karma.run/sdk'

import * as xpr from '@karma.run/sdk/expression'
import * as utl from '@karma.run/sdk/utility'

import {
  name as commonModuleName,
  version as commonModuleVersion,
  EditorContext,
  ViewContextOptionsWithModel,
  TagRecord,
  RefValue
} from '@karma.run/editor-common'

import {version as serverModuleVersion} from './version'
import {ServerPlugin, PluginContext} from './plugin'

export * from './plugin'
export * from './version'

const cacheOptions = {maxAge: '1d'}

export type EditorContextsForRolesFn = (
  roles: string[],
  tagMap: ReadonlyMap<string, RefValue>
) => EditorContext[]

export type ViewContextsForRolesFn = (
  roles: string[],
  tagMap: ReadonlyMap<string, RefValue>
) => ViewContextOptionsWithModel[]

export interface MiddlewareOptions {
  title?: string
  basePath?: string
  karmaDataURL: string

  bundlePublicPath: string
  clientName: string
  workerName: string

  favicon: string
  plugins?: ServerPlugin[]

  editorContextsForRoles?: EditorContextsForRolesFn
  viewContextsForRoles?: ViewContextsForRolesFn
}

export function getTagsAndRoles(
  session: UserSession
): Promise<{tags: TagRecord[]; roles: string[]}> {
  return session.do(
    xpr.data(d =>
      d.struct({
        tags: d.expr(xpr.tag(utl.BuiltInTag.Tag).all()),
        roles: d.expr(
          xpr
            .currentUser()
            .get()
            .field('roles')
            .mapList((_, value) => xpr.get(value).field('name'))
        )
      })
    )
  )
}

export function editorMiddleware(opts: MiddlewareOptions): express.Router {
  const title = opts.title || 'karma.data - editor'
  const basePath = opts.basePath || ''

  const router = express.Router()
  const reactDateTimePath = require.resolve('react-datetime')
  const reactDateTimeCSSPath = path.join(path.dirname(reactDateTimePath), 'css/react-datetime.css')

  const pluginHeaderElements: React.ReactNode[] = []
  const pluginIdentifiers: string[] = []

  const remote = new Remote(opts.karmaDataURL)

  if (opts.plugins && opts.plugins.length) {
    for (const plugin of opts.plugins) {
      const pluginContext: PluginContext = {
        basePath,
        karmaDataURL: opts.karmaDataURL,
        pluginBasePath: `${basePath}/api/plugin/${plugin.name}`
      }

      const identifier = `${plugin.name}@${plugin.version}`

      if (plugin.registerRoutes) {
        const pluginRouter = express.Router()
        plugin.registerRoutes(pluginContext, pluginRouter)
        router.use(pluginContext.pluginBasePath, pluginRouter)
      }

      if (plugin.registerHeaderElements) {
        pluginHeaderElements.push(
          <React.Fragment key={identifier}>
            {plugin.registerHeaderElements(pluginContext)}
          </React.Fragment>
        )
      }

      pluginIdentifiers.push(identifier)
      console.info(`Initialized plugin: ${identifier}`)
    }
  }

  router.get(`${basePath}/css/react-datetime.css`, (_, res) => {
    return res.sendFile(reactDateTimeCSSPath, cacheOptions)
  })

  router.use(
    `${basePath}/static`,
    express.static(opts.bundlePublicPath, {
      index: false,
      ...cacheOptions
    })
  )

  router.use(`${basePath}/static`, (_, res) => {
    return res.status(404).send()
  })

  router.get(`${basePath}/static/favicon.ico`, (_, res) => {
    return res.sendFile(opts.favicon, cacheOptions)
  })

  router.get(`${basePath}/api/status`, (_, res) => {
    return res.status(200).send({
      version: serverModuleVersion,
      karmaDataURL: opts.karmaDataURL,
      modules: [
        `${commonModuleName}@${commonModuleVersion}`,
        `${sdkModuleName}@${sdkModuleVersion}`
      ],
      plugins: pluginIdentifiers
    })
  })

  router.get(`${basePath}/api/context`, async (req, res, next) => {
    const signature = req.header(utl.Header.Signature)
    if (!signature) return next('No signature header found.')

    const session = new UserSession(remote.endpoint, '', signature)

    try {
      const {tags, roles} = await getTagsAndRoles(session)
      const tagMap = new Map(tags.map(tag => [tag.tag, tag.model] as [string, RefValue]))

      return res.status(200).send({
        editorContexts: opts.editorContextsForRoles
          ? opts.editorContextsForRoles(roles, tagMap)
          : [],
        viewContextOptions: opts.viewContextsForRoles
          ? opts.viewContextsForRoles(roles, tagMap)
          : []
      })
    } catch (err) {
      // TODO: Better error handling
      return next(err)
    }
  })

  router.use(`${basePath}/api/proxy`, proxy(remote.endpoint))

  router.use(
    (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error(err)
      return res.status(500).send({
        error: err.message
      })
    }
  )

  router.get(`${basePath}(/*)?`, (_, res) => {
    const configJSON = JSON.stringify({
      title,
      basePath,
      karmaDataURL: opts.karmaDataURL,
      workerURL: `/static/worker.js`
    })

    const stream = ReactDOMServer.renderToStaticNodeStream(
      <html>
        <head>
          <title>{title}</title>
          <link href={`${basePath}/static/favicon.ico`} rel="icon" type="image/x-icon" />
          <link href={`${basePath}/css/react-datetime.css`} rel="stylesheet" />
          <link
            href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i"
            rel="stylesheet"
          />

          {pluginHeaderElements}

          <script
            id="Config"
            type="application/json"
            dangerouslySetInnerHTML={{__html: configJSON}}
          />
          <script src={`${basePath}/static/${opts.clientName}`} defer />
        </head>
        <body>
          <div id="EditorRoot" />
        </body>
      </html>
    )

    res.write('<!DOCTYPE html>')
    return stream.pipe(res)
  })

  return router
}

export default editorMiddleware
