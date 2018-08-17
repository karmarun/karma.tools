import React from 'react'
import {expression as e} from '@karma.run/sdk'

import {
  Model,
  KeyPath,
  TypedFieldOptions,
  SortConfiguration,
  FilterConfiguration,
  OptionalPathSegment,
  ConditionType,
  SimpleConditionConfiguration,
  filterConfigurationPrependPath
} from '@karma.run/editor-common'

import {ErrorField} from './error'

import {
  EditRenderProps,
  Field,
  CreateFieldFunction,
  EditComponentRenderProps,
  SaveContext,
  DeleteContext,
  FieldValue,
  AnyField,
  ListRenderProps,
  AnyFieldValue
} from '../api/field'

import {FieldComponent, FieldLabel, FieldWrapper, FieldInset} from '../ui/field'
import {CardSection} from '../ui/card'
import {CheckboxInput} from '../ui'

export class OptionalFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<OptionalField, OptionalFieldValue>
> {
  private handleIsPresentChange = (value: boolean) => {
    this.props.onValueChange(
      {
        value: {
          isPresent: value,
          value: this.props.value.value.value || this.props.field.field.defaultValue
        },
        isValid: true,
        hasChanges: true
      },
      this.props.changeKey
    )
  }

  private handleValueChange = (value: AnyFieldValue) => {
    this.props.onValueChange(
      {
        value: {
          isPresent: this.props.value.value.isPresent,
          value: value
        },
        isValid: true,
        hasChanges: true
      },
      this.props.changeKey
    )
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
            leftContent={
              <CheckboxInput
                value={this.props.value.value.isPresent}
                onChange={this.handleIsPresentChange}
                disabled={this.props.disabled}
              />
            }
          />
        </FieldComponent>
        {this.props.value.value.isPresent && (
          <FieldInset>
            {this.props.field.field.renderEditComponent({
              index: 0,
              depth: this.props.depth + 1,
              isWrapped: true,
              disabled: this.props.disabled,
              value: this.props.value.value.value!,
              onValueChange: this.handleValueChange,
              onEditRecord: this.props.onEditRecord,
              onSelectRecord: this.props.onSelectRecord,
              onEditField: this.props.onEditField
            })}
          </FieldInset>
        )}
      </FieldWrapper>
    )
  }
}

export type OptionalFieldValue = FieldValue<
  {
    isPresent: boolean
    value?: AnyFieldValue
  },
  string
>

export interface OptionalFieldOptions {
  readonly label?: string
  readonly description?: string
  readonly field?: TypedFieldOptions
}

export interface OptionalFieldConstructorOptions {
  readonly label?: string
  readonly description?: string
  readonly field: AnyField
}

export class OptionalField implements Field<OptionalFieldValue> {
  public label?: string
  public description?: string

  public defaultValue: OptionalFieldValue = {
    value: {
      isPresent: false,
      value: undefined
    },
    isValid: true,
    hasChanges: true
  }

  public sortConfigurations: SortConfiguration[] = []
  public filterConfigurations: FilterConfiguration[] = []

  public field: AnyField

  public constructor(options: OptionalFieldConstructorOptions) {
    this.label = options.label
    this.description = options.description
    this.field = options.field
  }

  public initialize(recursions: ReadonlyMap<string, AnyField>) {
    this.field.initialize(recursions)

    this.filterConfigurations = [
      FilterConfiguration(OptionalField.type, OptionalField.type, this.label, [
        SimpleConditionConfiguration(ConditionType.OptionalIsPresent)
      ]),
      ...this.field.filterConfigurations.map(config =>
        filterConfigurationPrependPath(config, OptionalField.type, [OptionalPathSegment()])
      )
    ]

    return this
  }

  public renderListComponent(props: ListRenderProps<OptionalFieldValue>) {
    return <CardSection>{props.value.value}</CardSection>
  }

  public renderEditComponent(props: EditRenderProps<OptionalFieldValue>) {
    return (
      <OptionalFieldEditComponent
        label={this.label}
        description={this.description}
        field={this}
        {...props}
      />
    )
  }

  public transformRawValue(value: any): OptionalFieldValue {
    const isPresent = value != undefined

    return {
      value: {
        isPresent,
        value: isPresent ? this.field.transformRawValue(value) : undefined
      },
      isValid: true,
      hasChanges: false
    }
  }

  public transformValueToExpression(value: OptionalFieldValue) {
    return value.value.isPresent
      ? this.field.transformValueToExpression(value.value.value!)
      : e.null()
  }

  public fieldOptions(): OptionalFieldOptions & TypedFieldOptions {
    return {
      type: OptionalField.type,
      label: this.label,
      description: this.description,
      field: this.field.fieldOptions()
    }
  }

  public traverse(keyPath: KeyPath) {
    return this.field.traverse(keyPath)
  }

  public valuePathForKeyPath(keyPath: KeyPath) {
    return [OptionalPathSegment(), ...this.field.valuePathForKeyPath(keyPath)]
  }

  public valuesForKeyPath(value: OptionalFieldValue, keyPath: KeyPath) {
    return value.value.isPresent ? this.field.valuesForKeyPath(value.value.value!, keyPath) : []
  }

  public async onSave(
    value: OptionalFieldValue,
    context: SaveContext
  ): Promise<OptionalFieldValue> {
    if (this.field.onSave && value.value.isPresent) {
      return {
        value: {
          isPresent: value.value.isPresent,
          value: await this.field.onSave(value.value.value!, context)
        },
        isValid: true,
        hasChanges: true
      }
    }

    return value
  }

  public async onDelete(
    value: OptionalFieldValue,
    context: DeleteContext
  ): Promise<OptionalFieldValue> {
    if (this.field.onDelete && value.value.isPresent) {
      return {
        value: {
          isPresent: value.value.isPresent,
          value: await this.field.onDelete(value.value.value!, context)
        },
        isValid: true,
        hasChanges: true
      }
    }

    return value
  }

  public static type = 'optional'

  static canInferFromModel(model: Model) {
    return model.type === 'optional'
  }

  static create(
    model: Model,
    opts: OptionalFieldOptions | undefined,
    createField: CreateFieldFunction
  ) {
    if (model.type !== 'optional') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "optional" received: "${model.type}"`
      })
    }

    return new this({
      ...opts,
      field: createField(model.model, opts && opts.field)
    })
  }
}
