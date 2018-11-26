import { COLLAPSE_ALL, EXPAND_ALL } from './action-types.js'
// import { COLLAPSE_ALL, EXPAND_ALL } from './actions';
// import './actions'

export default function reducer(state = {}, action) {
  // let tmp = { ...state }
  switch (action.type) {
    // case actions.GET_MOVIES_COMPLETE:
    //   tmp.movies = action.movies
    //   break
    case COLLAPSE_ALL:
      return {
        ...state,
        expandAll: false
      }
    case EXPAND_ALL:
      return {
        ...state,
        expandAll: true
      }
    default:
      return state
  }
  // return tmp
}
