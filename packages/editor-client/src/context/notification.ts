import React from 'react'
import {createContextHOC} from './helper'

export enum NotificationType {
  Info = 'neutral',
  Success = 'success',
  Error = 'error'
}

export interface Notification {
  message: string
  type: NotificationType
}

export interface NotificationItem extends Notification {
  id: string
}

export interface NotificationContext {
  notifications: NotificationItem[]
  notify(notification: Notification): void
}

export const NotificationContext = React.createContext<NotificationContext>({
  notifications: [],
  notify() {
    console.warn('No NotificationProvider found!')
  }
})

export const withNotification = createContextHOC(
  NotificationContext,
  'notificationContext',
  'withNotification'
)
