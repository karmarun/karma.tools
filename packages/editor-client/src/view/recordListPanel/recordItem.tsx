import * as React from 'react'

import {ReadonlyRefMap} from '@karma.run/editor-common'
import {Card, CardFooter, DescriptionView} from '../../ui'

import {ModelRecord} from '../../context/session'
import {LocaleContext} from '../../context/locale'
import {ViewContext} from '../../api/viewContext'

export interface RecordItemProps {
  record: ModelRecord
  viewContext: ViewContext
  viewContextMap: ReadonlyRefMap<ViewContext>
  localeContext: LocaleContext
}

export class RecordItem extends React.Component<RecordItemProps> {
  public render() {
    const _ = this.props.localeContext.get

    const updatedDateString = this.props.record.updated.toLocaleDateString(
      this.props.localeContext.locale,
      {hour: 'numeric', minute: 'numeric'}
    )

    const createdDateString = this.props.record.created.toLocaleDateString(
      this.props.localeContext.locale,
      {hour: 'numeric', minute: 'numeric'}
    )

    return (
      <Card>
        <DescriptionView
          viewContext={this.props.viewContext}
          record={this.props.record}
          viewContextMap={this.props.viewContextMap}
        />
        <CardFooter
          contentLeft={
            <>
              <div>
                {_('recordUpdated')}: {updatedDateString}
              </div>
              <div>
                {_('recordCreated')}: {createdDateString}
              </div>
            </>
          }
          contentRight={this.props.children}
        />
      </Card>
    )
  }
}
