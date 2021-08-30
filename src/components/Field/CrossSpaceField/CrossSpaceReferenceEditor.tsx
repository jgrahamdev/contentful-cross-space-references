import React, { useState, useEffect } from 'react'

import { createClient, Entry, ContentType, LocaleCollection, Locale } from 'contentful'
import { WrappedEntryCard, MissingEntityCard } from '@contentful/field-editor-reference'
import { EntryCard } from '@contentful/forma-36-react-components';
import { FieldExtensionSDK } from '@contentful/app-sdk'

import { SpaceConfiguration, CrossSpaceLink, CrossSpaceEntryData } from '../../../Types'
import CrossSpaceEntryActions from './CrossSpaceEntryActions'

interface CrossSpaceReferenceEditorProps {
  sdk: FieldExtensionSDK;
  spaceConfigs: SpaceConfiguration[];
  value?: {
    sys: CrossSpaceLink
  };
}

export const CrossSpaceReferenceEditor = (props:CrossSpaceReferenceEditorProps) => {
  const [crossSpaceEntryData, setCrossSpaceEntryData] = useState<CrossSpaceEntryData>()
  const [loading, setLoading] = useState(false)

  const getCrossSpaceEntryData = React.useCallback(async (link:CrossSpaceLink, spaceConfigs:SpaceConfiguration[]) => {
    let entryData:any = {}

    let spaceConfig = spaceConfigs.find((config:SpaceConfiguration) => link.space.sys.id === config.id)

    if (spaceConfig) {
      let client = createClient({
        space: spaceConfig.id,
        accessToken: spaceConfig.token,
      })

      let locales:LocaleCollection = await client.getLocales()
      if (locales && locales.total) {
          entryData.defaultLocale = locales.items.find((locale:Locale) => locale.default);
      }

      let entry:Entry<any> = await client.getEntry(link.id, {locale: '*'})
      if (entry) {

        //Add fake published data so that the correct status is shown.
        entryData.entry = {
          ...entry,
          sys: {
            ...entry.sys,
            version: entry.sys.revision,
            publishedVersion: entry.sys.revision
          }
        }

        let contentType:ContentType = await client.getContentType(entry.sys.contentType.sys.id)
        if (contentType) {
          entryData.contentType = contentType
        }
      }
    }

    return entryData
  }, [])

  const onRemoveEntry = () => {
    props.sdk.field.removeValue()
  }

  useEffect(() => {
    if (props.value) {
      setLoading(true)

      getCrossSpaceEntryData(props.value.sys, props.spaceConfigs)
      .then((data:CrossSpaceEntryData) => {
        setCrossSpaceEntryData(data)
        setLoading(false)
      })
    }
  }, [props.value, props.spaceConfigs, getCrossSpaceEntryData])

  let entryCardProps:any = {
    getEntityScheduledActions: async () => [],
    getAsset: async () => {},
    size: 'auto' as 'auto',
    isDisabled: false,
    localeCode: '',
    defaultLocaleCode: '',
    contentType: null,
    hasCardEditActions: true,
    isClickable: false,
  }

  const CrossSpaceEntryCard = (props:any) => {
    if (loading) {
      return <EntryCard loading />
    }

    if (props.crossSpaceEntryData) {
      return <WrappedEntryCard
        {...props.entryCardProps}
        entry={props.crossSpaceEntryData.entry}
        contentType={props.crossSpaceEntryData.contentType}
        localeCode={props.crossSpaceEntryData.defaultLocale.code}
        onRemove={props.onRemove}
      />
    }

    return <MissingEntityCard entityType="Entry" isDisabled={false} onRemove={props.onRemove} />
  }

  return (
    <>
      {props.value ?
        <CrossSpaceEntryCard crossSpaceEntryData={crossSpaceEntryData} entryCardProps={entryCardProps} onRemove={onRemoveEntry} />
      :
        <CrossSpaceEntryActions sdk={props.sdk} spaceConfigs={props.spaceConfigs} />
      }

    </>
  )
}
