import React from 'react'
import {RefValue} from '@karma.run/editor-common'

import {
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
import {FilterList, FilterListValue, defaultFilterListValue, FilterRowValue} from '../filter/list'
import {RecordItem} from './recordItem'
import {ErrorPanel, ErrorPanelType} from '../errorPanel'
import {AppLocation, EditRecordLocation, DeleteRecordLocation} from '../../context/location'

export class NoRecordsView extends React.Component {
  public render() {
    return <div>No Results</div>
  }
}

export interface ToolbarAction {
  key: string
  icon: IconName
  label: string
  onTrigger: (id: RefValue) => void
}

export interface RecordAction {
  key: string
  icon: IconName
  label: string
  locationForRecord?: (record: ModelRecord) => AppLocation
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
    if (this.props.records.length === 0) return <NoRecordsView />

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
                location={action.locationForRecord && action.locationForRecord(record)}
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
    if (this.props.records.length === 0) return <NoRecordsView />

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
                location={action.locationForRecord && action.locationForRecord(record)}
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
  model: RefValue
  sessionContext: SessionContext
  localeContext: LocaleContext
  disabled: boolean
  headerPrefix: string
  toolbarActions: ToolbarAction[]
  recordActions: RecordAction[]
  onSelectRecord: (model: RefValue) => Promise<ModelRecord | undefined>
}

export interface RecordListPanelState {
  records?: ModelRecord[]
  total: number
  limit: number
  offset: number
  sort?: Sort
  sortValue?: SortConfiguration
  sortDescending: boolean
  quickSearchValue: string
  isFilterActive: boolean
  filterListValue: FilterListValue
}

export class RecordListPanel extends React.PureComponent<
  RecordListPanelProps,
  RecordListPanelState
> {
  public state: RecordListPanelState = {
    total: 0,
    limit: 50,
    offset: 0,
    sortDescending: false,
    quickSearchValue: '',
    isFilterActive: false,
    filterListValue: defaultFilterListValue
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

  private handleToggleFilter = () => {
    this.setState({isFilterActive: !this.state.isFilterActive}, () => {
      this.loadRecords(0)
    })
  }

  private conditionForFilterRowValue(value: FilterRowValue): Condition | undefined {
    if (!value.fieldID || !value.conditionID) return undefined

    const viewContext = this.viewContext!
    const field = viewContext.filterConfigurations.find(config => config.id === value.fieldID)

    if (!field) return undefined

    const condition = field.conditions.find(condition => condition.type === value.conditionID)

    if (!condition) return undefined

    switch (condition.type) {
      case ConditionType.NumberEqual:
      case ConditionType.NumberMin:
      case ConditionType.NumberMax:
        const numberValue = Number(value.value)

        return {
          path: condition.path,
          type: condition.type,
          storageType: condition.storageType,
          value: isNaN(numberValue) ? 0 : numberValue
        }

      default:
        return {
          path: condition.path,
          type: condition.type,
          value: value.value
        } as Condition
    }
  }

  private handleFilterListValueChange = (value: FilterListValue) => {
    this.setState({filterListValue: value}, () => {
      this.loadRecords(0)
    })
  }

  private get totalPages(): number {
    if (this.state.total === 0) return 0
    return Math.ceil(this.state.total / this.state.limit)
  }

  private get currentPage(): number {
    if (this.state.total === 0) return 0
    return Math.ceil(this.state.offset / this.state.limit) + 1
  }

  private get hasMoreRecords(): boolean {
    return this.totalPages > this.currentPage
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

    if (this.state.isFilterActive) {
      filters.push(
        ...(this.state.filterListValue
          .map(value => this.conditionForFilterRowValue(value))
          .filter(value => Boolean(value)) as Condition[])
      )
    }

    if (this.state.quickSearchValue.trim() !== '') {
      const quickSearchFilters: Condition[] = []

      for (const keyPath of this.viewContext.displayKeyPaths) {
        const valuePath = this.viewContext.field.valuePathForKeyPath(keyPath)

        quickSearchFilters.push({
          type: ConditionType.ExtractedStringIncludes,
          path: valuePath,
          value: this.state.quickSearchValue.trim()
        })
      }

      if (quickSearchFilters.length > 0) {
        filters.push({
          type: ConditionType.Or,
          path: [],
          value: quickSearchFilters
        })
      }
    }

    // Request one more than the limit to check if there's another page
    const recordList = await this.props.sessionContext.getRecordList(
      this.viewContext.model,
      this.state.limit,
      offset,
      this.sort,
      filters
    )

    this.setState({
      records: recordList.records,
      total: recordList.total
    })
  }

  public componentDidMount() {
    this.loadRecords(this.state.offset)
  }

  public render() {
    const sessionContext = this.props.sessionContext
    const viewContext = this.viewContext
    const hasRecords = this.state.total !== 0

    if (!viewContext) return <ErrorPanel type={ErrorPanelType.NotFound} />

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
              {hasRecords && (
                <FlexList spacing="small">
                  <Button
                    type={ButtonType.Icon}
                    icon={IconName.ListArrowLeft}
                    onTrigger={this.handlePreviousPage}
                    disabled={this.state.offset <= 0}
                  />
                  <div>
                    {this.currentPage} / {this.totalPages}
                  </div>
                  <Button
                    type={ButtonType.Icon}
                    icon={IconName.ListArrowRight}
                    onTrigger={this.handleNextPage}
                    disabled={!this.hasMoreRecords}
                  />
                </FlexList>
              )}
              <ToolbarFilter
                viewContext={viewContext}
                sortConfigurations={viewContext.sortConfigurations}
                sortValue={this.sortValue}
                sortDescending={this.state.sortDescending}
                onSortChange={this.handleSortChange}
                quickSearchValue={this.state.quickSearchValue}
                onQuickSearchChange={this.handleQuickSearchChange}
                disableQuickSearch={viewContext.displayKeyPaths.length === 0}
                onToggleFilter={this.handleToggleFilter}
                filterConfigurations={viewContext.filterConfigurations}
                isFilterActive={this.state.isFilterActive}
              />
            </FlexList>
          }
          drawer={
            this.state.isFilterActive && (
              <FilterList
                value={this.state.filterListValue}
                field={viewContext.field}
                filterConfigurations={viewContext.filterConfigurations}
                onSelectRecord={this.props.onSelectRecord}
                onValueChange={this.handleFilterListValueChange}
              />
            )
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
  onEditRecord: (model: RefValue, id?: RefValue) => Promise<ModelRecord | undefined>
  onDeleteRecord: (model: RefValue, id: RefValue) => Promise<void>
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

  private editLocationForRecord = (record: ModelRecord) => {
    const viewContext = this.props.sessionContext.viewContextMap.get(this.props.model)!
    return EditRecordLocation(viewContext.slug, record.id[1])
  }

  private deleteLocationForRecord = (record: ModelRecord) => {
    const viewContext = this.props.sessionContext.viewContextMap.get(this.props.model)!
    return DeleteRecordLocation(viewContext.slug, record.id[1])
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

    const viewContext = this.props.sessionContext.viewContextMap.get(this.props.model)

    if (!viewContext) return <ErrorPanel type={ErrorPanelType.NotFound} />

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
            locationForRecord: this.editLocationForRecord,
            onTrigger: this.handleEditRecord
          },
          {
            key: 'delete',
            icon: IconName.DeleteDocument,
            label: _('deleteRecord'),
            locationForRecord: this.deleteLocationForRecord,
            onTrigger: this.handleDeleteRecord
          }
        ]}
      />
    )
  }
}

export interface SelectRecordListPanelProps extends SpecializedRecordListProps {
  onBack: (model: RefValue) => void
  onRecordSelected: (model: RefValue, record: ModelRecord) => void
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
