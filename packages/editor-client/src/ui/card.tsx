import * as React from 'react'

import {style} from 'typestyle'
import {url} from 'csx'

import {
  Color,
  Spacing,
  FontSize,
  DefaultBorderRadiusPx,
  FontWeight,
  marginLeftExceptFirst,
  MarkerWidth
} from './style'

import {Markdown} from './markdown'

export interface CardFooterProps {
  contentLeft?: React.ReactNode
  contentRight?: React.ReactNode
}

export const CardFooterStyle = style({
  $debugName: 'CardFooter',

  padding: Spacing.medium,

  borderTop: `1px solid ${Color.neutral.light2}`,
  backgroundColor: Color.neutral.light4,

  display: 'flex',
  alignItems: 'center',

  color: Color.primary.light1,
  fontSize: FontSize.small,
  fontWeight: FontWeight.light,

  width: '100%',

  $nest: {
    '> .contentLeft': {
      display: 'flex',
      alignItems: 'center',
      flexGrow: 1,

      width: '100%',
      opacity: 0.75,

      $nest: {
        '> *': marginLeftExceptFirst(Spacing.medium)
      }
    },

    '> .contentRight': {
      display: 'flex',

      flexGrow: 0,
      flexShrink: 0,
      opacity: 0.25,

      $nest: {
        '> *': marginLeftExceptFirst(Spacing.large)
      }
    }
  }
})

export class CardFooter extends React.Component<CardFooterProps> {
  public render() {
    return (
      <div className={CardFooterStyle}>
        <div className="contentLeft">{this.props.contentLeft}</div>
        <div className="contentRight">{this.props.contentRight}</div>
      </div>
    )
  }
}

export interface CardProps {
  depth?: number
  markerColor?: string
}

export class Card extends React.Component<CardProps> {
  public render() {
    return (
      <div className={CardStyle}>
        {this.props.markerColor && (
          <div className={'marker'} style={{backgroundColor: this.props.markerColor}} />
        )}
        <div className={'content'}>{this.props.children}</div>
      </div>
    )
  }
}

export const CardStyle = style({
  $debugName: 'Card',

  display: 'flex',
  flexDirection: 'row',
  flexShrink: 0,
  width: '100%',
  borderRadius: DefaultBorderRadiusPx,
  overflow: 'hidden',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  backgroundColor: Color.neutral.white,

  $nest: {
    '> .marker': {width: MarkerWidth, flexShrink: 0},
    '> .content': {display: 'flex', flexDirection: 'column', width: '100%'},
    [`&:hover > .content .${CardFooterStyle} > .contentRight`]: {opacity: 1}
  }
})

export const CardSectionStyle = style({
  $debugName: 'CardSection',

  display: 'flex',
  flexDirection: 'column',
  padding: Spacing.medium,
  marginTop: '-1px',
  color: Color.primary.base,

  $nest: {
    '&:first-child': {marginTop: 0}
  }
})

export const CardSection: React.StatelessComponent = props => {
  return <div className={CardSectionStyle}>{props.children}</div>
}

export const CardErrorsStyle = style({
  $debugName: 'CardError',

  display: 'flex',
  flexDirection: 'column',
  padding: Spacing.medium,
  border: `1px solid ${Color.error.light1}`,
  backgroundColor: Color.error.light2,
  color: Color.error.dark1,

  marginTop: '-1px',
  $nest: {
    '&:first-child': {marginTop: 0}
  }
})

export const CardError: React.StatelessComponent = props => {
  return <div className={CardErrorsStyle}>{props.children}</div>
}

export const CardLabelStyle = style({
  $debugName: 'CardLabel',
  display: 'block',

  color: Color.primary.base,
  fontSize: FontSize.medium,
  fontWeight: FontWeight.bold
})

export interface CardLabelProps {
  text?: string
}

export const CardLabel: React.StatelessComponent<CardLabelProps> = props => {
  if (props.text) return <label className={CardLabelStyle}>{props.text}</label>
  return null
}

export const CardDescriptionStyle = style({
  $debugName: 'CardDescription',
  display: 'block',

  color: Color.primary.base,
  fontSize: FontSize.small,

  $nest: {
    'p:first-child': {marginTop: 0},
    'p:last-child': {marginBottom: 0}
  }
})

export interface CardDescriptionProps {
  text?: string
}

export const CardDescription: React.StatelessComponent<CardDescriptionProps> = props => {
  if (props.text) {
    return (
      <div className={CardDescriptionStyle}>
        <Markdown source={props.text} />
      </div>
    )
  }

  return null
}

export interface CardImageProps {
  src: string
}

export interface CardImageState {
  isVisible: boolean
}

export const CardImageStyle = style({
  $debugName: 'CardImage',

  position: 'relative',
  zIndex: 1,
  height: '10rem',
  backgroundColor: Color.neutral.light3,
  backgroundSize: 0,
  marginTop: '-1px',

  overflow: 'hidden',

  $nest: {
    '&:first-child': {marginTop: 0},

    '&:after': {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      content: '""',
      backgroundImage: 'inherit',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      backgroundPosition: 'center'
    },

    '&:before': {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      opacity: 0.25,
      content: '""',
      backgroundImage: 'inherit',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      filter: 'blur(30px)'
    }
  }
})

export class CardImage extends React.Component<CardImageProps, CardImageState> {
  public state: CardImageState = {isVisible: false}

  private element?: HTMLDivElement | null
  private ovbserver?: IntersectionObserver

  public componentDidMount() {
    this.ovbserver = new IntersectionObserver(entries => {
      if (entries[0].intersectionRatio > 0) {
        this.setState({isVisible: true})
        this.ovbserver!.disconnect()
        this.ovbserver = undefined
      }
    })

    this.ovbserver.observe(this.element!)
  }

  public componentWillUnmount() {
    if (this.ovbserver) {
      this.ovbserver.disconnect()
      this.ovbserver = undefined
    }
  }

  public render() {
    let style: React.CSSProperties = {}

    if (this.state.isVisible) {
      style = {backgroundImage: url(encodeURI(this.props.src))}
    }

    return (
      <div className={CardImageStyle} style={style} ref={element => (this.element = element)} />
    )
  }
}

export interface CardDocumentProps {
  extension?: string
}

export const CardDocumentStyle = style({
  $debugName: 'CardDocument',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '10rem',
  marginTop: '-1px',
  overflow: 'hidden',
  backgroundColor: Color.neutral.light4,

  $nest: {
    '&:first-child': {marginTop: 0}
  }
})

export const CardDocumentIconStyle = style({
  $debugName: 'CardDocumentIcon',
  padding: `${Spacing.large} ${Spacing.medium}`,
  border: `1px solid ${Color.neutral.light1}`,
  backgroundColor: Color.neutral.white,
  color: Color.neutral.dark2,
  borderRadius: DefaultBorderRadiusPx,
  fontWeight: 'bold',
  minWidth: '4.8rem',
  textAlign: 'center'
})

export const CardDocumentIcon: React.StatelessComponent<CardDocumentProps> = props => {
  return <div className={CardDocumentIconStyle}>{props.extension ? `${props.extension}` : '?'}</div>
}

export const CardDocument: React.StatelessComponent<CardDocumentProps> = props => {
  return (
    <div className={CardDocumentStyle}>
      <CardDocumentIcon {...props} />
    </div>
  )
}
