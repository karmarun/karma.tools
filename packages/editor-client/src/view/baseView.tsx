import * as React from 'react'
import {style} from 'typestyle'
import {SidePanelContainer} from './sidePanel'

import {MainPanelContainer} from './mainPanel'
import {SessionContext, withSession} from '../context/session'
import {LocationContext, withLocation} from '../context/location'
import {Color} from '../ui'

export interface BaseViewProps {
  locationContext: LocationContext
  sessionContext: SessionContext
}

export const BaseViewStyle = style({
  $debugName: 'BaseView',

  backgroundColor: Color.primary.light1,

  display: 'flex',
  flexGrow: 1,

  width: '100%',
  height: '100%'
})

export class BaseView extends React.Component<BaseViewProps> {
  public render() {
    return (
      <div className={BaseViewStyle}>
        <SidePanelContainer />
        <MainPanelContainer />
      </div>
    )
  }
}

export const BaseViewContainer = withSession(withLocation(BaseView))
