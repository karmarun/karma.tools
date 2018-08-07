import * as React from 'react'
import {style} from 'typestyle'
import {Spacing, Color} from './style'
import {Notification, NotificationItem, withNotification} from '../context/notification'

export const NotificationItemViewStyle = style({
  $debugName: 'NotificationItem',
  width: '30vw',
  padding: Spacing.medium,
  marginBottom: Spacing.small,
  border: '1px solid',

  $nest: {
    '&[data-type="neutral"]': {
      backgroundColor: Color.neutral.light2,
      borderColor: Color.neutral.light1
    },

    '&[data-type="success"]': {
      borderColor: Color.success.base,
      backgroundColor: Color.success.light2,
      color: Color.success.dark1
    },

    '&[data-type="error"]': {
      borderColor: Color.error.light1,
      backgroundColor: Color.error.light2,
      color: Color.error.dark1
    }
  }
})

export interface NotificationItemViewProps {
  notification: Notification
}

export const NotificationItemView: React.StatelessComponent<NotificationItemViewProps> = props => {
  return (
    <div className={NotificationItemViewStyle} data-type={props.notification.type}>
      {props.notification.message}
    </div>
  )
}

export const NotificationContainerStyle = style({
  $debugName: 'NotificationContainer',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'absolute',
  left: 0,
  right: 0,
  top: Spacing.medium,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 1000,
  overflow: 'hidden'
})

export interface NotificationViewProps {
  notifications: NotificationItem[]
}

export class NotificationView extends React.PureComponent<NotificationViewProps> {
  public render() {
    const notifications = this.props.notifications.map(notification => (
      <NotificationItemView key={notification.id} notification={notification} />
    ))

    return <div className={NotificationContainerStyle}>{notifications}</div>
  }
}

export const NotificationViewContainer = withNotification(props => {
  return <NotificationView notifications={props.notificationContext.notifications} />
})
