import * as val from './value'
import {mapObject, ObjectMap} from './utility'

/*
    HOW TO ADD A NEW EXPRESSION

    - Define a class lower down in this file.
      If the karma function name is "foo", the class name should be "Foo".

    - Define a convenience constructor function above the class definitions.
      If the class name is "Foo", the convenience constructor should be called "foo".
      If "foo" is a reserved JS keyword and hence illegal as a function name (e.g. "delete"), use a short version of it or append an underscore.

    - Add a convenience chain-method to the abstract class Expression if the first argument to the function is an expression.
      If the convenience constructor name is "foo", the chain-method should also be called "foo".
      If the convenience constructor name is a reserved JS keyword but is legal in method declarations (e.g. "with"), prefer the original name.

    - If the expression takes a function as argument, take it as e.g. f : (a : Scope, b : Scope) => (Expression | Expression[])
      and lift the function to a Function using the func() constructor.
*/

export class Function {
  constructor(readonly args: string[], readonly body: Expression[]) {
    if (body.length === 0) {
      throw new Error(`function must have at least 1 expression in body`)
    }
  }

  toValue(): val.Value {
    return val.union(
      'function',
      val.tuple(
        val.list(this.args.map(arg => val.string(arg))),
        val.list(this.body.map(expr => expr.toValue()))
      )
    )
  }
}

let argID = 0

export function func(
  f: (...args: Scope[]) => Expression | Expression[],
  minArgs: number = 0
): Function {
  const args: string[] = []
  const numArgs = Math.max(minArgs, f.length)

  for (let i = 0; i < numArgs; i++) {
    args.push(`arg${argID++}_${i}`)
  }

  const body = f(...args.map(name => scope(name)))
  if (Array.isArray(body)) {
    return new Function(args, body)
  }

  return new Function(args, [body])
}

export abstract class Expression {
  assertModelRef(model: string | Expression): AssertModelRef {
    return assertModelRef(this, model)
  }

  switchModelRef(default_: Expression, cases: ModelRefCaseArg[]): SwitchModelRef {
    return switchModelRef(this, default_, cases)
  }

  graphFlow(flow: GraphFlowArg[]): GraphFlow {
    return graphFlow(this, flow)
  }

  memSortFunction(sort: (a: Scope, b: Scope) => Expression | Expression[]): MemSortFunction {
    return memSortFunction(this, sort)
  }

  concatLists(rhs: Expression): ConcatLists {
    return concatLists(this, rhs)
  }

  inList(needle: Expression): InList {
    return inList(this, needle)
  }

  reduceList(
    init: Expression,
    reducer: (a: Scope, b: Scope) => Expression | Expression[]
  ): ReduceList {
    return reduceList(this, init, reducer)
  }

  rightFoldList(
    init: Expression,
    reducer: (a: Scope, b: Scope) => Expression | Expression[]
  ): RightFoldList {
    return rightFoldList(this, init, reducer)
  }

  leftFoldList(
    init: Expression,
    reducer: (a: Scope, b: Scope) => Expression | Expression[]
  ): LeftFoldList {
    return leftFoldList(this, init, reducer)
  }

  referrers(inModel: string | Expression): Referrers {
    return referrers(this, inModel)
  }

  referred(inModel: string | Expression): Referred {
    return referred(this, inModel)
  }

  resolveRefs(...models: string[] | Expression[]): ResolveRefs {
    return resolveRefs(this, ...models)
  }

  switchCase(cases: {[caze: string]: (val: Scope) => Expression | Expression[]}): SwitchCase {
    return switchCase(this, cases)
  }

  assertCase(caze: string): AssertCase {
    return assertCase(caze, this)
  }

  stringContains(needle: string | Expression): StringContains {
    return stringContains(this, needle)
  }

  substringIndex(needle: string | Expression): SubstringIndex {
    return substringIndex(this, needle)
  }

  joinStrings(separator: string | Expression): JoinStrings {
    return joinStrings(this, separator)
  }

  isCase(caze: string | Expression): IsCase {
    return isCase(caze, this)
  }

  setField(name: string, val: Expression): SetField {
    return setField(name, val, this)
  }

  mapMap(f: (key: Scope, val: Scope) => Expression | Expression[]): MapMap {
    return mapMap(this, f)
  }

  mapSet(f: (val: Scope) => Expression | Expression[]): MapSet {
    return mapSet(this, f)
  }

  setKey(name: string, val: Expression): SetKey {
    return setKey(name, val, this)
  }

  indexTuple(idx: number): IndexTuple {
    return indexTuple(idx, this)
  }

  after(rhs: Expression): After {
    return after(this, rhs)
  }

  before(rhs: Expression): Before {
    return before(this, rhs)
  }

  define(name: string): Define {
    return define(name, this)
  }

  matchRegex(
    regex: string,
    caseInsensitive: boolean = false,
    multiLine: boolean = false
  ): MatchRegex {
    return matchRegex(this, regex, caseInsensitive, multiLine)
  }

  searchRegex(
    regex: string,
    caseInsensitive: boolean = false,
    multiLine: boolean = false
  ): SearchRegex {
    return searchRegex(this, regex, caseInsensitive, multiLine)
  }

  searchAllRegex(
    regex: string,
    caseInsensitive: boolean = false,
    multiLine: boolean = false
  ): SearchAllRegex {
    return searchAllRegex(this, regex, caseInsensitive, multiLine)
  }

  if(then: Expression, elze: Expression): If {
    return if_(this, then, elze)
  }

  create(f: (self: Scope) => Expression | Expression[]): Create {
    return create(this, f)
  }

  with(f: (arg: Scope) => Expression | Expression[]): With {
    return with_(this, f)
  }

  addFloat(rhs: Expression): AddFloat {
    return addFloat(this, rhs)
  }

  addInt64(rhs: Expression): AddInt64 {
    return addInt64(this, rhs)
  }

  addInt32(rhs: Expression): AddInt32 {
    return addInt32(this, rhs)
  }

  addInt16(rhs: Expression): AddInt16 {
    return addInt16(this, rhs)
  }

  addInt8(rhs: Expression): AddInt8 {
    return addInt8(this, rhs)
  }

  addUint64(rhs: Expression): AddUint64 {
    return addUint64(this, rhs)
  }

  addUint32(rhs: Expression): AddUint32 {
    return addUint32(this, rhs)
  }

  addUint16(rhs: Expression): AddUint16 {
    return addUint16(this, rhs)
  }

  addUint8(rhs: Expression): AddUint8 {
    return addUint8(this, rhs)
  }

  subFloat(rhs: Expression): SubFloat {
    return subFloat(this, rhs)
  }

  subInt64(rhs: Expression): SubInt64 {
    return subInt64(this, rhs)
  }

  subInt32(rhs: Expression): SubInt32 {
    return subInt32(this, rhs)
  }

  subInt16(rhs: Expression): SubInt16 {
    return subInt16(this, rhs)
  }

  subInt8(rhs: Expression): SubInt8 {
    return subInt8(this, rhs)
  }

  subUint64(rhs: Expression): SubUint64 {
    return subUint64(this, rhs)
  }

  subUint32(rhs: Expression): SubUint32 {
    return subUint32(this, rhs)
  }

  subUint16(rhs: Expression): SubUint16 {
    return subUint16(this, rhs)
  }

  subUint8(rhs: Expression): SubUint8 {
    return subUint8(this, rhs)
  }

  divFloat(rhs: Expression): DivFloat {
    return divFloat(this, rhs)
  }

  divInt64(rhs: Expression): DivInt64 {
    return divInt64(this, rhs)
  }

  divInt32(rhs: Expression): DivInt32 {
    return divInt32(this, rhs)
  }

  divInt16(rhs: Expression): DivInt16 {
    return divInt16(this, rhs)
  }

  divInt8(rhs: Expression): DivInt8 {
    return divInt8(this, rhs)
  }

  divUint64(rhs: Expression): DivUint64 {
    return divUint64(this, rhs)
  }

  divUint32(rhs: Expression): DivUint32 {
    return divUint32(this, rhs)
  }

  divUint16(rhs: Expression): DivUint16 {
    return divUint16(this, rhs)
  }

  divUint8(rhs: Expression): DivUint8 {
    return divUint8(this, rhs)
  }

  mulFloat(rhs: Expression): MulFloat {
    return mulFloat(this, rhs)
  }

  mulInt64(rhs: Expression): MulInt64 {
    return mulInt64(this, rhs)
  }

  mulInt32(rhs: Expression): MulInt32 {
    return mulInt32(this, rhs)
  }

  mulInt16(rhs: Expression): MulInt16 {
    return mulInt16(this, rhs)
  }

  mulInt8(rhs: Expression): MulInt8 {
    return mulInt8(this, rhs)
  }

  mulUint64(rhs: Expression): MulUint64 {
    return mulUint64(this, rhs)
  }

  mulUint32(rhs: Expression): MulUint32 {
    return mulUint32(this, rhs)
  }

  mulUint16(rhs: Expression): MulUint16 {
    return mulUint16(this, rhs)
  }

  mulUint8(rhs: Expression): MulUint8 {
    return mulUint8(this, rhs)
  }

  gtFloat(rhs: Expression): GtFloat {
    return gtFloat(this, rhs)
  }

  gtInt64(rhs: Expression): GtInt64 {
    return gtInt64(this, rhs)
  }

  gtInt32(rhs: Expression): GtInt32 {
    return gtInt32(this, rhs)
  }

  gtInt16(rhs: Expression): GtInt16 {
    return gtInt16(this, rhs)
  }

  gtInt8(rhs: Expression): GtInt8 {
    return gtInt8(this, rhs)
  }

  gtUint64(rhs: Expression): GtUint64 {
    return gtUint64(this, rhs)
  }

  gtUint32(rhs: Expression): GtUint32 {
    return gtUint32(this, rhs)
  }

  gtUint16(rhs: Expression): GtUint16 {
    return gtUint16(this, rhs)
  }

  gtUint8(rhs: Expression): GtUint8 {
    return gtUint8(this, rhs)
  }

  ltFloat(rhs: Expression): LtFloat {
    return ltFloat(this, rhs)
  }

  ltInt64(rhs: Expression): LtInt64 {
    return ltInt64(this, rhs)
  }

  ltInt32(rhs: Expression): LtInt32 {
    return ltInt32(this, rhs)
  }

  ltInt16(rhs: Expression): LtInt16 {
    return ltInt16(this, rhs)
  }

  ltInt8(rhs: Expression): LtInt8 {
    return ltInt8(this, rhs)
  }

  ltUint64(rhs: Expression): LtUint64 {
    return ltUint64(this, rhs)
  }

  ltUint32(rhs: Expression): LtUint32 {
    return ltUint32(this, rhs)
  }

  ltUint16(rhs: Expression): LtUint16 {
    return ltUint16(this, rhs)
  }

  ltUint8(rhs: Expression): LtUint8 {
    return ltUint8(this, rhs)
  }

  toFloat(): ToFloat {
    return toFloat(this)
  }

  toInt8(): ToInt8 {
    return toInt8(this)
  }

  toInt16(): ToInt16 {
    return toInt16(this)
  }

  toInt32(): ToInt32 {
    return toInt32(this)
  }

  toInt64(): ToInt64 {
    return toInt64(this)
  }

  toUint8(): ToUint8 {
    return toUint8(this)
  }

  toUint16(): ToUint16 {
    return toUint16(this)
  }

  toUint32(): ToUint32 {
    return toUint32(this)
  }

  toUint64(): ToUint64 {
    return toUint64(this)
  }

  assertPresent(): AssertPresent {
    return assertPresent(this)
  }

  extractStrings(): ExtractStrings {
    return extractStrings(this)
  }

  first(): First {
    return first(this)
  }

  isPresent(): IsPresent {
    return isPresent(this)
  }

  model(): Model {
    return model(this)
  }

  modelOf(): ModelOf {
    return modelOf(this)
  }

  not(): Not {
    return not(this)
  }

  presentOrZero(): PresentOrZero {
    return presentOrZero(this)
  }

  refTo(): RefTo {
    return refTo(this)
  }

  resolveAllRefs(): ResolveAllRefs {
    return resolveAllRefs(this)
  }

  reverseList(): ReverseList {
    return reverseList(this)
  }

  stringToLower(): StringToLower {
    return stringToLower(this)
  }

  tag(): Tag {
    return tag(this)
  }

  allReferrers(): AllReferrers {
    return allReferrers(this)
  }

  tagExists(): TagExists {
    return tagExists(this)
  }

  length(): Length {
    return length(this)
  }

  delete(): Delete {
    return delete_(this)
  }

  update(value: Expression): Update {
    return update(this, value)
  }

  memSort(f: (value: Scope) => Expression | Expression[]): MemSort {
    return memSort(this, f)
  }

  filterList(f: (index: Scope, value: Scope) => Expression | Expression[]): FilterList {
    return filterList(this, f)
  }

  and(...conditions: Expression[]): And {
    return and(this, ...conditions)
  }

  or(...conditions: Expression[]): Or {
    return or(this, ...conditions)
  }

  equal(other: Expression): Equal {
    return equal(this, other)
  }

  key(name: string | Expression): Key {
    return key(name, this)
  }

  field(name: string): Field {
    return field(name, this)
  }

  get(): Get {
    return get(this)
  }

  all(): All {
    return all(this)
  }

  mapList(f: (index: Scope, value: Scope) => Expression | Expression[]): MapList {
    return mapList(this, f)
  }

  metarialize(): Metarialize {
    return metarialize(this)
  }

  slice(offset: number | Expression, length: number | Expression): Slice {
    return slice(this, offset, length)
  }

  createMultiple(funcs: {
    [name: string]: ((f: Scope) => Expression | Expression[]) | Function
  }): CreateMultiple {
    return createMultiple(this, funcs)
  }

  abstract toValue(): val.Value
}

// start convenience constructors

export function memSortFunction(
  list: Expression,
  sort: (a: Scope, b: Scope) => Expression | Expression[]
): MemSortFunction {
  return new MemSortFunction(list, func(sort, 2))
}

export function concatLists(lhs: Expression, rhs: Expression): ConcatLists {
  return new ConcatLists(lhs, rhs)
}

export function inList(haystack: Expression, needle: Expression): InList {
  return new InList(haystack, needle)
}

export function reduceList(
  list: Expression,
  init: Expression,
  reducer: (a: Scope, b: Scope) => Expression | Expression[]
): ReduceList {
  return new ReduceList(list, init, func(reducer, 2))
}

export function rightFoldList(
  list: Expression,
  init: Expression,
  reducer: (a: Scope, b: Scope) => Expression | Expression[]
): RightFoldList {
  return new RightFoldList(list, init, func(reducer, 2))
}

export function leftFoldList(
  list: Expression,
  init: Expression,
  reducer: (a: Scope, b: Scope) => Expression | Expression[]
): LeftFoldList {
  return new LeftFoldList(list, init, func(reducer, 2))
}

export function referrers(ofValue: Expression, inModel: string | Expression): Referrers {
  if (typeof inModel === 'string') {
    inModel = model(inModel)
  }
  return new Referrers(ofValue, inModel)
}

export function referred(fromValue: Expression, inModel: string | Expression): Referred {
  if (typeof inModel === 'string') {
    inModel = model(inModel)
  }
  return new Referred(fromValue, inModel)
}

export function resolveRefs(arg: Expression, ...models: string[] | Expression[]): ResolveRefs {
  if (models.length > 0 && typeof models[0] === 'string') {
    models = (models as string[]).map(m => string(m))
  }
  return new ResolveRefs(arg, models as Expression[])
}

export function switchCase(
  arg: Expression,
  cases: {[caze: string]: (val: Scope) => Expression | Expression[]}
): SwitchCase {
  const mapped: {[caze: string]: Function} = {}
  Object.keys(cases).forEach(k => {
    mapped[k] = func(cases[k], 1)
  })
  return new SwitchCase(arg, mapped)
}

export function assertCase(caze: string, arg: Expression): AssertCase {
  return new AssertCase(caze, arg)
}

export function stringContains(haystack: Expression, needle: string | Expression): StringContains {
  if (typeof needle === 'string') {
    needle = string(needle)
  }
  return new StringContains(haystack, needle)
}

export function substringIndex(haystack: Expression, needle: string | Expression): SubstringIndex {
  if (typeof needle === 'string') {
    needle = string(needle)
  }
  return new SubstringIndex(haystack, needle)
}

export function joinStrings(strings: Expression, separator: string | Expression): JoinStrings {
  if (typeof separator === 'string') {
    separator = string(separator)
  }
  return new JoinStrings(strings, separator)
}

export function isCase(caze: string | Expression, arg: Expression): IsCase {
  if (typeof caze === 'string') {
    caze = string(caze)
  }
  return new IsCase(caze, arg)
}

export function setField(name: string, val: Expression, arg: Expression): SetField {
  return new SetField(name, val, arg)
}

export function mapMap(
  arg: Expression,
  f: (key: Scope, val: Scope) => Expression | Expression[]
): MapMap {
  return new MapMap(arg, func(f, 2))
}

export function mapSet(arg: Expression, f: (val: Scope) => Expression | Expression[]): MapSet {
  return new MapSet(arg, func(f, 1))
}

export function setKey(name: string, val: Expression, arg: Expression): SetKey {
  return new SetKey(name, val, arg)
}

export function indexTuple(idx: number, arg: Expression): IndexTuple {
  return new IndexTuple(idx, arg)
}

export function after(lhs: Expression, rhs: Expression): After {
  return new After(lhs, rhs)
}

export function before(lhs: Expression, rhs: Expression): Before {
  return new Before(lhs, rhs)
}

export function nil(): Null {
  return new Null()
}

export function define(name: string, arg: Expression): Define {
  return new Define(name, arg)
}

export function assertPresent(arg: Expression): AssertPresent {
  return new AssertPresent(arg)
}

export function extractStrings(arg: Expression): ExtractStrings {
  return new ExtractStrings(arg)
}

export function first(arg: Expression): First {
  return new First(arg)
}

export function isPresent(arg: Expression): IsPresent {
  return new IsPresent(arg)
}

export function modelOf(arg: Expression): ModelOf {
  return new ModelOf(arg)
}

export function not(arg: Expression): Not {
  return new Not(arg)
}

export function presentOrZero(arg: Expression): PresentOrZero {
  return new PresentOrZero(arg)
}

export function refTo(arg: Expression): RefTo {
  return new RefTo(arg)
}

export function resolveAllRefs(arg: Expression): ResolveAllRefs {
  return new ResolveAllRefs(arg)
}

export function reverseList(arg: Expression): ReverseList {
  return new ReverseList(arg)
}

export function stringToLower(arg: Expression): StringToLower {
  return new StringToLower(arg)
}

export function allReferrers(arg: Expression): AllReferrers {
  return new AllReferrers(arg)
}

export function tagExists(arg: string | Expression): TagExists {
  if (typeof arg === 'string') {
    arg = string(arg)
  }
  return new TagExists(arg)
}

export function zero(): Zero {
  return new Zero()
}

export function length(ref: Expression): Length {
  return new Length(ref)
}

// NOTE: "delete" is a reserved keyword
export function delete_(ref: Expression): Delete {
  return new Delete(ref)
}

export function update(ref: Expression, value: Expression): Update {
  return new Update(ref, value)
}

export function and(...conditions: Expression[]): And {
  return new And(conditions)
}

export function or(...conditions: Expression[]): Or {
  return new Or(conditions)
}

export function equal(first: Expression, second: Expression): Equal {
  return new Equal(first, second)
}

export function key(name: string | Expression, arg: Expression): Key {
  if (typeof name === 'string') {
    name = string(name)
  }
  return new Key(name, arg)
}

export function field(name: string, arg: Expression): Field {
  return new Field(name, arg)
}

export function get(arg: Expression): Get {
  return new Get(arg)
}

export function slice(
  arg: Expression,
  offset: number | Expression,
  length: number | Expression
): Slice {
  if (typeof offset === 'number') {
    offset = int64(offset)
  }
  if (typeof length === 'number') {
    length = int64(length)
  }
  return new Slice(arg, offset, length)
}

export function model(arg: string | Expression): Model {
  if (typeof arg === 'string') {
    arg = string(arg)
  }
  return new Model(arg)
}

export function metarialize(arg: Expression): Metarialize {
  return new Metarialize(arg)
}

export function tag(name: string | Expression): Tag {
  if (typeof name === 'string') {
    name = string(name)
  }
  return new Tag(name)
}

export function all(arg: Expression): All {
  return new All(arg)
}

export function scope(name: string): Scope {
  return new Scope(name)
}

export function mapList(
  value: Expression,
  mapping: (index: Scope, value: Scope) => Expression | Expression[]
): MapList {
  return new MapList(value, func(mapping, 2))
}

export function filterList(
  value: Expression,
  mapping: (index: Scope, value: Scope) => Expression | Expression[]
): FilterList {
  return new FilterList(value, func(mapping, 2))
}

export function memSort(
  value: Expression,
  mapping: (value: Scope) => Expression | Expression[]
): MemSort {
  return new MemSort(value, func(mapping, 1))
}

export function int64(int64: number): Int64 {
  return new Int64(int64)
}

export function string(string: string): String {
  return new String(string)
}

export function bool(bool: boolean): Bool {
  return new Bool(bool)
}

export function float(float: number): Float {
  return new Float(float)
}

export function int8(int8: number): Int8 {
  return new Int8(int8)
}

export function int16(int16: number): Int16 {
  return new Int16(int16)
}

export function int32(int32: number): Int32 {
  return new Int32(int32)
}

export function uint8(uint8: number): Uint8 {
  return new Uint8(uint8)
}

export function uint16(uint16: number): Uint16 {
  return new Uint16(uint16)
}

export function uint32(uint32: number): Uint32 {
  return new Uint32(uint32)
}

export function uint64(uint64: number): Uint64 {
  return new Uint64(uint64)
}

export function symbol(symbol: string): Symbol {
  return new Symbol(symbol)
}

export function toFloat(arg: Expression): ToFloat {
  return new ToFloat(arg)
}

export function toInt8(arg: Expression): ToInt8 {
  return new ToInt8(arg)
}

export function toInt16(arg: Expression): ToInt16 {
  return new ToInt16(arg)
}

export function toInt32(arg: Expression): ToInt32 {
  return new ToInt32(arg)
}

export function toInt64(arg: Expression): ToInt64 {
  return new ToInt64(arg)
}

export function toUint8(arg: Expression): ToUint8 {
  return new ToUint8(arg)
}

export function toUint16(arg: Expression): ToUint16 {
  return new ToUint16(arg)
}

export function toUint32(arg: Expression): ToUint32 {
  return new ToUint32(arg)
}

export function toUint64(arg: Expression): ToUint64 {
  return new ToUint64(arg)
}

export function addFloat(lhs: Expression, rhs: Expression): AddFloat {
  return new AddFloat(lhs, rhs)
}

export function addInt64(lhs: Expression, rhs: Expression): AddInt64 {
  return new AddInt64(lhs, rhs)
}

export function addInt32(lhs: Expression, rhs: Expression): AddInt32 {
  return new AddInt32(lhs, rhs)
}

export function addInt16(lhs: Expression, rhs: Expression): AddInt16 {
  return new AddInt16(lhs, rhs)
}

export function addInt8(lhs: Expression, rhs: Expression): AddInt8 {
  return new AddInt8(lhs, rhs)
}

export function addUint64(lhs: Expression, rhs: Expression): AddUint64 {
  return new AddUint64(lhs, rhs)
}

export function addUint32(lhs: Expression, rhs: Expression): AddUint32 {
  return new AddUint32(lhs, rhs)
}

export function addUint16(lhs: Expression, rhs: Expression): AddUint16 {
  return new AddUint16(lhs, rhs)
}

export function addUint8(lhs: Expression, rhs: Expression): AddUint8 {
  return new AddUint8(lhs, rhs)
}

export function subFloat(lhs: Expression, rhs: Expression): SubFloat {
  return new SubFloat(lhs, rhs)
}

export function subInt64(lhs: Expression, rhs: Expression): SubInt64 {
  return new SubInt64(lhs, rhs)
}

export function subInt32(lhs: Expression, rhs: Expression): SubInt32 {
  return new SubInt32(lhs, rhs)
}

export function subInt16(lhs: Expression, rhs: Expression): SubInt16 {
  return new SubInt16(lhs, rhs)
}

export function subInt8(lhs: Expression, rhs: Expression): SubInt8 {
  return new SubInt8(lhs, rhs)
}

export function subUint64(lhs: Expression, rhs: Expression): SubUint64 {
  return new SubUint64(lhs, rhs)
}

export function subUint32(lhs: Expression, rhs: Expression): SubUint32 {
  return new SubUint32(lhs, rhs)
}

export function subUint16(lhs: Expression, rhs: Expression): SubUint16 {
  return new SubUint16(lhs, rhs)
}

export function subUint8(lhs: Expression, rhs: Expression): SubUint8 {
  return new SubUint8(lhs, rhs)
}

export function divFloat(lhs: Expression, rhs: Expression): DivFloat {
  return new DivFloat(lhs, rhs)
}

export function divInt64(lhs: Expression, rhs: Expression): DivInt64 {
  return new DivInt64(lhs, rhs)
}

export function divInt32(lhs: Expression, rhs: Expression): DivInt32 {
  return new DivInt32(lhs, rhs)
}

export function divInt16(lhs: Expression, rhs: Expression): DivInt16 {
  return new DivInt16(lhs, rhs)
}

export function divInt8(lhs: Expression, rhs: Expression): DivInt8 {
  return new DivInt8(lhs, rhs)
}

export function divUint64(lhs: Expression, rhs: Expression): DivUint64 {
  return new DivUint64(lhs, rhs)
}

export function divUint32(lhs: Expression, rhs: Expression): DivUint32 {
  return new DivUint32(lhs, rhs)
}

export function divUint16(lhs: Expression, rhs: Expression): DivUint16 {
  return new DivUint16(lhs, rhs)
}

export function divUint8(lhs: Expression, rhs: Expression): DivUint8 {
  return new DivUint8(lhs, rhs)
}

export function mulFloat(lhs: Expression, rhs: Expression): MulFloat {
  return new MulFloat(lhs, rhs)
}

export function mulInt64(lhs: Expression, rhs: Expression): MulInt64 {
  return new MulInt64(lhs, rhs)
}

export function mulInt32(lhs: Expression, rhs: Expression): MulInt32 {
  return new MulInt32(lhs, rhs)
}

export function mulInt16(lhs: Expression, rhs: Expression): MulInt16 {
  return new MulInt16(lhs, rhs)
}

export function mulInt8(lhs: Expression, rhs: Expression): MulInt8 {
  return new MulInt8(lhs, rhs)
}

export function mulUint64(lhs: Expression, rhs: Expression): MulUint64 {
  return new MulUint64(lhs, rhs)
}

export function mulUint32(lhs: Expression, rhs: Expression): MulUint32 {
  return new MulUint32(lhs, rhs)
}

export function mulUint16(lhs: Expression, rhs: Expression): MulUint16 {
  return new MulUint16(lhs, rhs)
}

export function mulUint8(lhs: Expression, rhs: Expression): MulUint8 {
  return new MulUint8(lhs, rhs)
}

export function gtFloat(lhs: Expression, rhs: Expression): GtFloat {
  return new GtFloat(lhs, rhs)
}

export function gtInt64(lhs: Expression, rhs: Expression): GtInt64 {
  return new GtInt64(lhs, rhs)
}

export function gtInt32(lhs: Expression, rhs: Expression): GtInt32 {
  return new GtInt32(lhs, rhs)
}

export function gtInt16(lhs: Expression, rhs: Expression): GtInt16 {
  return new GtInt16(lhs, rhs)
}

export function gtInt8(lhs: Expression, rhs: Expression): GtInt8 {
  return new GtInt8(lhs, rhs)
}

export function gtUint64(lhs: Expression, rhs: Expression): GtUint64 {
  return new GtUint64(lhs, rhs)
}

export function gtUint32(lhs: Expression, rhs: Expression): GtUint32 {
  return new GtUint32(lhs, rhs)
}

export function gtUint16(lhs: Expression, rhs: Expression): GtUint16 {
  return new GtUint16(lhs, rhs)
}

export function gtUint8(lhs: Expression, rhs: Expression): GtUint8 {
  return new GtUint8(lhs, rhs)
}

export function ltFloat(lhs: Expression, rhs: Expression): LtFloat {
  return new LtFloat(lhs, rhs)
}

export function ltInt64(lhs: Expression, rhs: Expression): LtInt64 {
  return new LtInt64(lhs, rhs)
}

export function ltInt32(lhs: Expression, rhs: Expression): LtInt32 {
  return new LtInt32(lhs, rhs)
}

export function ltInt16(lhs: Expression, rhs: Expression): LtInt16 {
  return new LtInt16(lhs, rhs)
}

export function ltInt8(lhs: Expression, rhs: Expression): LtInt8 {
  return new LtInt8(lhs, rhs)
}

export function ltUint64(lhs: Expression, rhs: Expression): LtUint64 {
  return new LtUint64(lhs, rhs)
}

export function ltUint32(lhs: Expression, rhs: Expression): LtUint32 {
  return new LtUint32(lhs, rhs)
}

export function ltUint16(lhs: Expression, rhs: Expression): LtUint16 {
  return new LtUint16(lhs, rhs)
}

export function ltUint8(lhs: Expression, rhs: Expression): LtUint8 {
  return new LtUint8(lhs, rhs)
}

export function dateTimeNow(): DateTimeNow {
  return new DateTimeNow()
}

export function currentUser(): CurrentUser {
  return new CurrentUser()
}

type DataFunc = (context: DataContextClass) => DataConstructor
export function data(data: DataConstructor | DataFunc): Data {
  if (typeof data === 'function') return new Data(data(DataContext))
  return new Data(data)
}

export function createMultiple(
  model: Expression,
  funcs: ObjectMap<((f: Scope) => Expression | Expression[]) | Function>
): CreateMultiple {
  const fs: ObjectMap<Function> = mapObject(funcs, value =>
    typeof value === 'function' ? func(value, 1) : value
  )

  return new CreateMultiple(model, fs)
}

// NOTE: "with" is a reserved keyword
export function with_(arg: Expression, f: (arg: Scope) => Expression | Expression[]): With {
  return new With(arg, func(f, 1))
}

export function create(model: Expression, self: (arg: Scope) => Expression | Expression[]): Create {
  return new Create(model, func(self, 1))
}

export function if_(condition: Expression, then: Expression, else_: Expression): If {
  return new If(condition, then, else_)
}

export function matchRegex(
  arg: Expression,
  regex: string,
  caseInsensitive: boolean = false,
  multiLine: boolean = false
): MatchRegex {
  return new MatchRegex(arg, regex, caseInsensitive, multiLine)
}

export function searchRegex(
  arg: Expression,
  regex: string,
  caseInsensitive: boolean = false,
  multiLine: boolean = false
): SearchRegex {
  return new SearchRegex(arg, regex, caseInsensitive, multiLine)
}

export function searchAllRegex(
  arg: Expression,
  regex: string,
  caseInsensitive: boolean = false,
  multiLine: boolean = false
): SearchAllRegex {
  return new SearchAllRegex(arg, regex, caseInsensitive, multiLine)
}

export function assertModelRef(arg: Expression, model_: string | Expression): AssertModelRef {
  if (typeof model_ === 'string') {
    model_ = model(model_)
  }

  return new AssertModelRef(arg, model_)
}

export type ModelRefCaseArg = {match: Expression; return: (arg: Scope) => Expression | Expression[]}

export function switchModelRef(
  arg: Expression,
  default_: Expression,
  cases: ModelRefCaseArg[]
): SwitchModelRef {
  const mapped = cases.map(caze => {
    return Object.assign(caze, {return: func(caze.return, 1)})
  })

  return new SwitchModelRef(arg, default_, mapped)
}

export type GraphFlowArg = {from: Expression; forward: Expression[]; backward: Expression[]}

export function graphFlow(arg: Expression, flow: GraphFlowArg[]): GraphFlow {
  return new GraphFlow(arg, flow)
}

// end convenience constructors

export class AssertModelRef extends Expression {
  constructor(readonly arg: Expression, readonly model_: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'assertModelRef',
      val.struct({
        value: this.arg.toValue(),
        ref: this.model_.toValue()
      })
    )
  }
}

export type ModelRefCase = {match: Expression; return: Function}

export class SwitchModelRef extends Expression {
  constructor(
    readonly arg: Expression,
    readonly default_: Expression,
    readonly cases: ModelRefCase[]
  ) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'switchModelRef',
      val.struct({
        value: this.arg.toValue(),
        default: this.default_.toValue(),
        cases: val.set(
          this.cases.map(c =>
            val.struct({
              match: c.match.toValue(),
              return: c.return.toValue()
            })
          )
        )
      })
    )
  }
}

export class GraphFlow extends Expression {
  constructor(readonly arg: Expression, readonly flow: GraphFlowArg[]) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'graphFlow',
      val.struct({
        start: this.arg.toValue(),
        flow: val.set(
          this.flow.map(f =>
            val.struct({
              from: f.from.toValue(),
              forward: val.set(f.forward.map(f => f.toValue())),
              backward: val.set(f.backward.map(f => f.toValue()))
            })
          )
        )
      })
    )
  }
}

export class AssertPresent extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('assertPresent', this.arg.toValue())
  }
}

export class ExtractStrings extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('extractStrings', this.arg.toValue())
  }
}

export class First extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('first', this.arg.toValue())
  }
}

export class IsPresent extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('isPresent', this.arg.toValue())
  }
}

export class ModelOf extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('modelOf', this.arg.toValue())
  }
}

export class Not extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('not', this.arg.toValue())
  }
}

export class PresentOrZero extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('presentOrZero', this.arg.toValue())
  }
}

export class RefTo extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('refTo', this.arg.toValue())
  }
}

export class ResolveAllRefs extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('resolveAllRefs', this.arg.toValue())
  }
}

export class ReverseList extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('reverseList', this.arg.toValue())
  }
}

export class StringToLower extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('stringToLower', this.arg.toValue())
  }
}

export class AllReferrers extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('allReferrers', this.arg.toValue())
  }
}

export class TagExists extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('tagExists', this.arg.toValue())
  }
}

export class Zero extends Expression {
  toValue(): val.Value {
    return val.union('zero', val.struct({}))
  }
}

export class ToFloat extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('toFloat', this.arg.toValue())
  }
}

export class ToInt8 extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('toInt8', this.arg.toValue())
  }
}

export class ToInt16 extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('toInt16', this.arg.toValue())
  }
}

export class ToInt32 extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('toInt32', this.arg.toValue())
  }
}

export class ToInt64 extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('toInt64', this.arg.toValue())
  }
}

export class ToUint8 extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('toUint8', this.arg.toValue())
  }
}

export class ToUint16 extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('toUint16', this.arg.toValue())
  }
}

export class ToUint32 extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('toUint32', this.arg.toValue())
  }
}

export class ToUint64 extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('toUint64', this.arg.toValue())
  }
}

export class Length extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('length', this.arg.toValue())
  }
}

export class And extends Expression {
  constructor(readonly conditions: Expression[]) {
    super()
  }

  toValue(): val.Value {
    return val.union('and', val.list(this.conditions.map(c => c.toValue())))
  }
}

export class Or extends Expression {
  constructor(readonly conditions: Expression[]) {
    super()
  }

  toValue(): val.Value {
    return val.union('or', val.list(this.conditions.map(c => c.toValue())))
  }
}

export class Update extends Expression {
  constructor(readonly ref: Expression, readonly value: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'update',
      val.struct({
        ref: this.ref.toValue(),
        value: this.value.toValue()
      })
    )
  }
}

export class Equal extends Expression {
  constructor(readonly first_: Expression, readonly second: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('equal', val.tuple(this.first_.toValue(), this.second.toValue()))
  }
}

export class Create extends Expression {
  constructor(readonly model_: Expression, readonly f: Function) {
    super()
  }

  toValue(): val.Value {
    return val.union('create', val.tuple(this.model_.toValue(), this.f.toValue()))
  }
}

export class CreateMultiple extends Expression {
  constructor(readonly model_: Expression, readonly funcs: {[name: string]: Function}) {
    super()
  }

  toValue(): val.Value {
    const arg: {[name: string]: val.Value} = {}
    for (let k in this.funcs) {
      arg[k] = this.funcs[k].toValue()
    }
    return val.union('createMultiple', val.tuple(this.model_.toValue(), val.map(arg)))
  }
}

export class Slice extends Expression {
  constructor(
    readonly value: Expression,
    readonly offset: Expression,
    readonly length_: Expression
  ) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'slice',
      val.struct({
        value: this.value.toValue(),
        offset: this.offset.toValue(),
        length: this.length_.toValue()
      })
    )
  }
}

export class Key extends Expression {
  constructor(readonly name: Expression, readonly value: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('key', val.tuple(this.name.toValue(), this.value.toValue()))
  }
}

export class Field extends Expression {
  constructor(readonly name: string, readonly value: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('field', val.tuple(val.string(this.name), this.value.toValue()))
  }
}

export class Delete extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('delete', this.arg.toValue())
  }
}

export class Get extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('get', this.arg.toValue())
  }
}

export class Int64 extends Expression {
  constructor(readonly int64: number) {
    super()
  }

  toValue(): val.Value {
    return val.union('int64', val.int64(this.int64))
  }
}

export class Model extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('model', this.arg.toValue())
  }
}

export class Metarialize extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('metarialize', this.arg.toValue())
  }
}

export class Define extends Expression {
  constructor(readonly name: string, readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('define', val.tuple(val.string(this.name), this.arg.toValue()))
  }
}

export class MapList extends Expression {
  constructor(readonly value: Expression, readonly mapping: Function) {
    super()
  }

  toValue(): val.Value {
    return val.union('mapList', val.tuple(this.value.toValue(), this.mapping.toValue()))
  }
}

export class FilterList extends Expression {
  constructor(readonly value: Expression, readonly filter: Function) {
    super()
  }

  toValue(): val.Value {
    return val.union('filterList', val.tuple(this.value.toValue(), this.filter.toValue()))
  }
}

export class MemSort extends Expression {
  constructor(readonly value: Expression, readonly less: Function) {
    super()
  }

  toValue(): val.Value {
    return val.union('memSort', val.tuple(this.value.toValue(), this.less.toValue()))
  }
}

export class Scope extends Expression {
  constructor(readonly name: string) {
    super()
  }

  toValue(): val.Value {
    return val.union('scope', val.string(this.name))
  }
}

export class Float extends Expression {
  constructor(readonly float: number) {
    super()
  }

  toValue(): val.Value {
    return val.union('float', val.float(this.float))
  }
}

export class Int8 extends Expression {
  constructor(readonly int8: number) {
    super()
  }

  toValue(): val.Value {
    return val.union('int8', val.int8(this.int8))
  }
}

export class Int16 extends Expression {
  constructor(readonly int16: number) {
    super()
  }

  toValue(): val.Value {
    return val.union('int16', val.int16(this.int16))
  }
}

export class Int32 extends Expression {
  constructor(readonly int32: number) {
    super()
  }

  toValue(): val.Value {
    return val.union('int32', val.int32(this.int32))
  }
}

export class Uint8 extends Expression {
  constructor(readonly uint8: number) {
    super()
  }

  toValue(): val.Value {
    return val.union('uint8', val.uint8(this.uint8))
  }
}

export class Uint16 extends Expression {
  constructor(readonly uint16: number) {
    super()
  }

  toValue(): val.Value {
    return val.union('uint16', val.uint16(this.uint16))
  }
}

export class Uint32 extends Expression {
  constructor(readonly uint32: number) {
    super()
  }

  toValue(): val.Value {
    return val.union('uint32', val.uint32(this.uint32))
  }
}

export class Uint64 extends Expression {
  constructor(readonly uint32: number) {
    super()
  }

  toValue(): val.Value {
    return val.union('uint64', val.uint32(this.uint32))
  }
}

export class Symbol extends Expression {
  constructor(readonly symbol: string) {
    super()
  }

  toValue(): val.Value {
    return val.union('symbol', val.string(this.symbol))
  }
}

export class String extends Expression {
  constructor(readonly string: string) {
    super()
  }

  toValue(): val.Value {
    return val.union('string', val.string(this.string))
  }
}

export class Tag extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('tag', this.arg.toValue())
  }
}

export class All extends Expression {
  constructor(readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('all', this.arg.toValue())
  }
}

export class Data extends Expression {
  constructor(readonly data: DataConstructor) {
    super()
  }

  toValue(): val.Value {
    return val.union('data', this.data.toValue())
  }
}

export class AddFloat extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('addFloat', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class AddInt64 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('addInt64', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class AddInt32 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('addInt32', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class AddInt16 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('addInt16', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class AddInt8 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('addInt8', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class AddUint64 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('addUint64', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class AddUint32 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('addUint32', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class AddUint16 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('addUint16', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class AddUint8 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('addUint8', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class SubFloat extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('subFloat', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class SubInt64 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('subInt64', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class SubInt32 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('subInt32', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class SubInt16 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('subInt16', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class SubInt8 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('subInt8', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class SubUint64 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('subUint64', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class SubUint32 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('subUint32', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class SubUint16 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('subUint16', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class SubUint8 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('subUint8', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class DivFloat extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('divFloat', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class DivInt64 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('divInt64', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class DivInt32 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('divInt32', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class DivInt16 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('divInt16', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class DivInt8 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('divInt8', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class DivUint64 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('divUint64', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class DivUint32 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('divUint32', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class DivUint16 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('divUint16', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class DivUint8 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('divUint8', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class MulFloat extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('mulFloat', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class MulInt64 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('mulInt64', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class MulInt32 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('mulInt32', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class MulInt16 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('mulInt16', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class MulInt8 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('mulInt8', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class MulUint64 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('mulUint64', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class MulUint32 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('mulUint32', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class MulUint16 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('mulUint16', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class MulUint8 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('mulUint8', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class GtFloat extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('gtFloat', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class GtInt64 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('gtInt64', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class GtInt32 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('gtInt32', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class GtInt16 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('gtInt16', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class GtInt8 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('gtInt8', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class GtUint64 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('gtUint64', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class GtUint32 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('gtUint32', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class GtUint16 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('gtUint16', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class GtUint8 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('gtUint8', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class LtFloat extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('ltFloat', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class LtInt64 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('ltInt64', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class LtInt32 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('ltInt32', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class LtInt16 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('ltInt16', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class LtInt8 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('ltInt8', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class LtUint64 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('ltUint64', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class LtUint32 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('ltUint32', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class LtUint16 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('ltUint16', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class LtUint8 extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('ltUint8', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class With extends Expression {
  constructor(readonly arg: Expression, readonly func: Function) {
    super()
  }

  toValue(): val.Value {
    return val.union('with', val.tuple(this.arg.toValue(), this.func.toValue()))
  }
}

export class DateTimeNow extends Expression {
  toValue(): val.Value {
    return val.union('dateTimeNow', val.struct({}))
  }
}

export class CurrentUser extends Expression {
  toValue(): val.Value {
    return val.union('currentUser', val.struct({}))
  }
}

export class If extends Expression {
  readonly else: Expression
  constructor(
    readonly condition: Expression,
    readonly then: Expression,
    elze: Expression // "else" disallowed here
  ) {
    super()
    this.else = elze
  }

  toValue(): val.Value {
    return val.union(
      'if',
      val.struct({
        condition: this.condition.toValue(),
        then: this.then.toValue(),
        else: this.else.toValue()
      })
    )
  }
}

export class MemSortFunction extends Expression {
  constructor(readonly arg: Expression, readonly sort: Function) {
    super()
  }

  toValue(): val.Value {
    return val.union('memSortFunction', val.tuple(this.arg.toValue(), this.sort.toValue()))
  }
}

export class ConcatLists extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('concatLists', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class InList extends Expression {
  constructor(readonly haystack: Expression, readonly needle: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'inList',
      val.struct({
        value: this.needle.toValue(),
        in: this.haystack.toValue()
      })
    )
  }
}

export class ReduceList extends Expression {
  constructor(readonly list: Expression, readonly init: Expression, readonly reduce: Function) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'reduceList',
      val.struct({
        value: this.list.toValue(),
        initial: this.init.toValue(),
        reducer: this.reduce.toValue()
      })
    )
  }
}

export class RightFoldList extends Expression {
  constructor(readonly list: Expression, readonly init: Expression, readonly reduce: Function) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'rightFoldList',
      val.tuple(this.list.toValue(), this.init.toValue(), this.reduce.toValue())
    )
  }
}

export class LeftFoldList extends Expression {
  constructor(readonly list: Expression, readonly init: Expression, readonly reduce: Function) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'leftFoldList',
      val.tuple(this.list.toValue(), this.init.toValue(), this.reduce.toValue())
    )
  }
}

export class Referrers extends Expression {
  constructor(readonly of_: Expression, readonly in_: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'referrers',
      val.struct({
        of: this.of_.toValue(),
        in: this.in_.toValue()
      })
    )
  }
}

export class Referred extends Expression {
  constructor(readonly from: Expression, readonly in_: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'referred',
      val.struct({
        from: this.from.toValue(),
        in: this.in_.toValue()
      })
    )
  }
}

export class ResolveRefs extends Expression {
  constructor(readonly arg: Expression, readonly models: Expression[]) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'resolveRefs',
      val.tuple(this.arg.toValue(), val.set(this.models.map(m => m.toValue())))
    )
  }
}

export class SwitchCase extends Expression {
  constructor(readonly arg: Expression, readonly cases: {[caze: string]: Function}) {
    super()
  }

  toValue(): val.Value {
    const mapped: {[caze: string]: val.Value} = {}
    Object.keys(this.cases).forEach(k => {
      mapped[k] = this.cases[k].toValue()
    })
    return val.union('switchCase', val.tuple(this.arg.toValue(), val.map(mapped)))
  }
}

export class AssertCase extends Expression {
  readonly case: string
  constructor(caze: string, readonly arg: Expression) {
    super()
    this.case = caze
  }

  toValue(): val.Value {
    return val.union(
      'assertCase',
      val.struct({
        case: val.string(this.case),
        value: this.arg.toValue()
      })
    )
  }
}

export class StringContains extends Expression {
  constructor(readonly haystack: Expression, readonly needle: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('stringContains', val.tuple(this.haystack.toValue(), this.needle.toValue()))
  }
}

export class SubstringIndex extends Expression {
  constructor(readonly haystack: Expression, readonly needle: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('substringIndex', val.tuple(this.haystack.toValue(), this.needle.toValue()))
  }
}

export class JoinStrings extends Expression {
  constructor(readonly strings: Expression, readonly separator: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'joinStrings',
      val.struct({
        strings: this.strings.toValue(),
        separator: this.separator.toValue()
      })
    )
  }
}

export class IsCase extends Expression {
  readonly case: Expression
  constructor(caze: Expression, readonly arg: Expression) {
    super()
    this.case = caze
  }

  toValue(): val.Value {
    return val.union(
      'isCase',
      val.struct({
        case: this.case.toValue(),
        value: this.arg.toValue()
      })
    )
  }
}

export class SetField extends Expression {
  constructor(readonly name: string, readonly value: Expression, readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'setField',
      val.struct({
        name: val.string(this.name),
        value: this.value.toValue(),
        in: this.arg.toValue()
      })
    )
  }
}

export class MapMap extends Expression {
  constructor(readonly arg: Expression, readonly mapping: Function) {
    super()
  }

  toValue(): val.Value {
    return val.union('mapMap', val.tuple(this.arg.toValue(), this.mapping.toValue()))
  }
}

export class MapSet extends Expression {
  constructor(readonly arg: Expression, readonly mapping: Function) {
    super()
  }

  toValue(): val.Value {
    return val.union('mapSet', val.tuple(this.arg.toValue(), this.mapping.toValue()))
  }
}

export class SetKey extends Expression {
  constructor(readonly name: string, readonly value: Expression, readonly arg: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'setKey',
      val.struct({
        name: val.string(this.name),
        value: this.value.toValue(),
        in: this.arg.toValue()
      })
    )
  }
}

export class IndexTuple extends Expression {
  constructor(readonly index: number, readonly tuple: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('indexTuple', val.tuple(this.tuple.toValue(), val.int64(this.index)))
  }
}

export class After extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('after', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class Before extends Expression {
  constructor(readonly lhs: Expression, readonly rhs: Expression) {
    super()
  }

  toValue(): val.Value {
    return val.union('before', val.tuple(this.lhs.toValue(), this.rhs.toValue()))
  }
}

export class Bool extends Expression {
  constructor(readonly bool: boolean) {
    super()
  }

  toValue(): val.Value {
    return val.union('bool', val.bool(this.bool))
  }
}

export class Null extends Expression {
  constructor() {
    super()
  }

  toValue(): val.Value {
    return val.union('null', val.nil)
  }
}

// start data constructors

export class DataContext {
  static null(): NullConstructor {
    return new NullConstructor()
  }

  static bool(bool: boolean): BoolConstructor {
    return new BoolConstructor(bool)
  }

  static dateTime(dateTime: Date): DateTimeConstructor {
    return new DateTimeConstructor(dateTime)
  }

  static string(string: string): StringConstructor {
    return new StringConstructor(string)
  }

  static float(float: number): FloatConstructor {
    return new FloatConstructor(float)
  }

  static int8(int8: number): Int8Constructor {
    return new Int8Constructor(int8)
  }

  static int16(int16: number): Int16Constructor {
    return new Int16Constructor(int16)
  }

  static int32(int32: number): Int32Constructor {
    return new Int32Constructor(int32)
  }

  static int64(int64: number): Int64Constructor {
    return new Int64Constructor(int64)
  }

  static uint8(uint8: number): Uint8Constructor {
    return new Uint8Constructor(uint8)
  }

  static uint16(uint16: number): Uint16Constructor {
    return new Uint16Constructor(uint16)
  }

  static uint32(uint32: number): Uint32Constructor {
    return new Uint32Constructor(uint32)
  }

  static uint64(uint64: number): Uint64Constructor {
    return new Uint64Constructor(uint64)
  }

  static symbol(symbol: string): SymbolConstructor {
    return new SymbolConstructor(symbol)
  }

  static ref(model: string, id: string): RefConstructor
  static ref(ref: [string, string]): RefConstructor
  static ref(model: string[] | string, id?: string): RefConstructor {
    if (Array.isArray(model)) return new RefConstructor(model[0], model[1])
    return new RefConstructor(model, id!)
  }

  static map(map: {[keys: string]: DataConstructor}): MapConstructor {
    return new MapConstructor(map)
  }

  static struct(struct: {[keys: string]: DataConstructor}): StructConstructor {
    return new StructConstructor(struct)
  }

  static list(list: DataConstructor[]): ListConstructor {
    return new ListConstructor(list)
  }

  static set(set: DataConstructor[]): SetConstructor {
    return new SetConstructor(set)
  }

  static tuple(...tuple: DataConstructor[]): TupleConstructor {
    return new TupleConstructor(tuple)
  }

  static union(caze: string, value: DataConstructor): UnionConstructor {
    return new UnionConstructor(caze, value)
  }

  static expr(expr: Expression): ExprConstructor {
    return new ExprConstructor(expr)
  }
}

export type DataContextClass = typeof DataContext

export interface DataConstructor {
  toValue(): val.Value
  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor
}

export class NullConstructor implements DataConstructor {
  toValue(): val.Value {
    return val.union('null', val.nil)
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class BoolConstructor implements DataConstructor {
  constructor(readonly bool: boolean) {}

  toValue(): val.Value {
    return val.union('bool', val.bool(this.bool))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class DateTimeConstructor implements DataConstructor {
  constructor(readonly dateTime: Date) {}

  toValue(): val.Value {
    return val.union('dateTime', val.dateTime(this.dateTime))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class StringConstructor implements DataConstructor {
  constructor(readonly string: string) {}

  toValue(): val.Value {
    return val.union('string', val.string(this.string))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class FloatConstructor implements DataConstructor {
  constructor(readonly float: number) {}

  toValue(): val.Value {
    return val.union('float', val.float(this.float))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class Int8Constructor implements DataConstructor {
  constructor(readonly int8: number) {}

  toValue(): val.Value {
    return val.union('int8', val.int8(this.int8))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class Int16Constructor implements DataConstructor {
  constructor(readonly int16: number) {}

  toValue(): val.Value {
    return val.union('int16', val.int16(this.int16))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class Int32Constructor implements DataConstructor {
  constructor(readonly int32: number) {}

  toValue(): val.Value {
    return val.union('int32', val.int32(this.int32))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class Int64Constructor implements DataConstructor {
  constructor(readonly int64: number) {}

  toValue(): val.Value {
    return val.union('int64', val.int64(this.int64))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class Uint8Constructor implements DataConstructor {
  constructor(readonly uint8: number) {}

  toValue(): val.Value {
    return val.union('uint8', val.uint8(this.uint8))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class Uint16Constructor implements DataConstructor {
  constructor(readonly uint16: number) {}

  toValue(): val.Value {
    return val.union('uint16', val.uint16(this.uint16))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class Uint32Constructor implements DataConstructor {
  constructor(readonly uint32: number) {}

  toValue(): val.Value {
    return val.union('uint32', val.uint32(this.uint32))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class Uint64Constructor implements DataConstructor {
  constructor(readonly uint64: number) {}

  toValue(): val.Value {
    return val.union('uint64', val.uint64(this.uint64))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class SymbolConstructor implements DataConstructor {
  constructor(readonly symbol: string) {}

  toValue(): val.Value {
    return val.union('symbol', val.symbol(this.symbol))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class MapConstructor implements DataConstructor {
  constructor(readonly map: {[keys: string]: DataConstructor}) {}

  toValue(): val.Value {
    let arg: {[keys: string]: val.Value} = {}
    for (let k in this.map) {
      arg[k] = this.map[k].toValue()
    }
    return val.union('map', val.map(arg))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    const mapped: {[keys: string]: DataConstructor} = {}
    Object.keys(this.map).forEach(k => {
      mapped[k] = this.map[k].transform(f)
    })
    return f(new MapConstructor(mapped))
  }
}

export class ListConstructor implements DataConstructor {
  constructor(readonly list: DataConstructor[]) {}

  toValue(): val.Value {
    return val.union('list', val.list(this.list.map(c => c.toValue())))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(new ListConstructor(this.list.map(v => v.transform(f))))
  }
}

export class SetConstructor implements DataConstructor {
  constructor(readonly set: DataConstructor[]) {}

  toValue(): val.Value {
    return val.union('set', val.set(this.set.map(c => c.toValue())))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(new SetConstructor(this.set.map(v => v.transform(f))))
  }
}

export class StructConstructor implements DataConstructor {
  constructor(readonly struct: {[fields: string]: DataConstructor}) {}

  toValue(): val.Value {
    let arg: {[fields: string]: val.Value} = {}
    for (let k in this.struct) {
      arg[k] = this.struct[k].toValue()
    }
    return val.union('struct', val.map(arg))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    const mapped: {[keys: string]: DataConstructor} = {}
    Object.keys(this.struct).forEach(k => {
      mapped[k] = this.struct[k].transform(f)
    })
    return f(new StructConstructor(mapped))
  }
}

export class TupleConstructor implements DataConstructor {
  constructor(readonly tuple: DataConstructor[]) {}

  toValue(): val.Value {
    return val.union('tuple', val.list(this.tuple.map(c => c.toValue())))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(new TupleConstructor(this.tuple.map(v => v.transform(f))))
  }
}

export class UnionConstructor implements DataConstructor {
  readonly case: string
  constructor(caze: string, readonly value: DataConstructor) {
    this.case = caze
  }

  toValue(): val.Value {
    return val.union('union', val.tuple(val.string(this.case), this.value.toValue()))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(new UnionConstructor(this.case, this.value.transform(f)))
  }
}

export class RefConstructor implements DataConstructor {
  constructor(readonly model: string, readonly id: string) {}

  toValue(): val.Value {
    return val.union('ref', val.tuple(val.string(this.model), val.string(this.id)))
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class ExprConstructor implements DataConstructor {
  constructor(readonly expression: Expression) {}

  toValue(): val.Value {
    return val.union('expr', this.expression.toValue())
  }

  transform(f: (c: DataConstructor) => DataConstructor): DataConstructor {
    return f(this)
  }
}

export class MatchRegex extends Expression {
  constructor(
    readonly arg: Expression,
    readonly regex: string,
    readonly caseInsensitive: boolean,
    readonly multiLine: boolean
  ) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'matchRegex',
      val.struct({
        value: this.arg.toValue(),
        regex: val.string(this.regex),
        caseInsensitive: val.bool(this.caseInsensitive),
        multiLine: val.bool(this.caseInsensitive)
      })
    )
  }
}

export class SearchRegex extends Expression {
  constructor(
    readonly arg: Expression,
    readonly regex: string,
    readonly caseInsensitive: boolean,
    readonly multiLine: boolean
  ) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'searchRegex',
      val.struct({
        value: this.arg.toValue(),
        regex: val.string(this.regex),
        caseInsensitive: val.bool(this.caseInsensitive),
        multiLine: val.bool(this.caseInsensitive)
      })
    )
  }
}

export class SearchAllRegex extends Expression {
  constructor(
    readonly arg: Expression,
    readonly regex: string,
    readonly caseInsensitive: boolean,
    readonly multiLine: boolean
  ) {
    super()
  }

  toValue(): val.Value {
    return val.union(
      'searchAllRegex',
      val.struct({
        value: this.arg.toValue(),
        regex: val.string(this.regex),
        caseInsensitive: val.bool(this.caseInsensitive),
        multiLine: val.bool(this.multiLine)
      })
    )
  }
}
