import {
  build,
  watchBuild,
  getCachePath,
  loadServerConfig,
  findConfigsIfNeededAndSetCWD
} from './helper'

export interface BuildCommandOptions {
  karmaDataURL?: string
  watch?: boolean
  serverConfigPath?: string
  clientConfigPath?: string
  require?: string
  plugins?: string[]
}

export default async function buildCommand(opts: BuildCommandOptions): Promise<void> {
  const {serverConfigPath, clientConfigPath} = findConfigsIfNeededAndSetCWD(
    opts.serverConfigPath,
    opts.clientConfigPath
  )

  const config = serverConfigPath ? await loadServerConfig(serverConfigPath) : {}
  const karmaDataURL = process.env.KARMA_DATA_URL || opts.karmaDataURL || config.karmaDataURL

  if (!karmaDataURL) {
    console.error('No karma.data URL specified, set it via environment, CLI option or config.')
    return process.exit(1)
  }

  const cachePath = getCachePath()

  if (opts.watch) {
    const path = await watchBuild(cachePath, clientConfigPath, (err, stats) => {
      if (err) return console.error(err.message)
      process.stdout.write(stats.toString({colors: true}) + '\n')
      console.info(`\nBuilt client: ${path}`)
    })
  } else {
    try {
      console.info('Building bundle...')
      const {path, stats} = await build(cachePath, clientConfigPath)
      process.stdout.write(stats.toString({colors: true}) + '\n')
      console.info(`\nBuilt client: ${path}`)
      process.exit(0)
    } catch (err) {
      console.error(`Coulnd't build bundle: ${err.message}`)
      process.exit(1)
    }
  }
}
