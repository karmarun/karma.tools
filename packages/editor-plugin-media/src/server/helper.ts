import fs from 'fs'
import util from 'util'
import path from 'path'
import sharp from 'sharp'
import mimeTypes from 'mime-types'
import {MediaType} from '../common'

export interface UploadFile {
  id: string
  path: string
  filename: string
}

export interface CommonFileMetadata {
  filename: string
  fileSize: number
  extension?: string
  mimeType: string
}

export interface ImageFileMetadata extends CommonFileMetadata {
  mediaType: MediaType.Image
  format: string
  width: number
  height: number
}

export interface VideoFileMetadata extends CommonFileMetadata {
  mediaType: MediaType.Video
}

export interface AudioFileMetadata extends CommonFileMetadata {
  mediaType: MediaType.Audio
}

export interface DocumentFileMetadata extends CommonFileMetadata {
  mediaType: MediaType.Document
}

export interface OtherFileMetadata extends CommonFileMetadata {
  mediaType: MediaType.Other
}

export type FileMetadata =
  | ImageFileMetadata
  | VideoFileMetadata
  | AudioFileMetadata
  | DocumentFileMetadata
  | OtherFileMetadata

export type IntermediateFile = FileMetadata & {
  id: string
  path: string
}

// const magic = new Magic(MAGIC_MIME)

// export function getMimeType(path: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     magic.detectFile(path, (err, mimeType) => {
//       if (err) return reject(err)
//       return resolve(mimeType)
//     })
//   })
// }

export function getMediaType(mimeType: string) {
  if (mimeType.startsWith('image/')) return MediaType.Image
  if (mimeType.startsWith('video/')) return MediaType.Video
  if (mimeType.startsWith('audio/')) return MediaType.Audio
  if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) return MediaType.Document

  return MediaType.Other
}

export function getFilePathForID(id: string, tempDirPath: string) {
  return path.join(tempDirPath, id)
}

export function getMetadataPathForID(id: string, tempDirPath: string) {
  return path.join(tempDirPath, `${id}.meta`)
}

export async function getMetadataForID(id: string, tempDirPath: string): Promise<FileMetadata> {
  const metadataPath = getMetadataPathForID(id, tempDirPath)
  const metadataJSON = await readFile(metadataPath)

  return JSON.parse(metadataJSON.toString())
}

export async function getFileMetadata(file: UploadFile): Promise<FileMetadata> {
  const stats = await statFile(file.path)
  const parsedPath = path.parse(file.filename)

  const mimeType =
    mimeTypes.contentType(file.filename) || 'application/octet-stream; charset=binary'

  const mediaType = getMediaType(mimeType)

  const commonMetadata: CommonFileMetadata = {
    filename: parsedPath.name,
    fileSize: stats.size,
    extension: parsedPath.ext || undefined,
    mimeType
  }

  switch (mediaType) {
    case MediaType.Image: {
      const metadata = await sharp(file.path).metadata()

      if (
        metadata.width == undefined ||
        metadata.height == undefined ||
        metadata.format == undefined
      ) {
        throw new Error("Couldn't get image metadata, image format is probably unsupported.")
      }

      if (mimeType !== mimeTypes.contentType(metadata.format!)) {
        throw new Error(
          "Image MIME type differs from extension MIME type, usually means that the extension didn't match the actual content"
        )
      }

      return {
        ...commonMetadata,
        mediaType,
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown'
      }
    }

    case MediaType.Audio:
      return {...commonMetadata, mediaType}

    case MediaType.Video:
      return {...commonMetadata, mediaType}

    case MediaType.Document:
      return {...commonMetadata, mediaType}

    case MediaType.Other:
      return {...commonMetadata, mediaType}
  }
}

export const writeFile = util.promisify(fs.writeFile)
export const readFile = util.promisify(fs.readFile)
export const statFile = util.promisify(fs.stat)
