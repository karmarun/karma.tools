import fs from 'fs'
import path from 'path'

import {
  UploadResponse,
  MediaType,
  ErrorType,
  CommitResponse,
  CopyResponse,
  DeleteResponse,
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

import {createDirectories, createMD5Hash} from './util'

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
  Height = 'h',
  Quality = 'q',
  Rotation = 'r',
  Focus = 'f'
}

export enum TransformationFocusType {
  TopLeft = 'top_left',
  Top = 'top',
  TopRight = 'top_right',
  Right = 'right',
  BottomRight = 'bottom_right',
  Bottom = 'bottom',
  BottomLeft = 'bottom_left',
  Left = 'left',
  Center = 'center',
  AutoEntropy = 'auto_entropy',
  AutoAttention = 'auto_attention'
}

export enum TransformationRotation {
  Auto = 'auto',
  Rotate0 = '0',
  Rotate90 = '90',
  Rotate180 = '180',
  Rotate270 = '270'
}

export interface Transformation {
  width?: number
  height?: number
  quality?: number
  rotation?: TransformationRotation
  focus?: {x: number; y: number} | TransformationFocusType
}

export function transformationFromString(str: string): Transformation {
  const tokens = str.split(',')
  const transformation: Transformation = {}

  for (const token of tokens) {
    const argsIndex = token.indexOf('_')

    const type = token.substring(0, argsIndex)
    const argString = token.substring(argsIndex + 1)

    const args = argString.split(':')

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

      case TransformationTokenType.Rotation: {
        if (!Object.values(TransformationRotation).includes(args[0])) {
          throw ErrorType.InvalidTransformation
        }

        transformation.rotation = args[0] as TransformationRotation
        break
      }

      case TransformationTokenType.Quality: {
        const quality = parseFloat(args[0])
        if (isNaN(quality)) throw ErrorType.InvalidTransformation
        transformation.quality = Math.max(0, Math.min(1, quality))
        break
      }

      case TransformationTokenType.Focus: {
        if (args.length >= 2) {
          const x = parseFloat(args[0])
          const y = parseFloat(args[1])

          if (isNaN(x) || isNaN(y)) throw ErrorType.InvalidTransformation
          transformation.focus = {x, y}
          break
        } else {
          if (!Object.values(TransformationFocusType).includes(args[0])) {
            throw ErrorType.InvalidTransformation
          }

          transformation.focus = args[0] as TransformationFocusType
          break
        }
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

  if (transformation.rotation) {
    tokens.push(`${TransformationTokenType.Rotation}_${transformation.rotation}`)
  }

  if (transformation.quality) {
    tokens.push(`${TransformationTokenType.Quality}_${transformation.quality}`)
  }

  if (transformation.focus) {
    if (typeof transformation.focus === 'object') {
      const {x, y} = transformation.focus
      tokens.push(`${TransformationTokenType.Focus}_${x}:${y}`)
    } else {
      tokens.push(`${TransformationTokenType.Focus}_${transformation.focus}`)
    }
  }

  return tokens.join(',')
}

export class FileID {
  public readonly id: string
  public readonly mediaType: MediaType
  public readonly format: string
  public readonly transformations: Readonly<Transformation>[]
  public readonly outputFormat: string

  public constructor(
    mediaType: MediaType,
    format: string,
    transformations: any[] = [],
    outputFormat?: string,
    id: string = generateID()
  ) {
    this.id = id
    this.mediaType = mediaType
    this.format = format || 'unknown'
    this.outputFormat = outputFormat || format
    this.transformations = transformations
  }

  public get isOriginal(): boolean {
    return this.transformations.length === 0 && this.format === this.outputFormat
  }

  public original(): FileID {
    if (!this.isOriginal) return new FileID(this.mediaType, this.format, [], undefined, this.id)
    return this
  }

  public toIDString() {
    const segments = [this.mediaType, this.format, this.id]
    return segments.join('/')
  }

  public toURLPath(filename: string) {
    const segments = [
      this.mediaType,
      this.format,
      this.id,
      ...(this.transformations.length
        ? this.transformations.map(transformation => transformationToString(transformation))
        : []),
      `${encodeURIComponent(filename)}.${this.outputFormat}`
    ]

    return segments.join('/')
  }

  public toFilePath() {
    let filename = 'original'

    if (this.format !== this.outputFormat || this.transformations.length !== 0) {
      filename = createMD5Hash(
        [
          ...this.transformations.map(transformation => transformationToString(transformation)),
          this.outputFormat
        ].join('/')
      )
    }

    const segments = [this.mediaType, this.format, this.id, `${filename}.${this.outputFormat}`]
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

    const transformationFormat = path.extname(lastSegment).substr(1) || undefined

    return new FileID(rawMediaType as MediaType, format, transformations, transformationFormat, id)
  }

  public static fromIDString(idString: string) {
    const [rawMediaType, format, id] = idString.split('/')
    if (!isValidMediaType(rawMediaType)) throw new Error('Not found!') // TODO: Better error
    return new FileID(rawMediaType as MediaType, format, [], undefined, id)
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
  hostname: string
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
    url: `${opts.hostname || ''}/${fileID.toURLPath(file.filename)}`
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
