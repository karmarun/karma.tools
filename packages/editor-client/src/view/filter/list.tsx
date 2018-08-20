import React from 'react'
import shortid from 'shortid'
import {style} from 'typestyle'
import memoizeOne from 'memoize-one'

import {Ref} from '@karma.run/sdk'

import {
  FilterConfiguration,
  labelForCondition,
  ConditionType,
  ConditionConfiguration,
  defaultValueForConditionConfiguration,
  refToPrettyString
} from '@karma.run/editor-common'

import {Spacing, marginLeftExceptFirst} from '../../ui/style'

import {
  InputStyle,
  Button,
  Select,
  SelectOption,
  ButtonType,
  IconName,
  TextInput,
  CheckboxInput,
  NumberInput,
  DateTimeInput,
  FlexList,
  ButtonStyle
} from '../../ui'

// import {FilterRow, FilterRowStyle} from './filterRow'
import {marginTopExceptFirst} from '../../ui/style'
import {ModelRecord} from '../../context/session'

import {AnyField} from '../../api/field'

export function renderInputForConditionConfiguration(
  config: ConditionConfiguration,
  value: any,
  onValueChange: (value: any) => void,
  onSelectRecord: (model: Ref) => Promise<ModelRecord | undefined>
) {
  switch (config.type) {
    case ConditionType.StringEqual:
    case ConditionType.StringStartsWith:
    case ConditionType.StringEndsWith:
    case ConditionType.StringIncludes:
    case ConditionType.StringRegExp:
    case ConditionType.ExtractedStringIncludes:
      return <TextInput value={value} onChange={onValueChange} />

    case ConditionType.BoolEqual:
    case ConditionType.OptionalIsPresent:
      return <CheckboxInput value={value} onChange={onValueChange} />

    case ConditionType.NumberEqual:
    case ConditionType.NumberMin:
    case ConditionType.NumberMax:
    case ConditionType.ListLengthEqual:
    case ConditionType.ListLengthMin:
    case ConditionType.ListLengthMax:
      return <NumberInput value={value} onChange={onValueChange} />

    case ConditionType.DateEqual:
    case ConditionType.DateMin:
    case ConditionType.DateMax:
      return <DateTimeInput value={value} onChange={onValueChange} />

    case ConditionType.EnumEqual:
    case ConditionType.UnionCaseEqual:
      return (
        <Select
          options={config.options}
          value={value}
          onChange={onValueChange}
          disableUnselectedOption
        />
      )

    case ConditionType.RefEqual:
      return (
        <RefSelect
          model={config.model}
          value={value}
          onValueChange={onValueChange}
          onSelectRecord={onSelectRecord}
        />
      )
  }
}

export interface RefSelectProps {
  value: Ref | undefined
  model: Ref
  onValueChange: (value: Ref) => void
  onSelectRecord: (model: Ref) => Promise<ModelRecord | undefined>
}

export class RefSelect extends React.Component<RefSelectProps> {
  private handleButtonTrigger = async () => {
    const result = await this.props.onSelectRecord(this.props.model)
    if (result) this.props.onValueChange(result.id)
  }

  public render() {
    return (
      <FlexList spacing="large">
        <Button
          icon={IconName.SelectDocument}
          type={ButtonType.Icon}
          label={'Select'}
          onTrigger={this.handleButtonTrigger}
        />
        {this.props.value && <div>{refToPrettyString(this.props.value)}</div>}
      </FlexList>
    )
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
        [`> .${ButtonStyle}`]: marginLeftExceptFirst(Spacing.medium)
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
  field: AnyField
  filterConfigurations: FilterConfiguration[]
  onAdd?: (index: number) => void
  onRemove?: (index: number) => void
  onSelectRecord: (model: Ref) => Promise<ModelRecord | undefined>
  onValueChange: (value: FilterRowValue, index: number) => void
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

  public setConditionID(id: string | undefined, value: any) {
    return new FilterRowValue(this.fieldID, id, value, this.id)
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
    const filterConfiguration = this.props.filterConfigurations.find(
      config => config.id === this.props.value.fieldID
    )!

    const conditionConfiguration = filterConfiguration.conditions.find(
      condition => condition.type === id
    )!

    const value = defaultValueForConditionConfiguration(
      conditionConfiguration,
      this.props.value.value
    )

    this.props.onValueChange(this.props.value.setConditionID(id, value), this.props.index)
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

      const condition = filterConfiguration.conditions.find(
        condition => condition.type === value.conditionID
      )

      if (!condition) return undefined

      return condition
    }
  )

  private fieldOptions = memoizeOne((filterConfigurations: FilterConfiguration[]) => {
    return filterConfigurations.map(
      configuration =>
        ({
          key: configuration.id,
          label: `${configuration.label} (${configuration.type})`,
          depth: configuration.depth,
          disabled: configuration.conditions.length === 0
        } as SelectOption)
    )
  })

  private conditionOptions = memoizeOne(
    (filterConfigurations: FilterConfiguration[], value: FilterRowValue) => {
      const filterConfiguration = this.selectedFilterConfiguration(filterConfigurations, value)

      if (!filterConfiguration) return []

      return filterConfiguration.conditions.map(
        condition =>
          ({
            key: condition.type,
            label: labelForCondition(condition.type)
          } as SelectOption)
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
  field: AnyField
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
            field={this.props.field}
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
