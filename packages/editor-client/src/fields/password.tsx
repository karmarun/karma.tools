import React from 'react'

import * as xpr from '@karma.run/sdk/expression'
import {DataContext as dat} from '@karma.run/sdk/expression'

import {
  Model,
  SortConfiguration,
  FilterConfiguration,
  TypedFieldOptions
} from '@karma.run/editor-common'
import {ErrorField} from './error'

import {
  EditComponentRenderProps,
  EditRenderProps,
  Field,
  ListRenderProps,
  SaveContext,
  FieldValue
} from '../api/field'

import {FieldComponent, FieldLabel} from '../ui/field'
import {TextInput} from '../ui/input'
import {CardSection} from '../ui/card'
import {FlexList} from '../ui'

export class PasswordFieldEditComponent extends React.PureComponent<
  EditComponentRenderProps<PasswordField, PasswordFieldValue>
> {
  private handlePasswordChange = (value: string) => {
    this.props.onValueChange(
      {
        value: {
          ...this.props.value.value,
          password: value
        },
        isValid: true,
        hasChanges: true
      },
      this.props.changeKey
    )
  }

  private handlePasswordConfirmChange = (value: string) => {
    this.props.onValueChange(
      {
        value: {
          ...this.props.value.value,
          passwordConfirm: value
        },
        isValid: true,
        hasChanges: true
      },
      this.props.changeKey
    )
  }

  public render() {
    return (
      <FieldComponent depth={this.props.depth} index={this.props.index}>
        {!this.props.isWrapped && (
          <FieldLabel
            label={this.props.label}
            description={this.props.description}
            depth={this.props.depth}
            index={this.props.index || 0}
          />
        )}
        <FlexList>
          <TextInput
            isPassword={true}
            placeholder="New Password (Leave empty for no change)"
            onChange={this.handlePasswordChange}
            value={this.props.value.value.password}
            disabled={this.props.disabled}
          />
          <TextInput
            isPassword={true}
            placeholder="Confirm"
            onChange={this.handlePasswordConfirmChange}
            value={this.props.value.value.passwordConfirm}
            disabled={this.props.disabled}
          />
        </FlexList>
      </FieldComponent>
    )
  }
}

export interface PasswordFieldOptions {
  readonly label?: string
  readonly description?: string
  readonly costFactor?: number
}

export type PasswordFieldValue = FieldValue<
  {
    hash?: string
    password: string
    passwordConfirm: string
  },
  string
>

export class PasswordField implements Field<PasswordFieldValue> {
  public readonly label?: string
  public readonly description?: string
  public readonly costFactor?: number

  public readonly defaultValue: PasswordFieldValue = {
    value: {
      password: '',
      passwordConfirm: ''
    },
    isValid: true,
    hasChanges: false
  }

  public readonly sortConfigurations: SortConfiguration[] = []
  public readonly filterConfigurations: FilterConfiguration[] = []

  public constructor(opts?: PasswordFieldOptions) {
    this.label = opts && opts.label
    this.description = opts && opts.description
    this.costFactor = opts && opts.costFactor
  }

  public initialize() {
    return this
  }

  public renderListComponent(props: ListRenderProps<PasswordFieldValue>) {
    return <CardSection>{props.value}</CardSection>
  }

  public renderEditComponent(props: EditRenderProps<PasswordFieldValue>) {
    return (
      <PasswordFieldEditComponent
        label={this.label}
        description={this.description}
        field={this}
        {...props}
      />
    )
  }

  public transformRawValue(value: unknown): PasswordFieldValue {
    if (typeof value !== 'string') throw new Error('Invalid value.')

    return {
      value: {
        hash: value,
        password: '',
        passwordConfirm: ''
      },
      isValid: true,
      hasChanges: true
    }
  }

  public transformValueToExpression(value: PasswordFieldValue): xpr.DataConstructor {
    if (value.value.hash == undefined) return dat.null()
    return dat.string(value.value.hash)
  }

  public async onSave(
    value: PasswordFieldValue,
    context: SaveContext
  ): Promise<PasswordFieldValue> {
    if (
      value.value.password &&
      value.value.passwordConfirm &&
      value.value.password === value.value.passwordConfirm
    ) {
      return {
        value: {
          hash: await context.workerContext.generateHash(value.value.password, this.costFactor),
          password: '',
          passwordConfirm: ''
        },
        isValid: true,
        hasChanges: true
      }
    }

    return value
  }

  public fieldOptions(): PasswordFieldOptions & TypedFieldOptions {
    return {
      type: PasswordField.type,
      label: this.label,
      description: this.description,
      costFactor: this.costFactor
    }
  }

  public traverse() {
    return this
  }

  public valuePathForKeyPath() {
    return []
  }

  public valuesForKeyPath(value: PasswordFieldValue) {
    return [value]
  }

  public static type = 'password'

  static create(model: Model, opts?: PasswordFieldOptions) {
    if (model.type !== 'string') {
      return new ErrorField({
        label: opts && opts.label,
        description: opts && opts.description,
        message: `Expected model type "string" received: "${model.type}"`
      })
    }

    return new this(opts)
  }
}
