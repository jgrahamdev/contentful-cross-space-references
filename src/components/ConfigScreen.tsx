import React, { Component } from 'react';

import { AppExtensionSDK } from '@contentful/app-sdk';
import {
  Heading, Form, Workbench, Paragraph, Note,
  Button, IconButton, Dropdown, DropdownList, DropdownListItem,
  Table, TableHead, TableCell, TableRow, TableBody
} from '@contentful/forma-36-react-components';

export interface spaceConfiguration {
  name: string;
  id: string;
  token: string;
}

export interface AppInstallationParameters {
  spaceConfigs: spaceConfiguration[];
}

interface StringArray {
  [index: number]: boolean;
}

interface ConfigProps {
  sdk: AppExtensionSDK;
}

interface ConfigState {
  parameters: AppInstallationParameters;
  dropdownState: StringArray;
}

export default class Config extends Component<ConfigProps, ConfigState> {
  constructor(props: ConfigProps) {
    super(props);
    this.state = {
      parameters: {
        spaceConfigs: [],
      },
      dropdownState: {},
    };

    props.sdk.app.onConfigure(() => this.onConfigure());
  }

  addSpaceConfiguration = async (event:React.MouseEvent<HTMLElement>) => {
    this.props.sdk.dialogs.openCurrentApp({
      position: 'center',
      title: 'Add Space Configuration',
      parameters: {
        dialog: 'SpaceConfiguration',
        props: {}
      }
    })
    .then(config => {
      if (config && config.id) {
        let spaceConfigs = [...this.state.parameters.spaceConfigs, config]
        this.setState({parameters: {spaceConfigs: spaceConfigs}})
      }
    })

  }

  onEdit = async (e:React.MouseEvent<HTMLElement>) => {
    this.toggleDropwdown(e)

    let spaceConfigIndex = (e.currentTarget.dataset.spaceConfigIndex as unknown) as number
    let spaceConfig = this.state.parameters.spaceConfigs[spaceConfigIndex]

    this.props.sdk.dialogs.openCurrentApp({
      position: 'center',
      title: `Edit ${spaceConfig.name} Space Configuration`,
      parameters: {
        dialog: 'SpaceConfiguration',
        props: spaceConfig
      }
    })
    .then(config => {
      if (config) {
        let spaceConfigs = this.state.parameters.spaceConfigs
        spaceConfigs[spaceConfigIndex] = config

        this.setState({parameters: {spaceConfigs: spaceConfigs}})
      }
    })
  }

  onDelete = async(e:React.MouseEvent<HTMLElement>) => {
    this.toggleDropwdown(e)
    let spaceConfigIndex = (e.currentTarget.dataset.spaceConfigIndex as unknown) as number

    this.props.sdk.dialogs.openConfirm({
      title: "Delete",
      message: "Are you sure?",
      intent: "positive",
      confirmLabel: "Delete",
      cancelLabel: "Cancel"
    })
    .then(result => {
      if (result) {
        let spaceConfigs = this.state.parameters.spaceConfigs.splice(spaceConfigIndex, 1)
        this.setState({parameters: {spaceConfigs: spaceConfigs}})
      }
    })
  }

  toggleDropwdown = async (e:React.MouseEvent<HTMLElement>) => {

    let spaceConfigIndex = (e.currentTarget.dataset.spaceConfigIndex as unknown) as number
    let updated = {[spaceConfigIndex]: !this.state.dropdownState[spaceConfigIndex]}

    this.setState({dropdownState: {...this.state.dropdownState, ...updated}})
  }

  async componentDidMount() {
    let parameters:any = {parameters: this.state.parameters}

    const savedParams: AppInstallationParameters | null = await this.props.sdk.app.getParameters();

    if (savedParams && Object.keys(savedParams).length) {
      parameters = {parameters: savedParams}
    }

    this.setState(parameters, () => {
      // Once preparation has finished, call `setReady` to hide
      // the loading screen and present the app to a user.
      this.props.sdk.app.setReady();
    });
  }

  onConfigure = async () => {
    // Check that we have valid installation parameters.
    if (!this.state.parameters.spaceConfigs.length) {
      this.props.sdk.notifier.error('You must add at least one Cross-Space configuration to install this application.')
      return false;
    }

    // Get current the state of EditorInterface and other entities
    // related to this app installation
    const currentState:any = await this.props.sdk.app.getCurrentState();

    return {
      // Parameters to be persisted as the app configuration.
      parameters: this.state.parameters,
      // In case you don't want to submit any update to app
      // locations, you can just pass the currentState as is
      targetState: currentState,
    };
  };

  render() {
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
          <Button onClick={this.addSpaceConfiguration}>Add Space Configuration</Button>
          {this.state.parameters.spaceConfigs.length &&
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Space Name</TableCell>
                  <TableCell>Id</TableCell>
                  <TableCell>CDA Token</TableCell>
                  <TableCell>Operations</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {this.state.parameters.spaceConfigs.map((config,index) => (
                <TableRow key={index}>
                  <TableCell>{config.name}</TableCell>
                  <TableCell>{config.id}</TableCell>
                  <TableCell>{config.token}</TableCell>
                  <TableCell>
                    <Dropdown
                      isOpen={this.state.dropdownState![index]}
                      toggleElement={
                        <IconButton
                          buttonType="primary"
                          label="Operations"
                          iconProps={{icon:"MoreVertical"}}
                          onClick={this.toggleDropwdown}
                          data-space-config-index={index}
                        />
                      }
                    >
                      <DropdownList maxHeight={300}>
                        <DropdownListItem key="edit" onClick={this.onEdit} data-space-config-index={index}>Edit</DropdownListItem>
                        <DropdownListItem key="delete" onClick={this.onDelete} data-space-config-index={index}>Delete</DropdownListItem>
                      </DropdownList>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          }
        </Form>
      </Workbench.Content>
    );
  }
}
