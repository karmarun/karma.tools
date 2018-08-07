import fs from 'fs'

import {
  UploadResponse,
  MediaType,
  ErrorType,
  CommitResponse,
  CopyResponse,
  DeleteResponse
} from '../common'

import {MediaBackend} from './backend'
import {UploadFile} from './helper'

import {
  getFilePathForID,
  getMetadataPathForID,
  IntermediateFile,
  readFile,
  getFileMetadata,
  writeFile
} from './helper'

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
    url: `${opts.hostname}/preview/${uploadFile.id}`
  }
}

export interface CommitOptions {
  tempDirPath: string
  backend: MediaBackend
}

export async function commitMedia(
  id: string,
  overrideID: string | undefined,
  opts: CommitOptions
): Promise<CommitResponse> {
  const filePath = getFilePathForID(id, opts.tempDirPath)
  const metadataPath = getMetadataPathForID(id, opts.tempDirPath)

  const metadataJSON = await readFile(metadataPath)
  const metadata = JSON.parse(metadataJSON.toString())

  const intermidateFile: IntermediateFile = {
    id,
    path: filePath,
    ...metadata
  }

  try {
    const response = await opts.backend.commit(intermidateFile, overrideID)

    fs.unlink(filePath, err => {
      if (err) console.error('Error while deleting intermidate file: ', err)
    })

    fs.unlink(metadataPath, err => {
      if (err) console.error('Error while deleting intermidate file metadata: ', err)
    })

    return response
  } catch (err) {
    console.error(err)
    throw err
  }
}

export interface CopyOptions {
  backend: MediaBackend
}

export async function copyMedia(id: string, opts: CopyOptions): Promise<CopyResponse> {
  return opts.backend.copy(id)
}

export interface DeleteOptions {
  backend: MediaBackend
}

export async function deleteMedia(id: string, opts: DeleteOptions): Promise<DeleteResponse> {
  return opts.backend.delete(id)
}

export interface ThumbnailOptions {
  backend: MediaBackend
}

export async function thumbnailRedirectURL(id: string, opts: ThumbnailOptions): Promise<string> {
  return opts.backend.thumbnailURL(id)
}
