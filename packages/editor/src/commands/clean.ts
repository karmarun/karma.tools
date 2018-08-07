import rimraf from 'rimraf'
import {getCachePath, findConfigsIfNeededAndSetCWD} from './helper'

export interface CleanCommandOptions {
  serverConfigPath?: string
}

export default async function cleanCommand(opts: CleanCommandOptions): Promise<void> {
  findConfigsIfNeededAndSetCWD(opts.serverConfigPath)
  const cachePath = getCachePath()

  console.info('Cleaning cache...')

  rimraf(cachePath, err => {
    if (err) return console.error(`Coulnd't clean cache: ${err.message}`)
    return console.info('Cleaned cache.')
  })
}
