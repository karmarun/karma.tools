import React from 'react'
import shortid from 'shortid'
import {RefValue} from '@karma.run/editor-common'
import {Deferred, lastItemThrow} from '@karma.run/editor-common'

import {RootRecordListPanelContainer, SelectRecordListPanelContainer} from './recordListPanel'
import {RecordEditPanelContainer} from './recordEditPanel'
import {RecordDeletePanelContainer} from './recordDeletePanel'
import {FieldPanelContainer} from './fieldPanel'

import {ModelRecord, SessionContext, withSession} from '../context/session'
import {
  LocationContext,
  AppLocation,
  LocationType,
  withLocation,
  EditRecordLocation,
  NewRecordLocation,
  NotFoundLocation,
  ListRecordsLocation,
  DeleteRecordLocation
} from '../context/location'

import {AnyField, AnyFieldValue} from '../api/field'
import {StackView} from '../ui'

export const enum PanelType {
  RootList = 'rootList',
  SelectList = 'selectList',
  Edit = 'edit',
  Delete = 'delete',
  Field = 'field',
  Expression = 'expression',
  NotFound = 'notFound'
}

export interface BasePanelContext {
  type: PanelType
  id: string
}

export interface NotFoundContext extends BasePanelContext {
  type: PanelType.NotFound
}

export function NotFoundContext(id: string = shortid.generate()): NotFoundContext {
  return {type: PanelType.NotFound, id}
}

export interface RootListPanelContext extends BasePanelContext {
  type: PanelType.RootList
  model: RefValue
}

export function RootListPanelContext(
  model: RefValue,
  id: string = shortid.generate()
): RootListPanelContext {
  return {type: PanelType.RootList, id, model}
}

export interface SelectListPanelContext extends BasePanelContext {
  type: PanelType.SelectList
  model: RefValue
  result: Deferred<ModelRecord | undefined>
}

export function SelectListPanelContext(
  model: RefValue,
  id: string = shortid.generate()
): SelectListPanelContext {
  return {type: PanelType.SelectList, id, model, result: new Deferred()}
}

export interface EditPanelContext extends BasePanelContext {
  type: PanelType.Edit
  model: RefValue
  recordID?: RefValue
  result: Deferred<ModelRecord | undefined>
}

export function EditPanelContext(
  model: RefValue,
  recordID?: RefValue,
  id: string = shortid.generate()
): EditPanelContext {
  return {
    type: PanelType.Edit,
    result: new Deferred(),
    recordID,
    model,
    id
  }
}

export interface DeletePanelContext extends BasePanelContext {
  type: PanelType.Delete
  model: RefValue
  recordID: RefValue
  result: Deferred<void>
}

export function DeletePanelContext(
  model: RefValue,
  recordID: RefValue,
  id: string = shortid.generate()
): DeletePanelContext {
  return {
    type: PanelType.Delete,
    result: new Deferred(),
    recordID,
    model,
    id
  }
}

export interface FieldPanelContext extends BasePanelContext {
  type: PanelType.Field
  field: AnyField
  value?: AnyFieldValue
  result: Deferred<AnyFieldValue>
}

export function FieldPanelContext(
  field: AnyField,
  value?: AnyFieldValue,
  id: string = shortid.generate()
): FieldPanelContext {
  return {type: PanelType.Field, result: new Deferred(), field, value, id}
}

export interface ExpressionPanelContext extends BasePanelContext {
  type: PanelType.Expression
  result: Deferred<any>
}

export function ExpressionPanelContext(id: string = shortid.generate()): ExpressionPanelContext {
  return {
    type: PanelType.Expression,
    result: new Deferred(),
    id
  }
}

export type PanelContext =
  | RootListPanelContext
  | SelectListPanelContext
  | EditPanelContext
  | DeletePanelContext
  | FieldPanelContext
  | ExpressionPanelContext
  | NotFoundContext

export interface MainPanelProps {
  sessionContext: SessionContext
  locationContext: LocationContext
}

export interface MainPanelState {
  panelContexts: PanelContext[]
}

export class MainPanel extends React.Component<MainPanelProps, MainPanelState> {
  public state: MainPanelState
  public ignoreNextLocationUpdate: boolean = false

  public constructor(props: MainPanelProps) {
    super(props)

    this.state = {
      panelContexts: this.getPanelContextsForLocation(props.locationContext.location!)
    }
  }

  // TODO: Callbacks don't work for contexts created by location, find a way to fix this.
  private getPanelContextsForLocation(location: AppLocation): PanelContext[] {
    const sessionContext = this.props.sessionContext
    switch (location.type) {
      case LocationType.ListRecords: {
        const viewContext = sessionContext.viewContextSlugMap.get(location.slug)
        if (!viewContext) return [NotFoundContext('notFound')]
        return [RootListPanelContext(viewContext.model, `rootList/${viewContext.model[1]}`)]
      }

      case LocationType.NewRecord: {
        const viewContext = sessionContext.viewContextSlugMap.get(location.slug)
        if (!viewContext) return [NotFoundContext('notFound')]

        return [
          RootListPanelContext(viewContext.model, `rootList/${viewContext.model[1]}`),
          EditPanelContext(viewContext.model, undefined, `new/${viewContext.model[1]}`)
        ]
      }

      case LocationType.EditRecord: {
        const viewContext = sessionContext.viewContextSlugMap.get(location.slug)
        if (!viewContext) return [NotFoundContext('notFound')]

        return [
          RootListPanelContext(viewContext.model, `rootList/${viewContext.model[1]}`),
          EditPanelContext(
            viewContext.model,
            [viewContext.model[1], location.id],
            `edit/${viewContext.model[1]}/${location.id}`
          )
        ]
      }

      case LocationType.DeleteRecord: {
        const viewContext = sessionContext.viewContextSlugMap.get(location.slug)
        if (!viewContext) return [NotFoundContext('notFound')]

        return [
          RootListPanelContext(viewContext.model, `rootList/${viewContext.model[1]}`),
          DeletePanelContext(
            viewContext.model,
            [viewContext.model[1], location.id],
            `delete/${viewContext.model[1]}/${location.id}`
          )
        ]
      }

      default:
      case LocationType.NotFound:
        return [NotFoundContext('notFound')]
    }
  }

  private handleEditRecord = async (model: RefValue, id?: RefValue) => {
    if (this.state.panelContexts.length === 1) {
      const viewContext = this.props.sessionContext.viewContextMap.get(model)
      this.ignoreNextLocationUpdate = true

      viewContext
        ? this.props.locationContext.pushLocation(
            id ? EditRecordLocation(viewContext.slug, id[1]) : NewRecordLocation(viewContext.slug)
          )
        : this.props.locationContext.pushLocation(NotFoundLocation())
    }

    const context = EditPanelContext(model, id)
    this.pushPanelContext(context)

    return await context.result
  }

  private handleBack = (model: RefValue, record?: ModelRecord) => {
    if (this.state.panelContexts.length === 2) {
      this.ignoreNextLocationUpdate = true

      const viewContext = this.props.sessionContext.viewContextMap.get(model)

      viewContext
        ? this.props.locationContext.pushLocation(ListRecordsLocation(viewContext.slug))
        : this.props.locationContext.pushLocation(NotFoundLocation())
    }

    const context = this.popPanelContext()

    switch (context.type) {
      case PanelType.SelectList:
      case PanelType.Edit:
        return context.result.resolve(record)
    }
  }

  private handleFieldApply = (value?: any) => {
    const context = this.popPanelContext()

    switch (context.type) {
      case PanelType.Field:
        return context.result.resolve(value)
    }
  }

  private handleFieldBack = () => {
    const context = this.popPanelContext()

    switch (context.type) {
      case PanelType.Field:
        return context.result.resolve(context.value)
    }
  }

  private handleFieldRemove = () => {
    const context = this.popPanelContext()

    switch (context.type) {
      case PanelType.Field:
        return context.result.resolve()
    }
  }

  private handleDeleteRecord = async (model: RefValue, id: RefValue) => {
    if (this.state.panelContexts.length === 1) {
      this.ignoreNextLocationUpdate = true

      const viewContext = this.props.sessionContext.viewContextMap.get(model)

      viewContext
        ? this.props.locationContext.pushLocation(DeleteRecordLocation(viewContext.slug, id[1]))
        : this.props.locationContext.pushLocation(NotFoundLocation())
    }

    const context = DeletePanelContext(model, id)
    this.pushPanelContext(context)

    return await context.result
  }

  private handleSelectRecord = async (model: RefValue) => {
    const context = SelectListPanelContext(model)
    this.pushPanelContext(context)

    return await context.result
  }

  private handlePostSave = async (model: RefValue, id: RefValue) => {
    if (this.state.panelContexts.length === 2) {
      this.ignoreNextLocationUpdate = true
      const viewContext = this.props.sessionContext.viewContextMap.get(model)

      viewContext
        ? this.props.locationContext.pushLocation(EditRecordLocation(viewContext.slug, id[1]))
        : this.props.locationContext.pushLocation(NotFoundLocation())
    }
  }

  private handlePostDelete = async (model: RefValue, _id: RefValue) => {
    if (this.state.panelContexts.length === 2) {
      this.ignoreNextLocationUpdate = true

      const viewContext = this.props.sessionContext.viewContextMap.get(model)

      viewContext
        ? this.props.locationContext.pushLocation(ListRecordsLocation(viewContext.slug))
        : this.props.locationContext.pushLocation(NotFoundLocation())
    }

    const context = this.popPanelContext()

    switch (context.type) {
      case PanelType.Delete:
        return context.result.resolve()
    }
  }

  private handleFieldEdit = async (field: AnyField, value?: AnyFieldValue) => {
    const context = FieldPanelContext(field, value)
    this.pushPanelContext(context)

    return await context.result
  }

  private pushPanelContext(context: PanelContext) {
    this.setState({
      panelContexts: [...this.state.panelContexts, context]
    })
  }

  private popPanelContext() {
    const panelContext = lastItemThrow(this.state.panelContexts)

    this.setState({
      panelContexts: [...this.state.panelContexts.slice(0, -1)]
    })

    return panelContext
  }

  private getPanelForContext(context: PanelContext, disabled: boolean) {
    switch (context.type) {
      case PanelType.RootList:
        return (
          <RootRecordListPanelContainer
            model={context.model}
            disabled={disabled}
            onEditRecord={this.handleEditRecord}
            onDeleteRecord={this.handleDeleteRecord}
            onSelectRecord={this.handleSelectRecord}
          />
        )

      case PanelType.SelectList:
        return (
          <SelectRecordListPanelContainer
            model={context.model}
            disabled={disabled}
            onBack={this.handleBack}
            onRecordSelected={this.handleBack}
            onSelectRecord={this.handleSelectRecord}
          />
        )

      case PanelType.Edit:
        return (
          <RecordEditPanelContainer
            model={context.model}
            recordID={context.recordID}
            disabled={disabled}
            onBack={this.handleBack}
            onEditRecord={this.handleEditRecord}
            onSelectRecord={this.handleSelectRecord}
            onEditField={this.handleFieldEdit}
            onPostSave={this.handlePostSave}
          />
        )

      case PanelType.Delete:
        return (
          <RecordDeletePanelContainer
            model={context.model}
            recordID={context.recordID}
            disabled={disabled}
            onBack={this.handleBack}
            onPostDelete={this.handlePostDelete}
            onEditRecord={this.handleEditRecord}
            onDeleteRecord={this.handleDeleteRecord}
          />
        )

      case PanelType.Field:
        return (
          <FieldPanelContainer
            value={context.value}
            field={context.field}
            disabled={disabled}
            onBack={this.handleFieldBack}
            onApply={this.handleFieldApply}
            onRemove={this.handleFieldRemove}
            onEditRecord={this.handleEditRecord}
            onSelectRecord={this.handleSelectRecord}
            onEditField={this.handleFieldEdit}
          />
        )

      default:
      case PanelType.NotFound:
        return <div>404</div>
    }
  }

  public componentDidUpdate(prevProps: MainPanelProps) {
    if (prevProps.locationContext.location === this.props.locationContext.location) return
    if (!this.props.locationContext.location) return

    if (this.ignoreNextLocationUpdate) {
      this.ignoreNextLocationUpdate = false
      return
    }

    this.setState({
      panelContexts: this.getPanelContextsForLocation(this.props.locationContext.location)
    })
  }

  public render() {
    return (
      <StackView>
        {this.state.panelContexts.map((panelContext, index) => (
          <React.Fragment key={panelContext.id}>
            {this.getPanelForContext(panelContext, index !== this.state.panelContexts.length - 1)}
          </React.Fragment>
        ))}
      </StackView>
    )
  }
}

export const MainPanelContainer = withLocation(withSession(MainPanel))
