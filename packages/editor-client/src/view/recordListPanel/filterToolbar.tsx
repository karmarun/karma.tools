import React from 'react'
import {style} from 'typestyle'
import {SortConfiguration, FilterConfiguration} from '@karma.run/editor-common'

import {Spacing, Button, IconName, ButtonType} from '../../ui'
import {QuickSearchFieldStyle, QuickSearchField} from '../filter/searchField'
import {SortFieldStyle, SortField} from '../filter/sortField'
import {ViewContext} from '../../api/viewContext'

export const ToolbarFilterStyle = style({
  display: 'flex',

  $nest: {
    [`> .${QuickSearchFieldStyle}`]: {
      marginRight: Spacing.largest
    },

    [`> .${SortFieldStyle}`]: {
      marginRight: Spacing.large,
      $nest: {'&:last-child': {marginRight: 0}}
    }
  }
})

export interface ToolbarProps {
  disableQuickSearch: boolean
  viewContext: ViewContext
  sortConfigurations: SortConfiguration[]
  sortValue: SortConfiguration
  sortDescending: boolean
  filterConfigurations: FilterConfiguration[]
  quickSearchValue: string
  isFilterActive: boolean

  onQuickSearchChange: (value: string) => void
  onSortChange: (value: SortConfiguration, descending: boolean) => void
  onToggleFilter: () => void
}

export interface ToolbarFilterState {}

export class ToolbarFilter extends React.Component<ToolbarProps> {
  public render() {
    return (
      <div className={ToolbarFilterStyle}>
        {!this.props.disableQuickSearch && (
          <QuickSearchField
            value={this.props.quickSearchValue}
            onChange={this.props.onQuickSearchChange}
          />
        )}
        <SortField
          configurations={this.props.sortConfigurations}
          value={this.props.sortValue}
          descending={this.props.sortDescending}
          onChange={this.props.onSortChange}
        />
        {this.props.filterConfigurations.length > 0 && (
          <Button
            icon={IconName.FilterList}
            type={ButtonType.Icon}
            onTrigger={this.props.onToggleFilter}
            selected={this.props.isFilterActive}
          />
        )}
      </div>
    )
  }
}
