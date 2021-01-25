export default {
  setCategories: ({ commit, state }, newValue) => {
    commit('SET_CATEGORIES', newValue)
    return state.categories
  }
}
