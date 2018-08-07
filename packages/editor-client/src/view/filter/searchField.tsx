import * as React from 'react'
import {style} from 'typestyle'
import {Color, FontWeight, Spacing, InputStyle, TextInput, TextInputType} from '../../ui'

export const QuickSearchFieldStyle = style({
  $debugName: 'QuickSearchFieldStyle',

  display: 'flex',
  alignItems: 'center',

  $nest: {
    '> .label': {
      flexShrink: 0,
      marginRight: Spacing.medium,
      color: Color.primary.base,
      fontWeight: FontWeight.bold,
      fontSize: '1.5rem'
    },

    [`> .${InputStyle}`]: {
      width: '22rem'
    }
  }
})

export namespace QuickSearchField {
  export interface Props {
    value: string
    onChange: (value: string) => void
  }
}

export class QuickSearchField extends React.Component<QuickSearchField.Props> {
  public render() {
    return (
      <div className={QuickSearchFieldStyle}>
        <div className="label">Search</div>
        <TextInput
          type={TextInputType.Light}
          value={this.props.value}
          onChange={this.props.onChange}
          placeholder="Search..."
        />
      </div>
    )
  }
}
