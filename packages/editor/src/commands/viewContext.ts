import {authenticate} from '@karma.run/sdk'
import {ClientConfiguration} from '../interface'
import {loadServerConfig, findConfigsIfNeededAndSetCWD} from './helper'
import {AnyFieldConstructor} from '@karma.run/editor-client'

export interface ViewContextCommandOptions {
  serverConfigPath?: string
  clientConfigPath?: string
  karmaDataURL?: string
  instanceSecret: string
}

export default async function viewContextCommand(opts: ViewContextCommandOptions): Promise<void> {
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

  if (!opts.instanceSecret) {
    console.error('No instance secret specified.')
    return process.exit(1)
  }

  const {
    getContexts,
    defaultFieldRegistry,
    mergeFieldRegistries,
    createFieldRegistry
  } = await import('@karma.run/editor-client')

  const clientConfig: ClientConfiguration = clientConfigPath ? await import(clientConfigPath) : {}

  let fields: AnyFieldConstructor[] = []

  for (const plugin of clientConfig.plugins || []) {
    if (plugin.registerFields) fields.push(...plugin.registerFields())
  }

  const fieldRegistry = mergeFieldRegistries(createFieldRegistry(...fields), defaultFieldRegistry)

  try {
    const signature = await authenticate(karmaDataURL, 'admin', opts.instanceSecret)
    const {viewContexts} = await getContexts(karmaDataURL, signature, fieldRegistry)

    process.stdout.write(
      JSON.stringify(viewContexts.map(viewContext => viewContext.serialize()), undefined, 2),
      () => {
        process.exit(0)
      }
    )
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}
