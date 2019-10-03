export const enum MediaType {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Document = 'document',
  Other = 'other'
}

export function isValidMediaType(rawMediaType: string): rawMediaType is MediaType {
  switch (rawMediaType) {
    case MediaType.Image:
    case MediaType.Video:
    case MediaType.Audio:
    case MediaType.Document:
    case MediaType.Other:
      return true
  }

  return false
}

export const enum ErrorType {
  Internal = 'internal',
  InvalidRequest = 'invalidRequest',
  InvalidMediaType = 'invalidMediaType',
  InvalidExtension = 'invalidExtension',
  InvalidTransformation = 'invalidTransformation',
  PermissionDenied = 'permissionDenied',
  NotFound = 'notFound'
}

export interface Image {
  url: string
  width: number
  height: number
}

export interface CommonUploadResponse {
  id: string
  mediaType: MediaType
  mimeType: string
  url: string
  filename: string
  fileSize: number
  extension: string
  format: string
}

export interface ImageUploadResponse extends CommonUploadResponse {
  mediaType: MediaType.Image
  width: number
  height: number
}

export interface VideoUploadResponse extends CommonUploadResponse {
  mediaType: MediaType.Video
}

export interface AudioUploadResponse extends CommonUploadResponse {
  mediaType: MediaType.Audio
}

export interface DocumentUploadResponse extends CommonUploadResponse {
  mediaType: MediaType.Document
}

export interface OtherUploadResponse extends CommonUploadResponse {
  mediaType: MediaType.Other
}

export type UploadResponse =
  | ImageUploadResponse
  | VideoUploadResponse
  | AudioUploadResponse
  | DocumentUploadResponse
  | OtherUploadResponse

export interface CommonCommitResponse {
  id: string
  url: string
  mimeType: string
  filename: string
  fileSize: number
  extension: string
  format: string
}

export interface ImageCommitResponse extends CommonCommitResponse {
  mediaType: MediaType.Image
  width: number
  height: number
}

export interface VideoCommitResponse extends CommonCommitResponse {
  mediaType: MediaType.Video
}

export interface AudioCommitResponse extends CommonCommitResponse {
  mediaType: MediaType.Audio
}

export interface DocumentCommitResponse extends CommonCommitResponse {
  mediaType: MediaType.Document
}

export interface OtherCommitResponse extends CommonCommitResponse {
  mediaType: MediaType.Other
}

export type CommitResponse =
  | ImageCommitResponse
  | VideoCommitResponse
  | AudioCommitResponse
  | DocumentCommitResponse
  | OtherCommitResponse

export interface CopyResponse<T = any> {
  id: string
  url: string
  backend: T
}

export interface DeleteResponse {
  id: string
}
