import * as t from './types'

import {model as m} from './model'
import {mapObject, ObjectMap} from './util'
import {func as f, ExpressionContext, DataExpressionContext} from './expression'

export type ModelContext = typeof modelContext
export type DataScopeFn = (d: BuilderDataContext, m: ModelContext) => t.DataExpression

export type ExpressionContextFn = (e: BuilderExpressionContext) => t.Expression
export type FunctionBodyFn = (...params: t.ScopeFn[]) => t.Expression | t.Expression[]
export type FunctionBodyContextFn = (e: BuilderExpressionContext) => FunctionBodyFn

export const modelContext = m

export class BuilderDataContext extends DataExpressionContext {
  private expressionContext: BuilderExpressionContext

  public constructor(expressionContext: BuilderExpressionContext) {
    super()
    this.expressionContext = expressionContext
  }

  public expr(func: t.Expression | ExpressionContextFn): t.ExprFn {
    if (typeof func === 'function') return super.expr(func(this.expressionContext))
    return super.expr(func)
  }
}

export type FilterCallbackFn = (index: t.ScopeFn, value: t.ScopeFn) => t.Expression
export type SortCallbackFn = (value: t.ScopeFn) => t.Expression
export type MapCallbackFn = (index: t.ScopeFn, value: t.ScopeFn) => t.Expression
export type ReduceCallbackFn = (index: t.ScopeFn, value: t.ScopeFn) => t.Expression

export type ValueCallbackFn = (value: t.ScopeFn) => t.Expression
export type IndexValueCallbackFn = (index: t.ScopeFn, value: t.ScopeFn) => t.Expression
export type KeyValueCallbackFn = (key: t.ScopeFn, value: t.ScopeFn) => t.Expression
export type AggregatorCallbackFn = (aggregator: t.ScopeFn, value: t.ScopeFn) => t.Expression
export type RefCallbackFn = (ref: t.ScopeFn) => t.Expression
export type RefsCallbackFn = (refs: t.ScopeFn) => t.Expression

export class BuilderExpressionContext extends ExpressionContext {
  private paramIndex = 0
  private dataContext = new BuilderDataContext(this)

  public data(scopeFnOrData: t.DataExpression | DataScopeFn): t.DataFn {
    if (typeof scopeFnOrData === 'function') {
      return super.data(scopeFnOrData(this.dataContext, modelContext))
    }

    return super.data(scopeFnOrData)
  }

  public filterList(
    value: t.Expression,
    filter: t.FunctionFn | IndexValueCallbackFn
  ): t.FilterListFn {
    if (typeof filter === 'function') {
      return super.filterList(
        value,
        this.function(filter, this.getUniqueParamNames('index', 'value'))
      )
    }

    return super.filterList(value, filter)
  }

  public memSort(value: t.Expression, sorter: t.FunctionFn | ValueCallbackFn): t.MemSortFn {
    if (typeof sorter === 'function') {
      return super.memSort(value, this.function(sorter, this.getUniqueParamNames('value')))
    }

    return super.memSort(value, sorter)
  }

  public memSortFunction(
    value: t.Expression,
    sorter: t.FunctionFn | ValueCallbackFn
  ): t.MemSortFunctionFn {
    if (typeof sorter === 'function') {
      return super.memSortFunction(
        value,
        this.function(sorter, this.getUniqueParamNames('valueA', 'valueB'))
      )
    }

    return super.memSortFunction(value, sorter)
  }

  public mapList(value: t.Expression, mapper: t.FunctionFn | IndexValueCallbackFn): t.MapListFn {
    if (typeof mapper === 'function') {
      return super.mapList(value, this.function(mapper, this.getUniqueParamNames('index', 'value')))
    }

    return super.mapList(value, mapper)
  }

  public reduceList(
    value: t.Expression,
    initial: t.Expression,
    reducer: t.FunctionFn | AggregatorCallbackFn
  ): t.ReduceListFn {
    if (typeof reducer === 'function') {
      return super.reduceList(
        value,
        initial,
        this.function(reducer, this.getUniqueParamNames('aggregator', 'value'))
      )
    }

    return super.reduceList(value, initial, reducer)
  }

  public leftFoldList(
    value: t.Expression,
    initial: t.Expression,
    folder: t.FunctionFn | AggregatorCallbackFn
  ): t.LeftFoldListFn {
    if (typeof folder === 'function') {
      return super.leftFoldList(
        value,
        initial,
        this.function(folder, this.getUniqueParamNames('aggregator', 'value'))
      )
    }

    return super.leftFoldList(value, initial, folder)
  }

  public rightFoldList(
    value: t.Expression,
    initial: t.Expression,
    folder: t.FunctionFn | AggregatorCallbackFn
  ): t.RightFoldListFn {
    if (typeof folder === 'function') {
      return super.rightFoldList(
        value,
        initial,
        this.function(folder, this.getUniqueParamNames('aggregator', 'value'))
      )
    }

    return super.rightFoldList(value, initial, folder)
  }

  public mapMap(value: t.Expression, mapper: t.FunctionFn | KeyValueCallbackFn): t.MapMapFn {
    if (typeof mapper === 'function') {
      return super.mapMap(value, this.function(mapper, this.getUniqueParamNames('key', 'value')))
    }

    return super.mapMap(value, mapper)
  }

  public mapSet(value: t.Expression, mapper: t.FunctionFn | IndexValueCallbackFn): t.MapSetFn {
    if (typeof mapper === 'function') {
      return super.mapSet(value, this.function(mapper, this.getUniqueParamNames('value')))
    }

    return super.mapSet(value, mapper)
  }

  public signature(func: t.FunctionFn | FunctionBodyFn): t.SignatureFn {
    if (typeof func === 'function') {
      return super.signature(this.function(func, []))
    }

    return super.signature(func)
  }

  public create(modelRef: t.Expression, func: t.FunctionFn | RefCallbackFn): t.CreateFn {
    if (typeof func === 'function') {
      return super.create(modelRef, this.function(func, this.getUniqueParamNames('ref')))
    }

    return super.create(modelRef, func)
  }

  public createMultiple(
    modelRef: t.Expression,
    creators: ObjectMap<t.FunctionFn | RefsCallbackFn>
  ): t.CreateMultipleFn {
    return super.createMultiple(
      modelRef,
      mapObject(creators, creator => {
        if (typeof creator === 'function') {
          return this.function(creator, this.getUniqueParamNames('refs'))
        }

        return creator
      })
    )
  }

  public switchCase(
    value: t.Expression,
    cases: ObjectMap<t.FunctionFn | ValueCallbackFn>
  ): t.SwitchCaseFn {
    return super.switchCase(
      value,
      mapObject(cases, caseFn => {
        if (typeof caseFn === 'function') {
          return this.function(caseFn, this.getUniqueParamNames('value'))
        }

        return caseFn
      })
    )
  }

  public with(value: t.Expression, body: t.FunctionFn | ValueCallbackFn): t.WithFn {
    if (typeof body === 'function') {
      return super.with(value, this.function(body, this.getUniqueParamNames('value')))
    }

    return super.with(value, body)
  }

  public getUniqueParamNames<P extends string[] = string[]>(...prefixes: P): P {
    const currentParamIndex = this.paramIndex++
    return prefixes.map(prefix => `_${prefix}_${currentParamIndex}`) as P
  }

  public function(body: FunctionBodyFn, paramNames: string[]): t.FunctionFn {
    if (body.length > 0) {
      for (let i = paramNames.length; i < body.length - paramNames.length; i++) {
        paramNames[i] = this.getUniqueParamNames(`param${i}`)[0]
      }
    }

    const scopes = paramNames.map(paramName => this.scope(paramName))
    const expressions = body(...scopes)

    return f.function(paramNames, ...(Array.isArray(expressions) ? expressions : [expressions]))
  }
}

export function buildExpression(
  contextFn: ExpressionContextFn,
  context: BuilderExpressionContext = new BuilderExpressionContext()
) {
  return contextFn(context)
}

export function buildFunction(
  contextFn: FunctionBodyContextFn,
  paramNames: string[] = [],
  context: BuilderExpressionContext = new BuilderExpressionContext()
) {
  const body = contextFn(context)
  return context.function(body, paramNames)
}
