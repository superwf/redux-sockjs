/**
 * @param {Object} reducerMap
 * @param {any} initialState
 * @return {Function}
 */
const createReducer = (reducerMap, initialState) => (state = initialState, action) => {
  const { type } = action
  // console.log(Object.keys(reducerMap))
  if (type in reducerMap) {
    return reducerMap[type](state, action)
  }
  return state
}

export default createReducer
