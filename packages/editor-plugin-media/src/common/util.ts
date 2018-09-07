import util from 'util'
import mkdirp from 'mkdirp'
import nanoid from 'nanoid/generate'

const mkdirpPromise = util.promisify(mkdirp)

export function generateID() {
  return nanoid('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 15)
}

export async function createDirectories(path: string): Promise<void> {
  await mkdirpPromise(path)
}
