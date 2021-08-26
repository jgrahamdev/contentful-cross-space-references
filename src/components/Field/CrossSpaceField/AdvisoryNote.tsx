import React, { useState } from 'react'

import { Note } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';

import { css } from 'emotion';

const styles = {
  note: css({
    marginBottom: tokens.spacingM
  })
}

const AdvisoryNote = () => {
  const [showNote, setShowNote] = useState<boolean>(true)

  return (
    <>
      {showNote &&
        <Note
          hasCloseButton
          noteType="primary"
          onClose={() => setShowNote(false)}
          className={styles.note}
        >
          Search for and select entries from a space other than the one you are currently using. You may see entries in this list that you don't have access to manage within Contentful.
        </Note>
      }
    </>
  )
}

export default AdvisoryNote
