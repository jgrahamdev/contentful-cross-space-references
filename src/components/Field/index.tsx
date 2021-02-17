import React from 'react';

import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';

import CrossSpaceField from './CrossSpaceField';

interface FieldProps {
  sdk: FieldExtensionSDK;
}

const Field = (props: FieldProps) => {
    return <CrossSpaceField sdk={props.sdk} />
};

export default Field;
