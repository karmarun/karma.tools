import * as xpr from './expression'

type ExprMap = {[key: string]: xpr.Expression}

export interface Value {
  transform(f: (v: Value) => Value): Value
  toDataConstructor(exprMap?: ExprMap): xpr.DataConstructor
  toJSON(): any
}

// start convenience constructors

export function union<T extends Value = Value>(caze: string, value: T): Union<T> {
  return new Union(caze, value)
}

export function struct<T extends {[field: string]: Value} = {[field: string]: Value}>(
  struct: T
): Struct<T> {
  return new Struct(struct)
}

export function map<T extends Value = Value>(map: {[field: string]: T}): Map<T> {
  return new Map(map)
}

export function list<T extends Value = Value>(list: T[]): List<T> {
  return new List(list)
}

export function set<T extends Value = Value>(set: T[]): Set<T> {
  return new Set(set)
}

export function tuple<T extends Value[] = Value[]>(...tuple: T): Tuple<T> {
  return new Tuple(tuple)
}

export function string(string: string): String {
  return new String(string)
}

export function symbol(symbol: string): Symbol {
  return new Symbol(symbol)
}

export function bool(bool: boolean): Bool {
  return new Bool(bool)
}

export function dateTime(dateTime: Date): DateTime {
  return new DateTime(dateTime)
}

export function ref(model: string, id: string): Ref
export function ref(ref: [string, string]): Ref
export function ref(model: string[] | string, id?: string): Ref {
  if (Array.isArray(model)) return new Ref(model[0], model[1])
  return new Ref(model, id!)
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

export function int64(int64: number): Int64 {
  return new Int64(int64)
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

// end convenience constructors

export class Union<T extends Value = Value> implements Value {
  readonly case: string

  constructor(
    c: string, // NOTE: "case" not permitted as constructor argument name
    readonly value: T
  ) {
    this.case = c
  }

  assertCase(caze: string): T {
    if (this.case !== caze) {
      throw new Error(
        `union case assertion failed, asserted ${JSON.stringify(caze)} but have ${JSON.stringify(
          this.case
        )}`
      )
    }
    return this.value
  }

  toDataConstructor(exprMap?: ExprMap): xpr.DataConstructor {
    return xpr.DataContext.union(this.case, this.value.toDataConstructor(exprMap))
  }

  toJSON(): any {
    return {[this.case]: this.value.toJSON()}
  }

  transform(f: (v: Value) => Value): Value {
    return f(union(this.case, this.value.transform(f)))
  }
}

export class Struct<T extends {[field: string]: Value} = {[field: string]: Value}>
  implements Value {
  constructor(readonly struct: T) {}
  field<K extends keyof T>(name: K): T[K] {
    return this.struct[name]
  }

  toDataConstructor(exprMap?: ExprMap): xpr.DataConstructor {
    const arg: {[field: string]: xpr.DataConstructor} = {}
    for (let k in this.struct) {
      arg[k] = this.struct[k].toDataConstructor(exprMap)
    }
    return xpr.DataContext.struct(arg)
  }

  toJSON(): any {
    const out: {[fields: string]: any} = {}
    for (const k in this.struct) {
      out[k] = this.struct[k].toJSON()
    }
    return out
  }

  transform(f: (v: Value) => Value): Value {
    const mapped: {[field: string]: Value} = {}
    Object.keys(this.struct).forEach(k => {
      mapped[k] = this.struct[k].transform(f)
    })
    return f(struct(mapped))
  }
}

export class Map<T extends Value = Value> implements Value {
  constructor(readonly map: {[key: string]: T}) {}

  key(name: string): T | Null {
    const v = this.map[name]
    if (typeof v == 'undefined') {
      return nil
    }
    return v
  }

  toDataConstructor(exprMap?: ExprMap): xpr.DataConstructor {
    const arg: {[field: string]: xpr.DataConstructor} = {}
    for (let k in this.map) {
      arg[k] = this.map[k].toDataConstructor(exprMap)
    }
    return xpr.DataContext.map(arg)
  }

  toJSON(): any {
    const out: {[fields: string]: any} = {}
    for (const k in this.map) {
      out[k] = this.map[k].toJSON()
    }
    return out
  }

  transform(f: (v: Value) => Value): Value {
    const mapped: {[key: string]: Value} = {}
    Object.keys(this.map).forEach(k => {
      mapped[k] = this.map[k].transform(f)
    })
    return f(map(mapped))
  }
}

export class List<T extends Value = Value> implements Value {
  constructor(readonly list: T[]) {}
  append(value: T): List<T> {
    return new List(this.list.concat(value))
  }

  index(index: number): T {
    return this.list[index]
  }

  toDataConstructor(exprMap?: ExprMap): xpr.DataConstructor {
    return xpr.DataContext.list(this.list.map(v => v.toDataConstructor(exprMap)))
  }

  toJSON(): any {
    return this.list.map(v => v.toJSON())
  }

  transform(f: (v: Value) => Value): Value {
    return f(list(this.list.map(v => v.transform(f))))
  }
}

export class Set<T extends Value = Value> implements Value {
  constructor(readonly set: T[]) {}
  toDataConstructor(exprMap?: ExprMap): xpr.DataConstructor {
    return xpr.DataContext.set(this.set.map(v => v.toDataConstructor(exprMap)))
  }

  toJSON(): any {
    return this.set.map(v => v.toJSON())
  }

  transform(f: (v: Value) => Value): Value {
    return f(set(this.set.map(v => v.transform(f))))
  }
}

export class Tuple<T extends Value[] = Value[]> implements Value {
  constructor(readonly tuple: T) {}
  index<K extends keyof T>(index: K): T[K] {
    return this.tuple[index]
  }

  toDataConstructor(exprMap?: ExprMap): xpr.DataConstructor {
    return xpr.DataContext.tuple(...this.tuple.map(v => v.toDataConstructor(exprMap)))
  }

  toJSON(): any {
    return this.tuple.map(v => v.toJSON())
  }

  transform(f: (v: Value) => Value): Value {
    return f(tuple(...this.tuple.map(v => v.transform(f))))
  }
}

export class Ref implements Value {
  constructor(readonly model: string, readonly id: string) {}
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.ref(this.model, this.id)
  }

  toJSON(): any {
    return this.id
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class String implements Value {
  constructor(readonly string: string) {}
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.string(this.string)
  }

  toJSON(): any {
    return this.string
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class Symbol implements Value {
  constructor(readonly symbol: string) {}
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.symbol(this.symbol)
  }

  toJSON(): any {
    return this.symbol
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class Int8 implements Value {
  constructor(readonly int8: number) {}
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.int8(this.int8)
  }

  toJSON(): any {
    return this.int8
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class Int16 implements Value {
  constructor(readonly int16: number) {}
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.int16(this.int16)
  }

  toJSON(): any {
    return this.int16
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class Int32 implements Value {
  constructor(readonly int32: number) {}
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.int32(this.int32)
  }

  toJSON(): any {
    return this.int32
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class Int64 implements Value {
  constructor(readonly int64: number) {}
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.int64(this.int64)
  }

  toJSON(): any {
    return this.int64
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class Uint8 implements Value {
  constructor(readonly uint8: number) {}
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.uint8(this.uint8)
  }

  toJSON(): any {
    return this.uint8
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class Uint16 implements Value {
  constructor(readonly uint16: number) {}
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.uint16(this.uint16)
  }

  toJSON(): any {
    return this.uint16
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class Uint32 implements Value {
  constructor(readonly uint32: number) {}
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.uint32(this.uint32)
  }

  toJSON(): any {
    return this.uint32
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class Uint64 implements Value {
  constructor(readonly uint64: number) {}
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.uint64(this.uint64)
  }

  toJSON(): any {
    return this.uint64
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class Float implements Value {
  constructor(readonly float: number) {}
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.float(this.float)
  }

  toJSON(): any {
    return this.float
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class Bool implements Value {
  constructor(readonly bool: boolean) {}
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.bool(this.bool)
  }

  toJSON(): any {
    return this.bool
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class DateTime implements Value {
  constructor(readonly dateTime: Date) {}
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.dateTime(this.dateTime)
  }

  toJSON(): any {
    return this.dateTime.toISOString()
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class Null implements Value {
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.null()
  }

  toJSON(): any {
    return null
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class BoundExpr implements Value {
  constructor(readonly label: string) {}
  toDataConstructor(exprMap?: ExprMap): xpr.DataConstructor {
    if (!exprMap || !exprMap[this.label])
      throw new Error(`Unbound expression labelled "${this.label}"`)
    return xpr.DataContext.expr(exprMap[this.label])
  }

  toJSON(): any {
    return null
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export class Expr implements Value {
  constructor(readonly expression: xpr.Expression) {}
  toDataConstructor(): xpr.DataConstructor {
    return xpr.DataContext.expr(this.expression)
  }

  toJSON(): any {
    return null
  }

  transform(f: (v: Value) => Value): Value {
    return f(this)
  }
}

export const nil = new Null()

export function newMetaModelValue(metaId: string): Union {
  return union(
    'recursion',
    struct({
      label: string('x'),
      model: union(
        'union',
        map({
          recursive: union(
            'struct',
            map({
              top: union('string', struct({})),
              models: union('map', union('recurse', string('x')))
            })
          ),
          recursion: union(
            'struct',
            map({
              label: union('string', struct({})),
              model: union('recurse', string('x'))
            })
          ),
          recurse: union('string', struct({})),
          annotation: union(
            'struct',
            map({
              value: union('string', struct({})),
              model: union('recurse', string('x'))
            })
          ),
          set: union('recurse', string('x')),
          list: union('recurse', string('x')),
          tuple: union('list', union('recurse', string('x'))),
          struct: union('map', union('recurse', string('x'))),
          union: union('map', union('recurse', string('x'))),
          ref: union('ref', ref(metaId, metaId)),
          map: union('recurse', string('x')),
          optional: union('recurse', string('x')),
          unique: union('recurse', string('x')),
          enum: union('list', union('string', struct({}))),
          any: union('struct', map({})),
          bool: union('struct', map({})),
          dateTime: union('struct', map({})),
          float: union('struct', map({})),
          string: union('struct', map({})),
          int8: union('struct', map({})),
          int16: union('struct', map({})),
          int32: union('struct', map({})),
          int64: union('struct', map({})),
          uint8: union('struct', map({})),
          uint16: union('struct', map({})),
          uint32: union('struct', map({})),
          uint64: union('struct', map({})),
          null: union('struct', map({}))
        })
      )
    })
  )
}
