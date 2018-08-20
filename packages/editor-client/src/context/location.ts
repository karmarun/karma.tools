import React from 'react'
import {createContextHOC} from './helper'
import {EditorSession} from './session'

export const enum LocationType {
  Login = 'login',
  Dashboard = 'dashboard',
  ListRecords = 'listRecords',
  NewRecord = 'newRecord',
  EditRecord = 'editRecord',
  DeleteRecord = 'deleteRecord',
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

export interface ListRecordsLocation {
  type: LocationType.ListRecords
  slug: string
}

export function ListRecordsLocation(slug: string): ListRecordsLocation {
  return {type: LocationType.ListRecords, slug}
}

export interface NewRecordLocation {
  type: LocationType.NewRecord
  slug: string
}

export function NewRecordLocation(slug: string): NewRecordLocation {
  return {type: LocationType.NewRecord, slug}
}

export interface EditRecordLocation {
  type: LocationType.EditRecord
  slug: string
  id: string
}

export function EditRecordLocation(slug: string, id: string): EditRecordLocation {
  return {type: LocationType.EditRecord, slug, id}
}

export interface DeleteRecordLocation {
  type: LocationType.DeleteRecord
  slug: string
  id: string
}

export function DeleteRecordLocation(slug: string, id: string): DeleteRecordLocation {
  return {type: LocationType.DeleteRecord, slug, id}
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
  | ListRecordsLocation
  | NewRecordLocation
  | EditRecordLocation
  | DeleteRecordLocation
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
