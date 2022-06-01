import React, { useState, useEffect } from 'react'

import { DialogExtensionSDK } from '@contentful/app-sdk'
import { createClient, ContentType, Entry, ContentfulClientApi } from 'contentful'
import { Modal, TextInput, Button, EntryCard, Paragraph, Spinner, Icon } from '@contentful/forma-36-react-components'

import { SpaceConfiguration } from '../../Types'

import * as EntryPickerStyles from './EntryPickerStyles'

interface EntryPickerProps {
  sdk: DialogExtensionSDK;
  spaceConfig: SpaceConfiguration;
}

interface EntryListProps {
  entries: Entry<any>[];
  contentTypes: ContentType[];
  query: string
  selectedEntry?: Entry<any>;
  onSelect: (entry:Entry<any>) => void;
}

interface EntryListItemProps {
  entry: Entry<any>;
  contentType: ContentType | undefined;
  selectedEntry?: Entry<any>;
  onSelect: (entry:Entry<any>) => void;
}

const EntryPickerDialog = (props:EntryPickerProps) => {
  const spaceConfig = props.spaceConfig

  const [client, setClient] = useState<ContentfulClientApi>()
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [selectedContentType, setSelectedContentType] = useState<string>('any')
  const [query, setQuery] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [entries, setEntries] = useState<Entry<any>[]>([])
  const [selected, setSelected] = useState<Entry<any>>()

  const onContentTypeChange = (e:React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedContentType(e.target.value)
  }

  const onQueryChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const compareContentTypesByName = (a: ContentType, b: ContentType) => a.name.localeCompare(b.name)

  useEffect(() => {
    let init = createClient({
      space: spaceConfig.spaceId,
      accessToken: spaceConfig.token,
      environment: spaceConfig.environment || 'master',
    })

    setClient(init)
  }, [spaceConfig])

  // Grab content types for a given space.
  useEffect(() => {
    if (client) {
      client.getContentTypes()
      .then(res => setContentTypes(res.items.sort(compareContentTypesByName)))
    }

  }, [client])

  // Grab content based on search params, with a delay of 500ms
  useEffect(() => {
    console.log(selectedContentType)
    const timeOutId = setTimeout(() => {
      if (query.length && client !== undefined) {
        setLoading(true)

        const params:any = {
          query: query,
          content_type: selectedContentType !== 'any' ? selectedContentType : undefined
        }

        client.getEntries(params)
        .then(res => {
          setLoading(false)
          setEntries(res.items)
        })
      }
    }, 500)
    return () => clearTimeout(timeOutId)
  }, [query, selectedContentType, client])

  return (
    <div className={EntryPickerStyles.modalRoot}>
      <Modal.Header title="Insert Cross Space Entry" onClose={() => props.sdk.close()} />
      <Modal.Content className={EntryPickerStyles.modal.content}>
        <EntryPickerTopBar />
        <EntryPickerSearch
          contentTypes={contentTypes}
          selectValue={selectedContentType}
          onSelectChange={onContentTypeChange}
          query={query}
          onQueryChange={onQueryChange}
          isLoading={loading}
        />
        <EntryList
          entries={entries}
          contentTypes={contentTypes}
          onSelect={setSelected}
          selectedEntry={selected}
          query={query}
        />
      </Modal.Content>
      <Modal.Controls>
        <Button buttonType="positive" onClick={() => props.sdk.close(selected)} disabled={selected === undefined}>Insert selected entry</Button>
        <Button buttonType="muted" onClick={() => props.sdk.close()}>Cancel</Button>
      </Modal.Controls>
    </div>
  )
}

// EntitySelectorTopBar.tsx
const EntryPickerTopBar = () => {
  return (
    <div className={EntryPickerStyles.topBar.root}>
      <Paragraph>Search for an entry:</Paragraph>
    </div>
  )
}

// EntitySelectorSearch.tsx
const EntryPickerSearch = (props:any) => {
  let styles = EntryPickerStyles.search

  return (
    <div className={styles.root} >
      <div className={styles.wrapper} >
        <div className={styles.inputWrapper} >
          <div className={styles.pillsInput} >
            <EntryPickerContentTypePill {...props} />
            <TextInput
              className={styles.input}
              placeholder="Type to search for entries"
              value={props.query}
              onChange={props.onQueryChange}
            />
          </div>
          {props.isLoading && <Spinner className={styles.spinner} />}
        </div>
      </div>
    </div>
  )
}

const EntryPickerContentTypePill = (props:any) => {
  let styles = EntryPickerStyles.filterPill
  return (
    <div className={styles.root} >
      <div className={styles.label}>Content type</div>
      <EntryPickerContentTypeSelect {...props} />
    </div>
  )
}

const EntryPickerContentTypeSelect = (props:{
    contentTypes:ContentType[];
    selectValue: string;
    onSelectChange: () => void;
  }) => {
  let styles = EntryPickerStyles.selectValueInput

  const getSelectWidth = (label:string) => {
    const width = label.length + 5;
    let value = Math.max(7, width);
    if (value > 20) {
      value = 20;
    }
    return value.toString() + 'ch';
  }

  return (
    <div className={styles.selectContainer}>
      <div className={styles.root}>
        <select
          className={styles.select}
          title={props.selectValue}
          style={{ width: getSelectWidth(props.selectValue)}}
          onChange={props.onSelectChange}
          value={props.selectValue}
        >
          <option className={styles.option} value="any">Any</option>

          {props.contentTypes.map((contentType:ContentType) => (
            <option key={contentType.sys.id} value={contentType.sys.id} className={styles.option}>{contentType.name}</option>
          ))}

        </select>
        <span className={styles.caret}>
          <Icon icon="ArrowDown" color="white" size="small" />
        </span>
      </div>
    </div>
  )
}

const EntryList = (props:EntryListProps) => {
  let styles = EntryPickerStyles.entryList

  return (
    <div className={styles.root}>
      {props.entries.length ? (
        <>
          {props.entries.map((entry:Entry<any>) => (
            <div key={entry.sys.id} className={styles.entryItem} >
              <EntryListItem
                entry={entry}
                contentType={props.contentTypes.find((ct) => ct.sys.id === entry.sys.contentType.sys.id)}
                onSelect={props.onSelect}
                selectedEntry={props.selectedEntry}
              />
            </div>
          ))}
        </>
      ) : (
        <div className={styles.empty} >
          <Paragraph>
            {props.query.length ? 'No entries found.' : 'Enter a search term above.'}
          </Paragraph>
        </div>
      )}
    </div>
  )
}

const EntryListItem = (props:EntryListItemProps) => {

  let entryTitle = 'Untitled'
  if (props.contentType && props.contentType.displayField && props.entry.fields[props.contentType.displayField]) {
    entryTitle = props.entry.fields[props.contentType.displayField]
  }

  return (
      <EntryCard
        title={entryTitle}
        contentType={props.contentType ? props.contentType.name : null}
        status="published"
        size="auto"
        className="test"
        onClick={() => props.onSelect(props.entry)}
        selected={props.selectedEntry && (props.entry.sys.id === props.selectedEntry.sys.id)}
      />
  )
}

export default EntryPickerDialog
