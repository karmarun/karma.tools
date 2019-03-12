import axios, {AxiosError} from 'axios'

import * as xpr from './expression'
import * as mdl from './model'
import * as val from './value'

import {Header, BuiltInTag, Endpoint, Codec, normalizeBaseURL, adminUsername} from './utility'
import {decodeError, JSONError} from './error'

async function handleAxiosError<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return fn()
  } catch (err) {
    const axiosError = err as AxiosError
    throw axiosError.response ? decodeError(axiosError.response.data) : err
  }
}

export async function authenticate(
  endpoint: string,
  username: string,
  password: string
): Promise<string> {
  return handleAxiosError(async () => {
    const response = await axios.post(
      endpoint + Endpoint.Authenticate,
      {username, password},
      {
        responseType: 'json',
        headers: {
          [Header.Codec]: Codec.JSON
        }
      }
    )

    return response.data as string
  })
}

export class Remote {
  constructor(readonly endpoint: string) {
    this.endpoint = normalizeBaseURL(endpoint)
  }

  async login(username: string, password: string): Promise<UserSession> {
    let token = await authenticate(this.endpoint, username, password)
    return new UserSession(this.endpoint, username, token)
  }

  async adminLogin(secret: string): Promise<AdminSession> {
    let token = await authenticate(this.endpoint, adminUsername, secret)
    return new AdminSession(this.endpoint, secret, token)
  }

  toString(): String {
    return `Remote: ${this.endpoint}`
  }

  toJSON(): any {
    return {endpoint: this.endpoint}
  }

  static fromJSON(value: any) {
    return new Remote(value.endpoint)
  }
}

export interface UserSessionJSON {
  endpoint: string
  username: string
  token: string
}

export class UserSession {
  protected metaModelID?: string
  protected metaModel?: mdl.Model

  public get token(): string {
    return this._token
  }

  constructor(
    public readonly endpoint: string,
    public readonly username: string,
    protected _token: string
  ) {}

  async do(...expressions: xpr.Expression[]): Promise<any> {
    return handleAxiosError(async () => {
      const response = await axios.post(
        this.endpoint + Endpoint.Query,
        new xpr.Function([], expressions).toValue(),
        {
          responseType: 'json',
          headers: this.headers
        }
      )

      return response.data
    })
  }

  async getMetaModelRef(): Promise<val.Ref> {
    const id = await this.getMetaModelID()
    return new val.Ref(id, id)
  }

  async getMetaModelID(): Promise<string> {
    if (this.metaModelID != undefined) return this.metaModelID
    this.metaModelID = (await this.do(xpr.tag(BuiltInTag.Model)))[1] as string
    return this.metaModelID
  }

  async getMetaModel(): Promise<mdl.Model> {
    if (this.metaModel != undefined) return this.metaModel
    this.metaModel = mdl.fromValue(val.newMetaModelValue(await this.getMetaModelID()))
    return this.metaModel
  }

  async getModel(modelID: string): Promise<mdl.Model> {
    const value = await this.do(xpr.model(modelID).get())
    const meta = await this.getMetaModel()

    return mdl.fromValue(meta.decode(value) as val.Union)
  }

  async refresh(): Promise<this> {
    return handleAxiosError(async () => {
      const response = await axios.post(this.endpoint + Endpoint.Authenticate, undefined, {
        responseType: 'json',
        headers: {
          [Header.Codec]: Codec.JSON,
          [Header.Signature]: this.token
        }
      })

      this._token = response.data as string
      return this
    })
  }

  protected get headers() {
    return {
      [Header.Codec]: 'json',
      [Header.Signature]: this.token
    }
  }

  toString(): String {
    return `Session: ${this.endpoint}`
  }

  toJSON(): UserSessionJSON {
    return {endpoint: this.endpoint, username: this.username, token: this.token}
  }

  static fromJSON(value: UserSessionJSON) {
    if (typeof value !== 'object' && value != null) throw new JSONError('value is not an object.')
    if (typeof value.endpoint !== 'string') throw new JSONError('"endpoint" is not of type string.')
    if (typeof value.username !== 'string') throw new JSONError('"username" is not of type string.')
    if (typeof value.token !== 'string') throw new JSONError('"token" is not of type string.')

    return new UserSession(value.endpoint, value.username, value.token)
  }
}

export interface AdminSessionJSON extends UserSessionJSON {
  endpoint: string
  username: string
  secret: string
  token: string
}

export class AdminSession extends UserSession {
  constructor(endpoint: string, protected secret: string, token: string) {
    super(endpoint, adminUsername, token)
  }

  async resetDatabase(newSecret?: string): Promise<void> {
    if (newSecret === undefined) {
      newSecret = this.secret
    }

    return handleAxiosError(async () => {
      await axios.post(this.endpoint + Endpoint.AdminReset, newSecret, {
        responseType: 'json',
        headers: this.headers
      })

      this._token = await authenticate(this.endpoint, this.username, newSecret!)
      this.secret = newSecret!
    })
  }

  async export(): Promise<ArrayBuffer> {
    return handleAxiosError(async () => {
      const response = await axios.post(this.endpoint + Endpoint.AdminExport, undefined, {
        responseType: 'arraybuffer',
        headers: this.headers
      })

      return response.data
    })
  }

  async import(data: any): Promise<boolean> {
    return handleAxiosError(async () => {
      await axios.post(this.endpoint + Endpoint.AdminImport, data, {
        headers: this.headers
      })

      try {
        this._token = await authenticate(this.endpoint, this.username, this.secret)
        return true
      } catch {
        return false
      }
    })
  }

  toString(): String {
    return `AdminSession: ${this.endpoint}`
  }

  toJSON(): AdminSessionJSON {
    return {
      endpoint: this.endpoint,
      username: this.username,
      secret: this.secret,
      token: this.token
    }
  }

  static fromJSON(value: AdminSessionJSON) {
    if (typeof value !== 'object' && value != null) throw new JSONError('value is not an object.')
    if (typeof value.endpoint !== 'string') throw new JSONError('"endpoint" is not of type string.')
    if (typeof value.username !== 'string') throw new JSONError('"username" is not of type string.')
    if (typeof value.secret !== 'string') throw new JSONError('"secret" is not of type string.')
    if (typeof value.token !== 'string') throw new JSONError('"token" is not of type string.')

    return new AdminSession(value.endpoint, value.secret, value.token)
  }
}
