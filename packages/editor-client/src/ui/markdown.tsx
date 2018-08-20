import React from 'react'
import ReactMarkdown from 'react-markdown'

interface LinkProps {
  href?: string
  title?: string
}

const Link: React.StatelessComponent<LinkProps> = props => {
  return (
    <a title={props.title} href={props.href} target="_blank">
      {props.children}
    </a>
  )
}

export interface MarkdownProps {
  source: string
}

export const Markdown: React.StatelessComponent<MarkdownProps> = props => {
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
