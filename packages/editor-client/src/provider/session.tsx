import React from 'react'
import axios from 'axios'

import {
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

import {
  Ref,
  authenticate,
  refreshSession,
  query,
  buildFunction,
  buildExpression,
  Expression,
  expression as e,
  MetarializedRecord,
  SignatureHeader,
  getTags,
  getModels,
  Tag,
  DefaultTags
} from '@karma.run/sdk'

import * as storage from '../util/storage'

import {Config, withConfig} from '../context/config'
import {WorkerContext, withWorker} from '../context/worker'

import {
  SessionContext,
  initialEditorData,
  EditorData,
  ModelRecord,
  EditorSession,
  SaveRecordResult,
  SaveRecordResultType
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
  karmaDataURL: string,
  signature: string
): Promise<{tags: Tag[]; models: MetarializedRecord[]; userRoles: string[]}> {
  return query(
    karmaDataURL,
    signature,
    buildFunction(e => () =>
      e.data(d =>
        d.struct({
          tags: d.expr(() => getTags()),
          models: d.expr(e => e.mapList(getModels(), (_, model) => e.metarialize(model)))
        })
      )
    )
  )
}

export async function getContexts(
  karmaDataURL: string,
  signature: string,
  registry: FieldRegistry,
  editorContexts: EditorContext[] = [],
  viewContextOptions: ViewContextOptionsWithModel[] = []
) {
  const {tags, models} = await getTagsAndModels(karmaDataURL, signature)

  const tagMap = new Map(tags.map(tag => [tag.tag, tag.model] as [string, Ref]))
  const reverseTagMap = new RefMap(tags.map(tag => [tag.model, tag.tag] as [Ref, string]))

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
          ] as [Ref, ViewContextOptions]
      )
  )

  // Set ViewContextOptions for default models if needed
  const userModelRef = tagMap.get(DefaultTags.User)
  const tagModelRef = tagMap.get(DefaultTags.Tag)

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
        models: modelGroup.models.map(
          model => (typeof model === 'string' ? tagMap.get(model)! : model)
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
      const newSignature = await refreshSession(this.props.config.karmaDataURL, session.signature)
      const newSession: EditorSession = {username: session.username, signature: newSignature}
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
    const signature = await authenticate(this.props.config.karmaDataURL, username, password)
    const session: EditorSession = {username, signature}
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

  public getRecord = async (model: Ref, id: Ref): Promise<ModelRecord> => {
    if (!this.state.session) throw new Error('No session!')

    const viewContext = this.state.viewContextMap.get(model)
    if (!viewContext) throw new Error(`Coulnd't find ViewContext for model: ${model}`)

    const record: MetarializedRecord = await query(
      this.props.config.karmaDataURL,
      this.state.session.signature,
      buildFunction(e => () => e.metarialize(e.get(e.data(d => d.ref(id)))))
    )

    return this.transformMetarializedRecord(record, viewContext)
  }

  public getRecordList = async (
    model: Ref,
    limit: number,
    offset: number,
    sort: Sort,
    filters: Condition[]
  ): Promise<ModelRecord[]> => {
    if (!this.state.session) throw new Error('No session!')

    const viewContext = this.state.viewContextMap.get(model)
    if (!viewContext) throw new Error(`Coulnd't find ViewContext for model: ${model}`)

    let listExpression = buildExpression(e =>
      e.mapList(e.all(e.data(d => d.ref(model))), (_, value) => e.metarialize(value))
    )

    if (filters.length > 0) {
      listExpression = buildExpression(e =>
        e.filterList(listExpression, (_, value) =>
          e.and(...filters.map(filter => filterExpression(e.field('value', value), filter)))
        )
      )
    }

    function expressionForValuePathSegment(value: Expression, segment: ValuePathSegment) {
      switch (segment.type) {
        case ValuePathSegmentType.Struct:
          return e.field(segment.key, value)

        case ValuePathSegmentType.Union:
          return e.field(segment.key, value)

        default:
          throw new Error('Not implemented!')
      }
    }

    let valueExpression = (value: Expression) => {
      for (const segment of sort.path) {
        value = expressionForValuePathSegment(value, segment)
      }

      return value
    }

    listExpression = buildExpression(e =>
      e.memSort(listExpression, value => valueExpression(value))
    )

    if (sort.descending) {
      listExpression = e.reverseList(listExpression)
    }

    const records: MetarializedRecord[] = await query(
      this.props.config.karmaDataURL,
      this.state.session.signature,
      buildFunction(e => () => e.slice(listExpression, offset, limit))
    )

    return records.map(record => this.transformMetarializedRecord(record, viewContext))
  }

  public getReferrers = async (id: Ref, limit: number, offset: number): Promise<ModelRecord[]> => {
    if (!this.state.session) throw new Error('No session!')

    let listExpression = buildExpression(e =>
      e.mapList(e.allReferrers(e.data(d => d.ref(id))), (_, value) => e.metarialize(e.get(value)))
    )

    const records: MetarializedRecord[] = await query(
      this.props.config.karmaDataURL,
      this.state.session.signature,
      buildFunction(e => () => e.slice(listExpression, offset, limit))
    )

    return records.map(record =>
      this.transformMetarializedRecord(record, this.state.viewContextMap.get(record.model)!)
    )
  }

  public saveRecord = async (
    model: Ref,
    id: Ref | undefined,
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
      const record = await query(
        this.props.config.karmaDataURL,
        this.state.session.signature,
        buildFunction(e => () => [
          e.define(
            'recordID',
            id
              ? e.update(e.data(d => d.ref(id)), e.data(() => expressionValue))
              : e.create(e.data(d => d.ref(model)), () => e.data(() => expressionValue))
          ),
          e.metarialize(e.get(e.scope('recordID')))
        ])
      )

      return {
        type: SaveRecordResultType.Success,
        record: this.transformMetarializedRecord(record, viewContext)
      }
    } catch (error) {
      return {type: SaveRecordResultType.Error, error, value}
    }
  }

  public deleteRecord = async (model: Ref, id: Ref, value: any): Promise<void> => {
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

    await query(
      this.props.config.karmaDataURL,
      this.state.session.signature,
      buildFunction(e => () => e.delete(e.data(d => d.ref(id))))
    )
  }

  public query = async (expression: Expression): Promise<any> => {
    if (!this.state.session) throw new Error('No session!')

    return query(
      this.props.config.karmaDataURL,
      this.state.session.signature,
      buildFunction(() => () => expression)
    )
  }

  private storeSession(session: EditorSession) {
    storage.set(sessionStorageKey, session)
  }

  private async getContextOptions(session: EditorSession): Promise<UserContext> {
    const response = await axios.get(`${this.props.config.basePath}/api/context`, {
      headers: {[SignatureHeader]: session.signature}
    })

    return response.data
  }

  private async getEditorData(session: EditorSession): Promise<EditorData> {
    const {editorContexts: userEditorContexts, viewContextOptions} = await this.getContextOptions(
      session
    )

    const {editorContexts, viewContexts} = await getContexts(
      this.props.config.karmaDataURL,
      session.signature,
      this.props.config.fieldRegistry,
      userEditorContexts,
      viewContextOptions
    )

    const viewContextMap = new RefMap(
      viewContexts.map(viewContext => [viewContext.model, viewContext] as [Ref, ViewContext])
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

    const newSignature = await refreshSession(
      this.props.config.karmaDataURL,
      this.state.session.signature
    )

    const newSession = {username: this.state.session.username, signature: newSignature}

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
