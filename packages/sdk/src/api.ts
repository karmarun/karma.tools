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

async function getRequest(url: string, signature?: string, codec = Codec.JSON): Promise<any> {
  try {
    const headers: ObjectMap = headersForSignature(signature, headersForCodec(codec))
    const result = await axios.get(url, {headers})

    return result.data
  } catch (e) {
    const err: AxiosError = e

    if (err.response && err.response.data) {
      throw new KarmaError(err.response.data)
    }

    throw new KarmaError()
  }
}

async function putRequest(
  url: string,
  data: any,
  signature?: string,
  codec = Codec.JSON
): Promise<any> {
  try {
    const headers: ObjectMap = headersForSignature(signature, headersForCodec(codec))
    const result = await axios.put(url, data, {headers})

    return result.data
  } catch (e) {
    const err: AxiosError = e

    if (err.response && err.response.data) {
      throw new KarmaError(err.response.data)
    }

    throw new KarmaError()
  }
}

async function deleteRequest(url: string, signature?: string, codec = Codec.JSON): Promise<any> {
  try {
    const headers: ObjectMap = headersForSignature(signature, headersForCodec(codec))
    const result = await axios.delete(url, {headers})

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

export async function createRecords<T = any>(
  url: string,
  signature: string,
  modelRef: Ref,
  data: T[]
): Promise<Ref[]>
export async function createRecords<T = any>(
  url: string,
  signature: string,
  modelOrTag: string,
  data: T[]
): Promise<Ref[]>
export async function createRecords<T = any>(
  url: string,
  signature: string,
  model: Ref | string,
  data: T[]
): Promise<Ref[]> {
  return createRecordsInternal<T>(url, signature, model, data)
}

async function createRecordsInternal<T = any>(
  url: string,
  signature: string,
  model: Ref | string,
  data: T[]
): Promise<Ref[]> {
  const modelID = isRef(model) ? model[1] : model
  return postRequest(`${url}/rest/${modelID}`, data, signature)
}

export async function createRecord<T = any>(
  url: string,
  signature: string,
  modelRef: Ref,
  data: T
): Promise<Ref>
export async function createRecord<T = any>(
  url: string,
  signature: string,
  modelOrTag: string,
  data: T
): Promise<Ref>
export async function createRecord<T = any>(
  url: string,
  signature: string,
  model: Ref | string,
  data: T
): Promise<Ref> {
  return createRecordInternal<T>(url, signature, model, data)
}

async function createRecordInternal<T = any>(
  url: string,
  signature: string,
  model: Ref | string,
  data: T
): Promise<Ref> {
  const modelID = isRef(model) ? model[1] : model
  return (await postRequest(`${url}/rest/${modelID}`, [data], signature))[0]
}

// TODO: Add support for length, offset and metadata query parameters
export async function getRecords<T = any>(
  url: string,
  signature: string,
  modelRef: Ref
): Promise<T[]>
export async function getRecords<T = any>(
  url: string,
  signature: string,
  modelOrTag: string
): Promise<T[]>
export async function getRecords<T = any>(
  url: string,
  signature: string,
  model: Ref | string
): Promise<T[]> {
  return getRecordsInternal<T>(url, signature, model)
}

async function getRecordsInternal<T = any>(
  url: string,
  signature: string,
  model: Ref | string
): Promise<T[]> {
  const modelID = isRef(model) ? model[1] : model
  return await getRequest(`${url}/rest/${modelID}`, signature)
}

export async function getRecord<T = any>(
  url: string,
  signature: string,
  modelOrTag: string,
  recordID: string
): Promise<T>
export async function getRecord<T = any>(url: string, signature: string, recordRef: Ref): Promise<T>
export async function getRecord<T = any>(
  url: string,
  signature: string,
  ...params: any[]
): Promise<T> {
  return getRecordInternal<T>(url, signature, params as any)
}

async function getRecordInternal<T = any>(
  url: string,
  signature: string,
  params: [string, string] | [Ref]
): Promise<T> {
  if (params.length === 2) {
    return getRequest(`${url}/rest/${params[0]}/${params[1]}`, signature)
  } else if (params.length === 1) {
    return getRequest(`${url}/rest/${params[0][0]}/${params[0][1]}`, signature)
  } else {
    throw new Error('Invalid parameters!')
  }
}

export async function updateRecord<T = any>(
  url: string,
  signature: string,
  modelOrTag: string,
  recordID: string,
  data: T
): Promise<Ref>
export async function updateRecord<T = any>(
  url: string,
  signature: string,
  recordRef: Ref,
  data: T
): Promise<Ref>
export async function updateRecord(url: string, signature: string, ...params: any[]): Promise<Ref> {
  return updateRecordInternal(url, signature, params as any)
}

async function updateRecordInternal<T = any>(
  url: string,
  signature: string,
  params: [string, string, T] | [Ref, T]
): Promise<Ref> {
  if (params.length === 3) {
    return putRequest(`${url}/rest/${params[0]}/${params[1]}`, params[2], signature)
  } else if (params.length === 2) {
    return putRequest(`${url}/rest/${params[0][0]}/${params[0][1]}`, params[1], signature)
  } else {
    throw new Error('Invalid parameters!')
  }
}

export async function deleteRecord<T = any>(
  url: string,
  signature: string,
  modelOrTag: string,
  recordID: string
): Promise<T>
export async function deleteRecord<T = any>(
  url: string,
  signature: string,
  recordRef: Ref
): Promise<T>
export async function deleteRecord<T = any>(
  url: string,
  signature: string,
  ...params: any[]
): Promise<T> {
  return deleteRecordInternal<T>(url, signature, params as any)
}

async function deleteRecordInternal<T = any>(
  url: string,
  signature: string,
  params: [string, string] | [Ref]
): Promise<T> {
  if (params.length === 2) {
    return deleteRequest(`${url}/rest/${params[0]}/${params[1]}`, signature)
  } else if (params.length === 1) {
    return deleteRequest(`${url}/rest/${params[0][0]}/${params[0][1]}`, signature)
  } else {
    throw new Error('Invalid parameters!')
  }
}

export class Client {
  public signature?: string
  public readonly url: string
  public readonly codec: Codec

  constructor(url: string, codec = Codec.JSON) {
    this.url = url
    this.codec = codec
  }

  public query(expression: FunctionFn): Promise<any> {
    if (!this.signature) throw new Error("Can't query without session!")
    return query(this.url, this.signature, expression, this.codec)
  }

  public async authenticate(username: string, password: string): Promise<string> {
    this.signature = await authenticate(this.url, username, password, this.codec)
    return this.signature
  }

  public get isAuthenticated(): boolean {
    return this.signature != undefined
  }

  public reset(): Promise<void> {
    if (!this.signature) throw new Error("Can't reset without session!")
    return reset(this.url, this.signature, this.codec)
  }

  public exportDB(): Promise<ArrayBuffer> {
    if (!this.signature) throw new Error("Can't exportDB without session!")
    return exportDB(this.url, this.signature, this.codec)
  }

  public importDB(data: ArrayBuffer): Promise<any> {
    if (!this.signature) throw new Error("Can't importDB without session!")
    return importDB(this.url, this.signature, data, this.codec)
  }

  public createRecords<T = any>(model: Ref | string, data: T[]): Promise<Ref[]> {
    if (!this.signature) throw new Error("Can't createRecords without session!")
    return createRecordsInternal(this.url, this.signature, model, data)
  }

  public createRecord<T = any>(model: Ref | string, data: T): Promise<Ref> {
    if (!this.signature) throw new Error("Can't createRecord without session!")
    return createRecordInternal(this.url, this.signature, model, data)
  }

  public getRecords<T = any>(modelRef: Ref): Promise<T[]>
  public getRecords<T = any>(modelOrTag: string): Promise<T[]>
  public getRecords<T = any>(model: Ref | string): Promise<T[]> {
    if (!this.signature) throw new Error("Can't getRecords without session!")
    return getRecordsInternal(this.url, this.signature, model)
  }

  public getRecord<T = any>(model: string, recordID: string): Promise<T>
  public getRecord<T = any>(recordRef: Ref): Promise<T>
  public getRecord<T = any>(...params: any[]): Promise<T> {
    if (!this.signature) throw new Error("Can't getRecord without session!")
    return getRecordInternal(this.url, this.signature, params as any)
  }

  public updateRecord<T = any>(model: string, recordID: string, data: T): Promise<Ref>
  public updateRecord<T = any>(recordRef: Ref, data: T): Promise<Ref>
  public updateRecord(...params: any[]): Promise<Ref> {
    if (!this.signature) throw new Error("Can't updateRecord without session!")
    return updateRecordInternal(this.url, this.signature, params as any)
  }

  public deleteRecord<T = any>(model: string, recordID: string): Promise<T>
  public deleteRecord<T = any>(recordRef: Ref): Promise<T>
  public deleteRecord<T = any>(...params: any[]): Promise<T> {
    if (!this.signature) throw new Error("Can't deleteRecord without session!")
    return deleteRecordInternal(this.url, this.signature, params as any)
  }
}
