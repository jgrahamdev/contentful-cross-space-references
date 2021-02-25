import React, { useEffect } from 'react'
import { Modal, Paragraph, Button } from '@contentful/forma-36-react-components'

import { DialogProps, DialogParameters } from './index'

const CrossSpaceEntry = (props: DialogProps) => {
  let dialogParams = props.sdk.parameters.invocation as DialogParameters
  let entry = dialogParams.props.entry

  const onEntryEdit = () => {
    let entryUrl = `https://app.contentful.com/spaces/${entry.sys.space.sys.id}/entries/${entry.sys.id}`

    window.open(entryUrl, "_blank")
    props.sdk.close()
  }

  const onDialogClose = () => {
    props.sdk.close()
  }

  // Start AutoResizer at initialization of component.
  useEffect(() => {
    props.sdk.window.startAutoResizer();
    return () => {
      return props.sdk.window.stopAutoResizer()
    }
  }, [props.sdk.window])

  return (
    <>
      <Modal.Content>
        <Paragraph>
          At this time, editing of Cross Space References can't be done via slide-in navigation. If you would like to edit this entry, please select "Edit this Entry" below to open the entry in it's respective space.
        </Paragraph>
      </Modal.Content>
      <Modal.Controls>
        <Button buttonType="positive" onClick={onDialogClose} >Back to Editing</Button>
        <Button buttonType="naked" onClick={onEntryEdit}>Edit this entry</Button>
      </Modal.Controls>
    </>
  )
}

export default CrossSpaceEntry
