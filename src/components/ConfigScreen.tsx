import React, { useState, useEffect } from 'react';

import { AppExtensionSDK } from '@contentful/app-sdk';
import {
  Heading, Form, Workbench, Paragraph, Note,
  Button, IconButton, Dropdown, DropdownList, DropdownListItem,
  Table, TableHead, TableCell, TableRow, TableBody
} from '@contentful/forma-36-react-components';

import { SpaceConfiguration } from '../Types'

interface ConfigProps {
  sdk: AppExtensionSDK;
}

interface InstallationParams {
  spaceConfigs?: SpaceConfiguration[]
}

interface SpaceConfigRowProps {
  spaceConfig:SpaceConfiguration;
  onEdit: (id:string) => void;
  onDelete: (id:string) => void
}

const ConfigScreen = (props: ConfigProps) => {
  props.sdk.app.onConfigure(() => onConfigure());

  const [spaceConfigs, setSpaceConfigs] = useState<SpaceConfiguration[]>([])

  const onConfigure = async() => {
    // Check that we have valid installation parameters.
    if (!spaceConfigs.length) {
      props.sdk.notifier.error('You must add at least one Cross-Space configuration to install this application.')
      return false;
    }

    // Get current the state of EditorInterface and other entities
    // related to this app installation
    const currentState:any = await props.sdk.app.getCurrentState();

    return {
      // Parameters to be persisted as the app configuration.
      parameters: { spaceConfigs: spaceConfigs },
      // In case you don't want to submit any update to app
      // locations, you can just pass the currentState as is
      targetState: currentState,
    };
  }

  const onSpaceConfigEdit = (id:string) => {
    let spaceConfigIndex = spaceConfigs.findIndex((config:SpaceConfiguration) => config.id === id)

    if (spaceConfigIndex !== -1) {
      props.sdk.dialogs.openCurrentApp({
        position: 'center',
        title: `Edit ${spaceConfigs[spaceConfigIndex].name} Space Configuration`,
        parameters: {
          dialog: 'SpaceConfiguration',
          props: {
            spaceConfig: spaceConfigs[spaceConfigIndex]
          }
        }
      })
      .then((updatedConfig:SpaceConfiguration) => {
        if (updatedConfig) {
          let updatedConfigs = [...spaceConfigs]

          updatedConfigs[spaceConfigIndex] = updatedConfig
          setSpaceConfigs(updatedConfigs)
        }
      })
    }
  }

  const onSpaceConfigDelete = (id:string) => {
    let spaceConfigIndex = spaceConfigs.findIndex((config:SpaceConfiguration) => config.id === id)
    if (spaceConfigIndex !== -1) {
      props.sdk.dialogs.openConfirm({
        title: "Delete",
        message: "Are you sure?",
        intent: "positive",
        confirmLabel: "Delete",
        cancelLabel: "Cancel"
      })
      .then((res:boolean) => {
        if (res) {
          let updatedConfigs = [...spaceConfigs]

          updatedConfigs.splice(spaceConfigIndex, 1)
          setSpaceConfigs(updatedConfigs)
        }
      })
    }
  }

  const addSpaceConfiguration = () => {
    props.sdk.dialogs.openCurrentApp({
      position: 'center',
      title: 'Add Space Configuration',
      parameters: {
        dialog: 'SpaceConfiguration',
        props: {}
      }
    })
    .then((config:SpaceConfiguration) => {
      if (config) {
        setSpaceConfigs([...spaceConfigs, config])
      }
    })
  }

  useEffect(() => {

    //Populate SpaceConfigs with any saved values.
    const getSavedConfigs = async () => {
      let params = await props.sdk.app.getParameters() as InstallationParams | null
      if (params && params.spaceConfigs) {
        setSpaceConfigs(params.spaceConfigs)
      }
    }

    getSavedConfigs().then(() => props.sdk.app.setReady())
  }, [props.sdk.app])

  const tableHeaderCells = ['Space Name', 'Space ID', 'CDA Token', 'Operations']

  return (
    <Workbench.Content>
      <Form>
        <Note title="About Cross Space References">
          The Cross-space references app allows you to search and select entries from your other spaces,
          then references the entries within a single space. This enables you to access content from across all of your organizations.
          The cross-space references app aims to help you create consistent content efficiently.
        </Note>
        <Heading>Space Configuration</Heading>
        <Paragraph>Configure which spaces you would like to allow cross-space references to:</Paragraph>
        <Button onClick={addSpaceConfiguration}>Add Space Configuration</Button>
        {spaceConfigs.length &&
            <Table>
              <TableHead>
                <TableRow>
                  {tableHeaderCells.map((header:string) => (
                    <TableCell key={header}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {spaceConfigs.map((config:SpaceConfiguration) => (
                  <SpaceConfigRow key={config.id} spaceConfig={config} onEdit={onSpaceConfigEdit} onDelete={onSpaceConfigDelete} />
                ))}
              </TableBody>
            </Table>
          }
      </Form>
    </Workbench.Content>
  )
};

const SpaceConfigRow = (props:SpaceConfigRowProps) => {
  let spaceConfig = props.spaceConfig
  return (
    <TableRow>
      <TableCell>{spaceConfig.name}</TableCell>
      <TableCell>{spaceConfig.id}</TableCell>
      <TableCell>{spaceConfig.token}</TableCell>
      <TableCell>
        <SpaceConfigRowDropdown {...props} />
      </TableCell>
    </TableRow>
  )
}

const SpaceConfigRowDropdown = (props:SpaceConfigRowProps) => {
  const [dropdownState, setDropdownState] = useState<boolean>(false)

  const onEdit = () => {
    setDropdownState(!dropdownState)
    props.onEdit(id)
  }

  const onDelete = () => {
    setDropdownState(!dropdownState)
    props.onDelete(id)
  }

  let id = props.spaceConfig.id
  return (
    <Dropdown
      isOpen={dropdownState}
      toggleElement={
        <IconButton
          buttonType="primary"
          label="Operations"
          iconProps={{icon:"MoreVertical"}}
          onClick={() => setDropdownState(!dropdownState)}
        />
      }
    >
      <DropdownList maxHeight={300}>
        <DropdownListItem key="edit" onClick={onEdit} >Edit</DropdownListItem>
        <DropdownListItem key="delete" onClick={onDelete} >Delete</DropdownListItem>
      </DropdownList>
    </Dropdown>
  )
}

export default ConfigScreen
