import * as t from './types'
import {ObjectMap} from './util'
import {data as d} from './expression'

export const model = {
  bool(): t.UnionFn {
    return d.union('bool', d.struct())
  },

  dateTime(): t.UnionFn {
    return d.union('dateTime', d.struct())
  },

  string(): t.UnionFn {
    return d.union('string', d.struct())
  },

  optional(type: t.DataExpression): t.UnionFn {
    return d.union('optional', type)
  },

  enum(...options: t.StringDataExpression[]): t.UnionFn {
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
  },

  int8(): t.UnionFn {
    return d.union('int8', d.struct())
  },

  int16(): t.UnionFn {
    return d.union('int16', d.struct())
  },

  int32(): t.UnionFn {
    return d.union('int32', d.struct())
  },

  int64(): t.UnionFn {
    return d.union('int64', d.struct())
  },

  uint8(): t.UnionFn {
    return d.union('uint8', d.struct())
  },

  uint16(): t.UnionFn {
    return d.union('uint16', d.struct())
  },

  uint32(): t.UnionFn {
    return d.union('uint32', d.struct())
  },

  uint64(): t.UnionFn {
    return d.union('uint64', d.struct())
  },

  float(): t.UnionFn {
    return d.union('float', d.struct())
  },

  map(type: t.DataExpression): t.UnionFn {
    return d.union('map', type)
  },

  list(type: t.DataExpression): t.UnionFn {
    return d.union('list', type)
  },

  set(type: t.DataExpression): t.UnionFn {
    return d.union('set', type)
  },

  struct(fields: ObjectMap<t.DataExpression> = {}): t.UnionFn {
    return d.union('struct', d.map(fields))
  },

  tuple(...types: t.DataExpression[]): t.UnionFn {
    return d.union('tuple', d.list(...types))
  },

  union(fields: ObjectMap<t.DataExpression> = {}): t.UnionFn {
    return d.union('union', d.map(fields))
  },

  ref(ref: t.DataExpression): t.UnionFn {
    return d.union('ref', ref)
  },

  annotation(value: string, model: t.DataExpression): t.UnionFn {
    return d.union(
      'annotation',
      d.struct({
        value: d.string(value),
        model
      })
    )
  },

  recursion(label: string, model: t.DataExpression): t.UnionFn {
    return d.union(
      'recursion',
      d.struct({
        label: d.string(label),
        model
      })
    )
  },

  recurse(label: string): t.UnionFn {
    return d.union('recurse', d.string(label))
  },

  recursive(top: string, models: ObjectMap<t.DataExpression>): t.UnionFn {
    return d.union(
      'recursive',
      d.struct({
        top: d.string(top),
        models: d.map(models)
      })
    )
  },

  unique(model: t.DataExpression): t.UnionFn {
    return d.union('unique', model)
  }
}
