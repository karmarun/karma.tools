import {
  Model,
  KeyPath,
  SortConfiguration,
  FilterConfiguration,
  reduceToMap,
  ObjectMap,
  FieldOptions,
  TypedFieldOptions
} from '@karma.run/editor-common'

import {ErrorField} from './error'

import {
  EditRenderProps,
  Field,
  CreateFieldFunction,
  ListRenderProps,
  SaveContext,
  DeleteContext,
  AnyField,
  AnyFieldValue
} from '../api/field'

export interface RecursionContext {
  readonly recursions?: {[key: string]: AnyField}
}

export interface RecursiveFieldOptions extends FieldOptions {
  readonly fields: ObjectMap<FieldOptions>
}

export interface RecursiveFieldConstructorOptions {
  readonly topRecursionLabel: string
  readonly fields: ReadonlyMap<string, AnyField>
}

export class RecursiveField implements Field<any> {
  public readonly topField: AnyField
  public readonly topRecursionLabel: string
  public readonly fields: ReadonlyMap<string, AnyField>

  public defaultValue: any
  public readonly sortConfigurations: SortConfiguration[] = []
  public readonly filterConfigurations: FilterConfiguration[] = []

  public constructor(options: RecursiveFieldConstructorOptions) {
    const topField = options.fields.get(options.topRecursionLabel)
    if (!topField) throw new Error("Top label doesn't exist in fields.")

    this.topRecursionLabel = options.topRecursionLabel
    this.topField = topField
    this.fields = options.fields
  }

  public initialize(recursions: ReadonlyMap<string, AnyField>) {
    this.fields.forEach(field => field.initialize(new Map([...recursions, ...this.fields])))
    this.defaultValue = this.topField.defaultValue

    return this
  }

  public renderListComponent(props: ListRenderProps<any>) {
    return this.topField.renderListComponent(props)
  }

  public renderEditComponent(props: EditRenderProps<any>) {
    return this.topField.renderEditComponent(props)
  }

  public transformRawValue(value: any) {
    return this.topField.transformRawValue(value)
  }

  public transformValueToExpression(value: any) {
    return this.topField.transformValueToExpression(value)
  }

  public fieldOptions(): RecursiveFieldOptions & TypedFieldOptions {
    return {
      type: RecursiveField.type,
      topRecursionLabel: this.topRecursionLabel,
      fields: reduceToMap(Array.from(this.fields.entries()), ([key, field]) => [
        key,
        field.fieldOptions()
      ])
    }
  }

  public traverse(keyPath: KeyPath) {
    return this.topField.traverse(keyPath)
  }

  public valuePathForKeyPath(keyPath: KeyPath) {
    return this.topField.valuePathForKeyPath(keyPath)
  }

  public valuesForKeyPath(value: AnyFieldValue, keyPath: KeyPath) {
    return this.topField.valuesForKeyPath(value, keyPath)
  }

  public async onSave(value: any, context: SaveContext) {
    if (this.topField.onSave) {
      return this.topField.onSave(value, context)
    }

    return value
  }

  public async onDelete(value: any, context: DeleteContext) {
    if (this.topField.onDelete) {
      return this.topField.onDelete(value, context)
    }

    return value
  }

  public static type = 'recursive'

  static canInferFromModel(model: Model) {
    return model.type === 'recursive'
  }

  static create(
    model: Model,
    opts: RecursiveFieldOptions | undefined,
    createField: CreateFieldFunction
  ) {
    if (model.type !== 'recursive') {
      return new ErrorField({
        label: opts && opts.label,
        message: `Expected model type "recursive" received: "${model.type}"`
      })
    }

    return new this({
      topRecursionLabel: model.top,
      fields: new Map(
        Object.entries(model.models).map(
          ([recursionKey, model]) =>
            [recursionKey, createField(model, opts && opts.fields[recursionKey])] as [
              string,
              AnyField
            ]
        )
      )
    })
  }
}

export interface RecursionFieldOptions extends FieldOptions {
  readonly field: FieldOptions
}

export interface RecursionFieldConstructorOptions {
  readonly recursionLabel: string
  readonly field: AnyField
}

export class RecursionField implements Field<AnyFieldValue> {
  public readonly recursionLabel: string
  public readonly field: AnyField

  public defaultValue: any
  public readonly sortConfigurations: SortConfiguration[] = []
  public readonly filterConfigurations: FilterConfiguration[] = []

  public constructor(options: RecursionFieldConstructorOptions) {
    this.recursionLabel = options.recursionLabel
    this.field = options.field
  }

  public initialize(recursions: ReadonlyMap<string, AnyField>) {
    this.field.initialize(new Map([...recursions, [this.recursionLabel, this.field]]))
    this.defaultValue = this.field.defaultValue

    return this
  }

  public renderListComponent(props: ListRenderProps<AnyFieldValue>) {
    return this.field.renderListComponent(props)
  }

  public renderEditComponent(props: EditRenderProps<AnyFieldValue>) {
    return this.field.renderEditComponent(props)
  }

  public transformRawValue(value: any) {
    return this.field.transformRawValue(value)
  }

  public transformValueToExpression(value: AnyFieldValue) {
    return this.field.transformValueToExpression(value)
  }

  public fieldOptions(): RecursionFieldOptions & TypedFieldOptions {
    return {
      type: RecursionField.type,
      recursionLabel: this.recursionLabel,
      field: this.field.fieldOptions()
    }
  }

  public traverse(keyPath: KeyPath) {
    return this.field.traverse(keyPath)
  }

  public valuePathForKeyPath(keyPath: KeyPath) {
    return this.field.valuePathForKeyPath(keyPath)
  }

  public valuesForKeyPath(value: AnyFieldValue, keyPath: KeyPath) {
    return this.field.valuesForKeyPath(value, keyPath)
  }

  public async onSave(value: any, context: SaveContext) {
    if (this.field.onSave) {
      return this.field.onSave(value, context)
    }

    return value
  }

  public async onDelete(value: any, context: DeleteContext) {
    if (this.field.onDelete) {
      return this.field.onDelete(value, context)
    }

    return value
  }

  public static type = 'recursion'

  static canInferFromModel(model: Model) {
    return model.type === 'recursion'
  }

  static create(
    model: Model,
    opts: RecursionFieldOptions | undefined,
    createField: CreateFieldFunction
  ) {
    if (model.type !== 'recursion') {
      return new ErrorField({
        label: opts && opts.label,
        message: `Expected model type "recursion" received: "${model.type}"`
      })
    }

    return new this({
      recursionLabel: model.label,
      field: createField(model.model, opts && opts.field)
    })
  }
}

export interface RecurseFieldOptions extends FieldOptions {
  readonly description?: string
}

export interface RecurseFieldConstructorOptions {
  readonly label?: string
  readonly description?: string
  readonly recursionLabel: string
}

export class RecurseField implements Field<any> {
  public readonly recursionLabel: string

  public readonly label?: string
  public readonly description?: string

  public defaultValue!: AnyFieldValue
  public readonly sortConfigurations: SortConfiguration[] = []
  public readonly filterConfigurations: FilterConfiguration[] = []

  public constructor(opts: RecurseFieldConstructorOptions) {
    this.label = opts.label
    this.description = opts.description
    this.recursionLabel = opts.recursionLabel
  }

  private field?: AnyField

  public initialize(recursions: ReadonlyMap<string, AnyField>) {
    const field = recursions.get(this.recursionLabel)!

    if (!field) {
      return new ErrorField({
        label: this.label,
        description: this.description,
        message: `Couldn't find recursion for label: ${this.recursionLabel}`
      })
    }

    this.field = field
    this.defaultValue = field.defaultValue

    return this
  }

  public renderListComponent(props: ListRenderProps<any>) {
    if (!this.field) return null
    return this.field.renderListComponent(props)
  }

  public renderEditComponent(props: EditRenderProps<any>) {
    if (!this.field) return null

    return this.field.renderEditComponent({
      ...props,
      label: this.label,
      description: this.description
    })
  }

  public transformRawValue(value: any) {
    if (!this.field) throw new Error(`Couldn't find recursion for label: ${this.recursionLabel}`)
    return this.field.transformRawValue(value)
  }

  public transformValueToExpression(value: AnyFieldValue) {
    if (!this.field) throw new Error(`Couldn't find recursion for label: ${this.recursionLabel}`)
    return this.field.transformValueToExpression(value)
  }

  public fieldOptions(): RecurseFieldOptions & TypedFieldOptions {
    return {
      type: RecurseField.type,
      recursionLabel: this.recursionLabel,
      label: this.label,
      description: this.description
    }
  }

  public traverse(keyPath: KeyPath) {
    if (!this.field) return undefined
    return this.field.traverse(keyPath)
  }

  public valuePathForKeyPath(keyPath: KeyPath) {
    if (!this.field) return []
    return this.field.valuePathForKeyPath(keyPath)
  }

  public valuesForKeyPath(value: AnyFieldValue, keyPath: KeyPath) {
    if (!this.field) throw new Error(`Couldn't find recursion for label: ${this.recursionLabel}`)
    return this.field.valuesForKeyPath(value, keyPath)
  }

  public async onSave(value: any, context: SaveContext) {
    if (this.field && this.field.onSave) {
      return this.field.onSave(value, context)
    }

    return value
  }

  public async onDelete(value: any, context: DeleteContext) {
    if (this.field && this.field.onDelete) {
      return this.field.onDelete(value, context)
    }

    return value
  }

  public static type = 'recurse'

  static canInferFromModel(model: Model) {
    return model.type === 'recurse'
  }

  static create(model: Model, opts?: RecurseFieldOptions) {
    if (model.type !== 'recurse') {
      return new ErrorField({
        ...opts,
        message: `Expected model type "recurse" received: "${model.type}"`
      })
    }

    return new this({...opts, recursionLabel: model.label})
  }
}
