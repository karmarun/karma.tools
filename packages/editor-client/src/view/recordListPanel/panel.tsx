import React from 'react'
import {Ref} from '@karma.run/sdk'

import {
  Filter,
  Sort,
  ConditionType,
  Condition,
  Omit,
  refToString,
  SortConfiguration,
  ReadonlyRefMap
} from '@karma.run/editor-common'

import {
  ViewContextPanelHeader,
  Panel,
  PanelToolbar,
  PanelContent,
  CenteredLoadingIndicator,
  Button,
  ButtonType,
  FlexList,
  IconName
} from '../../ui'

import {SessionContext, ModelRecord, withSession} from '../../context/session'
import {LocaleContext, withLocale} from '../../context/locale'
import {ViewContext} from '../../api/viewContext'

import {ToolbarFilter} from './filterToolbar'
import {RecordItem} from './recordItem'

export interface ToolbarAction {
  key: string
  icon: IconName
  label: string
  onTrigger: (id: Ref) => void
}

export interface RecordAction {
  key: string
  icon: IconName
  label: string
  onTrigger: (record: ModelRecord) => void
}

export interface MixedRecordListProps {
  viewContextMap: ReadonlyRefMap<ViewContext>
  localeContext: LocaleContext
  records?: ModelRecord[]
  actions: RecordAction[]
}

export class MixedRecordList extends React.Component<MixedRecordListProps> {
  public render() {
    if (!this.props.records) return <CenteredLoadingIndicator />

    // TODO: Empty view
    if (this.props.records.length === 0) return <>No results</>

    return (
      <FlexList direction="column" spacing="medium">
        {this.props.records.map(record => (
          <RecordItem
            key={refToString(record.id)}
            record={record}
            viewContext={this.props.viewContextMap.get(record.model)!}
            viewContextMap={this.props.viewContextMap}
            localeContext={this.props.localeContext}>
            {this.props.actions.map(action => (
              <Button
                key={action.key}
                type={ButtonType.Icon}
                data={record}
                onTrigger={action.onTrigger}
                icon={action.icon}
                label={action.label}
              />
            ))}
          </RecordItem>
        ))}
      </FlexList>
    )
  }
}

export interface RecordListProps {
  viewContext: ViewContext
  sessionContext: SessionContext
  localeContext: LocaleContext
  records?: ModelRecord[]
  actions: RecordAction[]
}

export class RecordList extends React.Component<RecordListProps> {
  public render() {
    if (!this.props.records) return <CenteredLoadingIndicator />

    // TODO: Empty view
    if (this.props.records.length === 0) return <>No results</>

    return (
      <FlexList direction="column" spacing="medium">
        {this.props.records.map(record => (
          <RecordItem
            key={refToString(record.id)}
            record={record}
            viewContext={this.props.viewContext}
            viewContextMap={this.props.sessionContext.viewContextMap}
            localeContext={this.props.localeContext}>
            {this.props.actions.map(action => (
              <Button
                key={action.key}
                type={ButtonType.Icon}
                data={record}
                onTrigger={action.onTrigger}
                icon={action.icon}
                label={action.label}
              />
            ))}
          </RecordItem>
        ))}
      </FlexList>
    )
  }
}

export interface RecordListPanelProps {
  model: Ref
  sessionContext: SessionContext
  localeContext: LocaleContext
  disabled: boolean
  headerPrefix: string
  toolbarActions: ToolbarAction[]
  recordActions: RecordAction[]
}

export interface RecordListPanelState {
  records?: ModelRecord[]
  limit: number
  offset: number
  hasMore: boolean
  filter?: Filter
  sort?: Sort
  sortValue?: SortConfiguration
  sortDescending: boolean
  quickSearchValue: string
}

export class RecordListPanel extends React.PureComponent<
  RecordListPanelProps,
  RecordListPanelState
> {
  public state: RecordListPanelState = {
    limit: 50,
    offset: 0,
    hasMore: true,
    sortDescending: false,
    quickSearchValue: ''
  }

  private handleNextPage = () => {
    this.nextPage()
  }

  private handlePreviousPage = () => {
    this.previousPage()
  }

  private handleSortChange = (value: SortConfiguration, descending: boolean) => {
    this.setState(
      {
        sortValue: value,
        sortDescending: descending
      },
      () => {
        this.loadRecords(this.state.offset)
      }
    )
  }

  private handleQuickSearchChange = (value: string) => {
    this.setState(
      {
        offset: 0,
        quickSearchValue: value
      },
      () => {
        this.loadRecords(this.state.offset)
      }
    )
  }

  private get viewContext(): ViewContext | undefined {
    return this.props.sessionContext.viewContextMap.get(this.props.model)
  }

  private get sortValue(): SortConfiguration {
    return this.state.sortValue || this.viewContext!.sortConfigurations[0]
  }

  private get sort(): Sort {
    return {
      path: this.sortValue.path,
      type: this.sortValue.type,
      descending: this.state.sortDescending
    }
  }

  private async previousPage() {
    this.loadRecords(this.state.offset - this.state.limit)
  }

  private async nextPage() {
    this.loadRecords(this.state.offset + this.state.limit)
  }

  public async reload() {
    await this.loadRecords(this.state.offset)
  }

  private loadRecords = async (offset: number) => {
    if (!this.viewContext) return

    this.setState({offset, records: undefined})

    const filters: Condition[] = []

    if (this.state.quickSearchValue.trim() !== '') {
      for (const keyPath of this.viewContext.displayKeyPaths) {
        const valuePath = this.viewContext.field.valuePathForKeyPath(keyPath)

        filters.push({
          type: ConditionType.StringIncludes,
          path: valuePath,
          value: this.state.quickSearchValue.trim()
        })
      }
    }

    // Request one more than the limit to check if there's another page
    const records = await this.props.sessionContext.getRecordList(
      this.viewContext.model,
      this.state.limit + 1,
      offset,
      this.sort,
      filters
    )

    const hasMore = records.length > this.state.limit

    if (hasMore) {
      // Remove extranous record
      records.splice(-1, 1)
    }

    this.setState({records, hasMore})
  }

  public componentDidMount() {
    this.loadRecords(this.state.offset)
  }

  public render() {
    const sessionContext = this.props.sessionContext
    const viewContext = this.viewContext

    // TODO: Error panel
    if (!viewContext) return <div>Not Found</div>

    return (
      <Panel>
        <ViewContextPanelHeader viewContext={viewContext} prefix={this.props.headerPrefix} />
        <PanelToolbar
          left={
            <FlexList spacing="medium">
              {this.props.toolbarActions.map(action => (
                <Button
                  key={action.key}
                  type={ButtonType.Icon}
                  onTrigger={action.onTrigger}
                  icon={action.icon}
                  label={action.label}
                />
              ))}
            </FlexList>
          }
          right={
            <FlexList spacing="medium">
              <Button
                type={ButtonType.Icon}
                icon={IconName.ListArrowLeft}
                onTrigger={this.handlePreviousPage}
                disabled={this.state.records == undefined || this.state.offset <= 0}
              />
              <Button
                type={ButtonType.Icon}
                icon={IconName.ListArrowRight}
                onTrigger={this.handleNextPage}
                disabled={this.state.records == undefined || !this.state.hasMore}
              />
              <ToolbarFilter
                viewContext={viewContext}
                sortConfigurations={viewContext.sortConfigurations}
                sortValue={this.sortValue}
                sortDescending={this.state.sortDescending}
                onSortChange={this.handleSortChange}
                filterConfigurations={[]}
                quickSearchValue={this.state.quickSearchValue}
                onQuickSearchChange={this.handleQuickSearchChange}
                disableQuickSearch={viewContext.displayKeyPaths.length === 0}
              />
            </FlexList>
          }
        />
        <PanelContent>
          <RecordList
            viewContext={viewContext}
            sessionContext={sessionContext}
            localeContext={this.props.localeContext}
            records={this.state.records}
            actions={this.props.recordActions}
          />
        </PanelContent>
      </Panel>
    )
  }
}

export type SpecializedRecordListProps = Omit<
  Omit<Omit<RecordListPanelProps, 'toolbarActions'>, 'recordActions'>,
  'headerPrefix'
>

export interface RootRecordListPanelProps extends SpecializedRecordListProps {
  onEditRecord: (model: Ref, id?: Ref) => Promise<ModelRecord | undefined>
  onDeleteRecord: (model: Ref, id: Ref) => Promise<void>
}

export class RootRecordListPanel extends React.PureComponent<RootRecordListPanelProps> {
  private listRef = React.createRef<RecordListPanel>()

  private handleNewRecord = async () => {
    await this.props.onEditRecord(this.props.model)
    this.listRef.current!.reload()
  }

  private handleEditRecord = async (record: ModelRecord) => {
    await this.props.onEditRecord(this.props.model, record.id)
    this.listRef.current!.reload()
  }

  private handleDeleteRecord = async (record: ModelRecord) => {
    await this.props.onDeleteRecord(this.props.model, record.id)
    this.listRef.current!.reload()
  }

  public render() {
    const _ = this.props.localeContext.get
    const toolbarActions: ToolbarAction[] = [
      {
        key: 'new',
        icon: IconName.NewDocument,
        label: _('newRecord'),
        onTrigger: this.handleNewRecord
      }
    ]

    if (this.props.sessionContext.developmentMode) {
      // TODO: Add View Context Editor
      // toolbarActions.push({
      //   key: 'viewContextEditor',
      //   icon: IconName.CodeView,
      //   label: _('viewContextEditor'),
      //   onTrigger: () => {}
      // })
    }

    return (
      <RecordListPanel
        {...this.props}
        ref={this.listRef}
        headerPrefix={_('listRecordPrefix')}
        toolbarActions={toolbarActions}
        recordActions={[
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
    )
  }
}

export interface SelectRecordListPanelProps extends SpecializedRecordListProps {
  onBack: (model: Ref) => void
  onRecordSelected: (model: Ref, record: ModelRecord) => void
}

export class SelectRecordListPanel extends React.PureComponent<SelectRecordListPanelProps> {
  private handleBack = () => {
    this.props.onBack(this.props.model)
  }

  private handleSelectRecord = (record: ModelRecord) => {
    this.props.onRecordSelected(this.props.model, record)
  }

  public render() {
    const _ = this.props.localeContext.get

    return (
      <RecordListPanel
        {...this.props}
        headerPrefix={_('selectRecordPrefix')}
        toolbarActions={[
          {
            key: 'new',
            icon: IconName.Back,
            label: _('back'),
            onTrigger: this.handleBack
          }
        ]}
        recordActions={[
          {
            key: 'select',
            icon: IconName.SelectDocument,
            label: _('selectRecord'),
            onTrigger: this.handleSelectRecord
          }
        ]}
      />
    )
  }
}

export const SelectRecordListPanelContainer = withLocale(withSession(SelectRecordListPanel))
export const RootRecordListPanelContainer = withLocale(withSession(RootRecordListPanel))
