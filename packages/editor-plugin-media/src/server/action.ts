import fs from 'fs'
import path from 'path'

import {
  UploadResponse,
  MediaType,
  ErrorType,
  CommitResponse,
  CopyResponse,
  DeleteResponse,
  createDirectories,
  generateID,
  CommonCommitResponse,
  isValidMediaType
} from '../common'

import {MediaAdapter} from './adapter'
import {UploadFile, FileMetadata} from './helper'

import {
  getFilePathForID,
  getMetadataPathForID,
  IntermediateFile,
  readFile,
  getFileMetadata,
  writeFile
} from './helper'

export interface StorageAdapter {
  write(fileID: FileID, stream: NodeJS.ReadableStream): Promise<void>
  read(fileID: FileID): Promise<NodeJS.ReadableStream>
  delete(fileID: FileID): Promise<void>
  exists(fileID: FileID): Promise<boolean>
}

export class LocaleStorageAdapter implements StorageAdapter {
  private storagePath: string
  // private cache = new Map<string, boolean>()

  public constructor(storagePath: string) {
    this.storagePath = storagePath
  }

  private fullFilePath(filePath: string) {
    return path.join(this.storagePath, filePath)
  }

  public async write(fileID: FileID, stream: NodeJS.ReadableStream): Promise<void> {
    const filePath = this.fullFilePath(fileID.toFilePath())

    await createDirectories(path.dirname(filePath))

    return new Promise<void>((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath)

      writeStream.on('error', err => {
        return reject(err)
      })

      writeStream.on('finish', () => {
        // this.cache.set(id, true)
        return resolve()
      })

      stream.pipe(writeStream)
    })
  }

  public async read(fileID: FileID): Promise<NodeJS.ReadableStream> {
    return fs.createReadStream(path.join(this.storagePath, fileID.toFilePath()))
  }

  public async delete(fileID: FileID) {
    const filePath = this.fullFilePath(fileID.toFilePath())
    await fs.promises.unlink(filePath)
  }

  public async exists(fileID: FileID): Promise<boolean> {
    const filePath = this.fullFilePath(fileID.toFilePath())

    try {
      await fs.promises.stat(filePath)
      return true
    } catch (err) {
      return false
    }
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

export enum TransformationTokenType {
  Width = 'w',
  Height = 'h'
}

export interface Transformation {
  width?: number
  height?: number
}

export function transformationFromString(str: string): Transformation {
  const tokens = str.split(',')
  const transformation: Transformation = {}

  for (const token of tokens) {
    const [type, ...args] = token.split('_')

    switch (type) {
      case TransformationTokenType.Width: {
        const width = parseInt(args[0])
        if (isNaN(width)) throw ErrorType.InvalidTransformation
        transformation.width = width
        break
      }

      case TransformationTokenType.Height: {
        const height = parseInt(args[0])
        if (isNaN(height)) throw ErrorType.InvalidTransformation
        transformation.height = height
        break
      }
    }
  }

  return transformation
}

export function transformationToString(transformation: Transformation): string {
  let tokens = []

  if (transformation.width) {
    tokens.push(`${TransformationTokenType.Width}_${transformation.width}`)
  }

  if (transformation.height) {
    tokens.push(`${TransformationTokenType.Height}_${transformation.height}`)
  }

  return tokens.join(',')
}

export class FileID {
  public readonly id: string
  public readonly mediaType: MediaType
  public readonly format: string
  public readonly transformations: Readonly<Transformation>[]

  public constructor(
    mediaType: MediaType,
    format: string,
    transformations: any[] = [],
    id: string = generateID()
  ) {
    this.id = id
    this.mediaType = mediaType
    this.format = format || 'unknown'
    this.transformations = transformations
  }

  public get isOriginal(): boolean {
    return this.transformations.length === 0
  }

  public get outputFormat(): string {
    return 'png'
  }

  public original(): FileID {
    if (!this.isOriginal) return new FileID(this.mediaType, this.format, [], this.id)
    return this
  }

  public toIDString() {
    const segments = [this.mediaType, this.format, this.id]
    return segments.join('/')
  }

  public toURLPath() {
    const segments = [
      this.mediaType,
      this.format,
      this.id,
      ...(this.transformations.length
        ? this.transformations.map(transformation => transformationToString(transformation))
        : ['original'])
    ]

    return segments.join('/')
  }

  public toFilePath() {
    const segments = [
      this.mediaType,
      this.format,
      this.id,
      ...(this.transformations.length
        ? this.transformations.map(transformation => transformationToString(transformation))
        : ['original'])
    ]

    return path.join(...segments)
  }

  public static fromURLPath(urlPath: string) {
    // TODO: Validate
    if (urlPath.startsWith('/')) urlPath = urlPath.substr(1)

    const [rawMediaType, format, id, ...segments] = urlPath.split('/')

    if (!isValidMediaType(rawMediaType)) throw ErrorType.NotFound
    if (segments.length === 0) throw ErrorType.NotFound

    const lastSegment = segments.splice(-1)[0]
    const transformations: Transformation[] = segments.map(segment =>
      transformationFromString(segment)
    )

    const transformationFormat = path.extname(lastSegment).substr(1)

    if (transformationFormat && transformationFormat !== format) {
      // TODO: Generate format transformation
    }

    console.log(transformations)

    return new FileID(rawMediaType as MediaType, format, transformations, id)
  }

  public static fromIDString(idString: string) {
    const [rawMediaType, format, id] = idString.split('/')
    if (!isValidMediaType(rawMediaType)) throw new Error('Not found!') // TODO: Better error
    return new FileID(rawMediaType as MediaType, format, undefined, id)
  }
}

export interface UploadOptions {
  hostname: string
  tempDirPath: string
  allowedMediaTypes: MediaType[]
}

export async function uploadMedia(
  uploadFile: UploadFile,
  opts: UploadOptions
): Promise<UploadResponse> {
  const metadata = await getFileMetadata(uploadFile)
  if (!opts.allowedMediaTypes.includes(metadata.mediaType)) throw ErrorType.InvalidMediaType

  const metadataPath = getMetadataPathForID(uploadFile.id, opts.tempDirPath)
  await writeFile(metadataPath, JSON.stringify(metadata))

  return {
    ...metadata,
    id: uploadFile.id,
    url: `${opts.hostname || ''}/preview/${uploadFile.id}`
  }
}

export interface CommitOptions {
  tempDirPath: string
  storageAdapter: StorageAdapter
}

export async function commitMedia(
  tempID: string,
  overrideID: FileID,
  opts: CommitOptions
): Promise<CommitResponse> {
  const filePath = getFilePathForID(tempID, opts.tempDirPath)
  const metadataPath = getMetadataPathForID(tempID, opts.tempDirPath)

  const metadataJSON = await readFile(metadataPath)
  const metadata: FileMetadata = JSON.parse(metadataJSON.toString())
  const file: IntermediateFile = {id: tempID, path: filePath, ...metadata}

  const stream = fs.createReadStream(file.path)

  const fileID = new FileID(file.mediaType, metadata.format)
  const sanitizedFilename = sanitizeFilename(file.filename)

  await opts.storageAdapter.write(fileID, stream)
  if (overrideID) await opts.storageAdapter.delete(overrideID)

  fs.unlink(filePath, err => {
    if (err) console.error('Error while deleting intermidate file: ', err)
  })

  fs.unlink(metadataPath, err => {
    if (err) console.error('Error while deleting intermidate file metadata: ', err)
  })

  const commonResponse: CommonCommitResponse = {
    id: fileID.toIDString(),
    filename: file.filename,
    extension: file.extension,
    fileSize: file.fileSize,
    mimeType: file.mimeType,
    format: file.format,
    url: `/${fileID.toURLPath()}/${sanitizedFilename}${file.extension}`,
    backend: undefined
  }

  switch (file.mediaType) {
    case MediaType.Image:
      return {
        ...commonResponse,
        mediaType: file.mediaType,
        width: file.width,
        height: file.height
      }

    case MediaType.Video:
      return {...commonResponse, mediaType: file.mediaType}

    case MediaType.Audio:
      return {...commonResponse, mediaType: file.mediaType}

    case MediaType.Document:
      return {...commonResponse, mediaType: file.mediaType}

    case MediaType.Other:
      return {...commonResponse, mediaType: file.mediaType}
  }
}

export interface CopyOptions {
  adapter: MediaAdapter
}

export async function copyMedia(id: string, opts: CopyOptions): Promise<CopyResponse> {
  return opts.adapter.copy(id)
}

export interface DeleteOptions {
  adapter: MediaAdapter
}

export async function deleteMedia(id: string, opts: DeleteOptions): Promise<DeleteResponse> {
  return opts.adapter.delete(id)
}

export interface ThumbnailOptions {
  adapter: MediaAdapter
}

export interface ThumbnailOptions {
  adapter: MediaAdapter
}

export async function thumbnailRedirectURL(id: string, opts: ThumbnailOptions): Promise<string> {
  return opts.adapter.thumbnailURL(id)
}
