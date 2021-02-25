import React, { useState, useEffect } from 'react';
import { TextField, Form, Modal, Button } from '@contentful/forma-36-react-components';

import { createClient } from 'contentful'

import { spaceConfiguration } from '../ConfigScreen'
import { DialogProps, DialogParameters } from './index'

interface ValidInput {
  id: boolean;
  token: boolean;
}

const SpaceConfigField = (props: any) => {
  let validationMessage = props.validationMessage.length ? props.validationMessage : 'This field is required'
  return (
    <TextField
      required
      name={props.name}
      id={props.id}
      labelText={props.label}
      helpText={props.help}
      value={props.value}
      onChange={props.onChange}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      validationMessage={!props.valid ? validationMessage : ''}
    />
  );
}


const SpaceConfiguration = (props: DialogProps) => {
  const [spaceConfig, setSpaceConfig] = useState<spaceConfiguration>({name: '', id: '', token: ''})
  const [validInput, setValidInput] = useState({id: true, token: true})
  const [validationMessages, setValidationMessages] = useState({id: '', token: ''})

  const onFieldFocus = (e:React.FocusEvent<HTMLInputElement>) => {
    let name = e.currentTarget.name as keyof ValidInput
    let valid:ValidInput = {...validInput, ...{[name]: true}}

    setValidInput(valid)
  }

  const onFieldBlur = (e:React.FocusEvent<HTMLInputElement>) => {
    if (!e.currentTarget.value) {
      let name = e.currentTarget.name as keyof ValidInput
      let valid:ValidInput = {...validInput, ...{[name]: false}}

      setValidInput(valid)

      if (validationMessages[name]) {
        setValidationMessages({...validationMessages, ...{[name]: ''}})
      }
    }
  }

  const onFieldChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    let id = e.currentTarget.id as keyof spaceConfiguration
    let updatedConfig:spaceConfiguration = {...spaceConfig, ...{[id]: e.currentTarget.value}}

    setSpaceConfig(updatedConfig)
  }

  const onClose = () => {
    let config = props.sdk.parameters.invocation ? props.sdk.parameters.invocation : spaceConfig
    props.sdk.close(config)
  }

  const onSave = () => {
    if (validInput.id && validInput.token) {
      let client = createClient({
        space: spaceConfig.id,
        accessToken: spaceConfig.token,
      })

      client.getSpace()
      .then((space) => {
        props.sdk.close({...spaceConfig, ...{name: space.name}})
      })
      .catch(e => {
        props.sdk.notifier.error(e.message)
        let field = e.sys.id === "AccessTokenInvalid"  ? 'token' : 'id'
        setValidInput({...validInput, ...{[field as keyof ValidInput]: false}})
        setValidationMessages({...validationMessages, ...{[field]: e.message}})
      })
    }
  }

  useEffect(() => {
    props.sdk.window.startAutoResizer();
    return (
      props.sdk.window.stopAutoResizer()
    );
  }, [props.sdk.window])

  useEffect(() => {
    const dialogParams = props.sdk.parameters.invocation as DialogParameters

    if (Object.keys(dialogParams.props).length) {
      let propsSpaceConfig = dialogParams.props as spaceConfiguration
      setSpaceConfig(propsSpaceConfig)
    }

  }, [props.sdk.parameters.invocation])

  return (
      <Form>
        <Modal.Content>
          <SpaceConfigField
            name="id"
            id="id"
            label="Space ID"
            help="Enter your Space ID"
            value={spaceConfig.id}
            onChange={onFieldChange}
            onFocus={onFieldFocus}
            onBlur={onFieldBlur}
            valid={validInput.id}
            validationMessage={validationMessages.id}
          />
          <SpaceConfigField
            name="token"
            id="token"
            label="CDA Token"
            help="Enter a valid Content Delivery API Token for the selected space."
            value={spaceConfig.token}
            onChange={onFieldChange}
            onFocus={onFieldFocus}
            onBlur={onFieldBlur}
            valid={validInput.token}
            validationMessage={validationMessages.token}
          />
        </Modal.Content>
        <Modal.Controls>
          <Button buttonType="positive" onClick={onSave} disabled={!(validInput.id && validInput.token)}>Save</Button>
          <Button buttonType="muted" onClick={onClose}>Close</Button>
        </Modal.Controls>
      </Form>
  );
};

export default SpaceConfiguration;
