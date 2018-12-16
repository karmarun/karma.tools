import {RefValue as ModelRef} from '../util/ref'
import {firstKey, mapObject, ObjectMap} from '../util/object'

export interface MetarializedRecord<T = any> {
  id: ModelRef
  model: ModelRef
  value: T
  created: string
  updated: string
}

export interface TagRecord {
  model: ModelRef
  tag: string
}

// Helpers
export type ModelMap = ObjectMap<Model>

export interface BaseModel<T extends string> {
  type: T
}
export interface RefModel<T extends string> extends BaseModel<T> {
  model: ModelRef
}
export interface ContainerModel<T extends string> extends BaseModel<T> {
  model: Model
}
export interface ArrayModel<T extends string> extends BaseModel<T> {
  fields: Model[]
}
export interface FieldModel<T extends string> extends BaseModel<T> {
  fields: ModelMap
}
export interface EnumModel<T extends string> extends BaseModel<T> {
  values: string[]
}
export interface AnnotationModel<T extends string> extends BaseModel<T> {
  value: string
  model: Model
}

export interface RecurseModel<T extends string> extends BaseModel<T> {
  label: string
}
export interface RecursionModel<T extends string> extends BaseModel<T> {
  label: string
  model: Model
}
export interface RecursiveModel<T extends string> extends BaseModel<T> {
  top: string
  models: ModelMap
}

export interface UnknownModel<T extends string> extends BaseModel<T> {
  originalType: string
  value: any
}

function BaseModelConstructor<T extends ModelType>(type: T) {
  return (): BaseModel<T> => ({type})
}

function RefModelConstructor<T extends ModelType>(type: T) {
  return (model: ModelRef): RefModel<T> => ({type, model})
}

function ContainerModelConstructor<T extends ModelType>(type: T) {
  return (model: Model): ContainerModel<T> => ({type, model})
}

function ArrayModelConstructor<T extends ModelType>(type: T) {
  return (fields: Model[]): ArrayModel<T> => ({type, fields})
}

function EnumModelConstructor<T extends ModelType>(type: T) {
  return (values: string[]): EnumModel<T> => ({type, values})
}

function AnnotationModelConstructor<T extends ModelType>(type: T) {
  return (value: string, model: Model): AnnotationModel<T> => ({type, value, model})
}

function FieldModelConstructor<T extends ModelType>(type: T) {
  return (fields: ModelMap = {}): FieldModel<T> => ({type, fields})
}

function RecurseModelConstructor<T extends ModelType>(type: T) {
  return (label: string): RecurseModel<T> => ({type, label})
}

function RecursionModelConstructor<T extends ModelType>(type: T) {
  return (label: string, model: Model): RecursionModel<T> => ({type, label, model})
}

function RecursiveModelConstructor<T extends ModelType>(type: T) {
  return (top: string, models: ModelMap): RecursiveModel<T> => ({type, top, models})
}

function UnknownModelConstructor<T extends ModelType>(type: T) {
  return (originalType: string, value: any): UnknownModel<T> => ({type, originalType, value})
}

// Primitive
export interface Int8 extends BaseModel<'int8'> {}
export const Int8 = BaseModelConstructor('int8')

export interface Int16 extends BaseModel<'int16'> {}
export const Int16 = BaseModelConstructor('int16')

export interface Int32 extends BaseModel<'int32'> {}
export const Int32 = BaseModelConstructor('int32')

export interface Int64 extends BaseModel<'int64'> {}
export const Int64 = BaseModelConstructor('int64')

export interface Uint8 extends BaseModel<'uint8'> {}
export const UInt8 = BaseModelConstructor('uint8')

export interface Uint16 extends BaseModel<'uint16'> {}
export const UInt16 = BaseModelConstructor('uint16')

export interface Uint32 extends BaseModel<'uint32'> {}
export const UInt32 = BaseModelConstructor('uint32')

export interface UInt64 extends BaseModel<'uint64'> {}
export const UInt64 = BaseModelConstructor('uint64')

export interface Float extends BaseModel<'float'> {}
export const Float = BaseModelConstructor('float')

export interface String extends BaseModel<'string'> {}
export const String = BaseModelConstructor('string')

export interface DateTime extends BaseModel<'dateTime'> {}
export const DateTime = BaseModelConstructor('dateTime')

export interface Bool extends BaseModel<'bool'> {}
export const Bool = BaseModelConstructor('bool')

export interface Ref extends RefModel<'ref'> {}
export const Ref = RefModelConstructor('ref')

export interface Enum extends EnumModel<'enum'> {}
export const Enum = EnumModelConstructor('enum')

// Algebraic
export interface List extends ContainerModel<'list'> {}
export const List = ContainerModelConstructor('list')

export interface Map extends ContainerModel<'map'> {}
export const Map = ContainerModelConstructor('map')

export interface Set extends ContainerModel<'set'> {}
export const Set = ContainerModelConstructor('set')

export interface Struct extends FieldModel<'struct'> {}
export const Struct = FieldModelConstructor('struct')

export interface Union extends FieldModel<'union'> {}
export const Union = FieldModelConstructor('union')

export interface Tuple extends ArrayModel<'tuple'> {}
export const Tuple = ArrayModelConstructor('tuple')

// Semantic
export interface Optional extends ContainerModel<'optional'> {}
export const Optional = ContainerModelConstructor('optional')

export interface Unique extends ContainerModel<'unique'> {}
export const Unique = ContainerModelConstructor('unique')

export interface Annotation extends AnnotationModel<'annotation'> {}
export const Annotation = AnnotationModelConstructor('annotation')

export interface Null extends BaseModel<'null'> {}
export const Null = BaseModelConstructor('null')

// Recursive
export interface Recurse extends RecurseModel<'recurse'> {}
export const Recurse = RecurseModelConstructor('recurse')

export interface Recursion extends RecursionModel<'recursion'> {}
export const Recursion = RecursionModelConstructor('recursion')

export interface Recursive extends RecursiveModel<'recursive'> {}
export const Recursive = RecursiveModelConstructor('recursive')

// Other
export interface Unknown extends UnknownModel<'unknown'> {}
export const Unknown = UnknownModelConstructor('unknown')

export type Model =
  // Primitive
  | Int8
  | Int16
  | Int32
  | Int64
  | Uint8
  | Uint16
  | Uint32
  | UInt64
  | Float
  | String
  | DateTime
  | Bool
  | Ref
  | Enum

  // Algebraic
  | List
  | Map
  | Set
  | Struct
  | Union
  | Tuple

  // Semantic
  | Optional
  | Unique
  | Annotation
  | Null

  // Recursive
  | Recurse
  | Recursion
  | Recursive

  // Other
  | Unknown

export type ModelType = Model['type']

export function unserializeModel(rawModel: any): Model {
  if (typeof rawModel !== 'object') {
    throw new Error(`Expected object, got ${typeof rawModel}.`)
  }

  const type = firstKey(rawModel) as ModelType
  const value = rawModel[type]

  switch (type) {
    // BaseModel=
    case 'int8':
    case 'int16':
    case 'int32':
    case 'int64':
    case 'uint8':
    case 'uint16':
    case 'uint32':
    case 'uint64':
    case 'float':
    case 'string':
    case 'dateTime':
    case 'bool':
    case 'null': {
      return BaseModelConstructor(type)() as Model
    }

    // RefModel
    case 'ref': {
      if (!Array.isArray(value) || value.length < 2) {
        throw new Error(`Expected array, got ${typeof value}.`)
      }

      return RefModelConstructor(type)(value as ModelRef)
    }

    // EnumModel
    case 'enum': {
      if (!Array.isArray(value)) {
        throw new Error(`Expected array, got ${typeof value}.`)
      }

      if (value.some(value => typeof value !== 'string')) {
        throw new Error(`Expected array of strings.`)
      }

      return EnumModelConstructor(type)(value)
    }

    // AnnotationModel
    case 'annotation': {
      if (typeof value !== 'object') {
        throw new Error(`Expected object, got ${typeof value}.`)
      }

      if (typeof value.value !== 'string') {
        throw new Error(`Expected string, got ${typeof value.value}.`)
      }

      return AnnotationModelConstructor(type)(value.value, unserializeModel(value.model))
    }

    // ContainerModel
    case 'list':
    case 'map':
    case 'set':
    case 'optional':
    case 'unique': {
      if (typeof value !== 'object') {
        throw new Error(`Expected object, got ${typeof value}.`)
      }

      return ContainerModelConstructor(type)(unserializeModel(value)) as Model
    }

    // ArrayModel
    case 'tuple': {
      if (!Array.isArray(value)) {
        throw new Error(`Expected array, got ${typeof value}.`)
      }

      return ArrayModelConstructor(type)(value.map(model => unserializeModel(model))) as Model
    }

    // FieldModel
    case 'struct':
    case 'union': {
      if (typeof value !== 'object') {
        throw new Error(`Expected object, got ${typeof value}.`)
      }

      return FieldModelConstructor(type)(
        mapObject(value, model => unserializeModel(model))
      ) as Model
    }

    // RecurseModel
    case 'recurse': {
      if (typeof value !== 'string') {
        throw new Error(`Expected string, got ${typeof value}.`)
      }

      return RecurseModelConstructor(type)(value)
    }

    // RecursionModel
    case 'recursion': {
      if (typeof value !== 'object') {
        throw new Error(`Expected object, got ${typeof value}.`)
      }

      if (typeof value.label !== 'string') {
        throw new Error(`Expected string, got ${typeof value}.`)
      }

      return RecursionModelConstructor(type)(value.label, unserializeModel(value.model)) as Model
    }

    // RecursiveModel
    case 'recursive': {
      if (typeof value !== 'object') {
        throw new Error(`Expected object, got ${typeof value}.`)
      }

      if (typeof value.top !== 'string') {
        throw new Error(`Expected string, got ${typeof value}.`)
      }

      if (typeof value.models !== 'object') {
        throw new Error(`Expected object, got ${typeof value}.`)
      }

      return RecursiveModelConstructor(type)(
        value.top,
        mapObject(value.models, model => unserializeModel(model))
      ) as Model
    }

    default: {
      return Unknown(type, rawModel[type])
    }
  }
}

export function serializeModel(model: Model): any {
  let value: any

  switch (model.type) {
    // BaseModel
    case 'int8':
    case 'int16':
    case 'int32':
    case 'int64':
    case 'uint8':
    case 'uint16':
    case 'uint32':
    case 'uint64':
    case 'float':
    case 'string':
    case 'dateTime':
    case 'bool':
    case 'null':
      value = {}
      break

    // RefModel
    case 'ref':
      value = model.model
      break

    // EnumModel
    case 'enum':
      value = model.values
      break

    // ContainerModel
    case 'list':
    case 'map':
    case 'set':
    case 'optional':
    case 'unique':
    case 'annotation':
      value = serializeModel(model.model)
      break

    // ArrayModel
    case 'tuple':
      value = model.fields.map(field => serializeModel(field))
      break

    // FieldModel
    case 'struct':
    case 'union':
      value = mapObject(model.fields, field => serializeModel(field))
      break

    // RecurseModel
    case 'recurse':
      value = model.label
      break

    // RecursionModel
    case 'recursion':
      value = {label: model.label, model: serializeModel(model.model)}
      break

    // RecursiveModel
    case 'recursive': {
      value = {
        top: model.top,
        models: mapObject(model.models, model => serializeModel(model))
      }
      break
    }

    case 'unknown':
      return {[model.originalType]: model.value}
  }

  return {[model.type]: value}
}
