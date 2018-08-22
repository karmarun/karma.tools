import * as t from './types'
import {ObjectMap} from './internal'
import {data as d} from './expression'

export class ModelExpressionContext {
  public bool(): t.UnionFn {
    return d.union('bool', d.struct())
  }

  public dateTime(): t.UnionFn {
    return d.union('dateTime', d.struct())
  }

  public string(): t.UnionFn {
    return d.union('string', d.struct())
  }

  public optional(type: t.DataExpression): t.UnionFn {
    return d.union('optional', type)
  }

  public enum(...options: t.StringDataExpression[]): t.UnionFn {
    return d.union(
      'enum',
      d.set(
        ...options.map(option => {
          if (typeof option === 'string') {
            return d.string(option)
          }

          return option
        })
      )
    )
  }

  public int8(): t.UnionFn {
    return d.union('int8', d.struct())
  }

  public int16(): t.UnionFn {
    return d.union('int16', d.struct())
  }

  public int32(): t.UnionFn {
    return d.union('int32', d.struct())
  }

  public int64(): t.UnionFn {
    return d.union('int64', d.struct())
  }

  public uint8(): t.UnionFn {
    return d.union('uint8', d.struct())
  }

  public uint16(): t.UnionFn {
    return d.union('uint16', d.struct())
  }

  public uint32(): t.UnionFn {
    return d.union('uint32', d.struct())
  }

  public uint64(): t.UnionFn {
    return d.union('uint64', d.struct())
  }

  public float(): t.UnionFn {
    return d.union('float', d.struct())
  }

  public map(type: t.DataExpression): t.UnionFn {
    return d.union('map', type)
  }

  public list(type: t.DataExpression): t.UnionFn {
    return d.union('list', type)
  }

  public set(type: t.DataExpression): t.UnionFn {
    return d.union('set', type)
  }

  public struct(fields: ObjectMap<t.DataExpression> = {}): t.UnionFn {
    return d.union('struct', d.map(fields))
  }

  public tuple(...types: t.DataExpression[]): t.UnionFn {
    return d.union('tuple', d.list(...types))
  }

  public union(fields: ObjectMap<t.DataExpression> = {}): t.UnionFn {
    return d.union('union', d.map(fields))
  }

  public ref(ref: t.DataExpression): t.UnionFn {
    return d.union('ref', ref)
  }

  public annotation(value: string, model: t.DataExpression): t.UnionFn {
    return d.union(
      'annotation',
      d.struct({
        value: d.string(value),
        model
      })
    )
  }

  public recursion(label: string, model: t.DataExpression): t.UnionFn {
    return d.union(
      'recursion',
      d.struct({
        label: d.string(label),
        model
      })
    )
  }

  public recurse(label: string): t.UnionFn {
    return d.union('recurse', d.string(label))
  }

  public recursive(top: string, models: ObjectMap<t.DataExpression>): t.UnionFn {
    return d.union(
      'recursive',
      d.struct({
        top: d.string(top),
        models: d.map(models)
      })
    )
  }

  public unique(model: t.DataExpression): t.UnionFn {
    return d.union('unique', model)
  }
}

export const model = new ModelExpressionContext()
