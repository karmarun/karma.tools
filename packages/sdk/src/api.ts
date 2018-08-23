import axios, {AxiosError} from 'axios'
import {Ref, FunctionFn} from './types'
import {ObjectMap} from './internal'

export enum DefaultTags {
  Model = '_model',
  Tag = '_tag',
  Role = '_role',
  Migration = '_migration',
  User = '_user',
  Expression = '_expression'
}

export function isRef(ref: any): ref is Ref {
  return Array.isArray(ref) && typeof ref[0] === 'string' && typeof ref[1] === 'string'
}

export function createRef(model: string, id: string): Ref {
  return [model, id]
}

export const enum KarmaErrorType {
  RequestError = 'requestError',
  PermissionDeniedError = 'permissionDeniedError',
  DatabaseDoesNotExistError = 'databaseDoesNotExistError',
  ExecutionError = 'executionError',
  ObjectNotFoundError = 'objectNotFoundError',
  ModelNotFoundError = 'modelNotFoundError',
  CompilationError = 'compilationError',
  CodecError = 'codecError',
  InputParsingError = 'inputParsingError',
  ArgumentError = 'argumentError',
  DoNotationError = 'doNotationError',
  ModelParsingError = 'modelParsingError',
  InternalError = 'internalError',
  ConnectionError = 'connectionError',
  UnknownError = 'unknownError',
  AutoMigrationError = 'autoMigrationError'
}

export interface KarmaResponseErrorData {
  humanReadableError: {
    human: string
    machine: any
  }
}

export class KarmaError extends Error {
  public readonly type: KarmaErrorType = KarmaErrorType.ConnectionError
  public readonly data: any

  constructor(data?: KarmaResponseErrorData) {
    super()

    if (data) {
      // Currently not all errors are 'humanReadableError'
      if (data.humanReadableError) {
        const typeKey = Object.keys(data.humanReadableError.machine)[0]
        this.type = typeKey as KarmaErrorType
        this.message = data.humanReadableError.human
        this.data = data.humanReadableError.machine[typeKey]
      } else {
        const typeKey = Object.keys(data)[0]
        this.type = typeKey as KarmaErrorType
        this.message = this.type
        this.data = (data as any)[typeKey]
      }
    }
  }
}

export const enum Codec {
  JSON = 'json'
}

export const CodedHeader = 'X-Karma-Codec'
export const SignatureHeader = 'X-Karma-Signature'

export function headersForSignature(signature?: string, headers: ObjectMap = {}) {
  if (signature) headers[SignatureHeader] = signature
  return headers
}

export function headersForCodec(codec: Codec, headers: ObjectMap = {}) {
  headers[CodedHeader] = codec
  return headers
}

export function bodyForData(data: any, codec: Codec) {
  switch (codec) {
    case Codec.JSON:
      return JSON.stringify(data)
  }
}

async function postUploadRequest(
  url: string,
  data: any,
  signature?: string,
  codec = Codec.JSON
): Promise<any> {
  try {
    const headers: ObjectMap = headersForSignature(signature, headersForCodec(codec))
    const result = await axios.post(url, bodyForData(data, codec), {headers})

    return result.data
  } catch (e) {
    const err: AxiosError = e

    if (err.response && err.response.data) {
      throw new KarmaError(err.response.data)
    }

    throw new KarmaError()
  }
}

async function postRequest(
  url: string,
  data: any,
  signature?: string,
  codec = Codec.JSON
): Promise<any> {
  try {
    const headers: ObjectMap = headersForSignature(signature, headersForCodec(codec))
    const result = await axios.post(url, bodyForData(data, codec), {headers})

    return result.data
  } catch (e) {
    const err: AxiosError = e

    if (err.response && err.response.data) {
      throw new KarmaError(err.response.data)
    }

    throw new KarmaError()
  }
}

async function binaryGetRequest(url: string, signature?: string, codec = Codec.JSON): Promise<any> {
  try {
    const headers: ObjectMap = headersForSignature(signature, headersForCodec(codec))
    const result = await axios.get(url, {headers, responseType: 'arraybuffer'})

    return result.data
  } catch (e) {
    const err: AxiosError = e

    if (err.response && err.response.data) {
      throw new KarmaError(err.response.data)
    }

    throw new KarmaError()
  }
}

export async function query(
  url: string,
  signature: string,
  expression: FunctionFn,
  codec = Codec.JSON
) {
  return await postRequest(url, expression, signature, codec)
}

export async function reset(url: string, signature: string, codec = Codec.JSON) {
  await postRequest(url + '/admin/reset', undefined, signature, codec)
}

export async function authenticate(
  url: string,
  username: string,
  password: string,
  codec = Codec.JSON
): Promise<string> {
  const data = {username, password}
  const signature = await postRequest(url + '/auth', data, undefined, codec)

  return signature
}

export async function refreshSession(
  baseURL: string,
  signature?: string,
  codec = Codec.JSON
): Promise<string> {
  const newSignature = await postRequest(baseURL + '/auth', undefined, signature, codec)
  return newSignature
}

export async function exportDB(
  url: string,
  signature: string,
  codec = Codec.JSON
): Promise<ArrayBuffer> {
  return await binaryGetRequest(url + '/admin/export', signature, codec)
}

export async function importDB(
  url: string,
  signature: string,
  data: ArrayBuffer,
  codec = Codec.JSON
) {
  return await postUploadRequest(url + '/admin/import', data, signature, codec)
}

export async function createRecords(
  url: string,
  signature: string,
  model: Ref | string,
  data: any[]
): Promise<Ref> {
  if (isRef(model)) return await postRequest(`${url}/rest/${model[1]}`, data, signature)
  return await postRequest(`${url}/rest/${model}`, data, signature)
}

export class Client {
  public signature?: string
  public readonly url: string
  public readonly codec: Codec

  constructor(url: string, codec = Codec.JSON) {
    this.url = url
    this.codec = codec
  }

  public query(expression: FunctionFn) {
    if (!this.signature) throw new Error("Can't query without session!")
    return query(this.url, this.signature, expression, this.codec)
  }

  public async authenticate(username: string, password: string) {
    this.signature = await authenticate(this.url, username, password, this.codec)
    return this.signature
  }

  public reset() {
    if (!this.signature) throw new Error("Can't reset without session!")
    return reset(this.url, this.signature, this.codec)
  }

  public exportDB() {
    if (!this.signature) throw new Error("Can't exportDBB without session!")
    return exportDB(this.url, this.signature, this.codec)
  }

  public importDB(data: ArrayBuffer) {
    if (!this.signature) throw new Error("Can't importDB without session!")
    return importDB(this.url, this.signature, data, this.codec)
  }

  public createRecords(model: Ref | string, data: any[]) {
    if (!this.signature) throw new Error("Can't createRecords without session!")
    return createRecords(this.url, this.signature, model, data)
  }
}
