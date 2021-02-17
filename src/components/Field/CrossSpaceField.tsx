import React, { useState, useEffect } from 'react';

import { Note } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { FieldExtensionSDK, SpaceAPI } from 'contentful-ui-extensions-sdk';

import { createClient, ContentfulClientApi, Entry, ContentType } from 'contentful'

import { createFakeSpaceAPI } from '@contentful/field-editor-test-utils'
import { SingleEntryReferenceEditor, CombinedLinkActions} from '@contentful/field-editor-reference'

import { AppInstallationParameters, SpaceConfigs } from '../ConfigScreen'

import { css } from 'emotion';

interface FieldProps {
  sdk: FieldExtensionSDK;
}

const styles = {
  note: css({
    marginBottom: tokens.spacingM
  })
}

const CrossSpaceField = (props: FieldProps) => {
  const [showNote, setShowNote] = useState<boolean>(true)
  const [value, setValue] = useState<any>(props.sdk.field.getValue())
  const [spaceConfigs, setSpaceConfigs] = useState<SpaceConfigs>([])
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [entry, setEntry] = useState<Entry<any>|undefined>()

  const onNoteClose = () => {
    setShowNote(false)
  }

  const onLinkEntry = async (spaceId: string | undefined, index?: number | undefined) => {
    let spaceConfig = spaceConfigs.find((config) => config.id === spaceId)

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
    props.sdk.dialogs.openAlert({
      title: 'Cross Space Reference',
      message: "At this time, editing of Cross Space References can't be done via slide-in navigation. If you would like to edit this entry, please open the entry in it's respective space.",
      confirmLabel: "Back to Editing"
    })
  }

  const renderCard = (props:any, renderDefaultCard:any) => {
    return renderDefaultCard({
      ...props,
      onEdit: onCrossSpaceEntryEdit
    })
  }

  // Start AutoResizer at initialization of component.
  useEffect(() => {
    props.sdk.window.startAutoResizer();
    return () => {
      return props.sdk.window.stopAutoResizer()
    }
  }, [props.sdk.window])

  // Grab app parameters.
  useEffect(() => {
    let installParams = props.sdk.parameters.installation as AppInstallationParameters

    setSpaceConfigs(installParams.spaceConfigs)
  }, [props.sdk.parameters.installation])

  // Update field value if needed.
  useEffect(() => {
    const detachValueChangeHandler = props.sdk.field.onValueChanged( async (value:any) => {
      setValue(value)
    })

    return () => {
      return detachValueChangeHandler()
    }
  }, [props.sdk.field])

  // Grab Content Type data from Cross Space if field value exists.
  useEffect(() => {
    if (value && spaceConfigs) {
      let spaceConfig = spaceConfigs.find((space) => space.id === value.sys.space.sys.id)
      if (spaceConfig) {
        let client = createClient({
          space: spaceConfig.id,
          accessToken: spaceConfig.token,
        }) as ContentfulClientApi

        client.getEntry(value.sys.id)
        .then(entry => {
          setEntry(entry)
        })

        client.getContentTypes()
        .then(contentTypes => {
          if (contentTypes && contentTypes.total > 0) {
            setContentTypes(contentTypes.items)
          }
        })
      }
    }
  }, [value, spaceConfigs])

  const createFakeSdk = (value:any, entry:Entry<any>|undefined, contentTypes:ContentType[]) => {

    const getClient = () => {
      let client
      if (value) {
        let installParams = props.sdk.parameters.installation as AppInstallationParameters

        let spaceConfig = installParams.spaceConfigs.find((space) => space.id === value.sys.space.sys.id)
        if (spaceConfig) {
          client = createClient({
            space: spaceConfig.id,
            accessToken: spaceConfig.token,
          }) as ContentfulClientApi
        }
      }

      return client
    }

    const customizeMock = (space: SpaceAPI): SpaceAPI => {
      return {
        ...space,
         getCachedContentTypes: () => {
          return contentTypes
         },
      }
    }

    const space = createFakeSpaceAPI(customizeMock)
    const sdk = {
      field: props.sdk.field,
      locales: props.sdk.locales,
      space: {
        ...space,
        getEntry: async (id: string) => {
          let client = getClient()
          if (client) {
            let entry = await client.getEntry(id) as any

            // Add fake version info so card reflects that content is published.
            return {...entry, sys: {...entry.sys, version: 10, publishedVersion: 10 }}
          }

          return Promise.reject()
        },
        async getEntityScheduledActions() {
          return [];
        }
      },
      dialogs: props.sdk.dialogs,
      navigator: props.sdk.navigator,
      access: {
        can: async () => true,
      },
    }

    return sdk
  }

  const LinkActions = (props:any) => {
    let fakeCts = spaceConfigs.map((config) => {
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
        canCreateEntity={true}
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
      {spaceConfigs.length > 0 &&
        <SingleEntryReferenceEditor
          viewType="link"
          sdk={createFakeSdk(value, entry, contentTypes) as any}
          isInitiallyDisabled={false}
          hasCardEditActions={false}
          parameters={{instance: {
            showCreateEntityAction: true,
            showLinkEntityAction: true
          }}}
          renderCustomCard={(props, _, renderDefaultCard) => {
            return renderCard(props, renderDefaultCard)
          }}
          renderCustomActions={(props) => <LinkActions {...props} /> }
        />
      }
    </>
  )
};

export default CrossSpaceField;
