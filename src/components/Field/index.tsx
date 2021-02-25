import React, { useState, useEffect } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';

import { AppInstallationParameters, spaceConfiguration } from '../ConfigScreen'

import CrossSpaceField from './CrossSpaceField';

interface FieldProps {
  sdk: FieldExtensionSDK;
}

const Field = (props: FieldProps) => {
  const [value, setValue] = useState<any>(props.sdk.field.getValue())
  const [spaceConfigs, setSpaceConfigs] = useState<spaceConfiguration[]>([])

  // Update field value if needed.
  useEffect(() => {
    const detachValueChangeHandler = props.sdk.field.onValueChanged( async (value:any) => {
      setValue(value)
    })

    return () => {
      return detachValueChangeHandler()
    }
  }, [props.sdk.field])

    // Grab app parameters.
  useEffect(() => {
    let installParams = props.sdk.parameters.installation as AppInstallationParameters

    setSpaceConfigs(installParams.spaceConfigs)
  }, [props.sdk.parameters.installation])

  return (
    <>
      { spaceConfigs.length > 0 &&
        <CrossSpaceField sdk={props.sdk} value={value} spaceConfigs={spaceConfigs} />
      }
    </>
  )
};

export default Field;
