import * as React from 'react'

import {style} from 'typestyle'
import {Icon, IconName, Color, Spacing, FontWeight} from '../../ui'

export interface SidePanelSectionItem {
  id: string
  label: string
  href?: string
  icon?: string
}

export interface SidePanelSectionProps {
  id: string
  items: SidePanelSectionItem[]
  label: string
  icon: string
  isOpen: boolean
  onClick: (id: string) => void
  onItemClick: (href: string) => void
}

export class SidePanelSection extends React.Component<SidePanelSectionProps> {
  private handleHeaderClick = () => {
    this.props.onClick(this.props.id)
  }

  private handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (e.currentTarget.href) this.props.onItemClick(e.currentTarget.href)
  }

  public render() {
    let content: React.ReactNode

    if (this.props.isOpen) {
      const items = this.props.items.map(item => (
        <a className="item" key={item.id} href={item.href} onClick={this.handleItemClick}>
          {item.label}
        </a>
      ))

      content = <div className="content">{items}</div>
    }

    return (
      <div className={SidePanelSection.Style}>
        <div className="header" onClick={this.handleHeaderClick}>
          <Icon name={this.props.isOpen ? IconName.SectionCollapse : IconName.SectionUncollapse} />
          {this.props.label}
        </div>
        <div className="itemWrapper">{content}</div>
      </div>
    )
  }
}

export namespace SidePanelSection {
  export const Style = style({
    $debugName: 'SidePanelSection',

    marginBottom: Spacing.larger,
    fontSize: '1.6rem',

    $nest: {
      '> .header': {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        fontWeight: FontWeight.medium,

        $nest: {
          [`> .${Icon.Style}`]: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            fill: Color.neutral.white,
            marginRight: Spacing.medium
          }
        }
      },

      '> .itemWrapper': {
        marginTop: Spacing.large,
        paddingLeft: Spacing.largest,

        $nest: {
          '> .content': {
            display: 'flex',
            flexDirection: 'column',

            $nest: {
              '> .item': {
                fontSize: '0.9em',
                marginBottom: Spacing.medium,
                width: '100%',
                opacity: 0.5,

                $nest: {
                  '&[href]': {
                    opacity: 1
                  }
                }
              }
            }
          }
        }
      }
    }
  })
}
