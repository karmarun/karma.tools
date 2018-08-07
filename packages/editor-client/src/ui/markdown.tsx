import React from 'react'
import ReactMarkdown from 'react-markdown'

namespace Link {
  export interface Props {
    href?: string
    title?: string
  }
}

const Link: React.StatelessComponent<Link.Props> = props => {
  return (
    <a title={props.title} href={props.href} target="_blank">
      {props.children}
    </a>
  )
}

export namespace Markdown {
  export interface Props {
    source: string
  }
}

export const Markdown: React.StatelessComponent<Markdown.Props> = props => {
  return (
    <ReactMarkdown
      source={props.source}
      escapeHtml
      renderers={{
        link: Link
      }}
    />
  )
}
