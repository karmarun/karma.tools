import util from 'util'
import mkdirp from 'mkdirp'
import crypto from 'crypto'

const mkdirpPromise = util.promisify(mkdirp)

export async function createDirectories(path: string): Promise<void> {
  await mkdirpPromise(path)
}

export function createMD5Hash(str: string) {
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex')
}
