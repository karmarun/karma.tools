import fs from 'fs'
import path from 'path'
import shortid from 'shortid'

import {MediaBackend} from './interface'
import {CommitResponse, DeleteResponse} from '../../common'
import {IntermediateFile} from '../helper'

export interface StorageBackend {
  write(id: string, stream: NodeJS.ReadableStream): Promise<void>
  read(id: string): Promise<NodeJS.WritableStream>
  delete(id: string): Promise<void>
}

export class LocaleStorageBackend implements StorageBackend {
  private storagePath: string

  public constructor(storagePath: string) {
    this.storagePath = storagePath
  }

  public write(id: string, stream: NodeJS.ReadableStream): Promise<void> {
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.storagePath, id)
      const writeStream = fs.createWriteStream(filePath)

      writeStream.on('error', err => {
        return reject(err)
      })

      writeStream.on('finish', () => {
        return resolve()
      })

      stream.pipe(writeStream)
    })
  }

  public read(id: string): Promise<NodeJS.WritableStream> {
    // return Promise.resolve(new Stream())
  }

  public async delete(id: string) {
    const filePath = path.join(this.storagePath, id)
    await fs.promises.unlink(filePath)
  }
}

export function sanitizeFilename(filename: string) {
  return filename
    .substr(0, 50)
    .replace(/[^a-z0-9]+?([a-z0-9]|$)/gi, '-$1')
    .replace(/^-/, '')
    .replace(/-$/, '')
    .substr(0, 20)
}

export class LocalBackend implements MediaBackend {
  private storageBackend: StorageBackend

  public constructor() {
    this.storageBackend = new LocaleStorageBackend(path.resolve(process.cwd(), '.cache'))
  }

  public async commit(file: IntermediateFile, overrideID?: string): Promise<CommitResponse> {
    const stream = fs.createReadStream(file.path)

    const sanitizedFilename = sanitizeFilename(file.filename)
    const id = `${shortid.generate()}-${file.mediaType}-${sanitizedFilename}`

    console.log(file)

    await this.storageBackend.write(id, stream)
    if (overrideID) await this.storageBackend.delete(id)

    throw new Error('TODO')
  }

  public async copy(): Promise<CommitResponse> {
    throw new Error('Not implemented!')
  }

  public async delete(): Promise<DeleteResponse> {
    throw new Error('Not implemented!')
  }

  public async thumbnailURL(): Promise<string> {
    throw new Error('Not implemented!')
  }

  public async get(): Promise<string> {
    return '1234'
  }
}
