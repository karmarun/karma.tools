import * as val from './value'
import * as xpr from './expression'

export abstract class Model {
  abstract concrete(): Model
  abstract decode(json: any): val.Value
  abstract toValue(recursions?: {[key: string]: Recursion}): val.Value
  abstract transform(f: (model: Model) => Model): Model

  toDataConstructor(mapMarkers?: {[key: string]: xpr.Expression}): xpr.DataConstructor {
    return this.toValue().toDataConstructor(mapMarkers)
  }
}

// start convenience constructors

export function struct(fields: {[field: string]: Model}): Struct {
  return new Struct(fields)
}

export function union(cases: {[key: string]: Model}): Union {
  return new Union(cases)
}

export function set(model: Model): Set {
  return new Set(model)
}

export function map(model: Model): Map {
  return new Map(model)
}

export function list(model: Model): List {
  return new List(model)
}

export function ref(model: [string, string]): Ref {
  return new Ref(model)
}

export function tagRef(tag: string): TagRef {
  return new TagRef(tag)
}

export function dynamicRef(label: string): DynamicgRef {
  return new DynamicgRef(label)
}

export function unique(model: Model): Unique {
  return new Unique(model)
}

export function optional(model: Model): Optional {
  return new Optional(model)
}

export function annotation(string: string, model: Model): Annotation {
  return new Annotation(string, model)
}

export function tuple(...models: Model[]): Tuple {
  return new Tuple(models)
}

// end convenience constructors

export function fromValue(value: val.Union, recursions: {[key: string]: Recursion} = {}): Model {
  switch (value.case) {
    case 'recursive': {
      const arg = value.value as val.Struct<{top: val.String; models: val.Map<val.Value>}>
      const top = arg.field('top').string
      const models = arg.field('models').map
      if (!(top in models)) {
        throw new Error(`recursive: top label ${JSON.stringify(top)} not in models`)
      }
      for (const label in models) {
        if (label in recursions) {
          throw new Error(`ambiguous recursion label ${JSON.stringify(label)} already defined`)
        }
        recursions[label] = new Recursion(label)
      }
      for (const label in models) {
        recursions[label].model = fromValue(models[label] as val.Union, recursions)
      }
      const ret = recursions[top]
      for (const label in models) {
        delete recursions[label]
      }
      return ret
    }

    case 'recursion': {
      let arg = value.value as val.Struct<{label: val.String; model: val.Value}>
      let label = arg.field('label').string
      if (label in recursions) {
        throw new Error(`ambiguous recursion label ${JSON.stringify(label)} already defined`)
      }
      let recursion = new Recursion(label)
      recursions[label] = recursion
      recursion.model = fromValue(arg.field('model') as val.Union, recursions)
      delete recursions[label]
      return recursion
    }

    case 'recurse': {
      let label = (value.value as val.String).string
      if (!(label in recursions)) {
        throw new Error(`undefined recursion label ${label}`)
      }
      return recursions[label]
    }

    case 'annotation': {
      let arg = value.value as val.Struct<{value: val.String; model: val.Value}>
      return new Annotation(
        arg.field('value').string,
        fromValue(arg.field('model') as val.Union, recursions)
      )
    }

    case 'enum':
      return new Enum((value.value as val.List<val.String>).list.map(s => s.string))

    case 'set':
      return new Set(fromValue(value.value as val.Union, recursions))

    case 'list':
      return new List(fromValue(value.value as val.Union, recursions))

    case 'map':
      return new Map(fromValue(value.value as val.Union, recursions))

    case 'tuple': {
      return new Tuple(
        (value.value as val.List<val.Value>).list.map(v => fromValue(v as val.Union, recursions))
      )
    }

    case 'struct': {
      let arg = value.value as val.Map<val.Value>
      let children: {[field: string]: Model} = {}
      for (let k in arg.map) {
        children[k] = fromValue(arg.map[k] as val.Union, recursions)
      }
      return new Struct(children)
    }

    case 'union': {
      let arg = value.value as val.Map<val.Value>
      let children: {[key: string]: Model} = {}
      for (let k in arg.map) {
        children[k] = fromValue(arg.map[k] as val.Union, recursions)
      }
      return new Union(children)
    }

    case 'optional':
      return new Optional(fromValue(value.value as val.Union, recursions))

    case 'unique':
      return new Unique(fromValue(value.value as val.Union, recursions))
    case 'any':
      return new Any()
    case 'ref':
      return new Ref([(value.value as val.Ref).model, (value.value as val.Ref).id])
    case 'float':
      return new Float()
    case 'int8':
      return new Int8()
    case 'int16':
      return new Int16()
    case 'int32':
      return new Int32()
    case 'int64':
      return new Int64()
    case 'uint8':
      return new Uint8()
    case 'uint16':
      return new Uint16()
    case 'uint32':
      return new Uint32()
    case 'uint64':
      return new Uint64()
    case 'string':
      return new String()
    case 'dateTime':
      return new DateTime()
    case 'bool':
      return new Bool()
    case 'null':
      return new Null()
  }
  throw new Error(`undefined model constructor ${JSON.stringify(value.case)}`)
}

export class Recursion extends Model {
  public model: Model | undefined = undefined
  constructor(readonly label: string) {
    super()
  }
  concrete(): Model {
    if (this.model === undefined) {
      throw new Error('incomplete Recursion') // probably a problem in fromValue()
    }
    return this.model
  }
  decode(json: any): val.Value {
    if (this.model === undefined) {
      throw new Error('incomplete Recursion') // probably a problem in fromValue()
    }
    return this.model.decode(json)
  }
  toValue(recursions: {[key: string]: Recursion} = {}): val.Value {
    if (this.model === undefined) {
      throw new Error('incomplete Recursion') // probably a problem in fromValue()
    }
    if (recursions === undefined) {
      recursions = {}
    }
    if (this.label in recursions) {
      return val.union('recurse', val.string(this.label))
    }
    recursions[this.label] = this
    let result = val.union(
      'recursion',
      val.struct({
        label: val.string(this.label),
        model: this.model.toValue(recursions)
      })
    )
    delete recursions[this.label]
    return result
  }
  private transformation: Recursion | undefined = undefined
  transform(f: (model: Model) => Model): Model {
    if (this.model === undefined) {
      throw new Error('incomplete Recursion') // probably a problem in fromValue()
    }
    if (this.transformation !== undefined) {
      return this.transformation
    }
    this.transformation = new Recursion(this.label)
    this.transformation.model = this.model.transform(f)
    const out = this.transformation
    this.transformation = undefined
    return f(out)
  }
}

export class Annotation extends Model {
  constructor(readonly value: string, readonly model: Model) {
    super()
  }
  concrete(): Model {
    return this.model
  }
  decode(json: any): val.Value {
    return this.model.decode(json)
  }
  toValue(recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union(
      'annotation',
      val.struct({
        value: val.string(this.value),
        model: this.model.toValue(recursions)
      })
    )
  }
  transform(f: (model: Model) => Model): Model {
    return f(new Annotation(this.value, this.model.transform(f)))
  }
}

export class Optional extends Model {
  constructor(readonly model: Model) {
    super()
  }
  concrete(): Model {
    return this // NOTE: not this.model
  }
  decode(json: any): val.Value {
    if (json == null) {
      return val.nil
    }
    return this.model.decode(json)
  }
  toValue(recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('optional', this.model.toValue(recursions))
  }
  transform(f: (model: Model) => Model): Model {
    return f(new Optional(this.model.transform(f)))
  }
}

export class Unique extends Model {
  constructor(readonly model: Model) {
    super()
  }
  concrete(): Model {
    return this.model
  }
  decode(json: any): val.Value {
    return this.model.decode(json)
  }
  toValue(recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('unique', this.model.toValue(recursions))
  }
  transform(f: (model: Model) => Model): Model {
    return f(new Unique(this.model.transform(f)))
  }
}

export class Tuple extends Model {
  constructor(readonly elements: Model[]) {
    super()
  }
  concrete(): Model {
    return this
  }
  decode(json: any): val.Tuple {
    if (!Array.isArray(json)) {
      throw new Error(`expected array, got ${typeof json}`)
    }
    if (json.length !== this.elements.length) {
      throw new Error(`tuple length mismatch, want ${this.elements.length}, got ${json.length}`)
    }
    let decoded = json.map((o, i) => this.elements[i].decode(o))
    return val.tuple(...decoded)
  }
  toValue(recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('tuple', val.list(this.elements.map(m => m.toValue(recursions))))
  }
  transform(f: (model: Model) => Model): Model {
    return f(new Tuple(this.elements.map(m => m.transform(f))))
  }
}
export class List extends Model {
  constructor(readonly elements: Model) {
    super()
  }
  concrete(): Model {
    return this
  }
  decode(json: any): val.List {
    if (!Array.isArray(json)) {
      throw new Error(`expected array, got ${typeof json}`)
    }
    return val.list(json.map(o => this.elements.decode(o)))
  }
  toValue(recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('list', this.elements.toValue(recursions))
  }
  transform(f: (model: Model) => Model): Model {
    return f(new List(this.elements.transform(f)))
  }
}
export class Union extends Model {
  constructor(readonly cases: {[key: string]: Model}) {
    super()
  }
  concrete(): Model {
    return this
  }
  decode(json: any): val.Union {
    if (typeof json !== 'object') {
      throw new Error(`expected object, got ${typeof json}`)
    }
    let keys = Object.keys(json)
    if (keys.length !== 1) {
      throw new Error(`expected object with single key, have ${JSON.stringify(json)}`)
    }
    let caze = keys[0]
    if (!(caze in this.cases)) {
      throw new Error(
        `case ${JSON.stringify(caze)} not defined, expected one of ${JSON.stringify(
          Object.keys(this.cases)
        )}`
      )
    }
    return val.union(caze, this.cases[caze].decode(json[caze]))
  }
  toValue(recursions: {[key: string]: Recursion} = {}): val.Value {
    let cases: {[key: string]: val.Value} = {}
    for (let k in this.cases) {
      cases[k] = this.cases[k].toValue(recursions)
    }
    return val.union('union', val.map(cases))
  }
  transform(f: (model: Model) => Model): Model {
    const mapped: {[key: string]: Model} = {}
    Object.keys(this.cases).forEach(k => {
      mapped[k] = this.cases[k].transform(f)
    })
    return f(new Union(mapped))
  }
}

export class Any extends Model {
  concrete(): Model {
    return this
  }
  decode(_json: any): never {
    throw new Error(`can't decode JSON with 'any' model`)
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('any', val.struct({}))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class Struct extends Model {
  constructor(readonly fields: {[key: string]: Model}) {
    super()
  }
  concrete(): Model {
    return this
  }
  decode(json: any): val.Struct {
    if (typeof json !== 'object') {
      throw new Error(`expected object, got ${typeof json}`)
    }
    let keys = Object.keys(json)
    let decoded: {[key: string]: val.Value} = {}
    keys.forEach(k => {
      if (!(k in this.fields)) {
        throw new Error(
          `undefined key ${JSON.stringify(k)}, expected one of ${JSON.stringify(
            Object.keys(this.fields)
          )}`
        )
      }
      decoded[k] = this.fields[k].decode(json[k])
      return true
    })
    Object.keys(this.fields).forEach(k => {
      if (!(k in decoded)) {
        if (
          this.fields[k].concrete() instanceof Optional ||
          this.fields[k].concrete() instanceof Null
        ) {
          decoded[k] = val.nil
          return true // we admit the elision of optional keys
        }
        throw new Error(
          `missing key ${JSON.stringify(k)}, expected all of ${JSON.stringify(
            Object.keys(this.fields)
          )} (eliding optionals is permitted)`
        )
      }
      return true
    })
    return val.struct(decoded)
  }
  toValue(recursions: {[key: string]: Recursion} = {}): val.Value {
    let fields: {[key: string]: val.Value} = {}
    for (let k in this.fields) {
      fields[k] = this.fields[k].toValue(recursions)
    }
    return val.union('struct', val.map(fields))
  }
  transform(f: (model: Model) => Model): Model {
    const mapped: {[key: string]: Model} = {}
    Object.keys(this.fields).forEach(k => {
      mapped[k] = this.fields[k].transform(f)
    })
    return f(new Struct(mapped))
  }
}

export class Map extends Model {
  constructor(readonly elements: Model) {
    super()
  }
  concrete(): Model {
    return this
  }
  decode(json: any): val.Map {
    if (typeof json !== 'object') {
      throw new Error(`expected object, got ${typeof json}`)
    }
    let keys = Object.keys(json)
    let decoded: {[key: string]: val.Value} = {}
    keys.forEach(k => {
      decoded[k] = this.elements.decode(json[k])
    })
    return val.map(decoded)
  }
  toValue(recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('map', this.elements.toValue(recursions))
  }
  transform(f: (model: Model) => Model): Model {
    return f(new Map(this.elements.transform(f)))
  }
}

export class Float extends Model {
  concrete(): Model {
    return this
  }
  decode(json: any): val.Float {
    if (typeof json !== 'number') {
      throw new Error(`expected number, got ${typeof json}`)
    }
    return val.float(json)
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('float', val.struct({}))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class Bool extends Model {
  concrete(): Model {
    return this
  }
  decode(json: any): val.Bool {
    if (typeof json !== 'boolean') {
      throw new Error(`expected boolean, got ${typeof json}`)
    }
    return val.bool(json)
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('bool', val.struct({}))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class String extends Model {
  concrete(): Model {
    return this
  }
  decode(json: any): val.String {
    if (typeof json !== 'string') {
      throw new Error(`expected string, got ${typeof json}`)
    }
    return val.string(json)
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('string', val.struct({}))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class Ref extends Model {
  constructor(readonly ref: [string, string]) {
    super()
  }
  concrete(): Model {
    return this
  }
  decode(json: any): val.Ref {
    if (!Array.isArray(json)) {
      throw new Error(`expected array, got ${typeof json}`)
    }
    if (json.length !== 2) {
      throw new Error(`expected array of length 2, got length ${json.length}`)
    }
    return val.ref(json[0], json[1])
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('ref', val.ref(this.ref[0], this.ref[1]))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class DynamicgRef extends Model {
  constructor(readonly label: string) {
    super()
  }
  concrete(): Model {
    return this
  }
  decode(json: any): val.Ref {
    if (!Array.isArray(json)) {
      throw new Error(`expected array, got ${typeof json}`)
    }
    if (json.length !== 2) {
      throw new Error(`expected array of length 2, got length ${json.length}`)
    }
    return val.ref(json[0], json[1])
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('ref', new val.ExprMarker(this.label))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class TagRef extends Model {
  constructor(readonly tag: string) {
    super()
  }
  concrete(): Model {
    return this
  }
  decode(json: any): val.Ref {
    if (!Array.isArray(json)) {
      throw new Error(`expected array, got ${typeof json}`)
    }
    if (json.length !== 2) {
      throw new Error(`expected array of length 2, got length ${json.length}`)
    }
    return val.ref(json[0], json[1])
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('ref', new val.Expr(xpr.tag(this.tag)))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class DateTime extends Model {
  concrete(): Model {
    return this
  }
  decode(json: any): val.DateTime {
    if (typeof json !== 'string') {
      throw new Error(`expected string, got ${typeof json}`)
    }
    return val.dateTime(new Date(json))
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('dateTime', val.struct({}))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class Enum extends Model {
  constructor(readonly symbols: string[]) {
    super()
  }
  concrete(): Model {
    return this
  }
  decode(json: any): val.Symbol {
    if (typeof json !== 'string') {
      throw new Error(`expected string, got ${typeof json}`)
    }
    if (this.symbols.indexOf(json) < 0) {
      throw new Error(
        `undefined enum symbol ${JSON.stringify(json)}, expected one of ${JSON.stringify(
          this.symbols
        )}`
      )
    }
    return val.symbol(json)
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('enum', val.set(this.symbols.map(s => val.string(s))))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class Set extends Model {
  constructor(readonly elements: Model) {
    super()
  }
  concrete(): Model {
    return this
  }
  decode(json: any): val.Set {
    if (!Array.isArray(json)) {
      throw new Error(`expected array, got ${typeof json}`)
    }
    let decoded: val.Value[] = []
    json.forEach(o => {
      decoded.push(this.elements.decode(o))
    })
    return val.set(decoded)
  }
  toValue(recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('set', this.elements.toValue(recursions))
  }
  transform(f: (model: Model) => Model): Model {
    return f(new Set(this.elements.transform(f)))
  }
}

export class Int8 extends Model {
  concrete(): Model {
    return this
  }
  decode(json: any): val.Int8 {
    if (typeof json !== 'number') {
      throw new Error(`expected number, got ${typeof json}`)
    }
    return val.int8(+json.toFixed(0))
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('int8', val.struct({}))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class Int16 extends Model {
  concrete(): Model {
    return this
  }
  decode(json: any): val.Int16 {
    if (typeof json !== 'number') {
      throw new Error(`expected number, got ${typeof json}`)
    }
    return val.int16(+json.toFixed(0))
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('int16', val.struct({}))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class Int32 extends Model {
  concrete(): Model {
    return this
  }
  decode(json: any): val.Int32 {
    if (typeof json !== 'number') {
      throw new Error(`expected number, got ${typeof json}`)
    }
    return val.int32(+json.toFixed(0))
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('int32', val.struct({}))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class Int64 extends Model {
  concrete(): Model {
    return this
  }
  decode(json: any): val.Int64 {
    if (typeof json !== 'number') {
      throw new Error(`expected number, got ${typeof json}`)
    }
    return val.int64(+json.toFixed(0))
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('int64', val.struct({}))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class Uint8 extends Model {
  concrete(): Model {
    return this
  }
  decode(json: any): val.Uint8 {
    if (typeof json !== 'number') {
      throw new Error(`expected number, got ${typeof json}`)
    }
    return val.uint8(+json.toFixed(0))
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('uint8', val.struct({}))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class Uint16 extends Model {
  concrete(): Model {
    return this
  }
  decode(json: any): val.Uint16 {
    if (typeof json !== 'number') {
      throw new Error(`expected number, got ${typeof json}`)
    }
    return val.uint16(+json.toFixed(0))
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('uint16', val.struct({}))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class Uint32 extends Model {
  concrete(): Model {
    return this
  }
  decode(json: any): val.Uint32 {
    if (typeof json !== 'number') {
      throw new Error(`expected number, got ${typeof json}`)
    }
    return val.uint32(+json.toFixed(0))
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('uint32', val.struct({}))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class Uint64 extends Model {
  concrete(): Model {
    return this
  }
  decode(json: any): val.Uint64 {
    if (typeof json !== 'number') {
      throw new Error(`expected number, got ${typeof json}`)
    }
    return val.uint64(+json.toFixed(0))
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('uint64', val.struct({}))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export class Null extends Model {
  concrete(): Model {
    return this
  }
  decode(json: any): val.Null {
    if (json !== null) {
      throw new Error(`expected null, have ${JSON.stringify(json)}`)
    }
    return val.nil
  }
  toValue(_recursions: {[key: string]: Recursion} = {}): val.Value {
    return val.union('null', val.struct({}))
  }
  transform(f: (model: Model) => Model): Model {
    return f(this)
  }
}

export const bool = new Bool()
export const string = new String()
export const float = new Float()
export const dateTime = new DateTime()
export const int8 = new Int8()
export const int16 = new Int16()
export const int32 = new Int32()
export const int64 = new Int64()
export const any = new Any()
