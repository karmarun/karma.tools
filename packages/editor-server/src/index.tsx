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

import {SignatureHeader, Tag, query, buildFunction, getTags, Ref} from '@karma.run/sdk'
import {EditorContext, ViewContextOptionsWithModel} from '@karma.run/editor-common'

import {ServerPlugin} from './plugin'
export * from './plugin'

const cacheOptions = {maxAge: '1d'}

export type EditorContextsForRolesFn = (
  roles: string[],
  tagMap: ReadonlyMap<string, Ref>
) => EditorContext[]

export type ViewContextsForRolesFn = (
  roles: string[],
  tagMap: ReadonlyMap<string, Ref>
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
  karmaDataURL: string,
  signature: string
): Promise<{tags: Tag[]; roles: string[]}> {
  return query(
    karmaDataURL,
    signature,
    buildFunction(e => () =>
      e.data(d =>
        d.struct({
          tags: d.expr(() => getTags()),
          roles: d.expr(e =>
            e.mapList(e.field('roles', e.get(e.currentUser())), (_, value) =>
              e.field('name', e.get(value))
            )
          )
        })
      )
    )
  )
}

export function editorMiddleware(opts: MiddlewareOptions): express.Router {
  const title = opts.title || 'karma.data - editor'
  const basePath = opts.basePath || ''

  const router = express.Router()
  const reactDateTimePath = require.resolve('react-datetime')
  const reactDateTimeCSSPath = path.join(path.dirname(reactDateTimePath), 'css/react-datetime.css')

  const pluginIdentifiers: string[] = []

  if (opts.plugins && opts.plugins.length) {
    for (const plugin of opts.plugins) {
      if (plugin.registerRoutes) {
        const pluginRouter = express.Router()
        plugin.registerRoutes({karmaDataURL: opts.karmaDataURL}, pluginRouter)
        router.use(`${basePath}/api/plugin/${plugin.name}`, pluginRouter)
      }

      const identifier = `${plugin.name}@${plugin.version}`
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
      status: 'ok',
      karmaDataURL: opts.karmaDataURL,
      plugins: pluginIdentifiers
    })
  })

  router.get(`${basePath}/api/context`, async (req, res, next) => {
    const signature = req.header(SignatureHeader)
    if (!signature) return next('No signature header found.')

    try {
      const {tags, roles} = await getTagsAndRoles(opts.karmaDataURL, signature)
      const tagMap = new Map(tags.map(tag => [tag.tag, tag.model] as [string, Ref]))

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
