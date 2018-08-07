import React from 'react'
import {createContextHOC} from './helper'
import {EditorSession} from './session'

export const enum LocationType {
  Login = 'login',
  Dashboard = 'dashboard',
  EntryList = 'entryList',
  EntryNew = 'entryNew',
  EntryEdit = 'entryEdit',
  EntryDelete = 'entryDelete',
  NotFound = 'notFound',
  NoPermission = 'noPermission',
  External = 'external'
}

export interface LoginLocation {
  type: LocationType.Login
  originalLocation?: AppLocation
  session?: EditorSession
}

export function LoginLocation(
  originalLocation?: AppLocation,
  session?: EditorSession
): LoginLocation {
  return {type: LocationType.Login, originalLocation, session}
}

export interface DashboardLocation {
  type: LocationType.Dashboard
}

export function DashboardLocation(): DashboardLocation {
  return {type: LocationType.Dashboard}
}

export interface EntryListLocation {
  type: LocationType.EntryList
  slug: string
}

export function EntryListLocation(slug: string): EntryListLocation {
  return {type: LocationType.EntryList, slug}
}

export interface EntryNewLocation {
  type: LocationType.EntryNew
  slug: string
}

export function EntryNewLocation(slug: string): EntryNewLocation {
  return {type: LocationType.EntryNew, slug}
}

export interface EntryEditLocation {
  type: LocationType.EntryEdit
  slug: string
  id: string
}

export function EntryEditLocation(slug: string, id: string): EntryEditLocation {
  return {type: LocationType.EntryEdit, slug, id}
}

export interface EntryDeleteLocation {
  type: LocationType.EntryDelete
  slug: string
  id: string
}

export function EntryDeleteLocation(slug: string, id: string): EntryDeleteLocation {
  return {type: LocationType.EntryDelete, slug, id}
}

export interface NotFoundLocation {
  type: LocationType.NotFound
}

export function NotFoundLocation(): NotFoundLocation {
  return {type: LocationType.NotFound}
}

export interface NoPermissionLocation {
  type: LocationType.NoPermission
}

export function NoPermissionLocation(): NoPermissionLocation {
  return {type: LocationType.NoPermission}
}

export interface ExternalLocation {
  type: LocationType.External
  url: string
}

export function ExternalLocation(url: string): ExternalLocation {
  return {type: LocationType.External, url}
}

export type AppLocation =
  | LoginLocation
  | DashboardLocation
  | EntryListLocation
  | EntryNewLocation
  | EntryEditLocation
  | EntryDeleteLocation
  | NotFoundLocation
  | NoPermissionLocation
  | ExternalLocation

export interface LocationActionContext {
  pushLocation(location: AppLocation): void
  replaceLocation(location: AppLocation): void
  locationForURLPath(path: string): AppLocation
  urlPathForLocation(location: AppLocation): string
}

export const defaultActionContext = {
  async pushLocation() {
    console.warn('No LocationProvider found!')
  },

  async replaceLocation() {
    console.warn('No LocationProvider found!')
  },

  locationForURLPath() {
    console.warn('No LocationProvider found!')
    return NotFoundLocation()
  },

  urlPathForLocation() {
    console.warn('No LocationProvider found!')
    return ''
  }
}

export const LocationActionContext = React.createContext<LocationActionContext>({
  ...defaultActionContext
})

export interface LocationStateContext {
  location?: AppLocation
  shouldReplaceLocation: boolean
  hasUnsavedChanges: boolean
}

export type LocationContext = LocationStateContext & LocationActionContext

export const LocationContext = React.createContext<LocationContext>({
  shouldReplaceLocation: false,
  hasUnsavedChanges: false,
  ...defaultActionContext
})

export const withLocation = createContextHOC(LocationContext, 'locationContext', 'withLocation')
export const withLocationAction = createContextHOC(
  LocationActionContext,
  'locationActionContext',
  'withLocationAction'
)
