import {CommitResponse, Image, CopyResponse} from '../interface'
import {PointLike} from '@karma.run/editor-common'

export interface CloudinaryResponse {
  public_id: string
  version: number
  signature: string
  width?: number
  height?: number
  format: string
  resource_type: string
  created_at: string
  tags: string[]
  bytes: number
  type: string
  etag: string
  placeholder: boolean
  url: string
  secure_url: string
  access_mode: string
  original_filename: string
  pages?: number
  frame_rate?: number
  bit_rate?: number
  duration?: number
  is_audio?: boolean
  rotation?: number
}

export type CloudinaryCommitResponse = CommitResponse<{cloudinary: CloudinaryResponse}>
export type CloudinaryCopyResponse = CopyResponse<{cloudinary: CloudinaryResponse}>

export interface IDComponents {
  resourceType: string
  publicID: string
}

export function convertFromCloudinaryID(publicID: string, resourceType: string): string {
  return encodeURIComponent(`${resourceType}/${publicID}`)
}

export function convertToCloudinaryID(id: string): IDComponents {
  id = decodeURIComponent(id)

  const resourceType = id.split('/')[0]
  const publicID = id.substring(resourceType.length + 1)

  return {resourceType, publicID}
}

export function getFocusPointTransformation(
  image: Image,
  focusPoint: PointLike,
  focusScale: number,
  cropWidth: number,
  cropHeight: number
) {
  const cropAspectRatio = cropWidth / cropHeight
  const imageAspectRatio = image.width / image.height

  let fittingCropWidth: number
  let fittingCropHeight: number

  if (cropAspectRatio > imageAspectRatio) {
    fittingCropWidth = image.width
    fittingCropHeight = image.width / cropAspectRatio
  } else {
    fittingCropWidth = image.height * cropAspectRatio
    fittingCropHeight = image.height
  }

  fittingCropWidth = Math.round(fittingCropWidth / focusScale)
  fittingCropHeight = Math.round(fittingCropHeight / focusScale)

  const scaledFocusPoint = {
    x: Math.round(focusPoint.x * image.width),
    y: Math.round(focusPoint.y * image.height)
  }

  return (
    'c_crop,g_xy_center,' +
    `w_${fittingCropWidth},h_${fittingCropHeight},` +
    `x_${scaledFocusPoint.x},y_${scaledFocusPoint.y}` +
    `/w_${cropWidth},h_${cropHeight}`
  )
}
