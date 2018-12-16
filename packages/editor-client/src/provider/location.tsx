import React from 'react'
import memoizeOne from 'memoize-one'
import qs from 'qs'

import {
  LocationType,
  AppLocation,
  LoginLocation,
  NotFoundLocation,
  NoPermissionLocation,
  NewRecordLocation,
  EditRecordLocation,
  DeleteRecordLocation,
  ListRecordsLocation,
  DashboardLocation,
  LocationContext,
  LocationActionContext
} from '../context/location'

import {SessionContext, withSession} from '../context/session'
import {withConfig, Config} from '../context/config'

export function urlPathForLocation(basePath: string, location: AppLocation): string {
  switch (location.type) {
    case LocationType.Login:
      return `${basePath}/login`
    case LocationType.Dashboard:
      return `${basePath}/`
    case LocationType.ListRecords:
      return `${basePath}/records/${location.slug}`
    case LocationType.NewRecord:
      return `${basePath}/records/${location.slug}/new`
    case LocationType.EditRecord:
      return `${basePath}/records/${location.slug}/edit/${location.id}`
    case LocationType.DeleteRecord:
      return `${basePath}/records/${location.slug}/delete/${location.id}`
    case LocationType.NotFound:
      return `${basePath}/404`
    case LocationType.NoPermission:
      return `${basePath}/403`
    case LocationType.External:
      return location.url
  }
}

export function locationForURLPath(basePath: string, url: string): AppLocation {
  url = url.replace(window.location.origin, '')
  url = url.substring(basePath.length)

  let matchArray: RegExpMatchArray | null

  if ((matchArray = url.match(/^\/login(?:\?(.*))?(\/?)$/))) {
    const query = qs.parse(matchArray[1])

    const username = query.username
    const signature = query.signature

    if (typeof username === 'string' && typeof signature === 'string') {
      return LoginLocation(undefined, {username, token: signature})
    } else {
      return LoginLocation()
    }
  }

  if ((matchArray = url.match(/^\/404(\/?)$/))) return NotFoundLocation()
  if ((matchArray = url.match(/^\/403(\/?)$/))) return NoPermissionLocation()

  if ((matchArray = url.match(/^\/records\/(.+?)\/new(\/?)$/))) {
    return NewRecordLocation(matchArray[1])
  }

  if ((matchArray = url.match(/^\/records\/(.+?)\/edit\/(.+?)(\/?)$/))) {
    return EditRecordLocation(matchArray[1], matchArray[2])
  }

  if ((matchArray = url.match(/^\/records\/(.+?)\/delete\/(.+?)(\/?)$/))) {
    return DeleteRecordLocation(matchArray[1], matchArray[2])
  }

  if ((matchArray = url.match(/^\/records\/(.+?)(\/?)$/))) {
    return ListRecordsLocation(matchArray[1])
  }

  if (url === '' || url.match(/^\/((records)(\/)?)?$/)) {
    return DashboardLocation()
  }

  return NotFoundLocation()
}

export interface LocationActionProviderProps {
  locationContext: LocationContext
}

export class LocationActionProvider extends React.Component<
  LocationActionProviderProps,
  LocationActionContext
> {
  public shouldComponentUpdate(nextProps: LocationActionProviderProps) {
    const locationContext = this.props.locationContext
    const nextLocationContext = nextProps.locationContext

    if (
      locationContext.pushLocation !== nextLocationContext.pushLocation ||
      locationContext.replaceLocation !== nextLocationContext.replaceLocation ||
      locationContext.locationForURLPath !== nextLocationContext.locationForURLPath ||
      locationContext.urlPathForLocation !== nextLocationContext.urlPathForLocation
    ) {
      return true
    }

    return false
  }

  private getActionContext = memoizeOne(
    (
      pushLocation: LocationActionContext['pushLocation'],
      replaceLocation: LocationActionContext['replaceLocation'],
      locationForURLPath: LocationActionContext['locationForURLPath'],
      urlPathForLocation: LocationActionContext['urlPathForLocation']
    ): LocationActionContext => {
      return {
        pushLocation,
        replaceLocation,
        locationForURLPath,
        urlPathForLocation
      }
    }
  )

  public render() {
    const locationContext = this.props.locationContext
    const actionContext = this.getActionContext(
      locationContext.pushLocation,
      locationContext.replaceLocation,
      locationContext.locationForURLPath,
      locationContext.urlPathForLocation
    )

    return (
      <LocationActionContext.Provider value={actionContext}>
        {this.props.children}
      </LocationActionContext.Provider>
    )
  }
}

export interface LocationProviderProps {
  config: Config
  sessionContext: SessionContext
}

export function sessionContextMiddleware(
  location: AppLocation,
  sessionContext: SessionContext
): AppLocation {
  if (location.type === 'login' && sessionContext.session) {
    return location.originalLocation
      ? sessionContextMiddleware(location.originalLocation, sessionContext)
      : DashboardLocation()
  }

  if (location.type !== 'login' && !sessionContext.session) {
    return LoginLocation(location)
  }

  if (
    location.type === LocationType.ListRecords &&
    !sessionContext.viewContextSlugMap.get(location.slug)
  ) {
    return NotFoundLocation()
  }

  return location
}

export class LocationProvider extends React.Component<LocationProviderProps, LocationContext> {
  constructor(props: LocationProviderProps) {
    super(props)

    this.state = {
      shouldReplaceLocation: false,
      hasUnsavedChanges: false,
      pushLocation: this.pushLocation,
      replaceLocation: this.replaceLocation,
      locationForURLPath: this.locationForURLPath,
      urlPathForLocation: this.urlPathForLocation
    }
  }

  public componentDidMount() {
    window.addEventListener('popstate', () => {
      if (this.props.sessionContext.unsavedChangesCount > 0) {
        const confirmed = window.confirm(
          'You have unsaved changes, are you sure you want to go back?'
        )

        if (!confirmed && this.state.location) {
          // Push current location back to the stack,
          // isn't the best solution if the user pressed forward instead of back
          window.history.pushState(
            undefined,
            '',
            urlPathForLocation(this.props.config.basePath, this.state.location!)
          )
          return
        }
      }

      this.syncLocationFromURL()
    })

    if (!this.state.location) {
      this.syncLocationFromURL()
    }
  }

  private syncLocationFromURL() {
    this.replaceLocation(
      locationForURLPath(
        this.props.config.basePath,
        window.location.pathname + window.location.search
      )
    )
  }

  public locationForURLPath = (path: string): AppLocation => {
    return locationForURLPath(this.props.config.basePath, path)
  }

  public urlPathForLocation = (location: AppLocation): string => {
    return urlPathForLocation(this.props.config.basePath, location)
  }

  public pushLocation = (location: AppLocation) => {
    if (location.type === LocationType.External) {
      window.open(location.url, '_blank')
      return
    }

    this.setState({location, shouldReplaceLocation: false})
  }

  public replaceLocation = (location: AppLocation) => {
    if (location.type === LocationType.External) {
      window.open(location.url, '_blank')
      return
    }

    this.setState({location, shouldReplaceLocation: true})
  }

  public componentDidUpdate(_prevProps: LocationProviderProps, prevState: LocationContext) {
    if (!window) return

    // Sync location to history
    if (this.state.location && this.state.location !== prevState.location) {
      if (this.state.shouldReplaceLocation) {
        window.history.replaceState(
          undefined,
          '',
          urlPathForLocation(this.props.config.basePath, this.state.location)
        )
      } else {
        window.history.pushState(
          undefined,
          '',
          urlPathForLocation(this.props.config.basePath, this.state.location)
        )
      }
    }
  }

  public render() {
    return (
      <LocationContext.Provider value={this.state}>
        <LocationActionProvider locationContext={this.state}>
          {this.props.children}
        </LocationActionProvider>
      </LocationContext.Provider>
    )
  }

  public static getDerivedStateFromProps(
    nextProps: Readonly<LocationProviderProps>,
    prevState: LocationContext
  ): Partial<LocationContext> | null {
    if (prevState.location) {
      return {location: sessionContextMiddleware(prevState.location, nextProps.sessionContext)}
    }

    return null
  }
}

export const LocationProviderContainer = withConfig(withSession(LocationProvider))
