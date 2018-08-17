import * as React from 'react'
import {style} from 'typestyle'

import {boolAttr} from '../util/react'
import {Spacing} from './style'

export const FlexListStyle = style({
  $debugName: 'FlexList',

  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  $nest: {
    '&[data-fill]': {
      width: '100%',
      height: '100%',
      flexGrow: 1
    },

    '&[data-wrap]': {
      flexWrap: 'wrap'
    },

    '&[data-direction="row"]': {
      flexDirection: 'row',

      $nest: {
        '&[data-spacing="none"]': {$nest: {'> *': {marginRight: 0}}},
        '&[data-spacing="small"]': {$nest: {'> *': {marginRight: Spacing.small}}},
        '&[data-spacing="medium"]': {$nest: {'> *': {marginRight: Spacing.medium}}},
        '&[data-spacing="large"]': {$nest: {'> *': {marginRight: Spacing.large}}},
        '> *': {marginRight: Spacing.small, $nest: {'&:last-child': {marginRight: 0}}}
      }
    },

    '&[data-direction="column"]': {
      flexDirection: 'column',
      width: '100%',

      $nest: {
        '&[data-spacing="none"]': {$nest: {'> *': {marginBottom: 0}}},
        '&[data-spacing="small"]': {$nest: {'> *': {marginBottom: Spacing.small}}},
        '&[data-spacing="medium"]': {$nest: {'> *': {marginBottom: Spacing.medium}}},
        '&[data-spacing="large"]': {$nest: {'> *': {marginBottom: Spacing.large}}},
        '> *': {$nest: {'&:last-child': {marginBottom: 0}}}
      }
    },
    '&[data-justify-content="start"]': {justifyContent: 'flex-start'},
    '&[data-justify-content="end"]': {justifyContent: 'flex-end'},

    '&[data-align-items="start"]': {alignItems: 'flex-start'},
    '&[data-align-items="center"]': {alignItems: 'center'},
    '&[data-align-items="end"]': {alignItems: 'flex-end'}
  }
})

export interface FlexListProps {
  direction?: 'row' | 'column'
  justifyContent?: 'start' | 'end'
  alignItems?: 'start' | 'center' | 'end'
  spacing?: 'none' | 'small' | 'medium' | 'large'
  wrap?: boolean
  fill?: boolean
}

export const FlexList: React.StatelessComponent<FlexListProps> = props => {
  return (
    <div
      className={FlexListStyle}
      data-direction={props.direction || 'row'}
      data-justify-content={props.justifyContent || 'start'}
      data-align-items={props.alignItems || 'center'}
      data-spacing={props.spacing || 'small'}
      data-fill={boolAttr(props.fill)}
      data-wrap={boolAttr(props.wrap)}>
      {props.children}
    </div>
  )
}

export const FlexItemStyle = style({
  $debugName: 'FlexItem'
})

export interface FlexItemProps {
  grow?: number
  shrink?: number
}

export const FlexItem: React.StatelessComponent<FlexItemProps> = props => {
  return (
    <div className={FlexItemStyle} style={{flexGrow: props.grow, flexShrink: props.shrink}}>
      {props.children}
    </div>
  )
}

export const FlexFiller: React.StatelessComponent = () => {
  return <FlexItem grow={1} />
}

export const FlexCenterStyle = style({
  $debugName: 'FlexCenter',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  width: '100%',
  height: '100%'
})

export const FlexCenter: React.StatelessComponent = props => {
  return <div className={FlexCenterStyle}>{props.children}</div>
}
