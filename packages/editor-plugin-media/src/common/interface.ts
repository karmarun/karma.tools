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

export interface CommonCommitResponse<T = any> {
  id: string
  url: string
  mimeType: string
  filename: string
  fileSize: number
  extension: string
  format: string
  backend: T
}

export interface ImageCommitResponse<T = any> extends CommonCommitResponse<T> {
  mediaType: MediaType.Image
  width: number
  height: number
}

export interface VideoCommitResponse<T = any> extends CommonCommitResponse<T> {
  mediaType: MediaType.Video
}

export interface AudioCommitResponse<T = any> extends CommonCommitResponse<T> {
  mediaType: MediaType.Audio
}

export interface DocumentCommitResponse<T = any> extends CommonCommitResponse<T> {
  mediaType: MediaType.Document
}

export interface OtherCommitResponse<T = any> extends CommonCommitResponse<T> {
  mediaType: MediaType.Other
}

export type CommitResponse<T = any> =
  | ImageCommitResponse<T>
  | VideoCommitResponse<T>
  | AudioCommitResponse<T>
  | DocumentCommitResponse<T>
  | OtherCommitResponse<T>

export interface CopyResponse<T = any> {
  id: string
  url: string
  backend: T
}

export interface DeleteResponse {
  id: string
}
