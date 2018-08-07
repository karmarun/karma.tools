import * as React from 'react'

import {NotificationViewContainer, CenteredLoadingIndicator} from '../ui'
import {LocationContext, AppLocation, withLocation} from '../context/location'

import {LoginContainer} from './login'
import {AsyncComponent} from './asyncComponent'

export interface RootViewProps {
  locationContext: LocationContext
}

export function rootViewForLocation(location?: AppLocation) {
  if (!location) return <CenteredLoadingIndicator />

  switch (location.type) {
    case 'login':
      return <LoginContainer session={location.session} />

    default:
      return (
        <AsyncComponent>
          {async () => {
            const {BaseViewContainer} = await import('./baseView')
            return <BaseViewContainer />
          }}
        </AsyncComponent>
      )
  }
}

export class RootView extends React.Component<RootViewProps> {
  public render() {
    return (
      <>
        {rootViewForLocation(this.props.locationContext.location)}
        <NotificationViewContainer />
      </>
    )
  }
}

export const RootViewContainer = withLocation(RootView)
