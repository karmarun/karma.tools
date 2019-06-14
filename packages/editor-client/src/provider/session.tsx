import React from 'react'
import axios from 'axios'

import {
  RefValue,
  TagRecord,
  MetarializedRecord,
  Sort,
  ValuePathSegmentType,
  ValuePathSegment,
  Condition,
  EditorContext,
  RefMap,
  ViewContextOptions,
  ViewContextOptionsWithModel,
  unserializeModel
} from '@karma.run/editor-common'

// import {
//   authenticate,
//   refreshSession,
//   query,
//   buildFunction,
//   buildExpression,
//   Expression,
//   expression as e,
//   MetarializedRecord,
//   SignatureHeader,
//   getTags,
//   getModels,
//   Tag,
//   DefaultTags
// } from '@karma.run/sdk'

import {UserSession, Remote} from '@karma.run/sdk'
import * as xpr from '@karma.run/sdk/expression'
import * as utl from '@karma.run/sdk/utility'
import * as storage from '../util/storage'

import {Config, withConfig} from '../context/config'
import {WorkerContext, withWorker} from '../context/worker'

import {
  SessionContext,
  initialEditorData,
  EditorData,
  ModelRecord,
  SaveRecordResult,
  SaveRecordResultType,
  PaginatedRecordList,
  EditorSession
} from '../context/session'

import {ViewContext} from '../api/viewContext'
import {FieldRegistry, AnyFieldValue} from '../api/field'
import {filterExpression} from '../api/filter'

export const defaultModelGroupID: string = 'default'
export const defaultEditorContextID: string = 'default'

export const sessionStorageKey = 'session'
export const sessionRenewalInterval = 5 * (60 * 1000) // 5min

export const developmentModeStorageKey = 'developmentMode'

export interface SessionProviderProps {
  config: Config
  workerContext: WorkerContext
}

export interface UserContext {
  editorContexts: EditorContext[]
  viewContextOptions: ViewContextOptionsWithModel[]
}

export function getTagsAndModels(
  session: UserSession
): Promise<{tags: TagRecord[]; models: MetarializedRecord[]; userRoles: string[]}> {
  return session.do(
    xpr.data(d =>
      d.struct({
        tags: d.expr(xpr.tag(utl.BuiltInTag.Tag).all()),
        models: d.expr(
          xpr
            .tag(utl.BuiltInTag.Model)
            .all()
            .mapList((_, model) => xpr.metarialize(model))
        )
      })
    )
  )
}

export async function getContexts(
  session: UserSession,
  registry: FieldRegistry,
  editorContexts: EditorContext[] = [],
  viewContextOptions: ViewContextOptionsWithModel[] = []
) {
  const {tags, models} = await getTagsAndModels(session)

  const tagMap = new Map(tags.map(tag => [tag.tag, tag.model] as [string, RefValue]))
  const reverseTagMap = new RefMap(tags.map(tag => [tag.model, tag.tag] as [RefValue, string]))

  const overrideViewContextMap = new RefMap(
    viewContextOptions
      .filter(viewContextOption => {
        return typeof viewContextOption.model === 'string'
          ? tagMap.has(viewContextOption.model)
          : true
      })
      .map(
        viewContextOption =>
          [
            typeof viewContextOption.model === 'string'
              ? tagMap.get(viewContextOption.model)
              : true,
            viewContextOption
          ] as [RefValue, ViewContextOptions]
      )
  )

  // Set ViewContextOptions for default models if needed
  const userModelRef = tagMap.get(utl.BuiltInTag.User)
  const tagModelRef = tagMap.get(utl.BuiltInTag.Tag)

  if (userModelRef && !overrideViewContextMap.has(userModelRef)) {
    overrideViewContextMap.set(userModelRef, {
      field: {
        fields: [['username'], ['password', {type: 'password'}], ['roles']]
      }
    })
  }

  if (tagModelRef && !overrideViewContextMap.has(tagModelRef)) {
    overrideViewContextMap.set(tagModelRef, {
      field: {
        fields: [['tag'], ['model']]
      }
    })
  }

  const viewContexts = models.map(model =>
    ViewContext.inferFromModel(
      model.id,
      unserializeModel(model.value),
      registry,
      reverseTagMap.get(model.id),
      [],
      overrideViewContextMap.get(model.id)
    )
  )

  if (editorContexts) {
    editorContexts = editorContexts.map(editorContext => ({
      ...editorContext,
      modelGroups: editorContext.modelGroups.map(modelGroup => ({
        ...modelGroup,
        models: modelGroup.models.map(model =>
          typeof model === 'string' ? tagMap.get(model)! : model
        )
      }))
    }))
  }

  return {
    editorContexts:
      editorContexts && editorContexts.length > 0
        ? editorContexts
        : [
            {
              name: 'Default',
              modelGroups: [{name: 'Models', models: models.map(model => model.id)}]
            }
          ],
    viewContexts
  }
}

export class SessionProvider extends React.Component<SessionProviderProps, SessionContext> {
  private refreshSessionIntervalID?: any

  constructor(props: SessionProviderProps) {
    super(props)

    this.state = {
      ...initialEditorData,
      remote: new Remote('/api/proxy'),
      canRestoreSessionFromStorage: storage.get(sessionStorageKey) != undefined,
      unsavedChangesCount: 0,
      developmentMode: storage.get(developmentModeStorageKey) || false,
      restoreSessionFromLocalStorage: this.restoreSessionFromLocalStorage,
      restoreSession: this.restoreSession,
      authenticate: this.authenticate,
      invalidate: this.invalidate,
      getRecord: this.getRecord,
      getRecordList: this.getRecordList,
      getReferrers: this.getReferrers,
      saveRecord: this.saveRecord,
      deleteRecord: this.deleteRecord,
      query: this.query,
      increaseUnsavedChangesCount: this.increaseUnsavedChangesCount,
      decreaseUnsavedChangesCount: this.decreaseUnsavedChangesCount,
      setDevelopmentMode: this.setDevelopmentMode
    }
  }

  public increaseUnsavedChangesCount = () => {
    this.setState({unsavedChangesCount: this.state.unsavedChangesCount + 1})
  }

  public decreaseUnsavedChangesCount = () => {
    if (this.state.unsavedChangesCount - 1 < 0) throw new Error('Unbalanced saved changes count!')
    this.setState({unsavedChangesCount: this.state.unsavedChangesCount - 1})
  }

  private setDevelopmentMode = (developmentMode: boolean) => {
    this.setState({developmentMode})
    storage.set(developmentModeStorageKey, developmentMode)
  }

  public restoreSessionFromLocalStorage = async () => {
    const session = storage.get(sessionStorageKey)

    if (!session) {
      throw new Error('No session to restore!')
    }

    return this.restoreSession(session)
  }

  public restoreSession = async (session: EditorSession) => {
    try {
      const newSession = await new UserSession(
        this.state.remote.endpoint,
        session.username,
        session.token
      ).refresh()

      const editorData = await this.getEditorData(newSession)

      this.storeSession(newSession)
      this.setState({...editorData, session: newSession})

      return newSession
    } catch (err) {
      this.invalidate()
      throw err
    }
  }

  public authenticate = async (username: string, password: string) => {
    const session = await this.state.remote.login(username, password)
    const editorData = await this.getEditorData(session)

    this.storeSession(session)
    this.setState({...editorData, session})

    return session
  }

  public invalidate = async () => {
    this.setState({...initialEditorData, session: undefined, canRestoreSessionFromStorage: false})
    storage.remove(sessionStorageKey)
  }

  private transformMetarializedRecord(
    record: MetarializedRecord,
    viewContext: ViewContext
  ): ModelRecord {
    return {
      id: record.id,
      model: record.model,
      created: new Date(record.created),
      updated: new Date(record.updated),
      value: viewContext.field.transformRawValue(record.value)
    }
  }

  public getRecord = async (model: RefValue, id: RefValue): Promise<ModelRecord> => {
    if (!this.state.session) throw new Error('No session!')

    const viewContext = this.state.viewContextMap.get(model)
    if (!viewContext) throw new Error(`Coulnd't find ViewContext for model: ${model}`)

    const record: MetarializedRecord = await this.state.session.do(
      xpr.get(xpr.data(d => d.ref(id))).metarialize()
    )

    return this.transformMetarializedRecord(record, viewContext)
  }

  public getRecordList = async (
    model: RefValue,
    limit: number,
    offset: number,
    sort: Sort,
    filters: Condition[]
  ): Promise<PaginatedRecordList> => {
    if (!this.state.session) throw new Error('No session!')

    const viewContext = this.state.viewContextMap.get(model)
    if (!viewContext) throw new Error(`Coulnd't find ViewContext for model: ${model}`)

    let listExpression: xpr.Expression = xpr
      .all(xpr.data(d => d.ref(model)))
      .mapList((_, value) => xpr.metarialize(value))

    if (filters.length > 0) {
      listExpression = listExpression.filterList((_, value) =>
        xpr.and(...filters.map(filter => filterExpression(value.field('value'), filter)))
      )
    }

    function expressionForValuePathSegment(value: xpr.Expression, segment: ValuePathSegment) {
      switch (segment.type) {
        case ValuePathSegmentType.Struct:
          return value.field(segment.key)

        case ValuePathSegmentType.Union:
          return value.field(segment.key)

        default:
          throw new Error('Not implemented!')
      }
    }

    let valueExpression = (value: xpr.Expression) => {
      for (const segment of sort.path) {
        value = expressionForValuePathSegment(value, segment)
      }

      return value
    }

    listExpression = listExpression.memSort(value => valueExpression(value))

    if (sort.descending) {
      listExpression = listExpression.reverseList()
    }

    const recordList: PaginatedRecordList<MetarializedRecord> = await this.state.session.do(
      xpr.define('records', listExpression),
      xpr.data(d =>
        d.struct({
          total: d.expr(xpr.scope('records').length()),
          limit: d.int64(limit),
          offset: d.int64(offset),
          records: d.expr(xpr.scope('records').slice(offset, limit))
        })
      )
    )

    return {
      ...recordList,
      records: recordList.records.map(record =>
        this.transformMetarializedRecord(record, viewContext)
      )
    }
  }

  public getReferrers = async (
    id: RefValue,
    limit: number,
    offset: number
  ): Promise<ModelRecord[]> => {
    if (!this.state.session) throw new Error('No session!')

    let listExpression = xpr
      .allReferrers(xpr.data(d => d.ref(id)))
      .mapList((_, value) => value.get().metarialize())

    const records: MetarializedRecord[] = await this.state.session.do(
      listExpression.slice(offset, limit)
    )

    return records.map(record =>
      this.transformMetarializedRecord(record, this.state.viewContextMap.get(record.model)!)
    )
  }

  public saveRecord = async (
    model: RefValue,
    id: RefValue | undefined,
    value: AnyFieldValue
  ): Promise<SaveRecordResult> => {
    if (!this.state.session) throw new Error('No session!')

    const viewContext = this.state.viewContextMap.get(model)
    if (!viewContext) throw new Error(`Coulnd't find ViewContext for model: ${model}`)

    if (viewContext.field.onSave) {
      value = await viewContext.field.onSave(value, {
        config: this.props.config,
        workerContext: this.props.workerContext,
        sessionContext: this.state,
        model,
        id
      })
    }

    if (!value.isValid) return {type: SaveRecordResultType.ValidationError, value}

    const expressionValue = viewContext.field.transformValueToExpression(value)

    try {
      const record: MetarializedRecord = await this.state.session.do(
        xpr.define(
          'recordID',
          id
            ? xpr.update(xpr.data(d => d.ref(id)), xpr.data(() => expressionValue))
            : xpr.create(xpr.data(d => d.ref(model)), () => xpr.data(() => expressionValue))
        ),
        xpr
          .scope('recordID')
          .get()
          .metarialize()
      )

      return {
        type: SaveRecordResultType.Success,
        record: this.transformMetarializedRecord(record, viewContext)
      }
    } catch (error) {
      return {type: SaveRecordResultType.Error, error, value}
    }
  }

  public deleteRecord = async (model: RefValue, id: RefValue, value: any): Promise<void> => {
    if (!this.state.session) throw new Error('No session!')

    const viewContext = this.state.viewContextMap.get(model)
    if (!viewContext) throw new Error(`Coulnd't find ViewContext for model: ${model}`)

    if (viewContext.field.onDelete) {
      await viewContext.field.onDelete(value, {
        config: this.props.config,
        workerContext: this.props.workerContext,
        sessionContext: this.state,
        model,
        id
      })
    }

    await this.state.session.do(xpr.delete_(xpr.data(d => d.ref(id))))
  }

  public query = async (expression: xpr.Expression): Promise<any> => {
    if (!this.state.session) throw new Error('No session!')
    return this.state.session.do(expression)
  }

  private storeSession(session: UserSession) {
    storage.set(sessionStorageKey, session)
  }

  private async getContextOptions(session: UserSession): Promise<UserContext> {
    const response = await axios.get(`${this.props.config.basePath}/api/context`, {
      headers: {[utl.Header.Signature]: session.token}
    })

    return response.data
  }

  private async getEditorData(session: UserSession): Promise<EditorData> {
    const {editorContexts: userEditorContexts, viewContextOptions} = await this.getContextOptions(
      session
    )

    const {editorContexts, viewContexts} = await getContexts(
      session,
      this.props.config.fieldRegistry,
      userEditorContexts,
      viewContextOptions
    )

    const viewContextMap = new RefMap(
      viewContexts.map(viewContext => [viewContext.model, viewContext] as [RefValue, ViewContext])
    )

    const viewContextSlugMap = new Map(
      viewContexts.map(viewContext => [viewContext.slug, viewContext] as [string, ViewContext])
    )

    const editorContextMap = new Map(
      editorContexts.map(
        editorContext => [editorContext.name, editorContext] as [string, EditorContext]
      )
    )

    return {
      editorContexts,
      editorContextMap,
      viewContexts,
      viewContextMap,
      viewContextSlugMap
    }
  }

  private async refreshSession() {
    if (!this.state.session) return

    const newSession = await this.state.session.refresh()

    this.storeSession(newSession)
    this.setState({session: newSession})
  }

  public componentDidMount() {
    this.refreshSessionIntervalID = setInterval(() => this.refreshSession(), sessionRenewalInterval)

    window.addEventListener('beforeunload', e => {
      if (this.state.unsavedChangesCount > 0) {
        const message = 'You have unsaved changes, are you sure you want to leave the site?'
        e.returnValue = message
        return message
      }

      return undefined
    })
  }

  public componentWillUnmount() {
    clearInterval(this.refreshSessionIntervalID)
  }

  public render() {
    return (
      <SessionContext.Provider value={this.state}>{this.props.children}</SessionContext.Provider>
    )
  }
}

export const SessionProviderContainer = withWorker(withConfig(SessionProvider))
