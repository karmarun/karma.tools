import React from 'react'
import memoizeOne from 'memoize-one'
import {RefValue} from '@karma.run/editor-common'

import {
  Panel,
  ViewContextPanelHeader,
  PanelContent,
  PanelToolbar,
  IconName,
  ButtonType,
  Button,
  FlexList,
  CenteredLoadingIndicator
} from '../../ui'

import {AnyField, AnyFieldValue} from '../../api/field'
import {SessionContext, ModelRecord, withSession, SaveRecordResultType} from '../../context/session'
import {LocaleContext, withLocale} from '../../context/locale'
import {NotificationContext, withNotification, NotificationType} from '../../context/notification'

export interface RecordEditPanelProps {
  recordID?: RefValue
  model: RefValue
  sessionContext: SessionContext
  localeContext: LocaleContext
  notificationContext: NotificationContext
  disabled: boolean
  onBack: (model: RefValue, record?: ModelRecord) => void
  onEditRecord: (model: RefValue, id?: RefValue) => Promise<ModelRecord | undefined>
  onSelectRecord: (model: RefValue) => Promise<ModelRecord | undefined>
  onEditField: (field: AnyField, value?: any) => Promise<AnyFieldValue | undefined>
  onPostSave: (model: RefValue, id: RefValue) => void
}

export interface RecordEditPanelState {
  record?: ModelRecord
  isSaving: boolean
  isLoadingRecord: boolean
  value?: AnyFieldValue
}

export class RecordEditPanel extends React.PureComponent<
  RecordEditPanelProps,
  RecordEditPanelState
> {
  private hasIncreasedUnsavedChangesCount = false

  public state: RecordEditPanelState = {
    isSaving: false,
    isLoadingRecord: false,
    value: undefined
  }

  private get value() {
    const viewContext = this.props.sessionContext.viewContextMap.get(this.props.model)

    return (
      this.state.value ||
      (this.state.record ? this.state.record.value : viewContext!.field.defaultValue)
    )
  }

  private async loadRecord(id: RefValue) {
    this.setState({
      isLoadingRecord: true
    })

    const record = await this.props.sessionContext.getRecord(this.props.model, id)

    this.setState({
      isLoadingRecord: false,
      record,
      value: record.value
    })
  }

  private handleValueChange = (value: AnyFieldValue) => {
    if (value.hasChanges && !this.hasIncreasedUnsavedChangesCount) {
      this.props.sessionContext.increaseUnsavedChangesCount()
      this.hasIncreasedUnsavedChangesCount = true
    }

    this.setState({value})
  }

  private handleBack = () => {
    let confirmed = true

    if (this.value.hasChanges) {
      confirmed = window.confirm('You have unsaved changes, are you sure you want to go back?')
    }

    if (confirmed) {
      if (this.hasIncreasedUnsavedChangesCount) {
        this.props.sessionContext.decreaseUnsavedChangesCount()
        this.hasIncreasedUnsavedChangesCount = false
      }

      this.props.onBack(this.props.model, this.state.record)
    }
  }

  private handleSave = async () => {
    this.setState({isSaving: true})

    const result = await this.props.sessionContext.saveRecord(
      this.props.model,
      this.state.record && this.state.record.id,
      this.value
    )

    switch (result.type) {
      case SaveRecordResultType.Success: {
        this.props.notificationContext.notify({
          type: NotificationType.Success,
          message: 'Successfully saved!'
        })

        this.props.onPostSave(this.props.model, result.record.id)

        if (this.hasIncreasedUnsavedChangesCount) {
          this.props.sessionContext.decreaseUnsavedChangesCount()
          this.hasIncreasedUnsavedChangesCount = false
        }

        return this.setState({
          isSaving: false,
          record: result.record,
          value: result.record.value
        })
      }

      case SaveRecordResultType.ValidationError: {
        this.props.notificationContext.notify({
          type: NotificationType.Error,
          message: 'Validation error!'
        })

        return this.setState({
          isSaving: false,
          value: result.value
        })
      }

      case SaveRecordResultType.Error: {
        console.error(result.error)
        this.props.notificationContext.notify({
          type: NotificationType.Error,
          message: result.error.message
        })

        return this.setState({isSaving: false})
      }
    }
  }

  private handleSaveAsCopy = async () => {
    this.setState({isSaving: true})

    const result = await this.props.sessionContext.saveRecord(
      this.props.model,
      undefined,
      this.value
    )

    switch (result.type) {
      case SaveRecordResultType.Success: {
        this.props.notificationContext.notify({
          type: NotificationType.Success,
          message: 'Successfully saved as copy!'
        })

        this.props.onPostSave(this.props.model, result.record.id)

        if (this.hasIncreasedUnsavedChangesCount) {
          this.props.sessionContext.decreaseUnsavedChangesCount()
        }

        return this.setState({
          isSaving: false,
          record: result.record,
          value: result.record.value
        })
      }

      case SaveRecordResultType.ValidationError: {
        this.props.notificationContext.notify({
          type: NotificationType.Error,
          message: 'Validation error!'
        })

        return this.setState({
          isSaving: false,
          value: result.value
        })
      }

      case SaveRecordResultType.Error: {
        console.error(result.error)
        this.props.notificationContext.notify({
          type: NotificationType.Error,
          message: result.error.message
        })

        return this.setState({isSaving: false})
      }
    }
  }

  // private handleOpenJSONEditor = () => {}

  public componentDidMount() {
    if (this.props.recordID) this.loadRecord(this.props.recordID)
  }

  private getToolbarButtons = memoizeOne(
    (
      disabled: boolean,
      hasChanges: boolean,
      isNewRecord: boolean,
      localeContext: LocaleContext
    ) => {
      const _ = localeContext.get

      return (
        <FlexList spacing="large">
          <Button
            type={ButtonType.Icon}
            icon={IconName.Back}
            onTrigger={this.handleBack}
            disabled={disabled}
            label={_('back')}
          />
          <Button
            type={ButtonType.Icon}
            icon={IconName.SaveDocument}
            onTrigger={this.handleSave}
            disabled={disabled || !hasChanges}
            label={_('save')}
          />
          {!isNewRecord && (
            <Button
              type={ButtonType.Icon}
              icon={IconName.CopyDocument}
              onTrigger={this.handleSaveAsCopy}
              disabled={disabled}
              label={_('saveAsCopy')}
            />
          )}
        </FlexList>
      )
    }
  )

  private getDeveloperButtons = memoizeOne(
    (_isDeveloper: boolean, _localeContext: LocaleContext) => {
      return null

      // TODO: Expression Editor
      // if (!isDeveloper) return undefined
      // const _ = localeContext.get

      // return (
      //   <Button
      //     label={_('expressionEditor')}
      //     icon={IconName.CodeView}
      //     type={ButtonType.Icon}
      //     onTrigger={this.handleOpenJSONEditor}
      //   />
      // )
    }
  )

  public render() {
    const _ = this.props.localeContext.get
    const disabled = this.state.isSaving || this.props.disabled
    const isNewRecord = this.props.recordID == undefined && this.state.record == undefined
    const hasUnsavedChanges = this.props.recordID == undefined || this.value.hasChanges
    const viewContext = this.props.sessionContext.viewContextMap.get(this.props.model)

    // TODO: Error panel
    if (!viewContext) return <div>Not Found</div>

    return (
      <Panel>
        <ViewContextPanelHeader
          viewContext={viewContext}
          prefix={
            this.props.recordID || this.state.record ? _('editRecordPrefix') : _('newRecordPrefix')
          }
        />
        <PanelToolbar
          left={this.getToolbarButtons(
            disabled,
            hasUnsavedChanges,
            isNewRecord,
            this.props.localeContext
          )}
          right={this.getDeveloperButtons(
            this.props.sessionContext.developmentMode,
            this.props.localeContext
          )}
        />
        <PanelContent>
          {this.state.isLoadingRecord ? (
            <CenteredLoadingIndicator />
          ) : (
            viewContext.field.renderEditComponent({
              depth: 0,
              index: 0,
              isWrapped: true,
              disabled: disabled,
              value: this.value,
              onValueChange: this.handleValueChange,
              onEditRecord: this.props.onEditRecord,
              onSelectRecord: this.props.onSelectRecord,
              onEditField: this.props.onEditField
            })
          )}
        </PanelContent>
      </Panel>
    )
  }
}

export const RecordEditPanelContainer = withNotification(withLocale(withSession(RecordEditPanel)))
