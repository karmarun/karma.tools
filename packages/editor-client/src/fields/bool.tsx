import React from 'react'
import {expression as e} from '@karma.run/sdk'

import {
  Model,
  SortConfiguration,
  FilterConfiguration,
  TypedFieldOptions
} from '@karma.run/editor-common'

import {
  EditComponentRenderProps,
  EditRenderProps,
  Field,
  ListRenderProps,
  FieldValue
} from '../api/field'

import {CheckboxInput} from '../ui/input'
import {CardSection} from '../ui/card'
import {FieldComponent, FieldLabel} from '../ui/field'
import {ErrorField} from './error'

export class BoolFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<BoolField, BoolFieldValue>
> {
  private handleChange = (value: boolean) => {
    this.props.onValueChange({value, isValid: true, hasChanges: true}, this.props.changeKey)
  }

  public render() {
    return (
      <FieldComponent depth={this.props.depth} index={this.props.index}>
        {!this.props.isWrapped && (
          <FieldLabel
            label={this.props.label}
            description={this.props.description}
            depth={this.props.depth}
            index={this.props.index}
          />
        )}
        <CheckboxInput
          onChange={this.handleChange}
          value={this.props.value.value}
          disabled={this.props.disabled}
        />
      </FieldComponent>
    )
  }
}

export interface BoolFieldOptions {
  readonly label?: string
  readonly description?: string
  readonly minLength?: number
  readonly maxLength?: number
  readonly multiline?: boolean
}

export type BoolFieldValue = FieldValue<boolean, never>

export class BoolField implements Field<BoolFieldValue> {
  public readonly label?: string
  public readonly description?: string

  public readonly defaultValue: BoolFieldValue = {
    value: false,
    isValid: true,
    hasChanges: true
  }

  public readonly sortConfigurations: SortConfiguration[]
  public readonly filterConfigurations: FilterConfiguration[] = []

  public constructor(opts?: BoolFieldOptions) {
    this.label = opts && opts.label
    this.description = opts && opts.description
    this.sortConfigurations = []
  }

  public initialize() {
    return this
  }

  public renderListComponent(props: ListRenderProps<BoolFieldValue>) {
    return <CardSection>{props.value}</CardSection>
  }

  public renderEditComponent(props: EditRenderProps<BoolFieldValue>) {
    return (
      <BoolFieldEditComponent
        label={this.label}
        description={this.description}
        field={this}
        {...props}
      />
    )
  }

  public transformRawValue(value: unknown): BoolFieldValue {
    if (typeof value !== 'boolean') throw new Error('Invalid value.')
    return {value, isValid: true, hasChanges: false}
  }

  public transformValueToExpression(fieldValue: BoolFieldValue) {
    return e.bool(fieldValue.value)
  }

  public fieldOptions(): BoolFieldOptions & TypedFieldOptions {
    return {
      type: BoolField.type,
      label: this.label,
      description: this.description
    }
  }

  public traverse() {
    return this
  }

  public valuePathForKeyPath() {
    return []
  }

  public valuesForKeyPath(value: BoolFieldValue) {
    return [value]
  }

  public static type = 'bool'

  static canInferFromModel(model: Model) {
    return model.type === 'bool'
  }

  static create(model: Model, opts?: BoolFieldOptions) {
    if (model.type !== 'bool') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "bool" received: "${model.type}"`
      })
    }

    return new this(opts)
  }
}
