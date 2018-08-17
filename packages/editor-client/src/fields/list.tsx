import React from 'react'
import shortid from 'shortid'
import {style} from 'typestyle'
import {data as d, DataExpression} from '@karma.run/sdk'

import {
  KeyPath,
  Model,
  TypedFieldOptions,
  SortConfiguration,
  FilterConfiguration,
  ValuePath,
  flatMap,
  SimpleConditionConfiguration,
  ConditionType,
  filterConfigurationPrependPath,
  ListPathSegment
} from '@karma.run/editor-common'

import {
  EditComponentRenderProps,
  Field,
  EditRenderProps,
  CreateFieldFunction,
  SaveContext,
  DeleteContext,
  FieldValue,
  AnyField,
  AnyFieldValue
} from '../api/field'

import {ErrorField} from './error'
import {FieldWrapper, FieldComponent, FieldLabel, FieldInset} from '../ui/field'
import {darkFieldColorForDepthAndIndex, Spacing, Color} from '../ui/style'
import {FlexFiller} from '../ui/flex'
import {Button, ButtonType} from '../ui/button'
import {IconName} from '../ui/icon'

export interface ListFieldItemProps {
  index: number
  isFirst: boolean
  isLast: boolean
  disabled: boolean
  depth: number
  label: string
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onAddAbove: (index: number) => void
  onAddBelow: (index: number) => void
  onRemove: (index: number) => void
}

export const ListFieldItemStyle = style({
  $debugName: 'ListFieldItem',
  marginTop: Spacing.small,

  $nest: {
    '> .header': {
      display: 'flex',
      padding: Spacing.medium,
      color: Color.neutral.dark1,
      fontStyle: 'italic',

      $nest: {
        Button: {
          marginLeft: Spacing.small
        }
      }
    },

    '&:first-child': {
      marginTop: 0
    }
  }
})

export class ListFieldItem extends React.Component<ListFieldItemProps> {
  public render() {
    const headerStyle: React.CSSProperties = {
      backgroundColor: darkFieldColorForDepthAndIndex(this.props.depth, this.props.index)
    }

    return (
      <div className={ListFieldItemStyle}>
        <div className="header" style={headerStyle}>
          {this.props.label}
          <FlexFiller />
          {!this.props.isFirst && (
            <Button
              type={ButtonType.Icon}
              icon={IconName.ListArrowUp}
              onTrigger={this.props.onMoveUp}
              disabled={this.props.disabled}
            />
          )}
          {!this.props.isLast && (
            <Button
              data={this.props.index}
              type={ButtonType.Icon}
              icon={IconName.ListArrowDown}
              onTrigger={this.props.onMoveDown}
              disabled={this.props.disabled}
            />
          )}
          <Button
            data={this.props.index}
            type={ButtonType.Icon}
            icon={IconName.AddTop}
            onTrigger={this.props.onAddAbove}
            disabled={this.props.disabled}
          />
          <Button
            data={this.props.index}
            type={ButtonType.Icon}
            icon={IconName.AddBottom}
            onTrigger={this.props.onAddBelow}
            disabled={this.props.disabled}
          />
          <Button
            data={this.props.index}
            type={ButtonType.Icon}
            icon={IconName.Remove}
            onTrigger={this.props.onRemove}
            disabled={this.props.disabled}
          />
        </div>
        {this.props.children}
      </div>
    )
  }
}

export class ListFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<ListField, ListFieldValue>
> {
  private handleValueChange = (value: AnyFieldValue, index: number) => {
    if (index == undefined) {
      throw new Error('Child field did not call onValueChange with changeKey!')
    }

    this.props.onValueChange(
      {
        value: Object.assign([...this.props.value.value], {
          [index]: {...this.props.value.value[index], value}
        }),
        isValid: true,
        hasChanges: true
      },
      this.props.changeKey
    )
  }

  public insertValueAt(index: number) {
    if (index < 0 || index > this.props.value.value.length) throw new Error('Invalid Index!')

    const newValue = [...this.props.value.value]

    newValue.splice(index, 0, {
      id: shortid.generate(),
      value: this.props.field.field.defaultValue
    })

    this.props.onValueChange(
      {
        value: newValue,
        isValid: true,
        hasChanges: true
      },
      this.props.changeKey
    )
  }

  public removeValueAt(index: number) {
    if (index < 0 || index >= this.props.value.value.length) throw new Error('Invalid Index!')

    const newValue = [...this.props.value.value]
    newValue.splice(index, 1)

    this.props.onValueChange(
      {
        value: newValue,
        isValid: true,
        hasChanges: true
      },
      this.props.changeKey
    )
  }

  private moveFieldToIndex(index: number, toIndex: number) {
    if (index < 0 || index >= this.props.value.value.length) throw new Error('Invalid Index!')
    if (toIndex < 0 || toIndex >= this.props.value.value.length) throw new Error('Invalid Index!')

    const newValue = [...this.props.value.value]
    const moveValue = newValue.splice(index, 1)
    newValue.splice(toIndex, 0, ...moveValue)

    this.props.onValueChange(
      {
        value: newValue,
        isValid: true,
        hasChanges: true
      },
      this.props.changeKey
    )
  }

  private handleInsertFieldAt = (index: number) => {
    this.insertValueAt(index)
  }

  private handleMoveFieldUp = (index: number) => {
    this.moveFieldToIndex(index, index - 1)
  }

  private handleMoveFieldDown = (index: number) => {
    this.moveFieldToIndex(index, index + 1)
  }

  private handleInsertFieldBelow = (index: number) => {
    this.insertValueAt(index + 1)
  }

  private handleRemoveFieldAt = (index: number) => {
    this.removeValueAt(index)
  }

  public render() {
    return (
      <FieldWrapper depth={this.props.depth} index={this.props.index}>
        <FieldComponent depth={this.props.depth} index={this.props.index}>
          <FieldLabel
            label={this.props.label}
            description={this.props.description}
            depth={this.props.depth}
            index={this.props.index || 0}
            rightContent={
              <Button
                data={0}
                type={ButtonType.Icon}
                icon={IconName.Add}
                onTrigger={this.handleInsertFieldAt}
                disabled={this.props.disabled}
              />
            }
          />
        </FieldComponent>
        {this.props.value.value.length > 0 && (
          <FieldInset>
            {this.props.value.value.map((value, index) => {
              return (
                <ListFieldItem
                  key={value.id}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === this.props.value.value.length - 1}
                  disabled={this.props.disabled}
                  depth={this.props.depth + 1}
                  label={
                    this.props.field.label
                      ? `${this.props.field.label} #${index + 1}`
                      : `#${index + 1}`
                  }
                  onMoveUp={this.handleMoveFieldUp}
                  onMoveDown={this.handleMoveFieldDown}
                  onAddAbove={this.handleInsertFieldAt}
                  onAddBelow={this.handleInsertFieldBelow}
                  onRemove={this.handleRemoveFieldAt}>
                  {this.props.field.field.renderEditComponent({
                    index: index,
                    depth: this.props.depth + 1,
                    isWrapped: true,
                    disabled: this.props.disabled,
                    value: value.value,
                    onValueChange: this.handleValueChange,
                    onEditRecord: this.props.onEditRecord,
                    onSelectRecord: this.props.onSelectRecord,
                    onEditField: this.props.onEditField,
                    changeKey: index
                  })}
                </ListFieldItem>
              )
            })}
          </FieldInset>
        )}
      </FieldWrapper>
    )
  }
}

export interface ListFieldOptions {
  readonly label?: string
  readonly description?: string
  readonly field?: TypedFieldOptions
}

export interface ListFieldConstructorOptions {
  readonly label?: string
  readonly description?: string
  readonly field: AnyField
}

export type ListFieldValue = FieldValue<{id: string; value: AnyFieldValue}[], string[]>

export class ListField implements Field<ListFieldValue> {
  public readonly label?: string
  public readonly description?: string

  public readonly defaultValue: ListFieldValue = {value: [], isValid: true, hasChanges: false}
  public readonly sortConfigurations: SortConfiguration[] = []

  public filterConfigurations!: FilterConfiguration[]

  public readonly field: AnyField

  public constructor(opts: ListFieldConstructorOptions) {
    this.label = opts.label
    this.description = opts.description
    this.field = opts.field
  }

  public initialize(recursions: ReadonlyMap<string, AnyField>) {
    this.field.initialize(recursions)

    this.filterConfigurations = [
      FilterConfiguration(ListField.type, ListField.type, this.label, [
        SimpleConditionConfiguration(ConditionType.ListLengthEqual),
        SimpleConditionConfiguration(ConditionType.ListLengthMin),
        SimpleConditionConfiguration(ConditionType.ListLengthMax)
      ]),
      ...this.field.filterConfigurations.map(config =>
        filterConfigurationPrependPath(config, ListField.type, [ListPathSegment()])
      )
    ]

    return this
  }

  public renderListComponent() {
    return ''
  }

  public renderEditComponent(props: EditRenderProps<ListFieldValue>) {
    return (
      <ListFieldEditComponent
        label={this.label}
        description={this.description}
        field={this}
        {...props}
      />
    )
  }

  public transformRawValue(value: any): ListFieldValue {
    return {
      value: Object.entries(value).map(([key, value]) => ({
        id: shortid.generate(),
        key,
        value: this.field.transformRawValue(value)
      })),
      isValid: true,
      hasChanges: false
    }
  }

  public transformValueToExpression(value: ListFieldValue): DataExpression {
    return d.list(...value.value.map(({value}) => this.field.transformValueToExpression(value)))
  }

  public fieldOptions(): ListFieldOptions & TypedFieldOptions {
    return {
      type: ListField.type,
      label: this.label,
      description: this.description,
      field: this.field.fieldOptions()
    }
  }

  public traverse(keyPath: KeyPath) {
    if (keyPath.length === 0) return this
    return undefined
  }

  public valuePathForKeyPath(keyPath: KeyPath): ValuePath {
    return [ListPathSegment(), ...this.field.valuePathForKeyPath(keyPath.slice(1))]
  }

  public valuesForKeyPath(value: ListFieldValue, keyPath: KeyPath) {
    return flatMap(value.value, value => this.field.valuesForKeyPath(value.value, keyPath))
  }

  public async onSave(value: ListFieldValue, context: SaveContext): Promise<ListFieldValue> {
    if (!this.field.onSave) return value
    let newValue = []

    for (const {id, value: mapValue} of value.value) {
      newValue.push({id, value: await this.field.onSave(mapValue, context)})
    }

    return {value: newValue, isValid: true, hasChanges: true}
  }

  public async onDelete(value: ListFieldValue, context: DeleteContext): Promise<ListFieldValue> {
    if (!this.field.onDelete) return value
    let newValue = []

    for (const {id, value: mapValue} of value.value) {
      newValue.push({id, value: await this.field.onDelete(mapValue, context)})
    }

    return {value: newValue, isValid: true, hasChanges: true}
  }

  public static type = 'list'

  static canInferFromModel(model: Model) {
    return model.type === 'list'
  }

  static create(
    model: Model,
    opts: ListFieldOptions | undefined,
    createField: CreateFieldFunction
  ) {
    if (model.type !== 'list') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "list" received: "${model.type}"`
      })
    }

    return new this({...opts, field: createField(model.model, opts && opts.field)})
  }
}
