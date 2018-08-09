import React from 'react'
import shortid from 'shortid'
import {style} from 'typestyle'
import {data as d} from '@karma.run/sdk'

import {
  reduceToMap,
  KeyPath,
  Model,
  SortConfiguration,
  FilterConfiguration,
  ValuePath,
  ValuePathSegmentType,
  TypedFieldOptions,
  flatMap
} from '@karma.run/editor-common'

import {
  EditComponentRenderProps,
  Field,
  EditRenderProps,
  CreateFieldFunction,
  SaveContext,
  DeleteContext,
  FieldValue,
  AnyFieldValue,
  AnyField
} from '../api/field'

import {ErrorField} from './error'
import {FieldWrapper, FieldComponent, FieldLabel, FieldInset} from '../ui/field'
import {EditableTabList} from '../ui/tabList'

export interface MapFieldEditComponentState {
  activeTabIndex: number
}

export class MapFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<MapField, MapFieldValue>,
  MapFieldEditComponentState
> {
  public state: MapFieldEditComponentState = {activeTabIndex: 0}

  private tabListRef = React.createRef<EditableTabList>()
  private focusTabAtIndex?: number

  private handleValueChange = (value: any, index: number) => {
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

  public changeKeyAt(index: number, key: string) {
    if (index < 0 || index > this.props.value.value.length) throw new Error('Invalid Index!')

    this.props.onValueChange(
      {
        value: Object.assign([...this.props.value.value], {
          [index]: {...this.props.value.value[index], key}
        }),
        isValid: true,
        hasChanges: true
      },
      this.props.changeKey
    )
  }

  public insertValueAt(index: number, key: string) {
    if (index < 0 || index > this.props.value.value.length) throw new Error('Invalid Index!')

    const newValue = [...this.props.value.value]

    newValue.splice(index, 0, {
      id: shortid.generate(),
      key: key,
      value: this.props.field.field.defaultValue
    })

    this.focusTabAtIndex = index
    this.setState({activeTabIndex: index})
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

  public componentDidUpdate() {
    if (this.focusTabAtIndex != undefined) {
      this.tabListRef.current!.focusIndex(this.focusTabAtIndex)
      this.focusTabAtIndex = undefined
    }
  }

  private handleChangeActiveTab = (index: number) => {
    this.setState({activeTabIndex: index})
  }

  private handleKeyChangeAt = (index: number, key: string) => {
    this.changeKeyAt(index, key)
  }

  private handleInsertFieldAt = (index: number, key: string) => {
    this.insertValueAt(index, key)
  }

  private handleRemoveFieldAt = (index: number) => {
    this.removeValueAt(index)
  }

  public render() {
    const value = this.props.value

    return (
      <FieldWrapper depth={this.props.depth} index={this.props.index}>
        <FieldComponent
          className={MapFieldEditComponentLabelStyle}
          depth={this.props.depth}
          index={this.props.index}>
          {!this.props.isWrapped && (
            <FieldLabel
              label={this.props.label}
              description={this.props.description}
              depth={this.props.depth}
              index={this.props.index}
            />
          )}
          <EditableTabList
            ref={this.tabListRef}
            values={value.value}
            activeTab={this.state.activeTabIndex}
            onChangeActiveTab={this.handleChangeActiveTab}
            onChangeAt={this.handleKeyChangeAt}
            onInsertAt={this.handleInsertFieldAt}
            onRemoveAt={this.handleRemoveFieldAt}
            options={this.props.field.restrictedToKeys}
          />
        </FieldComponent>
        {this.state.activeTabIndex < value.value.length && (
          <FieldInset>
            {this.props.field.field.renderEditComponent({
              index: 0,
              depth: this.props.depth + 1,
              isWrapped: true,
              disabled: this.props.disabled,
              value: value.value[this.state.activeTabIndex].value,
              onValueChange: this.handleValueChange,
              onEditRecord: this.props.onEditRecord,
              onSelectRecord: this.props.onSelectRecord,
              onEditField: this.props.onEditField,
              changeKey: this.state.activeTabIndex
            })}
          </FieldInset>
        )}
      </FieldWrapper>
    )
  }
}

export const MapFieldEditComponentLabelStyle = style({
  paddingBottom: 0
})

export interface MapFieldOptions {
  readonly label?: string
  readonly description?: string
  readonly field?: TypedFieldOptions
}

export interface MapFieldConstructorOptions {
  readonly label?: string
  readonly description?: string
  readonly restrictedToKeys?: string[]
  readonly field: AnyField
}

export type MapFieldValue = FieldValue<{id: string; key: string; value: AnyFieldValue}[], string[]>

export class MapField implements Field<MapFieldValue> {
  public readonly label?: string
  public readonly description?: string
  public readonly restrictedToKeys?: string[]

  public readonly defaultValue: MapFieldValue = {
    value: [],
    isValid: true,
    hasChanges: true
  }

  public readonly sortConfigurations: SortConfiguration[] = []
  public readonly filterConfigurations: FilterConfiguration[] = []

  public readonly field: AnyField

  public constructor(opts: MapFieldConstructorOptions) {
    this.label = opts.label
    this.description = opts.description
    this.restrictedToKeys = opts.restrictedToKeys
    this.field = opts.field
  }

  public initialize(recursions: ReadonlyMap<string, AnyField>) {
    this.field.initialize(recursions)
    return this
  }

  public renderListComponent() {
    return ''
  }

  public renderEditComponent(props: EditRenderProps<MapFieldValue>) {
    return (
      <MapFieldEditComponent
        label={this.label}
        description={this.description}
        field={this}
        {...props}
      />
    )
  }

  public transformRawValue(value: any): MapFieldValue {
    return {
      value: Object.entries(value).map(([key, value]) => ({
        id: shortid.generate(),
        key,
        value: this.field.transformRawValue(value)
      })),
      isValid: true,
      hasChanges: true
    }
  }

  public transformValueToExpression(value: MapFieldValue) {
    return d.map(
      reduceToMap(value.value, ({key, value}) => [
        key,
        this.field.transformValueToExpression(value)
      ])
    )
  }

  public fieldOptions(): MapFieldOptions & TypedFieldOptions {
    return {
      type: MapField.type,
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
    return [{type: ValuePathSegmentType.Map}, ...this.field.valuePathForKeyPath(keyPath.slice(1))]
  }

  public valuesForKeyPath(value: MapFieldValue, keyPath: KeyPath) {
    return flatMap(value.value, value => this.field.valuesForKeyPath(value.value, keyPath))
  }

  public async onSave(value: MapFieldValue, context: SaveContext): Promise<MapFieldValue> {
    if (!this.field.onSave) return value
    let newValue = []

    for (const {id, key, value: mapValue} of value.value) {
      newValue.push({id, key, value: await this.field.onSave(mapValue, context)})
    }

    return {
      value: newValue,
      isValid: true,
      hasChanges: true
    }
  }

  public async onDelete(value: MapFieldValue, context: DeleteContext): Promise<MapFieldValue> {
    if (!this.field.onDelete) return value
    let newValue = []

    for (const {id, key, value: mapValue} of value.value) {
      newValue.push({id, key: key, value: await this.field.onDelete(mapValue, context)})
    }

    return {
      value: newValue,
      isValid: true,
      hasChanges: true
    }
  }

  public static type = 'map'

  static canInferFromModel(model: Model) {
    return model.type === 'map'
  }

  static create(model: Model, opts: MapFieldOptions | undefined, createField: CreateFieldFunction) {
    if (model.type !== 'map') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "map" received: "${model.type}"`
      })
    }

    return new this({...opts, field: createField(model.model, opts && opts.field)})
  }
}
