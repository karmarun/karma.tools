import {ObjectMap} from './util'

// Return Types
// ============

export type Ref = [string, string]

export interface Tag {
  tag: string
  model: Ref
}

// Expression Scope
// ================

// Numeric
// -------

export interface AddFloatFn {
  addFloat: [Expression, Expression]
}

export interface AddInt8Fn {
  addInt8: [Expression, Expression]
}

export interface AddInt16Fn {
  addInt16: [Expression, Expression]
}

export interface AddInt32Fn {
  addInt32: [Expression, Expression]
}

export interface AddInt64Fn {
  addInt64: [Expression, Expression]
}

export interface AddUInt8Fn {
  addUint8: [Expression, Expression]
}

export interface AddUInt16Fn {
  addUint16: [Expression, Expression]
}

export interface AddUInt32Fn {
  addUint32: [Expression, Expression]
}

export interface AddUInt64Fn {
  addUint64: [Expression, Expression]
}

export interface SubFloatFn {
  subFloat: [Expression, Expression]
}

export interface SubInt8Fn {
  subInt8: [Expression, Expression]
}

export interface SubInt16Fn {
  subInt16: [Expression, Expression]
}

export interface SubInt32Fn {
  subInt32: [Expression, Expression]
}

export interface SubInt64Fn {
  subInt64: [Expression, Expression]
}

export interface SubUInt8Fn {
  subUint8: [Expression, Expression]
}

export interface SubUInt16Fn {
  subUint16: [Expression, Expression]
}

export interface SubUInt32Fn {
  subUint32: [Expression, Expression]
}

export interface SubUInt64Fn {
  subUint64: [Expression, Expression]
}

export interface DivFloatFn {
  divFloat: [Expression, Expression]
}
export interface DivInt8Fn {
  divInt8: [Expression, Expression]
}

export interface DivInt16Fn {
  divInt16: [Expression, Expression]
}

export interface DivInt32Fn {
  divInt32: [Expression, Expression]
}

export interface DivInt64Fn {
  divInt64: [Expression, Expression]
}

export interface DivUInt8Fn {
  divUint8: [Expression, Expression]
}

export interface DivUInt16Fn {
  divUint16: [Expression, Expression]
}

export interface DivUInt32Fn {
  divUint32: [Expression, Expression]
}

export interface DivUInt64Fn {
  divUint64: [Expression, Expression]
}

export interface MulFloatFn {
  mulFloat: [Expression, Expression]
}

export interface MulInt8Fn {
  mulInt8: [Expression, Expression]
}

export interface MulInt16Fn {
  mulInt16: [Expression, Expression]
}

export interface MulInt32Fn {
  mulInt32: [Expression, Expression]
}

export interface MulInt64Fn {
  mulInt64: [Expression, Expression]
}

export interface MulUInt8Fn {
  mulUint8: [Expression, Expression]
}

export interface MulUInt16Fn {
  mulUint16: [Expression, Expression]
}

export interface MulUInt32Fn {
  mulUint32: [Expression, Expression]
}

export interface MulUInt64Fn {
  mulUint64: [Expression, Expression]
}

export interface LtFloatFn {
  ltFloat: [Expression, Expression]
}

export interface LtInt8Fn {
  ltInt8: [Expression, Expression]
}

export interface LtInt16Fn {
  ltInt16: [Expression, Expression]
}

export interface LtInt32Fn {
  ltInt32: [Expression, Expression]
}

export interface LtInt64Fn {
  ltInt64: [Expression, Expression]
}

export interface LtUInt8Fn {
  ltUint8: [Expression, Expression]
}

export interface LtUInt16Fn {
  ltUint16: [Expression, Expression]
}

export interface LtUInt32Fn {
  ltUint32: [Expression, Expression]
}

export interface LtUInt64Fn {
  ltUint64: [Expression, Expression]
}

export interface GtFloatFn {
  gtFloat: [Expression, Expression]
}

export interface GtInt8Fn {
  gtInt8: [Expression, Expression]
}

export interface GtInt16Fn {
  gtInt16: [Expression, Expression]
}

export interface GtInt32Fn {
  gtInt32: [Expression, Expression]
}

export interface GtInt64Fn {
  gtInt64: [Expression, Expression]
}

export interface GtUInt8Fn {
  gtUint8: [Expression, Expression]
}

export interface GtUInt16Fn {
  gtUint16: [Expression, Expression]
}

export interface GtUInt32Fn {
  gtUint32: [Expression, Expression]
}

export interface GtUInt64Fn {
  gtUint64: [Expression, Expression]
}

export interface FloatToIntFn {
  floatToInt: Expression
}

export interface IntToFloatFn {
  intToFloat: Expression
}

// Logic
// -----

export interface AndFn {
  and: Expression[]
}

export interface OrFn {
  or: Expression[]
}

export interface AssertCaseFn {
  assertCase: {case: string; value: Expression}
}

export interface AssertModelRefFn {
  assertModelRef: {ref: Expression; value: Expression}
}

export interface AssertPresentFn {
  assertPresent: Expression
}

export interface EqualFn {
  equal: [Expression, Expression]
}

export interface IfFn {
  if: {condition: Expression; then: Expression; else: Expression}
}

export interface NotFn {
  not: Expression
}

export interface SwitchCaseFn {
  switchCase: [Expression, ObjectMap<FunctionFn>]
}

export interface SwitchModelRefFn {
  switchModelRef: {
    cases: {match: Expression; return: Expression}[]
    value: Expression
    default: Expression
  }
}

// CRUD
// ----

export interface AllFn {
  all: Expression
}

export interface CreateFn {
  create: [Expression, FunctionFn]
}

export interface CreateMultipleFn {
  createMultiple: [Expression, ObjectMap<FunctionFn>]
}

export interface DeleteFn {
  delete: Expression
}

export interface GetFn {
  get: Expression
}

export interface UpdateFn {
  update: {ref: Expression; value: Expression}
}

// Graph / Referential
// -------------------

export interface AllReferrersFn {
  allReferrers: Expression
}

export interface RefToFn {
  refTo: Expression
}

export interface ReferredFn {
  referred: {from: Expression; in: Expression}
}

export interface ReferrersFn {
  referrers: {of: Expression; in: Expression}
}

export interface RelocateRefFn {
  relocateRef: {model: Expression; ref: Expression}
}

export interface ResolveAllRefsFn {
  resolveAllRefs: Expression
}

export interface ResolveRefsFn {
  resolveRefs: [Expression, Expression[]]
}

export interface TagFn {
  tag: Expression
}

export interface TagExistsFn {
  tagExists: Expression
}

export interface GraphFlowFn {
  graphFlow: {
    flow: {backward: Expression[]; forward: Expression[]; from: Expression}[]
    start: Expression
  }
}

// User / Permission
// -----------------

export interface CurrentUserFn {
  currentUser: {}
}

// List
// ----

export interface ConcatListsFn {
  concatLists: [Expression, Expression]
}

export interface FilterListFn {
  filterList: [Expression, FunctionFn]
}

export interface FirstFn {
  first: Expression
}

export interface InListFn {
  inList: {in: Expression; value: Expression}
}

export interface MapListFn {
  mapList: [Expression, FunctionFn]
}

export interface LengthFn {
  length: Expression
}

export interface MemSortFn {
  memSort: [Expression, FunctionFn]
}

export interface MemSortFunctionFn {
  memSortFunction: [Expression, FunctionFn]
}

export interface ReverseListFn {
  reverseList: Expression
}

export interface SliceFn {
  slice: {value: Expression; offset: Expression; length: Expression}
}

export interface ReduceListFn {
  reduceList: {
    initial: Expression
    value: Expression
    reducer: FunctionFn
  }
}

export interface RightFoldListFn {
  rightFoldList: [Expression, Expression, FunctionFn]
}

export interface LeftFoldListFn {
  leftFoldList: [Expression, Expression, FunctionFn]
}

// Struct
// ------

export interface ExtractStringsFn {
  extractStrings: Expression
}

export interface FieldFn {
  field: [string, Expression]
}

export interface SetFieldFn {
  setField: {name: string; in: Expression; value: Expression}
}

// Tuple
// -----

export interface IndexTupleFn {
  indexTuple: [Expression, number]
}

// Union
// -----

export interface IsCaseFn {
  isCase: {case: Expression; value: Expression}
}

// Map
// ---

export interface KeyFn {
  key: [Expression, Expression]
}

export interface MapMapFn {
  mapMap: [Expression, FunctionFn]
}

export interface SetKeyFn {
  setKey: {name: string; in: Expression; value: Expression}
}

// Set
// ---

export interface MapSetFn {
  mapSet: [Expression, FunctionFn]
}

// Optional
// --------

export interface IsPresentFn {
  isPresent: Expression
}

export interface PresentOrZeroFn {
  presentOrZero: Expression
}

// String
// ------

export interface JoinStringsFn {
  joinStrings: {separator: Expression; strings: Expression}
}

export interface StringToLowerFn {
  stringToLower: Expression
}

export interface MatchRegexFn {
  matchRegex: {
    caseInsensitive: boolean
    multiLine: boolean
    regex: string
    value: Expression
  }
}

export interface SearchAllRegexFn {
  searchAllRegex: {
    caseInsensitive: boolean
    multiLine: boolean
    regex: string
    value: Expression
  }
}

export interface SearchRegexFn {
  searchRegex: {
    caseInsensitive: boolean
    multiLine: boolean
    regex: string
    value: Expression
  }
}

export interface StringContainsFn {
  stringContains: [Expression, Expression]
}

export interface SubstringIndexFn {
  substringIndex: [Expression, Expression]
}

// Date Time
// ---------

export interface AfterFn {
  after: [Expression, Expression]
}

export interface BeforeFn {
  before: [Expression, Expression]
}

// Scope
// -----

export interface DataFn {
  data: DataExpression
}

export interface WithFn {
  with: [Expression, FunctionFn]
}

export interface DefineFn {
  define: [string, Expression]
}

export interface ScopeFn {
  scope: string
}

export interface SignatureFn {
  signature: FunctionFn
}

// Other
// -----

export interface ModelFn {
  model: Expression
}

export interface ModelOfFn {
  modelOf: Expression
}

export interface MetarializeFn {
  metarialize: Expression
}

export interface ZeroFn {
  zero: {}
}

// Data Scope
// ==========

export interface BoolFn {
  bool: boolean
}

export interface DateTimeFn {
  dateTime: string
}

export interface StringFn {
  string: string
}

export interface FloatFn {
  float: number
}

export interface Int8Fn {
  int8: number
}

export interface Int16Fn {
  int16: number
}

export interface Int32Fn {
  int32: number
}

export interface Int64Fn {
  int64: number
}

export interface UInt8Fn {
  uint8: number
}

export interface UInt16Fn {
  uint16: number
}

export interface UInt32Fn {
  uint32: number
}

export interface UInt64Fn {
  uint64: number
}

export interface NullFn {
  null: null
}

export interface SymbolFn {
  symbol: string
}

export interface TupleFn {
  tuple: DataExpression[]
}

export interface RefFn {
  ref: [string, string]
}

export interface SetFn {
  set: DataExpression[]
}

export interface ExprFn {
  expr: Expression
}

export interface ListFn {
  list: DataExpression[]
}

export interface MapFn {
  map: ObjectMap<DataExpression>
}

export interface StructFn {
  struct: ObjectMap<DataExpression | undefined>
}

export interface UnionFn {
  union: [string, DataExpression]
}

// Function Scope
// ==============

export interface FunctionFn {
  function: [string[], Expression[]]
}

export type PrimitiveDataExpression =
  | BoolFn
  | DateTimeFn
  | StringFn
  | NullFn
  | SymbolFn
  | Int8Fn
  | Int16Fn
  | Int32Fn
  | Int64Fn
  | UInt8Fn
  | UInt16Fn
  | UInt32Fn
  | UInt64Fn
  | FloatFn

export type DataExpression =
  | PrimitiveDataExpression
  | MapFn
  | ListFn
  | SetFn
  | StructFn
  | TupleFn
  | UnionFn
  | RefFn
  | ExprFn

//
export type Expression =
  // Convinience constructors
  | PrimitiveDataExpression

  // Other
  | ModelFn
  | ModelOfFn
  | MetarializeFn
  | ZeroFn

  // Scope
  | DataFn
  | WithFn
  | DefineFn
  | ScopeFn
  | SignatureFn

  // Date Time
  | AfterFn
  | BeforeFn

  // String
  | JoinStringsFn
  | StringToLowerFn
  | MatchRegexFn
  | SearchAllRegexFn
  | SearchRegexFn
  | StringContainsFn
  | SubstringIndexFn

  // Optional
  | IsPresentFn
  | PresentOrZeroFn

  // Set
  | MapSetFn

  // Map
  | KeyFn
  | MapMapFn
  | SetKeyFn

  // Union
  | IsCaseFn

  // Tuple
  | IndexTupleFn

  // Struct
  | ExtractStringsFn
  | FieldFn
  | SetFieldFn

  // List
  | ConcatListsFn
  | FilterListFn
  | FirstFn
  | InListFn
  | MapListFn
  | LengthFn
  | MemSortFn
  | MemSortFunctionFn
  | ReverseListFn
  | SliceFn
  | ReduceListFn
  | LeftFoldListFn
  | RightFoldListFn

  // User / Permission
  | CurrentUserFn

  // Graph / Referential
  | AllReferrersFn
  | RefToFn
  | ReferredFn
  | ReferrersFn
  | RelocateRefFn
  | ResolveAllRefsFn
  | ResolveRefsFn
  | TagFn
  | TagExistsFn

  // CRUD
  | AllFn
  | CreateFn
  | CreateMultipleFn
  | DeleteFn
  | GetFn
  | UpdateFn

  // Logic
  | AndFn
  | OrFn
  | AssertCaseFn
  | AssertModelRefFn
  | AssertPresentFn
  | EqualFn
  | IfFn
  | NotFn
  | SwitchCaseFn
  | SwitchModelRefFn

  // Numeric
  | AddFloatFn
  | AddInt8Fn
  | AddInt16Fn
  | AddInt32Fn
  | AddInt64Fn
  | AddUInt8Fn
  | AddUInt16Fn
  | AddUInt32Fn
  | AddUInt64Fn
  | SubFloatFn
  | SubInt8Fn
  | SubInt16Fn
  | SubInt32Fn
  | SubInt64Fn
  | SubUInt8Fn
  | SubUInt16Fn
  | SubUInt32Fn
  | SubUInt64Fn
  | DivFloatFn
  | DivInt8Fn
  | DivInt16Fn
  | DivInt32Fn
  | DivInt64Fn
  | DivUInt8Fn
  | DivUInt16Fn
  | DivUInt32Fn
  | DivUInt64Fn
  | MulFloatFn
  | MulInt8Fn
  | MulInt16Fn
  | MulInt32Fn
  | MulInt64Fn
  | MulUInt8Fn
  | MulUInt16Fn
  | MulUInt32Fn
  | MulUInt64Fn
  | LtFloatFn
  | LtInt8Fn
  | LtInt16Fn
  | LtInt32Fn
  | LtInt64Fn
  | LtUInt8Fn
  | LtUInt16Fn
  | LtUInt32Fn
  | LtUInt64Fn
  | GtFloatFn
  | GtInt8Fn
  | GtInt16Fn
  | GtInt32Fn
  | GtInt64Fn
  | GtUInt8Fn
  | GtUInt16Fn
  | GtUInt32Fn
  | GtUInt64Fn
  | FloatToIntFn
  | IntToFloatFn

export type StringExpression = string | Expression
export type NumberExpression = number | Expression
export type DateExpression = string | number | Date | Expression

export type StringDataExpression = string | DataExpression
