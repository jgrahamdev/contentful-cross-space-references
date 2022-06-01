import React, { useState } from 'react'

import { Entry } from 'contentful'
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { Button, Dropdown, DropdownList, DropdownListItem } from '@contentful/forma-36-react-components';
import { SpaceConfiguration } from '../../../Types'

import { css } from 'emotion';


interface CrossSpaceEntryActionsProps {
  spaceConfigs: SpaceConfiguration[];
  sdk: FieldExtensionSDK;
}

const CrossSpaceEntryActions = (props:CrossSpaceEntryActionsProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const calculateHeight = () => {
    let height = 40 + (37 * props.spaceConfigs.length)
    return isOpen ? height : 0
  }

  const styles = {
    wrapper: css({
      display: 'flex',
      border: '1px dashed #b4c3ca',
      borderRadius: '6px',
      justifyContent: 'center',
      padding: '2rem'
    }),
    open: css({
      height:  calculateHeight()
    })
  }


  const onSpaceSelect = (spaceId:string) => {
    let spaceConfig = props.spaceConfigs.find((config) => config.id === spaceId)

    if (spaceConfig) {
      props.sdk.dialogs.openCurrentApp({
        position: 'center',
        // title: 'Insert cross-space entry',
        parameters: {
          dialog: 'EntryPicker',
          props: {spaceConfig: spaceConfig}
        },
        width: 800,
        shouldCloseOnOverlayClick: true,
        shouldCloseOnEscapePress: true,
      })
      .then((response:Entry<any>|undefined) => {
        if (response !== undefined) {
          props.sdk.field.setValue({
            sys: {
              type: "Link",
              linkType: "CrossSpaceEntry",
              id: response.sys.id,
              space: response.sys.space,
              environment: response.sys.environment,
            }
          })
          .catch((err) => {
            props.sdk.notifier.error(err)
          })
        }
      })
    }
  }

  const onButtonClick = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <div className={styles.wrapper}>
        <Dropdown
          dropdownContainerClassName='cross_space_dropdown'
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          toggleElement={
            <Button
              icon="Plus"
              buttonType="muted"
              indicateDropdown
              onClick={onButtonClick}
            >
              Add content from another space
            </Button>
          }
        >
          <DropdownList border="bottom">
            <DropdownListItem isTitle>Select Space</DropdownListItem>
          </DropdownList>
          <DropdownList>
            {props.spaceConfigs.map((config:any) => (
              <DropdownListItem
                key={config.id}
                onClick={() => onSpaceSelect(config.id)}
              >
                {config.name} {config.environment && ` (${config.environment})`}
              </DropdownListItem>
            ))}
          </DropdownList>
        </Dropdown>
      </div>
      <div className={styles.open}></div>
    </>
  )
}

export default CrossSpaceEntryActions
