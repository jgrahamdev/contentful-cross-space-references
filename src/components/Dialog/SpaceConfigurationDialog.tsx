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
  [id:string]: string;
  token: string;
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
    id: 'Space ID',
    token: 'CDA Token',
  }

  let help:SpaceConfigMessages = {
    id: 'Enter your Space ID',
    token: 'Enter a valid Content Delivery API Token for the selected space.'
  }


  return (
    <TextField
      required
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
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfiguration>(props.spaceConfig ? props.spaceConfig : {name: '', id: '', token: ''})

  const [validInput, setValidInput] = useState<ValidInput>({id: true, token: true})
  const [validationMessages, setValidationMessages] = useState<SpaceConfigMessages>({id: '', token: ''})

  const onFieldFocus = (id:string) => {
    setValidInput({...validInput, [id]: true})
  }

  const onFieldBlur = (id:string, value:string) => {
    if (!value.length) {
      setValidInput({...validInput, [id]: false})

      if (validationMessages[id]) {
        setValidationMessages({...validationMessages, [id]: ''})
      }
    }
  }

  const onFieldChange = (id:string, value:string) => {
    setSpaceConfig({...spaceConfig, [id]: value})
  }

  const onClose = () => {
    props.sdk.close()
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
        setValidInput({...validInput, ...{[field]: false}})
        setValidationMessages({...validationMessages, ...{[field]: e.message}})
      })
    }
  }

  return (
      <Form>
        <Modal.Content>
          {['id', 'token'].map((key:string) => (
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
          <Button buttonType="positive" onClick={onSave} disabled={(!spaceConfig.id.length || !spaceConfig.token.length) || (!validInput.id || !validInput.token)}>Save</Button>
          <Button buttonType="muted" onClick={onClose}>Close</Button>
        </Modal.Controls>
      </Form>
  );
};

export default SpaceConfigurationDialog;
