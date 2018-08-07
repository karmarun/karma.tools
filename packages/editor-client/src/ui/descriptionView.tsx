import * as React from 'react'

import {ReadonlyRefMap, keyPathToString, refToPrettyString} from '@karma.run/editor-common'

import {CardSection} from './card'
import {ViewContext} from '../api/viewContext'
import {ModelRecord} from '../context/session'

export interface DescriptionViewProps {
  viewContext: ViewContext
  viewContextMap: ReadonlyRefMap<ViewContext>
  record: ModelRecord
}

export function contentForViewContext(
  record: ModelRecord,
  viewContext: ViewContext
): React.ReactNode[] {
  if (!viewContext.displayKeyPaths) return []

  return viewContext.displayKeyPaths.map(keyPath => {
    const field = viewContext.field.traverse(keyPath)
    const key = keyPathToString(keyPath)

    if (field) {
      const values = viewContext.field.valuesForKeyPath(record.value, keyPath)

      return values.map((value, index) => (
        <React.Fragment key={`${key}.${index}`}>
          {field.renderListComponent({value})}
        </React.Fragment>
      ))
    } else {
      return <React.Fragment key={key}>Invalid keyPath: {key}</React.Fragment>
    }
  })
}

export class DescriptionView extends React.Component<DescriptionViewProps> {
  public render() {
    const content: React.ReactNode[] = contentForViewContext(
      this.props.record,
      this.props.viewContext
    )

    if (content.length > 0) {
      return <>{content}</>
    }

    const viewContext = this.props.viewContextMap.get(this.props.record.id)

    return (
      <>
        <CardSection>
          {`${refToPrettyString(this.props.record.id)} ${
            viewContext ? `(${viewContext.name})` : ''
          }`}
        </CardSection>
      </>
    )
  }
}
