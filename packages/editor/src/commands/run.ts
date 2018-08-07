import express from 'express'
import compression from 'compression'
import editorMiddleware from '@karma.run/editor-server'

import {
  build,
  getCachedBuild,
  watchBuild,
  getCachePath,
  findConfigsIfNeededAndSetCWD,
  loadServerConfig
} from './helper'

export const defaultPort = 3000

export interface RunCommandOptions {
  karmaDataURL?: string
  watch?: boolean
  serverConfigPath?: string
  clientConfigPath?: string
  port: number
}

export default async function runCommand(opts: RunCommandOptions): Promise<void> {
  const {serverConfigPath, clientConfigPath} = findConfigsIfNeededAndSetCWD(
    opts.serverConfigPath,
    opts.clientConfigPath
  )

  // TODO: Watch server config with watch flag
  const config = serverConfigPath ? await loadServerConfig(serverConfigPath) : {}
  const karmaDataURL = process.env.KARMA_DATA_URL || opts.karmaDataURL || config.karmaDataURL

  if (!karmaDataURL) {
    console.error('No karma.data URL specified, set it via environment, CLI option or config.')
    return process.exit(1)
  }

  const port = process.env.PORT
    ? parseInt(process.env.PORT)
    : opts.port || (config && config.port) || defaultPort

  const plugins = config.plugins || []
  const cachePath = getCachePath()

  let clientBundlePath: string | undefined

  if (opts.watch) {
    console.info('Watching bundle...')
    clientBundlePath = await watchBuild(cachePath, clientConfigPath, (err, stats) => {
      if (err) return console.error(err.message)
      process.stdout.write(stats.toString({colors: true}) + '\n')
    })
  } else {
    // TODO: Add ignore cache option
    clientBundlePath = await getCachedBuild(cachePath)

    if (!clientBundlePath) {
      try {
        console.info('Building bundle...')
        const {path, stats} = await build(cachePath, clientConfigPath)
        process.stdout.write(stats.toString({colors: true}) + '\n')
        clientBundlePath = path
      } catch (err) {
        console.error(`Coulnd't build bundle: ${err.message}`)
        process.exit(1)
      }
    }
  }

  const app = express()
  app.disable('x-powered-by')

  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_INSECURE_REQUESTS !== 'true') {
    app.use((req, res, next) => {
      if (req.get('X-Forwarded-Proto') === 'http') {
        res.redirect('https://' + req.headers.host + req.url)
        return
      }

      res.setHeader('Content-Security-Policy', 'upgrade-insecure-requests')
      res.setHeader('X-Content-Security-Policy', 'upgrade-insecure-requests')

      return next()
    })
  }

  app.use(compression())

  app.use(
    editorMiddleware({
      bundlePublicPath: clientBundlePath!,
      clientName: 'index.js',
      workerName: 'worker.js',
      favicon: '../../static/favicon.ico',
      karmaDataURL,
      editorContextsForRoles: config.editorContexts,
      viewContextsForRoles: config.viewContexts,
      plugins
    })
  )

  app.listen(port, () => {
    console.log('Server running at localhost:' + port)
  })
}
