import {
  convertFromCloudinaryID,
  convertToCloudinaryID,
  CloudinaryCommitResponse,
  CloudinaryCopyResponse,
  CloudinaryResponse,
  MediaType,
  CommonCommitResponse,
  DeleteResponse
} from '../../common'

import {MediaAdapter} from './interface'
import {IntermediateFile} from '../helper'

export interface CloudinaryConfig {
  cloud_name?: string
  api_key?: string
  api_secret?: string
  folder?: string
  use_filename?: boolean
  resource_type?: string
  fetch_format?: string
  transformation?: string
}

export interface CloudinaryAPI {
  v2: {
    uploader: {
      upload(path: string, config: CloudinaryConfig): Promise<CloudinaryResponse>
    }

    api: {
      delete_resources(ids: string[], config: CloudinaryConfig): Promise<any>
    }

    url(id: string, config: CloudinaryConfig): string
  }
}

// No @types yet for cloudinary module and we can't provide module definition accross libraries that's why we
// manually type the parts we need after require'ing it.
const cloudinary: CloudinaryAPI = require('cloudinary')

export interface CloudinaryOptions {
  cloudName: string
  folder?: string
  apiKey: string
  apiSecret: string
}

export class CloudinaryAdapter implements MediaAdapter {
  private baseConfig: CloudinaryConfig

  public constructor(options: CloudinaryOptions) {
    this.baseConfig = {
      cloud_name: options.cloudName,
      api_key: options.apiKey,
      api_secret: options.apiSecret,
      folder: options.folder
    }
  }

  private mediaTypeForResourceType(resourceType: string) {
    switch (resourceType) {
      case 'image':
        return MediaType.Image
      case 'video':
        return MediaType.Video
      default:
        return MediaType.Other
    }
  }

  public async copy(id: string): Promise<CloudinaryCopyResponse> {
    const {publicID, resourceType} = convertToCloudinaryID(id)

    const url = cloudinary.v2.url(publicID, {
      ...this.baseConfig,
      resource_type: resourceType
    })

    const response = await cloudinary.v2.uploader.upload(url, {
      ...this.baseConfig,
      use_filename: false
    })

    return {
      id: convertFromCloudinaryID(response.public_id, response.resource_type),
      url: response.secure_url,
      backend: {cloudinary: response}
    }
  }

  public async delete(id: string): Promise<DeleteResponse> {
    const {publicID, resourceType} = convertToCloudinaryID(id)

    await cloudinary.v2.api.delete_resources([publicID], {
      ...this.baseConfig,
      resource_type: resourceType
    })

    return {id}
  }

  public async thumbnailURL(id: string): Promise<string> {
    const {publicID, resourceType} = convertToCloudinaryID(id)

    return cloudinary.v2.url(publicID, {
      ...this.baseConfig,
      transformation: 'media_lib_thumb',
      resource_type: resourceType,
      fetch_format: 'auto'
    })
  }

  public async commit(
    file: IntermediateFile,
    overrideID?: string
  ): Promise<CloudinaryCommitResponse> {
    const response = await cloudinary.v2.uploader.upload(file.path, {
      ...this.baseConfig,
      use_filename: false,
      resource_type: 'auto'
    })

    const mediaType = this.mediaTypeForResourceType(response.resource_type)

    const knownCloudinaryProps: CloudinaryResponse = {
      public_id: response.public_id,
      version: response.version,
      signature: response.signature,
      width: response.width,
      height: response.height,
      format: response.format,
      resource_type: response.resource_type,
      created_at: response.created_at,
      tags: response.tags,
      bytes: response.bytes,
      type: response.type,
      etag: response.etag,
      placeholder: response.placeholder,
      url: response.url,
      secure_url: response.secure_url,
      access_mode: response.access_mode,
      original_filename: response.original_filename,
      pages: response.pages,
      frame_rate: response.frame_rate,
      bit_rate: response.bit_rate,
      duration: response.duration,
      is_audio: response.is_audio,
      rotation: response.rotation
    }

    const commonResponse: CommonCommitResponse = {
      id: convertFromCloudinaryID(response.public_id, response.resource_type),
      url: response.secure_url,
      filename: file.filename,
      fileSize: file.fileSize,
      extension: file.extension,
      mimeType: file.mimeType,
      format: file.format,
      backend: {cloudinary: knownCloudinaryProps}
    }

    try {
      if (overrideID) await this.delete(overrideID)
    } catch (err) {
      console.error('Error while deleting old cloudinary resource: ', err)
    }

    switch (mediaType) {
      case MediaType.Image:
        return {
          mediaType,
          ...commonResponse,
          width: response.width!,
          height: response.height!
        }

      case MediaType.Video:
        return {
          mediaType,
          ...commonResponse
        }

      default:
        return {
          mediaType,
          ...commonResponse
        }
    }
  }

  public async get(): Promise<never> {
    throw new Error('Not implemented!')
  }
}
