import React from 'react'
import shortid from 'shortid'
import {style} from 'typestyle'
import {Ref} from '@karma.run/sdk'

import {
  FilterConfiguration,
  labelForCondition,
  ConditionType,
  ConditionConfiguration
} from '@karma.run/editor-common'

import {Spacing, marginLeftExceptFirst} from '../../ui/style'
import {InputStyle, Button, Select, ButtonType, IconName, TextInput} from '../../ui'

// import {FilterRow, FilterRowStyle} from './filterRow'
import {marginTopExceptFirst} from '../../ui/style'
import {ModelRecord} from '../../context/session'

import memoizeOne from 'memoize-one'

export function renderInputForConditionConfiguration(
  conditionConfiguration: ConditionConfiguration,
  value: any,
  onValueChange: (value: any) => void,
  _onSelectRecord: (model: Ref) => Promise<ModelRecord | undefined>
) {
  switch (conditionConfiguration.type) {
    case ConditionType.StringEqual:
      return <TextInput value={value || ''} onChange={onValueChange} />

    default:
      return <div>NOT IMPLEMENTED</div>
  }
}

export const FilterRowStyle = style({
  display: 'flex',
  alignItems: 'center',

  width: '100%',

  $nest: {
    '> .types': {
      width: '25%',
      marginRight: Spacing.medium
    },

    '> .condition': {
      width: '25%',
      marginRight: Spacing.medium
    },

    '> .value': {
      flexGrow: 1,
      marginRight: Spacing.medium
    },

    '> .actions': {
      display: 'flex',

      $nest: {
        [`> .${Button.Style}`]: marginLeftExceptFirst(Spacing.medium)
      }
    },

    [`> .${InputStyle}`]: {
      width: 'auto'
    }
  }
})

export interface FilterRowProps {
  index: number
  value: FilterRowValue
  filterConfigurations: FilterConfiguration[]
  onAdd?: (index: number) => void
  onRemove?: (index: number) => void
  onSelectRecord(model: Ref): Promise<ModelRecord | undefined>
  onValueChange(value: FilterRowValue, index: number): void
}

export class FilterRowValue {
  public readonly id: string

  public readonly fieldID?: string
  public readonly conditionID?: string
  public readonly value?: any

  constructor(
    fieldID?: string,
    conditionID?: string,
    value?: any,
    id: string = shortid.generate()
  ) {
    this.id = id
    this.fieldID = fieldID
    this.conditionID = conditionID
    this.value = value
  }

  public setFieldID(id: string | undefined) {
    return new FilterRowValue(id, undefined, undefined, this.id)
  }

  public setConditionID(id: string | undefined) {
    return new FilterRowValue(this.fieldID, id, undefined, this.id)
  }

  public setValue(value: any) {
    return new FilterRowValue(this.fieldID, this.conditionID, value, this.id)
  }
}

export class FilterRow extends React.Component<FilterRowProps> {
  private handleFieldChange = (id: string | undefined) => {
    this.props.onValueChange(this.props.value.setFieldID(id), this.props.index)
  }

  private handleConditionChange = (id: string | undefined) => {
    this.props.onValueChange(this.props.value.setConditionID(id), this.props.index)
  }

  private handleValueChange = (value: any) => {
    this.props.onValueChange(this.props.value.setValue(value), this.props.index)
  }

  private handleAddClick = () => {
    this.props.onAdd!(this.props.index)
  }

  private handleRemoveClick = () => {
    this.props.onRemove!(this.props.index)
  }

  private selectedFilterConfiguration = memoizeOne(
    (filterConfigurations: FilterConfiguration[], value: FilterRowValue) =>
      filterConfigurations.find(config => config.id === value.fieldID)
  )

  private selectedCondition = memoizeOne(
    (filterConfigurations: FilterConfiguration[], value: FilterRowValue) => {
      const filterConfiguration = this.selectedFilterConfiguration(filterConfigurations, value)
      if (!filterConfiguration) return undefined

      for (const group of filterConfiguration.conditionGroups) {
        const condition = group.conditions.find(condition => condition.id === value.conditionID)
        if (condition) return condition
      }

      return undefined
    }
  )

  private fieldOptions = memoizeOne((filterConfigurations: FilterConfiguration[]) => {
    return filterConfigurations.map(
      configuration =>
        ({
          key: configuration.id,
          label: configuration.label,
          depth: configuration.depth,
          disabled: configuration.conditionGroups.length === 0
        } as Select.Option)
    )
  })

  private conditionOptions = memoizeOne(
    (filterConfigurations: FilterConfiguration[], value: FilterRowValue) => {
      const filterConfiguration = this.selectedFilterConfiguration(filterConfigurations, value)

      if (!filterConfiguration) return []

      return filterConfiguration.conditionGroups.map(
        group =>
          ({
            key: group.id,
            label: group.label,
            options: group.conditions.map(condition => ({
              key: condition.id,
              label: labelForCondition(condition.type)
            }))
          } as Select.Option)
      )
    }
  )

  public render() {
    return (
      <div className={FilterRowStyle}>
        <div className="types">
          <Select
            options={this.fieldOptions(this.props.filterConfigurations)}
            onChange={this.handleFieldChange}
            value={this.props.value.fieldID}
            disableUnselectedOption
          />
        </div>
        <div className="condition">
          {this.props.value.fieldID && (
            <Select
              options={this.conditionOptions(this.props.filterConfigurations, this.props.value)}
              onChange={this.handleConditionChange}
              value={this.props.value.conditionID}
              disableUnselectedOption
            />
          )}
        </div>
        <div className="value">
          {this.props.value.conditionID &&
            renderInputForConditionConfiguration(
              this.selectedCondition(this.props.filterConfigurations, this.props.value)!,
              this.props.value.value,
              this.handleValueChange,
              this.props.onSelectRecord
            )}
        </div>
        <div className="actions">
          {this.props.onRemove && (
            <Button
              type={ButtonType.Icon}
              onTrigger={this.handleRemoveClick}
              icon={IconName.Remove}
            />
          )}
          {this.props.onAdd && (
            <Button type={ButtonType.Icon} onTrigger={this.handleAddClick} icon={IconName.Add} />
          )}
        </div>
      </div>
    )
  }
}

export const FilterListStyle = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  $nest: {
    '> .label': {
      flexShrink: 0,
      marginRight: Spacing.medium
    },

    [`> .${InputStyle}`]: {
      width: 'auto'
    },

    [`> .${FilterRowStyle}`]: marginTopExceptFirst(Spacing.medium)
  }
})

export interface FilterListProps {
  value: FilterListValue
  filterConfigurations: FilterConfiguration[]
  onSelectRecord(model: Ref): Promise<ModelRecord | undefined>
  onValueChange(value: FilterListValue): void
}

export type FilterListValue = FilterRowValue[]

export class FilterList extends React.Component<FilterListProps> {
  private handleAddAtIndex = (index: number) => {
    const newValue = [...this.props.value]
    newValue.splice(index + 1, 0, new FilterRowValue())
    this.props.onValueChange(newValue)
  }

  private handleRemoveAtIndex = (index: number) => {
    const newValue = [...this.props.value]
    newValue.splice(index, 1)
    this.props.onValueChange(newValue)
  }

  private handleValueChangeAt = (value: FilterRowValue, index: number) => {
    this.props.onValueChange(Object.assign([], this.props.value, {[index]: value}))
  }

  public render() {
    return (
      <div className={FilterListStyle}>
        {this.props.value.map((value, index) => (
          <FilterRow
            key={value.id}
            index={index}
            value={value}
            filterConfigurations={this.props.filterConfigurations}
            onAdd={this.handleAddAtIndex}
            onRemove={this.props.value.length !== 1 ? this.handleRemoveAtIndex : undefined}
            onValueChange={this.handleValueChangeAt}
            onSelectRecord={this.props.onSelectRecord}
          />
        ))}
      </div>
    )
  }
}

export const defaultFilterListValue = [new FilterRowValue()]
