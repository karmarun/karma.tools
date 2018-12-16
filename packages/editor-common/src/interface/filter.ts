import {RefValue} from '../util/ref'
import {StorageType} from '../api/field'

export enum ConditionType {
  // List
  ListLengthEqual = 'listLengthEqual',
  ListLengthMin = 'listLengthMin',
  ListLengthMax = 'listLengthMax',

  // Map
  MapHasKey = 'mapHasKey',

  // Boolean
  BoolEqual = 'boolEqual',

  // Optional
  OptionalIsPresent = 'optionalIsPresent',

  // Union
  UnionCaseEqual = 'unionCaseEqual',

  // Enum
  EnumEqual = 'enumEqual',

  // String
  StringEqual = 'stringEqual',
  StringStartsWith = 'stringStartsWith',
  StringEndsWith = 'stringEndsWith',
  StringIncludes = 'stringIncludes',
  StringRegExp = 'stringRegExp',

  // Number
  NumberEqual = 'numberEqual',
  NumberMin = 'numberMin',
  NumberMax = 'numberMax',

  // Date
  DateEqual = 'dateEqual',
  DateMin = 'dateMin',
  DateMax = 'dateMax',

  // Ref
  RefEqual = 'refEqual',

  // Other
  ExtractedStringIncludes = 'extractedStringIncludes',
  Or = 'or',
  And = 'and'
}

export enum ValuePathSegmentType {
  List = 'list',
  Map = 'map',
  Optional = 'optional',
  Struct = 'struct',
  Union = 'union',
  Tuple = 'tuple'
}

export interface ListPathSegment {
  type: ValuePathSegmentType.List
}
export function ListPathSegment(): ListPathSegment {
  return {type: ValuePathSegmentType.List}
}

export interface MapPathSegment {
  type: ValuePathSegmentType.Map
}
export function MapPathSegment(): MapPathSegment {
  return {type: ValuePathSegmentType.Map}
}

export interface StructPathSegment {
  type: ValuePathSegmentType.Struct
  key: string
}
export function StructPathSegment(key: string): StructPathSegment {
  return {type: ValuePathSegmentType.Struct, key}
}

export interface TuplePathSegment {
  type: ValuePathSegmentType.Tuple
  index: number
}

export function TuplePathSegment(index: number): TuplePathSegment {
  return {type: ValuePathSegmentType.Tuple, index}
}

export interface UnionPathSegment {
  type: ValuePathSegmentType.Union
  key: string
}
export function UnionPathSegment(key: string): UnionPathSegment {
  return {type: ValuePathSegmentType.Union, key}
}

export interface OptionalPathSegment {
  type: ValuePathSegmentType.Optional
}
export function OptionalPathSegment(): OptionalPathSegment {
  return {type: ValuePathSegmentType.Optional}
}

export type ValuePathSegment =
  | ListPathSegment
  | MapPathSegment
  | StructPathSegment
  | UnionPathSegment
  | TuplePathSegment
  | OptionalPathSegment

export type ValuePath = ValuePathSegment[]

export interface BaseCondition {
  type: ConditionType
  path: ValuePathSegment[]
}

export interface StringCondition extends BaseCondition {
  type:
    | ConditionType.StringEqual
    | ConditionType.StringStartsWith
    | ConditionType.StringEndsWith
    | ConditionType.StringIncludes
    | ConditionType.StringRegExp
    | ConditionType.ExtractedStringIncludes
  value: string
}

export interface OptionalStringCondition extends BaseCondition {
  type: ConditionType.UnionCaseEqual | ConditionType.EnumEqual
  value: string | undefined
}

export interface NumberCondition extends BaseCondition {
  type:
    | ConditionType.ListLengthEqual
    | ConditionType.ListLengthMin
    | ConditionType.ListLengthMax
    | ConditionType.NumberEqual
    | ConditionType.NumberMin
    | ConditionType.NumberMax
  storageType: StorageType
  value: number
}

export interface RefStringCondition extends BaseCondition {
  type: ConditionType.RefEqual
  value: RefValue
}

export interface BooleanCondition extends BaseCondition {
  type: ConditionType.OptionalIsPresent | ConditionType.BoolEqual
  value: boolean
}

export interface DateCondition extends BaseCondition {
  type: ConditionType.DateEqual | ConditionType.DateMin | ConditionType.DateMax
  value: Date | string
}

export interface CompositeCondition extends BaseCondition {
  type: ConditionType.Or | ConditionType.And
  value: Condition[]
}

export type Condition =
  | StringCondition
  | DateCondition
  | NumberCondition
  | OptionalStringCondition
  | BooleanCondition
  | RefStringCondition
  | CompositeCondition

export enum SortType {
  Date = 'date',
  String = 'string'
}

export interface Sort {
  path: ValuePath
  type: SortType
  descending: boolean
}

export interface Option {
  key: string
  label: string
}

export interface BaseConditionConfiguration {
  type: ConditionType
  path: ValuePath
}

export interface SimpleConditionConfiguration extends BaseConditionConfiguration {
  type:
    | ConditionType.StringEqual
    | ConditionType.StringStartsWith
    | ConditionType.StringEndsWith
    | ConditionType.StringIncludes
    | ConditionType.StringRegExp
    | ConditionType.ListLengthEqual
    | ConditionType.ListLengthMin
    | ConditionType.ListLengthMax
    | ConditionType.DateEqual
    | ConditionType.DateMin
    | ConditionType.DateMax
    | ConditionType.OptionalIsPresent
    | ConditionType.BoolEqual
    | ConditionType.ExtractedStringIncludes
}

export function SimpleConditionConfiguration(
  type: SimpleConditionConfiguration['type'],
  path: ValuePath = []
): SimpleConditionConfiguration {
  return {type, path}
}

export interface NumberConditionConfiguration extends BaseConditionConfiguration {
  type: ConditionType.NumberEqual | ConditionType.NumberMin | ConditionType.NumberMax
  storageType: StorageType
}

export function NumberConditionConfiguration(
  type: NumberConditionConfiguration['type'],
  storageType: StorageType,
  path: ValuePath = []
): NumberConditionConfiguration {
  return {type, storageType, path}
}

export interface RefConditionConfiguration extends BaseConditionConfiguration {
  type: ConditionType.RefEqual
  model: RefValue
}

export function RefConditionConfiguration(
  type: RefConditionConfiguration['type'],
  model: RefValue,
  path: ValuePath = []
): RefConditionConfiguration {
  return {type, model, path}
}

export interface OptionsConditionConfiguration extends BaseConditionConfiguration {
  type: ConditionType.EnumEqual | ConditionType.UnionCaseEqual
  options: Option[]
}

export function OptionsConditionConfiguration(
  type: OptionsConditionConfiguration['type'],
  options: Option[],
  path: ValuePath = []
): OptionsConditionConfiguration {
  return {type, options, path}
}

export type ConditionConfiguration =
  | SimpleConditionConfiguration
  | NumberConditionConfiguration
  | RefConditionConfiguration
  | OptionsConditionConfiguration

export function conditionConfigurationPrependPath(
  conditionConfig: ConditionConfiguration,
  path: ValuePath
): ConditionConfiguration {
  return {
    ...conditionConfig,
    path: [...path, ...conditionConfig.path]
  }
}

export interface FilterConfiguration {
  id: string
  type: string
  label: string
  depth: number
  conditions: ConditionConfiguration[]
}

export function FilterConfiguration(
  id: string,
  type: string,
  label?: string,
  conditions: ConditionConfiguration[] = [],
  depth: number = 0
) {
  return {id, type, label: label || 'Unlabeled', conditions, depth}
}

export function filterConfigurationPrependPath(
  filterConfiguration: FilterConfiguration,
  id: string,
  path: ValuePath
) {
  return {
    ...filterConfiguration,
    id: `${id}.${filterConfiguration.id}`,
    depth: filterConfiguration.depth + 1,
    conditions: filterConfiguration.conditions.map(conditionConfig =>
      conditionConfigurationPrependPath(conditionConfig, path)
    )
  }
}

export interface SortConfiguration {
  key: string
  path: ValuePath
  type: SortType
  label: string
}

export function labelForCondition(condition: ConditionType): string {
  switch (condition) {
    case ConditionType.RefEqual:
    case ConditionType.StringEqual:
    case ConditionType.DateEqual:
    case ConditionType.ListLengthEqual:
    case ConditionType.EnumEqual:
    case ConditionType.NumberEqual:
    case ConditionType.UnionCaseEqual:
    case ConditionType.BoolEqual:
      return 'Equal'

    case ConditionType.StringStartsWith:
      return 'Starts with'

    case ConditionType.StringEndsWith:
      return 'Ends with'

    case ConditionType.StringIncludes:
      return 'Includes'

    case ConditionType.StringRegExp:
      return 'Matches RegExp'

    case ConditionType.DateMin:
    case ConditionType.NumberMin:
    case ConditionType.ListLengthMin:
      return 'Min'

    case ConditionType.DateMax:
    case ConditionType.NumberMax:
    case ConditionType.ListLengthMax:
      return 'Max'

    case ConditionType.OptionalIsPresent:
      return 'Present'
  }

  return condition
}

export function defaultValueForConditionConfiguration(
  condition: ConditionConfiguration,
  oldValue: any
): any {
  switch (condition.type) {
    case ConditionType.EnumEqual:
    case ConditionType.UnionCaseEqual:
      return undefined

    case ConditionType.StringEqual:
    case ConditionType.StringStartsWith:
    case ConditionType.StringEndsWith:
    case ConditionType.StringIncludes:
    case ConditionType.StringRegExp:
      return typeof oldValue === 'string' ? oldValue : ''

    case ConditionType.DateMin:
    case ConditionType.DateMax:
    case ConditionType.DateEqual:
      return typeof oldValue === 'string' || oldValue instanceof Date ? oldValue : ''

    case ConditionType.NumberMax:
    case ConditionType.NumberMin:
    case ConditionType.NumberEqual:
    case ConditionType.ListLengthMin:
    case ConditionType.ListLengthMax:
    case ConditionType.ListLengthEqual:
      return typeof oldValue === 'number' ? oldValue : 0

    case ConditionType.BoolEqual:
    case ConditionType.OptionalIsPresent:
      return typeof oldValue === 'boolean' ? oldValue : false

    case ConditionType.RefEqual:
      return undefined
  }

  return undefined
}
