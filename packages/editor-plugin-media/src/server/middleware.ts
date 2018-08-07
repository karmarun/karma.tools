import os from 'os'
import path from 'path'
import shortid from 'shortid'
import mkdirp from 'mkdirp'
import sharp from 'sharp'

import Busboy from 'busboy'
import {Router, RequestHandler, json, Response} from 'express'
import {ErrorRequestHandler, Request, NextFunction} from 'express-serve-static-core'

import {deleteNullValues} from '@karma.run/editor-common'
import {SignatureHeader, query, buildFunction} from '@karma.run/sdk'

import {MediaType, ErrorType} from '../common'

import {LocalBackend, MediaBackend} from './backend'

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
  CopyOptions
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
  backend: MediaBackend
  allowedRoles: string[]
  allowedMediaTypes?: MediaType[]
  tempDirPath?: string
}

export const defaultOptions: Partial<MiddlewareOptions> = {
  tempDirPath: path.join(os.tmpdir(), 'karma.run-media'),
  backend: new LocalBackend(),
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
    const busboy = new Busboy({
      headers: req.headers,
      limits: {files: 1}
    })

    busboy.on('file', async (_fieldName, fileStream, filename) => {
      // WORKAROUND: We have to include the extension so sharp can detect SVGs.
      const extension = path.extname(filename)
      const id = shortid() + extension

      const uploadFile: UploadFile | undefined = {
        id,
        filename,
        path: getFilePathForID(id, opts.tempDirPath)
      }

      // Normalize rotation based on EXIF
      const pipeline = sharp().rotate()
      fileStream.pipe(pipeline)

      try {
        await pipeline.toFile(uploadFile.path)

        return res.status(200).send(
          await uploadMedia(uploadFile!, {
            hostname: opts.hostname,
            tempDirPath: opts.tempDirPath,
            allowedMediaTypes: opts.allowedMediaTypes
          })
        )
      } catch (err) {
        return next(err)
      }
    })

    req.pipe(busboy)
  }
}

export function previewMediaMiddleware(opts: PreviewMiddlewareOptions): RequestHandler {
  return async (req, res, next) => {
    if (!req.params.id || typeof req.params.id !== 'string') return next(ErrorType.InvalidRequest)

    try {
      const tempFilePath = path.join(opts.tempDirPath, req.params.id)
      const metadata = await getMetadataForID(req.params.id, opts.tempDirPath)

      // Deliver "image/svg" as "image/svg+xml"
      const mimeType = metadata.mimeType.replace('image/svg;', 'image/svg+xml;')

      return res.status(200).sendFile(tempFilePath, {
        headers: {'Content-Type': mimeType}
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
      return res.status(200).send(await commitMedia(req.body.id, req.body.overrideID, opts))
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

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (typeof err === 'string') {
    let statusCode = 400

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
    }

    return res.status(statusCode).send({type: err})
  } else {
    console.error('Error:', err)
    return res.status(500).send({type: ErrorType.Internal})
  }
}

export function mediaMiddleware(options: MiddlewareOptions): Router {
  const opts = (options
    ? {...defaultOptions, ...deleteNullValues(options)}
    : defaultOptions) as Required<MiddlewareOptions>

  const router = Router()

  router.get('/preview/:id', previewMediaMiddleware(opts))
  router.get('/thumbnail/:id', thumbnailRedirectMiddleware(opts))

  router.use(json())
  router.use(checkPrivilegeMiddleware(opts))

  router.post('/upload', uploadMediaMiddleware(opts))
  router.post('/commit', commitMediaMiddleware(opts))
  router.post('/copy', copyMediaMiddleware(opts))

  router.delete('/:id', deleteMediaMiddleware(opts))
  router.use(errorHandler)

  return router
}
