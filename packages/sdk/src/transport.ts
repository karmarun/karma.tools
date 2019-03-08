import * as xpr from './expression'
import * as mdl from './model'
import * as val from './value'
import * as utl from './utility'
import {decodeError} from './error'

import axios, {AxiosError} from 'axios'

export class Remote {
  constructor(readonly endpoint: string) {
    while (endpoint.substr(-1) === '/') {
      endpoint = endpoint.substr(0, endpoint.length - 1)
    }
    this.endpoint = endpoint
  }

  async login(username: string, password: string): Promise<UserSession> {
    let token = await this._login(username, password)
    return new UserSession(this, username, token)
  }

  async adminLogin(username: string, dbSecret: string): Promise<DatabaseAdminSession> {
    let token = await this._login(username, dbSecret)
    return new DatabaseAdminSession(this, username, token, dbSecret)
  }

  protected async _login(username: string, password: string): Promise<string> {
    let response = await axios.post(
      this.endpoint + '/auth',
      {username, password},
      {
        responseType: 'json',
        headers: {
          [utl.Header.Codec]: 'json'
        }
      }
    )

    return response.data as string
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

export class UserSession {
  protected metaModelID?: string
  protected metaModel?: mdl.Model

  public get token(): string {
    return this._token
  }

  constructor(
    public readonly remote: Remote,
    public readonly username: string,
    protected _token: string
  ) {}

  async do(...expressions: xpr.Expression[]): Promise<any> {
    try {
      const response = await axios.post(
        this.remote.endpoint + '/',
        new xpr.Function([], expressions).toValue(),
        {
          responseType: 'json',
          headers: this.headers
        }
      )

      return response.data
    } catch (err) {
      const axiosError: AxiosError = err
      throw axiosError.response ? decodeError(axiosError.response.data) : err
    }
  }

  async getMetaModelRef(): Promise<val.Ref> {
    const id = await this.getMetaModelID()
    return new val.Ref(id, id)
  }

  async getMetaModelID(): Promise<string> {
    if (this.metaModelID != undefined) return this.metaModelID
    this.metaModelID = (await this.do(xpr.tag(utl.Tag.Model)))[1] as string
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
    try {
      const response = await axios.post(this.remote.endpoint + '/auth', undefined, {
        responseType: 'json',
        headers: {
          [utl.Header.Codec]: 'json',
          [utl.Header.Signature]: this.token
        }
      })

      this._token = response.data as string
      return this
    } catch (err) {
      const axiosError: AxiosError = err
      throw axiosError.response ? decodeError(axiosError.response.data) : err
    }
  }

  protected get headers() {
    return {
      [utl.Header.Codec]: 'json',
      [utl.Header.Signature]: this.token
    }
  }

  toString(): String {
    return `Session: ${this.remote.endpoint}`
  }

  toJSON(): any {
    return {remote: this.remote.toJSON(), username: this.username, token: this.token}
  }

  static fromJSON(value: any) {
    return new UserSession(Remote.fromJSON(value.remote), value.username, value.token)
  }
}

export class DatabaseAdminSession extends UserSession {
  constructor(remote: Remote, username: string, token: string, protected dbSecret: string) {
    super(remote, username, token)
  }

  async resetDatabase(newSecret?: string): Promise<DatabaseAdminSession> {
    if (newSecret === undefined) {
      newSecret = this.dbSecret
    }

    try {
      await axios.post(this.remote.endpoint + '/admin/reset', newSecret, {
        responseType: 'json',
        headers: this.headers
      })

      return this.remote.adminLogin(this.username, newSecret)
    } catch (err) {
      const axiosError: AxiosError = err
      throw axiosError.response ? decodeError(axiosError.response.data) : err
    }
  }

  async export(): Promise<ArrayBuffer> {
    try {
      const response = await axios.post(this.remote.endpoint + '/admin/export', undefined, {
        responseType: 'arraybuffer',
        headers: this.headers
      })

      return response.data
    } catch (err) {
      const axiosError: AxiosError = err
      throw axiosError.response ? decodeError(axiosError.response.data) : err
    }
  }

  async import(data: any): Promise<DatabaseAdminSession> {
    try {
      await axios.post(this.remote.endpoint + '/admin/import', data, {
        headers: this.headers
      })

      return this.remote.adminLogin(this.username, this.dbSecret)
    } catch (err) {
      const axiosError: AxiosError = err
      throw axiosError.response ? decodeError(axiosError.response.data) : err
    }
  }
}
