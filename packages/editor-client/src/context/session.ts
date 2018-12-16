import React from 'react'
import * as xpr from '@karma.run/sdk/expression'

import {
  RefValue,
  EditorContext,
  ReadonlyRefMap,
  RefMap,
  Sort,
  Condition
} from '@karma.run/editor-common'

import {createContextHOC} from './helper'
import {ViewContext} from '../api/viewContext'
import {AnyFieldValue} from '../api/field'
import {UserSession, Remote} from '@karma.run/sdk'

export interface PaginatedRecordList<T = ModelRecord> {
  total: number
  records: T[]
}

export interface ModelRecord<T extends AnyFieldValue = AnyFieldValue> {
  id: RefValue
  model: RefValue
  created: Date
  updated: Date
  value: T
}

export interface EditorSession {
  username: string
  token: string
}

export interface EditorData {
  editorContexts: EditorContext[]
  editorContextMap: ReadonlyMap<string, EditorContext>
  viewContexts: ViewContext[]
  viewContextMap: ReadonlyRefMap<ViewContext>
  viewContextSlugMap: ReadonlyMap<string, ViewContext>
}

export const initialEditorData: EditorData = {
  editorContexts: [],
  editorContextMap: new Map(),
  viewContexts: [],
  viewContextMap: new RefMap(),
  viewContextSlugMap: new Map()
}

export interface ReferrersResponse {
  record: ModelRecord
  referrers: ModelRecord[]
}

export enum SaveRecordResultType {
  Success = 'success',
  Error = 'error',
  ValidationError = 'validationError'
}

export interface SaveRecordSuccessResult {
  type: SaveRecordResultType.Success
  record: ModelRecord
}

export interface SaveRecordValidationErrorResult {
  type: SaveRecordResultType.ValidationError
  value: AnyFieldValue
}

export interface SaveRecordErrorResult {
  type: SaveRecordResultType.Error
  error: Error
  value: AnyFieldValue
}

export type SaveRecordResult =
  | SaveRecordSuccessResult
  | SaveRecordErrorResult
  | SaveRecordValidationErrorResult

export interface SessionContext extends EditorData {
  remote: Remote
  session?: UserSession
  canRestoreSessionFromStorage: boolean
  unsavedChangesCount: number
  developmentMode: boolean

  restoreSessionFromLocalStorage(): Promise<UserSession>
  restoreSession(session: EditorSession): Promise<UserSession>
  authenticate(username: string, password: string): Promise<UserSession>
  invalidate(): Promise<void>
  getRecord(model: RefValue, id: RefValue): Promise<ModelRecord>

  getRecordList(
    model: RefValue,
    limit: number,
    offset: number,
    sort: Sort,
    conditions: Condition[]
  ): Promise<PaginatedRecordList>

  getReferrers(id: RefValue, limit: number, offset: number): Promise<ModelRecord[]>
  saveRecord(
    model: RefValue,
    id: RefValue | undefined,
    value: AnyFieldValue
  ): Promise<SaveRecordResult>
  deleteRecord(model: RefValue, id: RefValue, value: AnyFieldValue): Promise<void>
  query(expression: xpr.Expression): Promise<any>

  increaseUnsavedChangesCount(): void
  decreaseUnsavedChangesCount(): void

  setDevelopmentMode(developmentMode: boolean): void
}

export const SessionContext = React.createContext<SessionContext>({
  ...initialEditorData,
  remote: null as any,
  canRestoreSessionFromStorage: false,
  unsavedChangesCount: 0,
  developmentMode: false,

  async restoreSessionFromLocalStorage() {
    throw new Error('No SessionProvider found!')
  },

  async restoreSession() {
    throw new Error('No SessionProvider found!')
  },

  async authenticate() {
    throw new Error('No SessionProvider found!')
  },

  async invalidate() {
    throw new Error('No SessionProvider found!')
  },

  async getRecord() {
    throw new Error('No SessionProvider found!')
  },

  async getRecordList() {
    throw new Error('No SessionProvider found!')
  },

  async getReferrers() {
    throw new Error('No SessionProvider found!')
  },

  async saveRecord() {
    throw new Error('No SessionProvider found!')
  },

  async deleteRecord() {
    throw new Error('No SessionProvider found!')
  },

  async query() {
    throw new Error('No SessionProvider found!')
  },

  increaseUnsavedChangesCount() {
    throw new Error('No SessionProvider found!')
  },

  decreaseUnsavedChangesCount() {
    throw new Error('No SessionProvider found!')
  },

  setDevelopmentMode() {
    throw new Error('No SessionProvider found!')
  }
})

export const withSession = createContextHOC(SessionContext, 'sessionContext', 'withSession')
