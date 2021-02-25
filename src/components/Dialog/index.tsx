import React from 'react'
import { DialogExtensionSDK } from '@contentful/app-sdk'

import SpaceConfiguration from './SpaceConfiguration'
import EntryPicker from './EntryPicker'
import CrossSpaceEntry from './CrossSpaceEntry'

export interface DialogProps {
  sdk: DialogExtensionSDK;
}

export interface DialogParameters {
  dialog: string;
  props: any;
}

const Dialog = (props: DialogProps) => {
  let params = props.sdk.parameters.invocation as DialogParameters

  if (params.dialog === 'SpaceConfiguration') {
    return <SpaceConfiguration sdk={props.sdk} />
  }
  else if (params.dialog === 'EntryPicker') {
    return <EntryPicker sdk={props.sdk} />
  }
  else if (params.dialog === 'CrossSpaceEntry') {
    return <CrossSpaceEntry sdk={props.sdk} />
  }

  return null
}

export default Dialog
