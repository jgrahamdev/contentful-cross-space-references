import React, { useState } from 'react';

import { DialogExtensionSDK } from '@contentful/app-sdk'
import { TextField, Form, Modal, Button } from '@contentful/forma-36-react-components';
import { createClient } from 'contentful'

import { SpaceConfiguration } from '../../Types'

interface ValidInput {
  [id: string]: boolean;
  token: boolean;
}

interface SpaceConfigMessages {
  [spaceId:string]: string;
  token: string;
  environment: string;
}

interface SpaceConfigFlags {
  [spaceId:string]: boolean;
  token: boolean;
  environment: boolean;
}

interface SpaceConfigurationProps {
  sdk: DialogExtensionSDK;
  spaceConfig?: SpaceConfiguration;
}

interface SpaceConfigFieldProps {
  id: string;
  spaceConfig: SpaceConfiguration;
  validations: ValidInput;
  validationMessages: SpaceConfigMessages;
  onChange: (e:any) => void;
  onFocus: (e:any) => void;
  onBlur: (e:any) => void;
}

const SpaceConfigField = (props: SpaceConfigFieldProps) => {
  const fieldId = props.id

  let validationMessage = props.validationMessages[fieldId] ? props.validationMessages[fieldId] : 'This field is required'

  let labels:SpaceConfigMessages = {
    spaceId: 'Space ID',
    token: 'CDA Token',
    environment: 'Environment',
  }

  let help:SpaceConfigMessages = {
    spaceId: 'Enter your Space ID',
    token: 'Enter a valid Content Delivery API Token for the selected space.',
    environment: 'Enter a valid Environment name within the selected space.',
  }

  let required:SpaceConfigFlags = {
    spaceId: true,
    token: true,
    environment: false,
  }


  return (
    <TextField
      required={required[fieldId]}
      name={fieldId}
      id={fieldId}
      labelText={labels[fieldId]}
      helpText={help[fieldId]}
      value={props.spaceConfig[fieldId]}
      onChange={props.onChange}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      validationMessage={!props.validations[fieldId] ? validationMessage as string : ''}
    />
  );
}


const SpaceConfigurationDialog = (props: SpaceConfigurationProps) => {
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfiguration>(props.spaceConfig ? props.spaceConfig : {name: '', id: '', spaceId: '', token: '', environment: ''})

  const [validInput, setValidInput] = useState<ValidInput>({spaceId: true, token: true, environment: true})
  const [validationMessages, setValidationMessages] = useState<SpaceConfigMessages>({spaceId: '', token: '', environment: ''})

  const onFieldFocus = (spaceId:string) => {
    setValidInput({...validInput, [spaceId]: true})
  }

  const onFieldBlur = (spaceId:string, value:string) => {
    if (!value.length) {
      setValidInput({...validInput, [spaceId]: false})

      if (validationMessages[spaceId]) {
        setValidationMessages({...validationMessages, [spaceId]: ''})
      }
    }
  }

  const onFieldChange = (spaceId:string, value:string) => {
    setSpaceConfig({...spaceConfig, [spaceId]: value})
  }

  const onClose = () => {
    props.sdk.close()
  }

  const onSave = () => {
    if (validInput.spaceId && validInput.token) {
      let client = createClient({
        space: spaceConfig.spaceId,
        accessToken: spaceConfig.token,
        environment: spaceConfig.environment || 'master',
      })

      client.getSpace()
      .then((space) => {
        props.sdk.close({...spaceConfig, ...{name: space.name, id: `${spaceConfig.spaceId}-${spaceConfig.environment || 'master'}`}})
      })
      .catch(e => {
        props.sdk.notifier.error(e.message)
        let field = e.sys.id === "AccessTokenInvalid"  ? 'token' : 'id'
        setValidInput({...validInput, ...{[field]: false}})
        setValidationMessages({...validationMessages, ...{[field]: e.message}})
      })
    }
  }

  return (
      <Form>
        <Modal.Content>
          {['spaceId', 'token', 'environment'].map((key:string) => (
            <SpaceConfigField
              onChange={(e:React.ChangeEvent<HTMLInputElement>) => onFieldChange(key, e.currentTarget.value)}
              onFocus={() => onFieldFocus(key)}
              onBlur={(e:React.FocusEvent<HTMLInputElement>) => onFieldBlur(key, e.currentTarget.value)}
              key={key}
              id={key} 
              spaceConfig={spaceConfig}
              validations={validInput}
              validationMessages={validationMessages}
            />
          ))}
        </Modal.Content>
        <Modal.Controls>
          <Button buttonType="positive" onClick={onSave} disabled={(!spaceConfig.spaceId.length || !spaceConfig.token.length) || (!validInput.spaceId || !validInput.token)}>Save</Button>
          <Button buttonType="muted" onClick={onClose}>Close</Button>
        </Modal.Controls>
      </Form>
  );
};

export default SpaceConfigurationDialog;
