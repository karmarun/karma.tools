import os from 'os'
import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import mimeTypes from 'mime-types'
import Busboy from 'busboy'

import sharp from 'sharp'

import {Router, RequestHandler, json, Response} from 'express'
import {ErrorRequestHandler, Request, NextFunction} from 'express-serve-static-core'

import {deleteNullValues} from '@karma.run/editor-common'

import {MediaType, ErrorType, generateID} from '../common'
import {getFilePathForID, UploadFile, getMetadataForID} from './helper'

import {
  commitMedia,
  uploadMedia,
  deleteMedia,
  thumbnailRedirectURL,
  copyMedia,
  UploadOptions,
  CommitOptions,
  DeleteOptions,
  ThumbnailOptions,
  CopyOptions,
  LocaleStorageAdapter,
  FileID,
  StorageAdapter,
  TransformationRotation,
  TransformationFocusType
} from './action'

import {Remote, UserSession} from '@karma.run/sdk'

import * as xpr from '@karma.run/sdk/expression'
import * as utl from '@karma.run/sdk/utility'

export type UploadMiddlewareOptions = UploadOptions
export type CommitMiddlewareOptions = CommitOptions
export type CopyMiddlewareOptions = CopyOptions
export type DeleteMiddlewareOptions = DeleteOptions
export type ThumbnailMiddlewareOptions = ThumbnailOptions

export interface CheckPrivilegeMiddlewareOptions {
  karmaDataURL: string
  allowedRoles: string[]
}

export interface PreviewMiddlewareOptions {
  tempDirPath: string
}

export interface MiddlewareOptions {
  karmaDataURL: string
  hostname: string
  storageAdapter: StorageAdapter
  allowedRoles: string[]
  allowedMediaTypes?: MediaType[]
  tempDirPath?: string
}

export const defaultOptions: Partial<MiddlewareOptions> = {
  tempDirPath: path.join(os.tmpdir(), 'karma.run-media'),
  storageAdapter: new LocaleStorageAdapter(path.resolve(process.cwd(), '.cache')),
  allowedMediaTypes: [
    MediaType.Image,
    MediaType.Video,
    MediaType.Audio,
    MediaType.Document,
    MediaType.Other
  ]
}

export function uploadMediaMiddleware(opts: UploadMiddlewareOptions): RequestHandler {
  // Create temp dir if it doesn't exist
  mkdirp.sync(opts.tempDirPath)

  return async (req, res, next) => {
    try {
      const busboy = new Busboy({
        headers: req.headers,
        limits: {files: 1}
      })

      busboy.on('file', async (_fieldName, fileStream, filename) => {
        const id = generateID()
        const filePath = getFilePathForID(id, opts.tempDirPath)
        const uploadFile: UploadFile = {id, filename, path: filePath}

        try {
          await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(uploadFile.path)

            writeStream.on('finish', () => resolve())
            writeStream.on('error', err => reject(err))

            fileStream.pipe(writeStream)
          })

          return res.status(200).send(
            await uploadMedia(uploadFile, {
              hostname: opts.hostname,
              tempDirPath: opts.tempDirPath,
              allowedMediaTypes: opts.allowedMediaTypes
            })
          )
        } catch (err) {
          return next(err)
        }
      })

      busboy.on('error', (err: any) => {
        return next(err)
      })

      req.pipe(busboy)
    } catch (err) {
      return next(err)
    }
  }
}

export function previewMediaMiddleware(opts: PreviewMiddlewareOptions): RequestHandler {
  return async (req, res, next) => {
    if (!req.params.id || typeof req.params.id !== 'string') return next(ErrorType.InvalidRequest)

    try {
      const tempFilePath = path.join(opts.tempDirPath, req.params.id)
      const metadata = await getMetadataForID(req.params.id, opts.tempDirPath)

      return res.status(200).sendFile(tempFilePath, {
        headers: {'Content-Type': metadata.mimeType}
      })
    } catch (err) {
      return next(ErrorType.NotFound)
    }
  }
}

export function commitMediaMiddleware(opts: CommitMiddlewareOptions): RequestHandler {
  return async (req, res, next) => {
    if (
      !req.body.id ||
      typeof req.body.id !== 'string' ||
      (req.body.overrideID && typeof req.body.overrideID !== 'string')
    ) {
      return next(ErrorType.InvalidRequest)
    }

    try {
      const overrideID = req.body.overrideID && FileID.fromIDString(req.body.overrideID)
      return res.status(200).send(await commitMedia(req.body.id, overrideID, opts))
    } catch (err) {
      return next(err)
    }
  }
}

export function copyMediaMiddleware(opts: DeleteMiddlewareOptions): RequestHandler {
  return async (req, res, next) => {
    if (!req.body.id || typeof req.body.id !== 'string') return next(ErrorType.InvalidRequest)

    try {
      return res.status(200).send(await copyMedia(req.body.id, opts))
    } catch (err) {
      return next(err)
    }
  }
}

export function deleteMediaMiddleware(opts: DeleteMiddlewareOptions): RequestHandler {
  return async (req, res, next) => {
    if (!req.params.id || typeof req.params.id !== 'string') return next(ErrorType.InvalidRequest)

    try {
      return res.status(200).send(await deleteMedia(req.params.id, opts))
    } catch (err) {
      return next(err)
    }
  }
}

export function thumbnailRedirectMiddleware(opts: ThumbnailMiddlewareOptions): RequestHandler {
  return async (req, res, next) => {
    if (!req.params.id || typeof req.params.id !== 'string') return next(ErrorType.InvalidRequest)

    try {
      return res.redirect(await thumbnailRedirectURL(req.params.id, opts))
    } catch (err) {
      return next(err)
    }
  }
}

export function checkPrivilegeMiddleware(opts: CheckPrivilegeMiddlewareOptions) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const remote = new Remote(opts.karmaDataURL)
    const signature = req.header(utl.Header.Signature)

    if (!signature) return next(ErrorType.PermissionDenied)

    const session = new UserSession(remote.endpoint, '', signature)

    try {
      const roles: string[] = await session.do(
        xpr.mapList(xpr.field('roles', xpr.get(xpr.currentUser())), (_, value) =>
          xpr.field('name', xpr.get(value))
        )
      )

      if (roles.some(role => opts.allowedRoles.includes(role))) {
        return next()
      }
    } catch (err) {
      return next(err)
    }

    return next(ErrorType.PermissionDenied)
  }
}

export function getMiddleware(opts: CommitMiddlewareOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fileID = FileID.fromURLPath(req.path)
      const exists = await opts.storageAdapter.exists(fileID)

      if (!exists && fileID.mediaType !== MediaType.Image) return next(ErrorType.NotFound)
      if (!exists && fileID.isOriginal) return next(ErrorType.NotFound)

      if (!exists) {
        const originalFileID = fileID.original()
        const originalExists = await opts.storageAdapter.exists(originalFileID)

        if (!originalExists) return next(ErrorType.NotFound)

        const originalStream = (await opts.storageAdapter.read(originalFileID)).pipe(sharp())
        const metadata = await originalStream.rotate().metadata()

        let lastStream = originalStream
        let formatSharpInstance = sharp()

        for (const transformation of fileID.transformations) {
          const sharpInstance = sharp()
          lastStream.pipe(sharpInstance)

          if (
            typeof transformation.focus === 'object' &&
            (transformation.width || transformation.height)
          ) {
          } else {
            switch (transformation.rotation) {
              case TransformationRotation.Rotate0:
                sharpInstance.rotate(0)
                break

              case TransformationRotation.Rotate90:
                sharpInstance.rotate(90)
                break

              case TransformationRotation.Rotate180:
                sharpInstance.rotate(180)
                break

              case TransformationRotation.Rotate270:
                sharpInstance.rotate(270)
                break

              case TransformationRotation.Auto:
                // We already normalize the rotation on any transformation.
                break
            }

            if (transformation.width || transformation.height) {
              const constrainedWidth = transformation.width
                ? Math.min(1000, Math.min(metadata.width!, transformation.width)) // TODO: Add max size to options
                : undefined

              const constrainedHeight = transformation.height
                ? Math.min(1000, Math.min(metadata.height!, transformation.height)) // TODO: Add max size to options
                : undefined

              sharpInstance.resize(constrainedWidth, constrainedHeight, {
                fit: 'cover',
                position:
                  typeof transformation.focus === 'string'
                    ? positionForFocusType(transformation.focus)
                    : undefined
              })
            }
          }

          lastStream = sharpInstance
        }

        lastStream.pipe(formatSharpInstance)

        await opts.storageAdapter.write(fileID, formatSharpInstance.toFormat(fileID.outputFormat))
      }

      const stream = await opts.storageAdapter.read(fileID)
      const mimeType = mimeTypes.contentType(fileID.outputFormat) || 'application/octet-stream'

      stream
        .on('error', err => {
          console.error(err)
          return next(ErrorType.NotFound)
        })
        .once('data', function() {
          res.set('Content-Type', mimeType)
          res.status(200)
        })
        .on('data', function(chunk) {
          res.write(chunk)
        })
        .on('end', () => {
          res.end()
        })
    } catch (err) {
      return next(err)
    }
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (typeof err === 'string') {
    let statusCode = 400
    let message: string | undefined = undefined

    switch (err) {
      case ErrorType.PermissionDenied:
        statusCode = 403
        break

      case ErrorType.NotFound:
        statusCode = 404
        break

      case ErrorType.Internal:
        statusCode = 500
        break

      case ErrorType.InvalidExtension:
        statusCode = 400
        message =
          'Image MIME type differs from extension MIME type, ' +
          "usually means that the extension didn't match the actual content"
    }

    return res.status(statusCode).json({type: err, message})
  } else {
    console.error('Error:', err)
    return res.status(500).json({type: ErrorType.Internal})
  }
}

export function mediaMiddleware(options: MiddlewareOptions): Router {
  const opts = (options
    ? {...defaultOptions, ...deleteNullValues(options)}
    : defaultOptions) as Required<MiddlewareOptions>

  const router = Router()

  router.get('/preview/:id', previewMediaMiddleware(opts))
  // router.get('/thumbnail/:id', thumbnailRedirectMiddleware(opts)) // TODO
  router.get('/*', getMiddleware(opts))

  router.use(json())
  // router.use(checkPrivilegeMiddleware(opts))

  router.post('/upload', uploadMediaMiddleware(opts))
  router.post('/commit', commitMediaMiddleware(opts))
  // router.post('/copy', copyMediaMiddleware(opts)) // TODO

  // router.delete('/:id', deleteMediaMiddleware(opts)) // TODO

  router.use(errorHandler)

  return router
}

export function positionForFocusType(focus: TransformationFocusType) {
  switch (focus) {
    case TransformationFocusType.AutoAttention:
      return sharp.strategy.attention

    case TransformationFocusType.AutoEntropy:
      return sharp.strategy.entropy

    case TransformationFocusType.TopLeft:
      return sharp.gravity.northwest

    case TransformationFocusType.Top:
      return sharp.gravity.north

    case TransformationFocusType.TopRight:
      return sharp.gravity.northeast

    case TransformationFocusType.Right:
      return sharp.gravity.east

    case TransformationFocusType.BottomRight:
      return sharp.gravity.southeast

    case TransformationFocusType.Bottom:
      return sharp.gravity.south

    case TransformationFocusType.BottomLeft:
      return sharp.gravity.southwest

    case TransformationFocusType.Left:
      return sharp.gravity.west

    case TransformationFocusType.Center:
      return sharp.gravity.center
  }
}
