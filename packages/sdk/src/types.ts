import {ObjectMap} from './internal'

// Utility Types
// ===========

export interface MetarializedRecord<T = any> {
  id: Ref
  model: Ref
  created: string
  updated: string
  value: T
}

// Return Types
// ============

export type Ref = [string, string]

export interface Tag {
  tag: string
  model: Ref
}

// Expression Type
// ===============

export const enum ExpressionType {
  // Numeric
  // -------

  AddFloat = 'addFloat',
  AddInt8 = 'addInt8',
  AddInt16 = 'addInt16',
  AddInt32 = 'addInt32',
  AddInt64 = 'addInt64',
  AddUint8 = 'addUint8',
  AddUint16 = 'addUint16',
  AddUint32 = 'addUint32',
  AddUint64 = 'addUint64',

  SubFloat = 'subFloat',
  SubInt8 = 'subInt8',
  SubInt16 = 'subInt16',
  SubInt32 = 'subInt32',
  SubInt64 = 'subInt64',
  SubUint8 = 'subUint8',
  SubUint16 = 'subUint16',
  SubUint32 = 'subUint32',
  SubUint64 = 'subUint64',

  DivFloat = 'divFloat',
  DivInt8 = 'divInt8',
  DivInt16 = 'divInt16',
  DivInt32 = 'divInt32',
  DivInt64 = 'divInt64',
  DivUint8 = 'divUint8',
  DivUint16 = 'divUint16',
  DivUint32 = 'divUint32',
  DivUint64 = 'divUint64',

  MulFloat = 'mulFloat',
  MulInt8 = 'mulInt8',
  MulInt16 = 'mulInt16',
  MulInt32 = 'mulInt32',
  MulInt64 = 'mulInt64',
  MulUint8 = 'mulUint8',
  MulUint16 = 'mulUint16',
  MulUint32 = 'mulUint32',
  MulUint64 = 'mulUint64',

  LtFloat = 'ltFloat',
  LtInt8 = 'ltInt8',
  LtInt16 = 'ltInt16',
  LtInt32 = 'ltInt32',
  LtInt64 = 'ltInt64',
  LtUint8 = 'ltUint8',
  LtUint16 = 'ltUint16',
  LtUint32 = 'ltUint32',
  LtUint64 = 'ltUint64',

  GtFloat = 'gtFloat',
  GtInt8 = 'gtInt8',
  GtInt16 = 'gtInt16',
  GtInt32 = 'gtInt32',
  GtInt64 = 'gtInt64',
  GtUint8 = 'gtUint8',
  GtUint16 = 'gtUint16',
  GtUint32 = 'gtUint32',
  GtUint64 = 'gtUint64',

  FloatToInt = 'floatToInt',
  IntToFloat = 'intToFloat',

  // Logic
  // -----

  And = 'and',
  Or = 'or',
  AssertCase = 'assertCase',
  AssertModelRef = 'assertModelRef',
  AssertPresent = 'assertPresent',
  Equal = 'equal',
  If = 'if',
  Not = 'not',
  SwitchCase = 'switchCase',
  SwitchModelRef = 'switchModelRef',

  // CRUD
  // ----

  All = 'all',
  Create = 'create',
  CreateMultiple = 'createMultiple',
  Delete = 'delete',
  Get = 'get',
  Update = 'update',

  // Graph / Referential
  // -------------------

  AllReferrers = 'allReferrers',
  RefTo = 'refTo',
  Referred = 'referred',
  Referrers = 'referrers',
  RelocateRef = 'relocateRef',
  ResolveAllRefs = 'resolveAllRefs',
  ResolveRefs = 'resolveRefs',
  Tag = 'tag',
  TagExists = 'tagExists',
  GraphFlow = 'graphFlow',

  // User / Permission
  // -----------------

  CurrentUser = 'currentUser',

  // List
  // ----

  ConcatLists = 'concatLists',
  FilterList = 'filterList',
  First = 'first',
  InList = 'inList',
  MapList = 'mapList',
  Length = 'length',
  MemSort = 'memSort',
  MemSortFunction = 'memSortFunction',
  ReverseList = 'reverseList',
  Slice = 'slice',
  ReduceList = 'reduceList',
  RightFoldList = 'rightFoldList',
  LeftFoldList = 'leftFoldList',

  // Struct
  // ------

  ExtractStrings = 'extractStrings',
  Field = 'field',
  SetField = 'setField',

  // Tuple
  // -----

  IndexTuple = 'indexTuple',

  // Union
  // -----

  IsCase = 'isCase',

  // Map
  // ---

  Key = 'key',
  MapMap = 'mapMap',
  SetKey = 'setKey',

  // Set
  // ---

  MapSet = 'mapSet',

  // Optional
  // --------

  IsPresent = 'isPresent',
  PresentOrZero = 'presentOrZero',

  // String
  // ------

  JoinStrings = 'joinStrings',
  StringToLower = 'stringToLower',
  MatchRegex = 'matchRegex',
  SearchRegex = 'searchRegex',
  SearchAllRegex = 'searchAllRegex',
  StringContains = 'stringContains',
  SubstringIndex = 'substringIndex',

  // Date Time
  // ---------

  After = 'after',
  Before = 'before',

  // Scope
  // -----

  Data = 'data',
  With = 'with',
  Define = 'define',
  Scope = 'scope',
  Signature = 'signature',

  // Other
  // -----

  Model = 'model',
  ModelOf = 'modelOf',
  Metarialize = 'metarialize',
  Zero = 'zero',

  // Data
  // ----

  Expr = 'expr',
  Bool = 'bool',
  DateTime = 'dateTime',
  String = 'string',
  Float = 'float',
  Int8 = 'int8',
  Int16 = 'int16',
  Int32 = 'int32',
  Int64 = 'int64',
  Uint8 = 'uint8',
  Uint16 = 'uint16',
  Uint32 = 'uint32',
  Uint64 = 'uint64',
  Null = 'null',
  Symbol = 'symbol',
  Tuple = 'tuple',
  Ref = 'ref',
  Set = 'set',
  List = 'list',
  Map = 'map',
  Struct = 'struct',
  Union = 'union',

  // Function
  // --------

  Function = 'function'
}

// Expression Scope
// ================

// Numeric
// -------

export interface AddFloatFn {
  [ExpressionType.AddFloat]: [Expression, Expression]
}

export interface AddInt8Fn {
  [ExpressionType.AddInt8]: [Expression, Expression]
}

export interface AddInt16Fn {
  [ExpressionType.AddInt16]: [Expression, Expression]
}

export interface AddInt32Fn {
  [ExpressionType.AddInt32]: [Expression, Expression]
}

export interface AddInt64Fn {
  [ExpressionType.AddInt64]: [Expression, Expression]
}

export interface AddUInt8Fn {
  [ExpressionType.AddUint8]: [Expression, Expression]
}

export interface AddUInt16Fn {
  [ExpressionType.AddUint16]: [Expression, Expression]
}

export interface AddUInt32Fn {
  [ExpressionType.AddUint32]: [Expression, Expression]
}

export interface AddUInt64Fn {
  [ExpressionType.AddUint64]: [Expression, Expression]
}

export interface SubFloatFn {
  [ExpressionType.SubFloat]: [Expression, Expression]
}

export interface SubInt8Fn {
  [ExpressionType.SubInt8]: [Expression, Expression]
}

export interface SubInt16Fn {
  [ExpressionType.SubInt16]: [Expression, Expression]
}

export interface SubInt32Fn {
  [ExpressionType.SubInt32]: [Expression, Expression]
}

export interface SubInt64Fn {
  [ExpressionType.SubInt64]: [Expression, Expression]
}

export interface SubUInt8Fn {
  [ExpressionType.SubUint8]: [Expression, Expression]
}

export interface SubUInt16Fn {
  [ExpressionType.SubUint16]: [Expression, Expression]
}

export interface SubUInt32Fn {
  [ExpressionType.SubUint32]: [Expression, Expression]
}

export interface SubUInt64Fn {
  [ExpressionType.SubUint64]: [Expression, Expression]
}

export interface DivFloatFn {
  [ExpressionType.DivFloat]: [Expression, Expression]
}
export interface DivInt8Fn {
  [ExpressionType.DivInt8]: [Expression, Expression]
}

export interface DivInt16Fn {
  [ExpressionType.DivInt16]: [Expression, Expression]
}

export interface DivInt32Fn {
  [ExpressionType.DivInt32]: [Expression, Expression]
}

export interface DivInt64Fn {
  [ExpressionType.DivInt64]: [Expression, Expression]
}

export interface DivUInt8Fn {
  [ExpressionType.DivUint8]: [Expression, Expression]
}

export interface DivUInt16Fn {
  [ExpressionType.DivUint16]: [Expression, Expression]
}

export interface DivUInt32Fn {
  [ExpressionType.DivUint32]: [Expression, Expression]
}

export interface DivUInt64Fn {
  [ExpressionType.DivUint64]: [Expression, Expression]
}

export interface MulFloatFn {
  [ExpressionType.MulFloat]: [Expression, Expression]
}

export interface MulInt8Fn {
  [ExpressionType.MulInt8]: [Expression, Expression]
}

export interface MulInt16Fn {
  [ExpressionType.MulInt16]: [Expression, Expression]
}

export interface MulInt32Fn {
  [ExpressionType.MulInt32]: [Expression, Expression]
}

export interface MulInt64Fn {
  [ExpressionType.MulInt64]: [Expression, Expression]
}

export interface MulUInt8Fn {
  [ExpressionType.MulUint8]: [Expression, Expression]
}

export interface MulUInt16Fn {
  [ExpressionType.MulUint16]: [Expression, Expression]
}

export interface MulUInt32Fn {
  [ExpressionType.MulUint32]: [Expression, Expression]
}

export interface MulUInt64Fn {
  [ExpressionType.MulUint64]: [Expression, Expression]
}

export interface LtFloatFn {
  [ExpressionType.LtFloat]: [Expression, Expression]
}

export interface LtInt8Fn {
  [ExpressionType.LtInt8]: [Expression, Expression]
}

export interface LtInt16Fn {
  [ExpressionType.LtInt16]: [Expression, Expression]
}

export interface LtInt32Fn {
  [ExpressionType.LtInt32]: [Expression, Expression]
}

export interface LtInt64Fn {
  [ExpressionType.LtInt64]: [Expression, Expression]
}

export interface LtUInt8Fn {
  [ExpressionType.LtUint8]: [Expression, Expression]
}

export interface LtUInt16Fn {
  [ExpressionType.LtUint16]: [Expression, Expression]
}

export interface LtUInt32Fn {
  [ExpressionType.LtUint32]: [Expression, Expression]
}

export interface LtUInt64Fn {
  [ExpressionType.LtUint64]: [Expression, Expression]
}

export interface GtFloatFn {
  [ExpressionType.GtFloat]: [Expression, Expression]
}

export interface GtInt8Fn {
  [ExpressionType.GtInt8]: [Expression, Expression]
}

export interface GtInt16Fn {
  [ExpressionType.GtInt16]: [Expression, Expression]
}

export interface GtInt32Fn {
  [ExpressionType.GtInt32]: [Expression, Expression]
}

export interface GtInt64Fn {
  [ExpressionType.GtInt64]: [Expression, Expression]
}

export interface GtUInt8Fn {
  [ExpressionType.GtUint8]: [Expression, Expression]
}

export interface GtUInt16Fn {
  [ExpressionType.GtUint16]: [Expression, Expression]
}

export interface GtUInt32Fn {
  [ExpressionType.GtUint32]: [Expression, Expression]
}

export interface GtUInt64Fn {
  [ExpressionType.GtUint64]: [Expression, Expression]
}

export interface FloatToIntFn {
  [ExpressionType.FloatToInt]: Expression
}

export interface IntToFloatFn {
  [ExpressionType.IntToFloat]: Expression
}

// Logic
// -----

export interface AndFn {
  [ExpressionType.And]: Expression[]
}

export interface OrFn {
  [ExpressionType.Or]: Expression[]
}

export interface AssertCaseFn {
  [ExpressionType.AssertCase]: {case: string; value: Expression}
}

export interface AssertModelRefFn {
  [ExpressionType.AssertModelRef]: {ref: Expression; value: Expression}
}

export interface AssertPresentFn {
  [ExpressionType.AssertPresent]: Expression
}

export interface EqualFn {
  [ExpressionType.Equal]: [Expression, Expression]
}

export interface IfFn {
  [ExpressionType.If]: {condition: Expression; then: Expression; else: Expression}
}

export interface NotFn {
  [ExpressionType.Not]: Expression
}

export interface SwitchCaseFn {
  [ExpressionType.SwitchCase]: [Expression, ObjectMap<FunctionExpression>]
}

export interface SwitchModelRefFn {
  [ExpressionType.SwitchModelRef]: {
    cases: {match: Expression; return: FunctionExpression}[]
    value: Expression
    default: Expression
  }
}

// CRUD
// ----

export interface AllFn {
  [ExpressionType.All]: Expression
}

export interface CreateFn {
  [ExpressionType.Create]: [Expression, FunctionExpression]
}

export interface CreateMultipleFn {
  [ExpressionType.CreateMultiple]: [Expression, ObjectMap<FunctionExpression>]
}

export interface DeleteFn {
  [ExpressionType.Delete]: Expression
}

export interface GetFn {
  [ExpressionType.Get]: Expression
}

export interface UpdateFn {
  [ExpressionType.Update]: {ref: Expression; value: Expression}
}

// Graph / Referential
// -------------------

export interface AllReferrersFn {
  [ExpressionType.AllReferrers]: Expression
}

export interface RefToFn {
  [ExpressionType.RefTo]: Expression
}

export interface ReferredFn {
  [ExpressionType.Referred]: {from: Expression; in: Expression}
}

export interface ReferrersFn {
  [ExpressionType.Referrers]: {of: Expression; in: Expression}
}

export interface RelocateRefFn {
  [ExpressionType.RelocateRef]: {model: Expression; ref: Expression}
}

export interface ResolveAllRefsFn {
  [ExpressionType.ResolveAllRefs]: Expression
}

export interface ResolveRefsFn {
  [ExpressionType.ResolveRefs]: [Expression, Expression[]]
}

export interface TagFn {
  [ExpressionType.Tag]: Expression
}

export interface TagExistsFn {
  [ExpressionType.TagExists]: Expression
}

export interface GraphFlowFn {
  [ExpressionType.GraphFlow]: {
    flow: {backward: Expression[]; forward: Expression[]; from: Expression}[]
    start: Expression
  }
}

// User / Permission
// -----------------

export interface CurrentUserFn {
  [ExpressionType.CurrentUser]: {}
}

// List
// ----

export interface ConcatListsFn {
  [ExpressionType.ConcatLists]: [Expression, Expression]
}

export interface FilterListFn {
  [ExpressionType.FilterList]: [Expression, FunctionExpression]
}

export interface FirstFn {
  [ExpressionType.First]: Expression
}

export interface InListFn {
  [ExpressionType.InList]: {in: Expression; value: Expression}
}

export interface MapListFn {
  [ExpressionType.MapList]: [Expression, FunctionExpression]
}

export interface LengthFn {
  [ExpressionType.Length]: Expression
}

export interface MemSortFn {
  [ExpressionType.MemSort]: [Expression, FunctionExpression]
}

export interface MemSortFunctionFn {
  [ExpressionType.MemSortFunction]: [Expression, FunctionExpression]
}

export interface ReverseListFn {
  [ExpressionType.ReverseList]: Expression
}

export interface SliceFn {
  [ExpressionType.Slice]: {value: Expression; offset: Expression; length: Expression}
}

export interface ReduceListFn {
  [ExpressionType.ReduceList]: {
    initial: Expression
    value: Expression
    reducer: FunctionExpression
  }
}

export interface RightFoldListFn {
  [ExpressionType.RightFoldList]: [Expression, Expression, FunctionExpression]
}

export interface LeftFoldListFn {
  [ExpressionType.LeftFoldList]: [Expression, Expression, FunctionExpression]
}

// Struct
// ------

export interface ExtractStringsFn {
  [ExpressionType.ExtractStrings]: Expression
}

export interface FieldFn {
  [ExpressionType.Field]: [string, Expression]
}

export interface SetFieldFn {
  [ExpressionType.SetField]: {name: string; in: Expression; value: Expression}
}

// Tuple
// -----

export interface IndexTupleFn {
  [ExpressionType.IndexTuple]: [Expression, number]
}

// Union
// -----

export interface IsCaseFn {
  [ExpressionType.IsCase]: {case: Expression; value: Expression}
}

// Map
// ---

export interface KeyFn {
  [ExpressionType.Key]: [Expression, Expression]
}

export interface MapMapFn {
  [ExpressionType.MapMap]: [Expression, FunctionExpression]
}

export interface SetKeyFn {
  [ExpressionType.SetKey]: {name: string; in: Expression; value: Expression}
}

// Set
// ---

export interface MapSetFn {
  [ExpressionType.MapSet]: [Expression, FunctionExpression]
}

// Optional
// --------

export interface IsPresentFn {
  [ExpressionType.IsPresent]: Expression
}

export interface PresentOrZeroFn {
  [ExpressionType.PresentOrZero]: Expression
}

// String
// ------

export interface JoinStringsFn {
  [ExpressionType.JoinStrings]: {separator: Expression; strings: Expression}
}

export interface StringToLowerFn {
  [ExpressionType.StringToLower]: Expression
}

export interface MatchRegexFn {
  [ExpressionType.MatchRegex]: {
    caseInsensitive: boolean
    multiLine: boolean
    regex: string
    value: Expression
  }
}

export interface SearchAllRegexFn {
  [ExpressionType.SearchAllRegex]: {
    caseInsensitive: boolean
    multiLine: boolean
    regex: string
    value: Expression
  }
}

export interface SearchRegexFn {
  [ExpressionType.SearchRegex]: {
    caseInsensitive: boolean
    multiLine: boolean
    regex: string
    value: Expression
  }
}

export interface StringContainsFn {
  [ExpressionType.StringContains]: [Expression, Expression]
}

export interface SubstringIndexFn {
  [ExpressionType.SubstringIndex]: [Expression, Expression]
}

// Date Time
// ---------

export interface AfterFn {
  [ExpressionType.After]: [Expression, Expression]
}

export interface BeforeFn {
  [ExpressionType.Before]: [Expression, Expression]
}

// Scope
// -----

export interface DataFn {
  [ExpressionType.Data]: DataExpression
}

export interface WithFn {
  [ExpressionType.With]: [Expression, FunctionExpression]
}

export interface DefineFn {
  [ExpressionType.Define]: [string, Expression]
}

export interface ScopeFn {
  [ExpressionType.Scope]: string
}

export interface SignatureFn {
  [ExpressionType.Signature]: FunctionExpression
}

// Other
// -----

export interface ModelFn {
  [ExpressionType.Model]: Expression
}

export interface ModelOfFn {
  [ExpressionType.ModelOf]: Expression
}

export interface MetarializeFn {
  [ExpressionType.Metarialize]: Expression
}

export interface ZeroFn {
  [ExpressionType.Zero]: {}
}

// Data Scope
// ==========

export interface BoolFn {
  [ExpressionType.Bool]: boolean
}

export interface DateTimeFn {
  [ExpressionType.DateTime]: string
}

export interface StringFn {
  [ExpressionType.String]: string
}

export interface FloatFn {
  [ExpressionType.Float]: number
}

export interface Int8Fn {
  [ExpressionType.Int8]: number
}

export interface Int16Fn {
  [ExpressionType.Int16]: number
}

export interface Int32Fn {
  [ExpressionType.Int32]: number
}

export interface Int64Fn {
  [ExpressionType.Int64]: number
}

export interface UInt8Fn {
  [ExpressionType.Uint8]: number
}

export interface UInt16Fn {
  [ExpressionType.Uint16]: number
}

export interface UInt32Fn {
  [ExpressionType.Uint32]: number
}

export interface UInt64Fn {
  [ExpressionType.Uint64]: number
}

export interface NullFn {
  [ExpressionType.Null]: null
}

export interface SymbolFn {
  [ExpressionType.Symbol]: string
}

export interface TupleFn {
  [ExpressionType.Tuple]: DataExpression[]
}

export interface RefFn {
  [ExpressionType.Ref]: [string, string]
}

export interface SetFn {
  [ExpressionType.Set]: DataExpression[]
}

export interface ExprFn {
  [ExpressionType.Expr]: Expression
}

export interface ListFn {
  [ExpressionType.List]: DataExpression[]
}

export interface MapFn {
  [ExpressionType.Map]: ObjectMap<DataExpression>
}

export interface StructFn {
  [ExpressionType.Struct]: ObjectMap<DataExpression>
}

export interface UnionFn {
  [ExpressionType.Union]: [string, DataExpression]
}

// Function Scope
// ==============

export interface FunctionFn {
  [ExpressionType.Function]: [string[], Expression[]]
}

export type FunctionExpression = FunctionFn

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
  | GraphFlowFn

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

export type AnyExpression = Expression | DataExpression | FunctionExpression

export type StringExpression = string | Expression
export type NumberExpression = number | Expression
export type DateExpression = string | number | Date | Expression
export type StringDataExpression = string | DataExpression
