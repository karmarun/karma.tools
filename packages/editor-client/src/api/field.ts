import * as xpr from '@karma.run/sdk/expression'

import {
  RefValue,
  Model,
  TypedFieldOptions,
  KeyPath,
  ValuePath,
  FieldOptions,
  SortConfiguration,
  FilterConfiguration
} from '@karma.run/editor-common'

import {SessionContext, ModelRecord} from '../context/session'
import {WorkerContext} from '../context/worker'
import {Config} from '../context/config'

export interface SaveContext {
  readonly model: RefValue
  readonly id: RefValue | undefined
  readonly config: Config
  readonly workerContext: WorkerContext
  readonly sessionContext: SessionContext
}

export interface DeleteContext {
  readonly model: RefValue
  readonly id: RefValue | undefined
  readonly config: Config
  readonly workerContext: WorkerContext
  readonly sessionContext: SessionContext
}

export type CreateFieldFunction = (model: Model, fieldOptions?: TypedFieldOptions) => AnyField

export interface ListRenderProps<V extends AnyFieldValue> {
  readonly value: V
}

export interface EditRenderProps<V extends AnyFieldValue> {
  readonly label?: string
  readonly description?: string

  readonly disabled: boolean
  readonly isWrapped: boolean
  readonly depth: number
  readonly index: number
  readonly value: V
  readonly changeKey?: any

  onValueChange(value: V, key: any): void
  onEditRecord(model: RefValue, id?: RefValue): Promise<ModelRecord | undefined>
  onSelectRecord(model: RefValue): Promise<ModelRecord | undefined>
  onEditField(field: AnyField, value?: AnyFieldValue): Promise<AnyFieldValue | undefined>
}

export interface ListComponentRenderProps<F extends AnyField, V extends AnyFieldValue>
  extends ListRenderProps<V> {
  readonly field: F
}

export interface EditComponentRenderProps<F extends AnyField, V extends AnyFieldValue>
  extends EditRenderProps<V> {
  readonly field: F
}

export interface FieldValue<V, E> {
  readonly value: V
  readonly error?: E
  readonly isValid: boolean
  readonly hasChanges: boolean
}

export type AnyFieldValue = FieldValue<any, any>
export type AnyField = Field<AnyFieldValue>

export interface Field<V extends AnyFieldValue> {
  readonly label?: string
  readonly description?: string

  readonly defaultValue: V

  readonly sortConfigurations: SortConfiguration[]
  readonly filterConfigurations: FilterConfiguration[]

  initialize(recursions: ReadonlyMap<string, AnyField>): AnyField
  fieldOptions(): TypedFieldOptions

  renderListComponent(props: ListRenderProps<V>): React.ReactNode
  renderEditComponent(props: EditRenderProps<V>): React.ReactNode

  transformRawValue(value: unknown): V
  transformValueToExpression(value: V): xpr.DataConstructor

  traverse(keyPath: KeyPath): AnyField | undefined
  valuePathForKeyPath(keyPath: KeyPath): ValuePath
  valuesForKeyPath(value: V, keyPath: KeyPath): AnyFieldValue[]

  onSave?(value: V, context: SaveContext): Promise<V>
  onDelete?(value: V, context: DeleteContext): Promise<V>
}

export interface FieldConstructor<V extends AnyFieldValue, O extends FieldOptions> {
  readonly type: string

  canInferFromModel?(model: Model): boolean
  create(model: Model, options: O | undefined, createField: CreateFieldFunction): Readonly<Field<V>>
}

export type AnyFieldConstructor = FieldConstructor<AnyFieldValue, FieldOptions>
export type FieldRegistry = ReadonlyMap<string, AnyFieldConstructor>

export function createFieldRegistry(...fieldClasses: AnyFieldConstructor[]): FieldRegistry {
  return new Map(fieldClasses.map(field => [field.type, field] as [string, AnyFieldConstructor]))
}

export function mergeFieldRegistries(...registries: FieldRegistry[]): FieldRegistry {
  const values = registries.reduce(
    (acc, registry) => {
      return acc.concat(Array.from(registry.values()))
    },
    [] as AnyFieldConstructor[]
  )

  return createFieldRegistry(...values)
}
