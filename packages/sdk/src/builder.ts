import * as t from './types'
import {expression as e, data as d, func as f} from './expression'
import {model as m} from './model'
import {mapObject, ObjectMap} from './util'

export type ModelContext = typeof modelContext
export type DataContext = ReturnType<typeof createDataContext>
export type DataScopeFn = (e: DataContext, m: ModelContext) => t.DataExpression

export type ExpressionContext = ReturnType<typeof createContext>
export type ExpressionContextFn = (e: ExpressionContext) => t.Expression

export type FunctionBodyFn = (...params: t.ScopeFn[]) => t.Expression | t.Expression[]
export type FunctionBodyContextFn = (e: ExpressionContext) => FunctionBodyFn

export const modelContext = m

export function createDataContext(context: ExpressionContext) {
  return {
    ...d,
    expr(func: ExpressionContextFn) {
      return d.expr(func(context))
    }
  }
}

export function createContext() {
  let paramIndex = 0
  let dataContext!: DataContext

  const context = {
    ...e,
    data(scopeFn: DataScopeFn): t.Expression {
      return e.data(scopeFn(dataContext, modelContext))
    },

    filterList(value: t.Expression, filter: (index: t.ScopeFn, value: t.ScopeFn) => t.Expression) {
      return e.filterList(value, this.function(filter, this.getUniqueParamNames('index', 'value')))
    },

    memSort(value: t.Expression, sorter: (value: t.ScopeFn) => t.Expression) {
      return e.memSort(value, this.function(sorter, this.getUniqueParamNames('value')))
    },

    mapList(value: t.Expression, mapper: (index: t.ScopeFn, value: t.ScopeFn) => t.Expression) {
      return e.mapList(value, this.function(mapper, this.getUniqueParamNames('index', 'value')))
    },

    reduceList(
      value: t.Expression,
      initial: t.Expression,
      reducer: (value: t.ScopeFn, nextValue: t.ScopeFn) => t.Expression
    ) {
      return e.reduceList(
        value,
        initial,
        this.function(reducer, this.getUniqueParamNames('value', 'nextValue'))
      )
    },

    mapMap(value: t.Expression, mapper: (key: t.ScopeFn, value: t.ScopeFn) => t.Expression) {
      return e.mapMap(value, this.function(mapper, this.getUniqueParamNames('key', 'value')))
    },

    mapSet(value: t.Expression, mapper: (index: t.ScopeFn, value: t.ScopeFn) => t.Expression) {
      return e.mapSet(value, this.function(mapper, this.getUniqueParamNames('value')))
    },

    signature(func: (...params: t.ScopeFn[]) => t.Expression) {
      return e.signature(this.function(func))
    },

    create(modelRef: t.Expression, func: (ref: t.ScopeFn) => t.Expression) {
      return e.create(modelRef, this.function(func, ['ref']))
    },

    createMultiple(modelRef: t.Expression, creators: ObjectMap<(refs: t.ScopeFn) => t.Expression>) {
      return e.createMultiple(
        modelRef,
        mapObject(creators, creator => this.function(creator, this.getUniqueParamNames('refs')))
      )
    },

    switchCase(
      value: t.Expression,
      defaultValue: t.Expression,
      cases: ObjectMap<(value: t.ScopeFn) => t.Expression>
    ) {
      return e.switchCase(
        value,
        defaultValue,
        mapObject(cases, caseFn => this.function(caseFn, this.getUniqueParamNames('value')))
      )
    },

    getUniqueParamNames(...prefixes: string[]) {
      const currentParamIndex = paramIndex++
      return prefixes.map(prefix => `_${prefix}_${currentParamIndex}`)
    },

    function(body: FunctionBodyFn, paramNames: string[] = []) {
      if (body.length > 0) {
        for (let i = paramNames.length; i < paramNames.length - body.length; i++) {
          paramNames[i] = this.getUniqueParamNames(`param${i}`)[0]
        }
      }

      const scopes = paramNames.map(paramName => this.scope(paramName))
      const expressions = body(...scopes)

      return f.function(paramNames, ...(Array.isArray(expressions) ? expressions : [expressions]))
    }
  }

  dataContext = createDataContext(context)
  return context
}

export function buildExpression(
  contextFn: ExpressionContextFn,
  context: ExpressionContext = createContext()
) {
  return contextFn(context)
}

export function buildFunction(
  contextFn: FunctionBodyContextFn,
  paramNames: string[] = [],
  context: ExpressionContext = createContext()
) {
  const body = contextFn(context)
  return context.function(body, paramNames)
}
