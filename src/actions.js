import * as actions from './action-types.js'

export const collapseAll = () => ({
  type: actions.COLLAPSE_ALL,
  expandAll: false,
})

export const expandAll = () => ({
  type: actions.EXPAND_ALL,
  expandAll: true,
})
