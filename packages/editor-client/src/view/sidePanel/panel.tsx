import * as React from 'react'
import Fuse from 'fuse.js'
import {RefValue} from '@karma.run/editor-common'
import {style} from 'typestyle'
import memoizeOne from 'memoize-one'
import {EditorContext, ReadonlyRefMap, refToString, uniqueFilter} from '@karma.run/editor-common'

import {
  Color,
  Spacing,
  FontWeight,
  DefaultBorderRadiusPx,
  Select,
  SelectType,
  SearchInput,
  SearchInputResultItem
} from '../../ui'

import * as storage from '../../util/storage'

import {version} from '../../version'
import {SidePanelFooter} from './footer'
import {SidePanelSection, SidePanelSectionItem} from './section'

import {Theme, withTheme, Colors} from '../../context/theme'
import {SessionContext, withSession} from '../../context/session'
import {LocaleContext, withLocale} from '../../context/locale'

import {
  LocationActionContext,
  ListRecordsLocation,
  withLocationAction
} from '../../context/location'

import {ViewContext} from '../../api/viewContext'

export const GroupStateStorageKey = 'sidePanelGroupState_v1'

export interface FuseSearchItem {
  name: string
  slug: string
  model: RefValue
}

export interface SidePanelState {
  searchValue: string
  searchResults: FuseSearchItem[]
  groupState: {[id: string]: boolean}
  editorContext: EditorContext
}

export interface SidePanelProps {
  theme: Theme
  sessionContext: SessionContext
  localeContext: LocaleContext
  locationActionContext: LocationActionContext
}

export class SidePanel extends React.PureComponent<SidePanelProps, SidePanelState> {
  constructor(props: SidePanelProps) {
    super(props)
    this.state = {
      searchValue: '',
      searchResults: [],
      groupState: storage.get(GroupStateStorageKey) || {},
      editorContext: props.sessionContext.editorContexts[0]
    }
  }

  private handleLogoutClick = () => {
    this.props.sessionContext.invalidate()
  }

  private handleGroupClick = (id: string) => {
    this.toggleGroup(id)
  }

  private handleViewContextClick = (href: string) => {
    this.props.locationActionContext.pushLocation(
      this.props.locationActionContext.locationForURLPath(href)
    )
  }

  private handleEditorContextChange = (id?: string) => {
    if (!id) return

    const editorContext = this.props.sessionContext.editorContextMap.get(id)

    if (editorContext) {
      this.setState({editorContext})
    }
  }
  private handleSearchChange = (searchValue: string) => {
    const fuseInstance = this.getFuseInstance(
      this.state.editorContext,
      this.props.sessionContext.viewContextMap
    )

    const searchResults = fuseInstance.search(searchValue).slice(0, 5)
    this.setState({searchValue, searchResults})
  }

  private handleSearchItemClick = (item: SearchInputResultItem) => {
    this.setState({searchValue: '', searchResults: []})
    this.handleViewContextClick(item.href)
  }

  private toggleGroup(id: string) {
    const isOpen = this.state.groupState[id]
    const newGroupState = {...this.state.groupState, [id]: !isOpen}
    this.setState({groupState: newGroupState})

    storage.set(GroupStateStorageKey, newGroupState)
  }

  private getFuseInstance = memoizeOne(
    (editorContext: EditorContext, viewContextMap: ReadonlyRefMap<ViewContext>) => {
      const groups = editorContext.modelGroups
      const modelIDs = groups
        .map(group => group.models.map(model => refToString(model as RefValue))) // TODO: Fix internal ModelGroup type
        .reduce((acc, models) => acc.concat(models))
        .filter(uniqueFilter)

      const viewContexts = modelIDs
        .map(modelID => viewContextMap.get(modelID))
        .filter(viewContext => viewContext != undefined) as ViewContext[]

      const searchItems: FuseSearchItem[] = viewContexts.map(viewContext => ({
        name: viewContext.name,
        slug: viewContext.slug,
        model: viewContext.model
      }))

      return new Fuse<FuseSearchItem>(searchItems, {
        shouldSort: true,
        tokenize: true,
        matchAllTokens: false,
        location: 0,
        distance: 50,
        threshold: 0.5,
        keys: ['name']
      })
    }
  )

  private getActiveModelGroups = memoizeOne((editorContext: EditorContext) => {
    return editorContext.modelGroups
  })

  public render() {
    const sessionContext = this.props.sessionContext
    const groups = this.getActiveModelGroups(this.state.editorContext)

    const groupSections = groups.map(group => {
      const items: SidePanelSectionItem[] = group.models.map(model => {
        const viewContext = sessionContext.viewContextMap.get(model)

        if (!viewContext) {
          const viewContext = sessionContext.viewContextMap.get(model)
          const label = viewContext ? viewContext.name : refToString(model as RefValue) // TODO: Fix internal ModelGroup type
          return {id: `noPermission_${model}`, label}
        }

        return {
          id: refToString(viewContext.model),
          label: viewContext.name,
          href: this.props.locationActionContext.urlPathForLocation(
            ListRecordsLocation(viewContext.slug)
          )
        }
      })

      return (
        <SidePanelSection
          key={group.name}
          id={group.name}
          isOpen={this.state.groupState[group.name]}
          onClick={this.handleGroupClick}
          onItemClick={this.handleViewContextClick}
          items={items}
          label={group.name}
          icon={''}
        />
      )
    })

    let editorContextSelect: React.ReactNode

    if (sessionContext.editorContexts.length > 1) {
      const editorContextOptions = sessionContext.editorContexts.map(context => ({
        key: context.name,
        label: context.name
      }))

      editorContextSelect = (
        <Select
          options={editorContextOptions}
          type={SelectType.Light}
          value={this.state.editorContext.name}
          disableUnselectedOption
          onChange={this.handleEditorContextChange}
        />
      )
    }

    const searchInputResults: SearchInputResultItem[] = this.state.searchResults.map(
      searchResult => ({
        id: searchResult.model,
        title: searchResult.name,
        subtitle: searchResult.slug,
        href: this.props.locationActionContext.urlPathForLocation(
          ListRecordsLocation(searchResult.slug)
        )
      })
    )

    return (
      <div className={SidePanelStyle(this.props.theme.colors)}>
        <div className="content">
          <div className="header">
            <div className="logo" title={`v${version}`}>
              <this.props.theme.logo />
            </div>
            <SearchInput
              onChange={this.handleSearchChange}
              onItemSubmit={this.handleSearchItemClick}
              value={this.state.searchValue}
              placeholder="Search..."
              results={searchInputResults}
            />
          </div>
          <div className="modelGroups">{groupSections}</div>
          {editorContextSelect}
        </div>
        <SidePanelFooter
          username={sessionContext.session!.username}
          developmentMode={sessionContext.developmentMode}
          localeContext={this.props.localeContext}
          onLogoutTrigger={this.handleLogoutClick}
        />
      </div>
    )
  }
}

export const SidePanelContainer = withSession(withLocationAction(withTheme(withLocale(SidePanel))))

export const SidePanelStyle = (colors: Colors) =>
  style({
    $debugName: 'SidePanel',

    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    alignItems: 'center',

    height: '100%',
    width: '26rem',

    backgroundColor: colors.primary,

    $nest: {
      '> .content': {
        display: 'flex',
        flexDirection: 'column',
        padding: Spacing.larger,
        height: '100%',
        width: '100%',

        $nest: {
          '> .header': {
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            marginBottom: Spacing.largest,
            fontSize: '1.1em',

            $nest: {
              '> .logo': {
                height: '10rem',
                marginTop: Spacing.medium,
                marginBottom: Spacing.largest,
                textAlign: 'center',

                $nest: {
                  '> svg': {
                    fill: Color.neutral.white,
                    height: '100%'
                  }
                }
              }
            }
          },

          '> .modelGroups': {
            paddingRight: Spacing.larger,
            marginBottom: Spacing.largest,

            overflowY: 'auto',
            width: '100%',
            flexGrow: 1,
            fontWeight: FontWeight.medium,

            $nest: {
              '&::-webkit-scrollbar-track': {
                borderRadius: DefaultBorderRadiusPx,
                backgroundColor: Color.primary.light1
              },

              '&::-webkit-scrollbar': {
                width: '0.5rem',
                backgroundColor: 'transparent'
              },

              '&::-webkit-scrollbar-thumb': {
                borderRadius: DefaultBorderRadiusPx,
                backgroundColor: Color.neutral.white
              }
            }
          }
        }
      }
    }
  })
