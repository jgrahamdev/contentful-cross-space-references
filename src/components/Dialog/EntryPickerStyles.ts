import tokens from '@contentful/forma-36-tokens'
import { css } from 'emotion'

const focus = {
  outline: 'none',
  borderColor: tokens.colorPrimary,
  boxShadow: tokens.glowPrimary,
  height: 'auto',
  overflow: 'visible',
}

export const modal = {
  content: css({
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  })
}

export const topBar = {
  root: css({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingS,
  })
}

export const search = {
  root: css({
    marginBottom: tokens.spacingM,
    position: 'relative',
    zIndex: 1,
  }),
  wrapper: css({
    height: '40px',
    width: '100%',
    position: 'relative',
  }),
  inputWrapper: css({
    paddingLeft: '3px',
    display: 'flex',
    background: tokens.colorWhite,
    border: `1px solid ${tokens.colorElementMid}`,
    boxShadow: tokens.insetBoxShadowDefault,
    borderRadius: tokens.borderRadiusMedium,
    height: '38px',
    overflow: 'hidden',
    '&:focus-within, &:focus': focus,
  }),
  focused: css(focus),
  input: css({
    flex: '1 1 auto',
    width: 'auto',
    height: '30px',
    paddingLeft: tokens.spacingXs,
    '& > input': {
      padding: 0,
      border: 'none !important',
      boxShadow: 'none !important',
    },
  }),
  pillsInput: css({
    display: 'flex',
    alignItems: 'center',
    flex: '1 1 auto',
    flexWrap: 'wrap',
  }),
  hidden: css({
    visibility: 'hidden',
  }),
  spinner: css({
    marginTop: tokens.spacingXs,
    marginRight: tokens.spacingXs,
  })
}

export const filterPill = {
  root: css({
    transition: 'margin .1s ease-in-out',
    display: 'inline-flex',
    alignItems: 'flex-start',
    fontWeight: 600,
    height: '30px',
    marginTop: '3px',
    marginBottom: '3px',
    marginRight: '5px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorElementLight,
    ':hover, :active': {
      backgroundColor: tokens.colorElementMid,
    },
    ":hover div[data-search-filter-role='operator']::before": {
      backgroundColor: tokens.colorElementMid,
    },
    ':focus': {
      outline: 'none',
      boxShadow: `0 0 0 1px ${tokens.colorBlueMid}`,
    },
  }),
  label: css({
    lineHeight: '30px',
    color: tokens.colorTextMid,
    padding: '0 12px',
    borderRadius: `${tokens.borderRadiusMedium} 0 0 ${tokens.borderRadiusMedium}`,
    cursor: 'pointer',
  }),
}


export const selectValueInput = {
  selectContainer: css({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    height: '100%',
  }),
  root: css({
    position: 'relative',
    display: 'inline',
    height: '100%',
  }),
  select: css({
    border: 0,
    transition: 'width .1s ease-in-out',
    padding: '0 25px 0 12px',
    minWidth: '60px',
    maxWidth: '200px',
    color: tokens.colorWhite,
    zIndex: 10,
    fontSize: 'inherit',
    textOverflow: 'ellipsis',
    appearance: 'none',
    backgroundColor: tokens.colorBlueMid,
    height: '100%',
    borderRadius: `0 ${tokens.borderRadiusMedium} ${tokens.borderRadiusMedium} 0`,
    fontFamily: tokens.fontStackPrimary,
    fontWeight: tokens.fontWeightMedium,
  }),
  option: css({
    color: tokens.colorTextDark,
    backgroundColor: tokens.colorWhite,
  }),
  caret: css({
    position: 'absolute',
    top: '5px',
    right: '5px',
    pointerEvents: 'none',
  }),
  spinner: css({
    position: 'absolute',
    right: '5px',
    pointerEvents: 'none',
  }),
}

export const entryList = {
  root: css({
    paddingTop: tokens.spacingS,
    marginTop: `-${tokens.spacingS}`,
    overflow: 'auto',
    flexGrow: 1,
  }),
  empty: css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: tokens.colorTextLightest,
    textOverflow: 'ellipsis',
  }),
  entryItem: css({
    display: 'block',
    marginTop: tokens.spacingS,
    paddingLeft: tokens.spacing2Xs,
  }),
  assetItem: css({
    display: 'inline-flex',
    marginTop: tokens.spacingS,
    marginRight: tokens.spacingS,
  }),
  loadingMore: css({
    marginTop: tokens.spacingS,
  }),
};
