import React, { useState, useEffect } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';

import { SpaceConfiguration } from 'Types'

import { CrossSpaceReferenceEditor } from './CrossSpaceField/CrossSpaceReferenceEditor'
import AdvisoryNote from './CrossSpaceField/AdvisoryNote'

interface FieldProps {
  sdk: FieldExtensionSDK;
}

const Field = (props: FieldProps) => {
  console.log(props.sdk.entry)
  const { spaceConfigs } = props.sdk.parameters.installation as {spaceConfigs:SpaceConfiguration[]}
  const [value, setValue] = useState<any>(props.sdk.field.getValue())

  // Fetch and update field value as needed.
  useEffect(() => {
    const detachValueChangeHandler = props.sdk.field.onValueChanged( async (value:any) => {
      setValue(value)
    })

    return () => {
      return detachValueChangeHandler()
    }
  }, [props.sdk.field])


  // Start AutoResizer at initialization of component.
  useEffect(() => {
    props.sdk.window.startAutoResizer();
    return () => {
      return props.sdk.window.stopAutoResizer()
    }
  }, [props.sdk.window])

  const CrossSpaceField = () => {

    if (spaceConfigs.length) {
      return (
        <>
          <AdvisoryNote />
          <CrossSpaceReferenceEditor sdk={props.sdk} value={value} spaceConfigs={spaceConfigs} />
        </>
      )
    }

    return null
  }


  return <CrossSpaceField />
};

export default Field;
