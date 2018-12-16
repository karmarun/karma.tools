import React from 'react'
import {RefValue} from '@karma.run/editor-common'

import {
  ViewContextPanelHeader,
  Panel,
  PanelToolbar,
  MessageBar,
  Button,
  ButtonType,
  FlexList,
  IconName,
  PanelContent,
  MessageBarType
} from '../../ui'

import {SessionContext, ModelRecord, withSession} from '../../context/session'
import {LocaleContext, withLocale} from '../../context/locale'

import {MixedRecordList} from '../recordListPanel/panel'
import {ViewContext} from '../../api/viewContext'

export interface RecordDeletePanelProps {
  model: RefValue
  recordID: RefValue
  sessionContext: SessionContext
  localeContext: LocaleContext
  disabled: boolean
  onBack: (mode: RefValue) => void
  onPostDelete: (model: RefValue, id: RefValue) => void
  onEditRecord: (model: RefValue, id?: RefValue) => Promise<ModelRecord | undefined>
  onDeleteRecord: (model: RefValue, id: RefValue) => Promise<void>
}

export interface RecordDeletePanelState {
  record?: ModelRecord
  referrers?: ModelRecord[]
  limit: number
  offset: number
  hasMore: boolean
}

export class RecordDeletePanel extends React.PureComponent<
  RecordDeletePanelProps,
  RecordDeletePanelState
> {
  public state: RecordDeletePanelState = {
    limit: 50,
    offset: 0,
    hasMore: true
  }

  private handleNextPage = () => {
    this.nextPage()
  }

  private handlePreviousPage = () => {
    this.previousPage()
  }

  private handleEditRecord = async (record: ModelRecord) => {
    await this.props.onEditRecord(record.model, record.id)
    this.reload()
  }

  private handleDeleteRecord = async (record: ModelRecord) => {
    await this.props.onDeleteRecord(record.model, record.id)
    this.reload()
  }

  private handleDelete = async () => {
    await this.props.sessionContext.deleteRecord(
      this.props.model,
      this.props.recordID,
      this.state.record!.value
    )

    this.props.onPostDelete(this.props.model, this.props.recordID)
  }

  private handleBack = async () => {
    this.props.onBack(this.props.model)
  }

  private get viewContext(): ViewContext | undefined {
    return this.props.sessionContext.viewContextMap.get(this.props.model)
  }

  private async previousPage() {
    this.loadRecords(this.state.offset - this.state.limit)
  }

  private async nextPage() {
    this.loadRecords(this.state.offset + this.state.limit)
  }

  private reload() {
    this.loadRecords(this.state.offset)
  }

  private loadRecords = async (offset: number) => {
    if (!this.viewContext) return

    this.setState({offset, record: undefined, referrers: undefined})

    const record = await this.props.sessionContext.getRecord(this.props.model, this.props.recordID)

    // Request one more than the limit to check if there's another page
    // TODO: Implement better pagination, see RecordListPanel
    const referrers = await this.props.sessionContext.getReferrers(
      this.props.recordID,
      this.state.limit + 1,
      offset
    )

    const hasMore = referrers.length > this.state.limit

    if (hasMore) {
      // Remove extranous record
      referrers.splice(-1, 1)
    }

    this.setState({record, referrers, hasMore})
  }

  public componentDidMount() {
    this.loadRecords(this.state.offset)
  }

  public render() {
    const viewContext = this.viewContext
    const canDelete = Boolean(
      this.state.record && this.state.referrers && !this.state.referrers.length
    )

    const _ = this.props.localeContext.get

    // TODO: Error panel
    if (!viewContext) return <div>Not Found</div>

    return (
      <Panel>
        <ViewContextPanelHeader viewContext={viewContext} prefix={_('deleteRecordPrefix')} />
        <PanelToolbar
          left={
            <FlexList spacing="medium">
              <Button
                type={ButtonType.Icon}
                icon={IconName.Back}
                onTrigger={this.handleBack}
                disabled={this.props.disabled}
                label={_('back')}
              />
              <Button
                type={ButtonType.Icon}
                onTrigger={this.handleDelete}
                icon={IconName.DeleteDocument}
                disabled={this.props.disabled && !canDelete}
                label={_('deleteRecord')}
              />
              <div />
            </FlexList>
          }
          right={
            <>
              <Button
                type={ButtonType.Icon}
                icon={IconName.ListArrowLeft}
                onTrigger={this.handlePreviousPage}
                disabled={this.state.referrers == undefined || this.state.offset <= 0}
              />
              <Button
                type={ButtonType.Icon}
                icon={IconName.ListArrowRight}
                onTrigger={this.handleNextPage}
                disabled={this.state.referrers == undefined || !this.state.hasMore}
              />
            </>
          }>
          {this.state.referrers && (
            <MessageBar
              type={canDelete ? MessageBarType.Success : MessageBarType.Error}
              message={canDelete ? _('recordSafeToDelete') : _('recordIsStillBeingReferred')}
            />
          )}
        </PanelToolbar>
        <PanelContent>
          <MixedRecordList
            viewContextMap={this.props.sessionContext.viewContextMap}
            localeContext={this.props.localeContext}
            records={this.state.referrers}
            actions={[
              {
                key: 'edit',
                icon: IconName.EditDocument,
                label: _('editRecord'),
                onTrigger: this.handleEditRecord
              },
              {
                key: 'delete',
                icon: IconName.DeleteDocument,
                label: _('deleteRecord'),
                onTrigger: this.handleDeleteRecord
              }
            ]}
          />
        </PanelContent>
      </Panel>
    )
  }
}

export const RecordDeletePanelContainer = withLocale(withSession(RecordDeletePanel))
