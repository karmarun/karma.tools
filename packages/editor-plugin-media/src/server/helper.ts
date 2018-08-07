import fs from 'fs'
import util from 'util'
import path from 'path'
import sharp from 'sharp'
import {Magic, MAGIC_MIME} from 'mmmagic'
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
  mediaType: MediaType
  mimeType: string
}

export interface ImageFileMetadata extends CommonFileMetadata {
  mediaType: MediaType.Image
  width: number
  height: number
}

export interface VideoFileMetadata extends CommonFileMetadata {
  mediaType: MediaType.Video
}

export interface AudioFileMetadata extends CommonFileMetadata {
  mediaType: MediaType.Document
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

export type IntermediateFile = CommonFileMetadata & {
  id: string
  path: string
}

const magic = new Magic(MAGIC_MIME)

export function getMimeType(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    magic.detectFile(path, (err, mimeType) => {
      if (err) return reject(err)
      return resolve(mimeType)
    })
  })
}

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

export async function getImageSize(
  path: string
): Promise<{width: number | undefined; height: number | undefined}> {
  const metadata = await sharp(path).metadata()
  return {width: metadata.width, height: metadata.height}
}

export function getMetadataPathForID(id: string, tempDirPath: string) {
  return path.join(tempDirPath, `${id}.meta`)
}

export async function getMetadataForID(id: string, tempDirPath: string) {
  const metadataPath = getMetadataPathForID(id, tempDirPath)
  const metadataJSON = await readFile(metadataPath)

  return JSON.parse(metadataJSON.toString())
}

export async function getFileMetadata(file: UploadFile): Promise<FileMetadata> {
  const mimeType = await getMimeType(file.path)
  const stats = await statFile(file.path)

  const mediaType = getMediaType(mimeType)
  const extension = path.extname(file.filename)

  const commonMetadata: CommonFileMetadata = {
    filename: file.filename,
    fileSize: stats.size,
    extension: extension || undefined,
    mediaType,
    mimeType
  }

  switch (mediaType) {
    case MediaType.Image: {
      const size = await getImageSize(file.path)
      return {...commonMetadata, width: size.width, height: size.height} as ImageFileMetadata
    }

    case MediaType.Video:
      return commonMetadata as VideoFileMetadata
    case MediaType.Audio:
      return commonMetadata as AudioFileMetadata
    case MediaType.Document:
      return commonMetadata as DocumentFileMetadata
    case MediaType.Other:
      return commonMetadata as OtherFileMetadata
  }
}

export const writeFile = util.promisify(fs.writeFile)
export const readFile = util.promisify(fs.readFile)
export const statFile = util.promisify(fs.stat)
