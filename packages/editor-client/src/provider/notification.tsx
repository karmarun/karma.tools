import React from 'react'
import shortid from 'shortid'
import {Notification, NotificationContext} from '../context/notification'

export const notificationDisplayTime = 5000

export class NotificationProvider extends React.Component<{}, NotificationContext> {
  constructor(props: {}) {
    super(props)

    this.state = {
      notifications: [],
      notify: this.notify
    }
  }

  private notify = (notification: Notification) => {
    const notificationItem = {...notification, id: shortid.generate()}

    this.setState({
      notifications: [...this.state.notifications, notificationItem]
    })

    setTimeout(() => {
      const index = this.state.notifications.indexOf(notificationItem)

      this.setState({
        notifications: this.state.notifications.slice(index + 1)
      })
    }, notificationDisplayTime)
  }

  public render() {
    return (
      <NotificationContext.Provider value={this.state}>
        {this.props.children}
      </NotificationContext.Provider>
    )
  }
}
