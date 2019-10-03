import {PointLike} from '@karma.run/editor-common'
import {CommitResponse, MediaType} from './interface'

export type Media = CommitResponse & {
  focusPoint: {x: number; y: number}
  focusScale: number
}

export type SerializedMedia = {
  mediaType: {
    image?: {width: number; height: number}
    video?: {}
    audio?: {}
    document?: {}
    other?: {}
  }
  id: string
  url: string
  format: string
  mimeType: string
  filename: string
  fileSize: number
  extension: string
  focusPoint: PointLike
  focusScale: number
}

export function thumbnailURL(baseURL: string, id: string) {
  return `${baseURL}/thumbnail/${id}`
}

export function serializeMedia(media: Media): SerializedMedia {
  const commonProps = {
    id: media.id,
    url: media.url,
    format: media.format,
    mimeType: media.mimeType,
    filename: media.filename,
    fileSize: media.fileSize,
    extension: media.extension,
    focusPoint: media.focusPoint,
    focusScale: media.focusScale
  }

  switch (media.mediaType) {
    case MediaType.Image:
      return {
        ...commonProps,
        mediaType: {
          image: {
            width: media.width,
            height: media.height
          }
        }
      }

    case MediaType.Video:
      return {
        ...commonProps,
        mediaType: {
          video: {}
        }
      }

    case MediaType.Audio:
      return {
        ...commonProps,
        mediaType: {
          audio: {}
        }
      }

    case MediaType.Document:
      return {
        ...commonProps,
        mediaType: {
          document: {}
        }
      }

    case MediaType.Other:
    default:
      return {
        ...commonProps,
        mediaType: {
          other: {}
        }
      }
  }
}

export function unserializeMedia(media: SerializedMedia): Media {
  const commonProps = {
    id: media.id,
    url: media.url,
    format: media.format,
    mimeType: media.mimeType,
    filename: media.filename,
    fileSize: media.fileSize,
    extension: media.extension,
    focusPoint: media.focusPoint,
    focusScale: media.focusScale
  }

  const mediaType = Object.keys(media.mediaType)[0] as MediaType

  switch (mediaType) {
    case MediaType.Image:
      return {
        ...commonProps,
        mediaType,
        ...media.mediaType[mediaType]!
      }

    case MediaType.Video:
      return {
        ...commonProps,
        mediaType,
        ...media.mediaType[mediaType]!
      }

    case MediaType.Audio:
      return {
        ...commonProps,
        mediaType,
        ...media.mediaType[mediaType]!
      }

    case MediaType.Document:
      return {
        ...commonProps,
        mediaType,
        ...media.mediaType[mediaType]!
      }

    case MediaType.Other:
    default:
      return {
        ...commonProps,
        mediaType,
        ...media.mediaType[mediaType]!
      }
  }
}
