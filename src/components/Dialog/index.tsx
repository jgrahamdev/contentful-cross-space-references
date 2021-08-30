import React, { useEffect } from 'react'
import { DialogExtensionSDK } from '@contentful/app-sdk'

import { SpaceConfiguration } from '../../Types'

import SpaceConfigurationDialog from './SpaceConfigurationDialog'
import EntryPickerDialog from './EntryPickerDialog'

interface DialogProps {
  sdk: DialogExtensionSDK;
}

interface DialogParameters {
  dialog: string;
  props: {
    spaceConfig?: SpaceConfiguration
  }
}

const Dialog = (props: DialogProps) => {

  useEffect(() => {
    props.sdk.window.startAutoResizer()
    return (
      props.sdk.window.stopAutoResizer()
    )
  }, [props.sdk.window])

  let params = props.sdk.parameters.invocation as DialogParameters

  if (params) {
    if (params.dialog === 'SpaceConfiguration') {
      return <SpaceConfigurationDialog sdk={props.sdk} spaceConfig={params.props.spaceConfig} />
    }
    else if (params.dialog === 'EntryPicker' && params.props.spaceConfig) {
      return <EntryPickerDialog sdk={props.sdk} spaceConfig={params.props.spaceConfig} />
    }
  }

  return null
}

export default Dialog
