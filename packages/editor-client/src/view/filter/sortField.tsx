import * as React from 'react'
import {style} from 'typestyle'
import {SortConfiguration} from '@karma.run/editor-common'

import {
  Select,
  SelectStyle,
  Button,
  ButtonType,
  SelectType,
  Color,
  FontWeight,
  Spacing,
  IconName
} from '../../ui'

export const SortFieldStyle = style({
  $debugName: 'SortFieldStyle',

  display: 'flex',
  alignItems: 'center',

  $nest: {
    '> .label': {
      marginRight: Spacing.medium,
      color: Color.primary.base,
      fontWeight: FontWeight.bold,
      fontSize: '1.5rem'
    },

    [`> .${SelectStyle}`]: {
      width: '22rem'
    }
  }
})

export interface SortFieldProps {
  value: SortConfiguration
  descending: boolean
  configurations: SortConfiguration[]
  onChange: (sort: SortConfiguration, descending: boolean) => void
}

export class SortField extends React.Component<SortFieldProps> {
  private handleSortChange = (key: string | undefined) => {
    const sortConfig = this.props.configurations.find(sortConfig => sortConfig.key === key)
    this.props.onChange(sortConfig!, this.props.descending)
  }

  private handleSortDirectionChange = () => {
    this.props.onChange(this.props.value, !this.props.descending)
  }

  public render() {
    const options: Select.Option[] = this.props.configurations.map(config => ({
      key: config.key,
      label: config.label
    }))

    return (
      <div className={SortFieldStyle}>
        <div className="label">Sort</div>
        <Select
          options={options}
          type={SelectType.Light}
          onChange={this.handleSortChange}
          value={this.props.value.key}
          disableUnselectedOption
        />
        <Button
          type={ButtonType.Icon}
          icon={this.props.descending ? IconName.ArrowUp : IconName.ArrowDown}
          onTrigger={this.handleSortDirectionChange}
        />
      </div>
    )
  }
}
