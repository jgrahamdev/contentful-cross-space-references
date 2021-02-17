import React, { useState, useEffect } from 'react'
import {
  Modal, Option, TextInput, Button,
  Pill, EntryCard, Paragraph, Spinner
} from '@contentful/forma-36-react-components'
import { createClient, ContentfulClientApi, ContentType, Entry } from 'contentful'

import tokens from '@contentful/forma-36-tokens'
import { css } from 'emotion'

import { SpaceConfigItem } from '../ConfigScreen'
import { DialogProps, DialogParameters } from './index'

interface EntryListItemProps {
  entry: Entry<any>;
  contentTypes: Array<ContentType>;
}

const styles = {
  inputWrapper: css({
    paddingLeft: tokens.spacingXs,
    display: 'flex',
    background: tokens.colorWhite,
    border: '1px solid transparent',
    borderColor: tokens.colorElementMid,
    height: '38px',
    overflow: 'hidden',
    '&:focus-within, &:focus': {
      outline: 'none',
      borderColor: tokens.colorBlueMid,
      height: 'auto',
      overflow: 'visible',
    },
  }),
  input: css({
    flex: '1 1 auto',
    width: 'auto',
    height: '30px',
    '& > input': {
      padding: 0,
      border: 'none !important',
      boxShadow: 'none !important',
    },
  }),
  pillsInput: css({
    transition: 'margin 0.1s ease-in-out',
    display: 'flex',
    lineHeight: '30px',
    fontWeight: 600,
    height: '30px',
    marginTop: '3px',
    marginBottom: '3px',
    marginRight: '5px',
    borderRadius: '3px',
  }),
  pillLabel: css({
    alignItems: 'center',
  }),
  selectWrapper: css({
    display: 'block',
    position: 'relative',
    paddingRight: '5px',
  }),
  select: css({
    backgroundColor: tokens.colorBlueMid,
    marginBottom: '3px',
    marginRight: '-5px',
    height: '100%',
    borderRadius: '0 3px 3px 0',
    fontFamily: tokens.fontStackPrimary,
    fontWeight: 600,
    minWidth: '60px',
    maxWidth: '200px',
    color: '#fff',
    zIndex: 10,
    textOverflow: 'ellipsis',
    transition: 'width 0.1s ease-in-out 0s',
    padding: '0px 25px 0px 12px',
    display: 'flex',
  }),
  listWrapper: css({
    height: 500,
    paddingTop: tokens.spacingS,
    marginTop: `-${tokens.spacingS}`,
    overflow: "auto"
  }),
  emptyState: css({
    height: 300,
    marginTop: 200,
    textAlign: "center",
    width: "100%",
    textOverflow: "ellipsis"
  }),
  textWrapper: css({
    display: "flex",
    justifyContent: "space-between",
    marginBottom: tokens.spacingS
  }),
  listItemWrapper: css({
    display: "block",
    marginTop: tokens.spacingS
  }),
  centerTop: css({
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    '& > svg': {
      marginRight: tokens.spacingS,
    }
  })
}

const EntryPicker = (props:DialogProps) => {
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfigItem>({id: '', name: '', token: ''})
  const [client, setClient] = useState<ContentfulClientApi>()
  const [contentTypes, setContentTypes] = useState<Array<ContentType>>([])
  const [selectedContentType, setSelectedContentType] = useState<string>('any')
  const [query, setQuery] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [entries, setEntries] = useState<Array<Entry<any>>>([])
  const [selected, setSelected] = useState<Entry<any>>()

  const onContentTypeChange = (e:React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedContentType(e.currentTarget.value)
  }

  const onSearch = (e:React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.currentTarget.value)
  }

  const onEntrySelect = (e:React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    let selectedEntry = entries.find((entry) => entry.sys.id === e.currentTarget.dataset.entryId)
    if (selectedEntry) {
      setSelected(selectedEntry)
    }
  }

  const onSave = (e:React.MouseEvent<HTMLElement>) => {
    props.sdk.close(selected)
  }

  const onCancel = (e:React.MouseEvent<HTMLElement>) => {
    props.sdk.close()
  }

  const EntryListItem = (props:EntryListItemProps) => {
    const entry = props.entry
    const contentType = props.contentTypes.find((ct) => ct.sys.id === entry.sys.contentType.sys.id)

    if (!contentType) return null;

    const displayField = contentType && contentType.displayField ? contentType.displayField : 'title'

    return (
      <EntryCard
        title={entry.fields[displayField]}
        contentType={contentType.name}
        status="published"
        size="auto"
        className="test"
        onClick={onEntrySelect}
        selected={selected && entry.sys.id === selected.sys.id}
        data-entry-id={entry.sys.id}
      />
    )
  }

  // Start AutoResizer at initialization of component.
  useEffect(() => {
    props.sdk.window.startAutoResizer();
    return () => {
      return props.sdk.window.stopAutoResizer()
    }
  }, [props.sdk.window])

  // Grab content types for a given space.
  useEffect(() => {
    if (spaceConfig.id && spaceConfig.token) {

      let contentfulClient:ContentfulClientApi = createClient({
        space: spaceConfig.id,
        accessToken: spaceConfig.token,
      })

      setClient(contentfulClient)

      contentfulClient.getContentTypes()
        .then(ct => setContentTypes(ct.items))
    }

  }, [spaceConfig])

  useEffect(() => {
    let dialogParams = props.sdk.parameters.invocation as DialogParameters

    if (dialogParams.props.spaceConfig) {
      setSpaceConfig(dialogParams.props.spaceConfig)
    }
  }, [props.sdk.parameters.invocation])

  // Grab content based on search params, with a delay of 500ms
  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (query.length && client !== undefined) {
        setLoading(true)

        const params:any = {
          query: query
        }

        if (selectedContentType !== 'any') {
          params.content_type = selectedContentType
        }

        client.getEntries(params)
        .then(entries => {
          setLoading(false)
          setEntries(entries.items)
        })
      }
    }, 500)
    return () => clearTimeout(timeOutId)
  }, [query, selectedContentType, client])

  return (
    <>
      <Modal.Content>
        {spaceConfig.id && (
          <>
            <div className={styles.textWrapper} >
              <Paragraph>Search for an entry:</Paragraph>
            </div>
            <div className={styles.inputWrapper}>
              <div className={styles.pillsInput}>
                <Pill className={styles.pillLabel} label="Content type" />
                <div className={styles.selectWrapper} >
                  <select
                    className={styles.select}
                    name="contentType"
                    id="contentType"
                    onChange={onContentTypeChange}
                    value={selectedContentType}
                  >
                    <Option key="any" value="any">Any</Option>
                    {contentTypes.map((ct) => (
                      <Option key={ct.sys.id} value={ct.sys.id}>{ct.name}</Option>
                    ))}
                  </select>
                </div>
              </div>
              <TextInput
                className={styles.input}
                value={query}
                onChange={onSearch}
                placeholder="Type to search for entries"
              />
              {loading && (
                <div className={styles.centerTop}>
                  <Spinner />
                </div>
              )}
            </div>
            <div className={styles.listWrapper}>
              {entries.length ? (
                <>
                  {entries.map(entry => (
                    <div key={entry.sys.id} className={styles.listItemWrapper} >
                      <EntryListItem
                        entry={entry}
                        contentTypes={contentTypes}
                      />
                    </div>
                  ))}
                </>
              ) : (
                <div className={styles.emptyState} >
                  <Paragraph>
                    {query.length ? 'No entries found.' : 'Enter a search term above.'}
                  </Paragraph>
                </div>
              )}
            </div>
          </>
        )}
      </Modal.Content>
      <Modal.Controls>
        <Button buttonType="positive" onClick={onSave} disabled={selected === undefined}>Insert selected entry</Button>
        <Button buttonType="muted" onClick={onCancel}>Cancel</Button>
      </Modal.Controls>
    </>
  )

}

export default EntryPicker
