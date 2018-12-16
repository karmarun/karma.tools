import React from 'react'
import {Omit} from '@karma.run/editor-common'

export type ReactComponentType<P = {}> = React.ComponentClass<P, any> | React.StatelessComponent<P>

export function createContextHOC<K extends string, C, CP extends {[key in K]: C}>(
  Context: React.Context<C>,
  propName: K,
  displayName?: string
) {
  function hoc<P extends CP>(Component: ReactComponentType<P>) {
    // TODO: Somehow this errors now
    const AnyComponent = Component as any

    const consumer: React.StatelessComponent<Omit<P, K>> = props => (
      <Context.Consumer>
        {context => <AnyComponent {...props} {...{[propName]: context}} />}
      </Context.Consumer>
    )

    consumer.displayName = displayName
    return consumer
  }

  return hoc
}
