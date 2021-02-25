import React, { useState, useEffect, useLayoutEffect } from 'react';

import { createClient, ContentfulClientApi, Entry, ContentType } from 'contentful'
import { FieldExtensionSDK, SpaceAPI } from '@contentful/app-sdk';
import { Note } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';

import { createFakeSpaceAPI } from '@contentful/field-editor-test-utils'
import { SingleEntryReferenceEditor, CombinedLinkActions} from '@contentful/field-editor-reference'

import { spaceConfiguration } from '../ConfigScreen'

import { css } from 'emotion';

interface CrossSpaceFieldProps {
  sdk: FieldExtensionSDK;
  spaceConfigs: spaceConfiguration[];
  value: any;
}

const styles = {
  note: css({
    marginBottom: tokens.spacingM
  })
}

const CrossSpaceField = (props: CrossSpaceFieldProps) => {
  const [showNote, setShowNote] = useState<boolean>(true)
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const spaceConfigs = props.spaceConfigs

  const getClient = () => {
    if (props.value) {
      let spaceConfig = props.spaceConfigs.find((space) => space.id === props.value.sys.space.sys.id)

      if (spaceConfig) {
        return createClient({
          space: spaceConfig.id,
          accessToken: spaceConfig.token
        })
      }
    }

    return null
  }

  const onNoteClose = () => {
    setShowNote(false)
  }

  const onLinkEntry = async (spaceId: string | undefined, index?: number | undefined) => {
    let spaceConfig = props.spaceConfigs.find((config) => config.id === spaceId)

    if (spaceConfig) {
      props.sdk.dialogs.openCurrentApp({
        position: 'center',
        title: 'Insert cross-space entry',
        parameters: {
          dialog: 'EntryPicker',
          props: {spaceConfig: spaceConfig}
        },
        width: 800
      })
      .then((response:Entry<any>|undefined) => {
        if (response !== undefined) {
          props.sdk.field.setValue({
            sys: {
              type: "Link",
              linkType: "CrossSpaceEntry",
              id: response.sys.id,
              space: response.sys.space,
            }
          })
          .catch((err) => {
            props.sdk.notifier.error(err)
          })
        }
      })
    }
  }

  const onCrossSpaceEntryEdit = () => {
    props.sdk.dialogs.openCurrentApp({
      title: 'Cross Space Reference',
      shouldCloseOnOverlayClick: true,
      shouldCloseOnEscapePress: true,
      parameters: {
        dialog: 'CrossSpaceEntry',
        props: {
          entry: props.value
        }
      }
    })
  }

  const customizeMock = (api: SpaceAPI): SpaceAPI => {
    return {
      ...api,
      getCachedContentTypes: () => {
        return contentTypes
      },
    }
  }

  const space = createFakeSpaceAPI(customizeMock as any)

  let fakeSdk = {
    ...props.sdk,
    space: {
      ...space,
      getEntry: async (id: string) => {
        let client = getClient()
        if (client) {
          let entry = await client.getEntry(id, {locale: '*'}) as Entry<any>
          return {
            ...entry,
            sys: {
              ...entry.sys,
              version: 10,
              publishedVersion: 10
            },
          }
        }
        return Promise.reject()
      },
      async getEntityScheduledActions() {
        return [];
      }
    },
    access: {
      can: async () => true
    },
  }

  // Start AutoResizer at initialization of component.
  useEffect(() => {
    props.sdk.window.startAutoResizer();
    return () => {
      return props.sdk.window.stopAutoResizer()
    }
  }, [props.sdk.window])

  // Grab Content Type data from Cross Space if field value exists.
  useLayoutEffect(() => {
    if (props.value && props.spaceConfigs.length) {
      let spaceConfig = props.spaceConfigs.find((space) => space.id === props.value.sys.space.sys.id)
      if (spaceConfig) {
        let client = createClient({
          space: spaceConfig.id,
          accessToken: spaceConfig.token,
        }) as ContentfulClientApi

        client.getContentTypes()
        .then(contentTypes => {
          if (contentTypes && contentTypes.total > 0) {
            setContentTypes(contentTypes.items)
          }
        })
      }
    }
  }, [props.value, props.spaceConfigs])

  const renderCard = (props:any, linkActionsProps:any, renderDefaultCard:any) => {
    return renderDefaultCard({
      ...props,
      onEdit: onCrossSpaceEntryEdit
    })
  }

  const LinkActions = (props:any) => {
    let fakeCts = spaceConfigs.map((config:any) => {
      return {
        description: '',
        name: config.name,
        sys: {
          id: config.id,
          type: 'Space'
        }
      }
    })

    return (
      <CombinedLinkActions
        {...props}
        onCreate={onLinkEntry}
        contentTypes={fakeCts}
        combinedActionsLabel="Add Content from another Space"
      />
    )

  }

  return (
    <>
      {showNote &&
        <Note
          hasCloseButton
          noteType="primary"
          onClose={onNoteClose}
          className={styles.note}
        >
          Search for and select entries from a space other than the one you are currently using. You may see entries in this list that you don't have access to manage within Contentful.
        </Note>
      }
      {fakeSdk &&
        <SingleEntryReferenceEditor
          viewType="link"
          sdk={fakeSdk as any}
          isInitiallyDisabled={false}
          hasCardEditActions={false}
          parameters={{instance: {
            showCreateEntityAction: true,
            showLinkEntityAction: false
          }}}
          renderCustomCard={renderCard}
          renderCustomActions={(props) => <LinkActions {...props} /> }
        />
      }
    </>
  )
};

export default CrossSpaceField;
