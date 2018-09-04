#!/usr/bin/env node
import commander from 'commander'

import run, {defaultPort} from './commands/run'
import build from './commands/build'
import clean from './commands/clean'
import viewContext from './commands/viewContext'

export * from './interface'

const program = commander.name('karma-editor').version('0.14.3')

program
  .command('server')
  .description('Run editor server.')
  .option(
    '-p --port [port]',
    `Set port the server runs on. (environment: PORT, default: ${defaultPort})`,
    parseInt
  )
  .option('-s --server-config --serverConfig [serverConfig]', 'Set path to the server config file.')
  .option('-c --client-config --clientConfig [clientConfig]', 'Set path to the client config file.')
  .option('-r --require [require]', 'Preload module before loading config.')
  .option('-w --watch', 'Watch bundle build.')
  .option('--no-cache --noCache', 'Ignores cache.')
  .option(
    '-u --karma-data-url --karmaDataURL [karmaDataURL]',
    'Set karma.data URL. (environment: KARMA_DATA_URL)'
  )
  .action(opts =>
    run({
      ...opts,
      serverConfigPath: opts.serverConfig,
      clientConfigPath: opts.clientConfig,
      karmaDataURL: opts.karmaDataUrl
    })
  )

program
  .command('build')
  .description('Pre-build editor client.')
  .option('-c --config [config]', 'Set path to config file.')
  .option('-r --require [require]', 'Preload module before loading config.')
  .option('-w --watch', 'Watch bundle build.')
  .option(
    '-u --karma-data-url --karmaDataURL [karmaDataURL]',
    'Set karma.data URL. (environment: KARMA_DATA_URL)'
  )
  .action(opts => build({...opts, karmaDataURL: opts.karmaDataUrl}))

program
  .command('viewcontext')
  .description('Output inferred view context for all models.')
  .option(
    '-u --karma-data-url --karmaDataURL [karmaDataURL]',
    'Set karma.data URL. (environment: KARMA_DATA_URL)'
  )
  .option(
    '-s --instance-secret --instanceSecret [instanceSecret]',
    'Set karma.data instance secret'
  )
  .action(opts => viewContext({...opts, karmaDataURL: opts.karmaDataUrl}))

program
  .command('clean')
  .description('Clean client cache.')
  .option('-s --server-config --serverConfig [serverConfig]', 'Set path to the server config file.')
  .action(opts => clean({...opts, serverConfigPath: opts.serverConfig}))

program.parse(process.argv)

if (process.argv.length <= 2) {
  program.help()
}
