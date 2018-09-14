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
import {SignatureHeader, query, buildFunction} from '@karma.run/sdk'

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
  StorageAdapter
} from './action'

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
    const signature = req.get(SignatureHeader)
    if (!signature) return next(ErrorType.PermissionDenied)

    try {
      const roles: string[] = await query(
        opts.karmaDataURL,
        signature,
        buildFunction(e => () =>
          e.mapList(e.field('roles', e.get(e.currentUser())), (_, value) =>
            e.field('name', e.get(value))
          )
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

        const originalStream = await opts.storageAdapter.read(originalFileID)

        let lastStream = originalStream
        let formatSharpInstance = sharp()

        for (const transformation of fileID.transformations) {
          const sharpInstance = sharp()
          lastStream.pipe(sharpInstance)

          // if (transformation.width || transformation.height) {
          if (typeof transformation.focus === 'object') {
          } else {
            switch (transformation.focus) {
              case 'auto_attention':
                sharpInstance.crop(sharp.strategy.attention)
                break

              case 'auto_entropy':
                sharpInstance.crop(sharp.strategy.entropy)
                break

              case 'top_left':
                sharpInstance.crop(sharp.gravity.northwest)
                break

              case 'top':
                sharpInstance.crop(sharp.gravity.north)
                break

              case 'top_right':
                sharpInstance.crop(sharp.gravity.northeast)
                break

              case 'right':
                sharpInstance.crop(sharp.gravity.east)
                break

              case 'bottom_right':
                sharpInstance.crop(sharp.gravity.southeast)
                break

              case 'bottom':
                sharpInstance.crop(sharp.gravity.south)
                break

              case 'bottom_left':
                sharpInstance.crop(sharp.gravity.southwest)
                break

              case 'left':
                sharpInstance.crop(sharp.gravity.west)
                break

              case 'center':
                sharpInstance.crop(sharp.gravity.center)
                break
            }

            switch (transformation.rotation) {
              case '0':
                sharpInstance.rotate(0)
                break

              case '90':
                sharpInstance.rotate(90)
                break

              case '180':
                sharpInstance.rotate(180)
                break

              case '270':
                sharpInstance.rotate(270)
                break

              case 'auto':
                sharpInstance.rotate()
                break
            }

            sharpInstance.resize(transformation.width, transformation.height)
          }
          // }

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
