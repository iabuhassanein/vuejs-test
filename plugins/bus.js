import Vue from 'vue'
const eventBus = {}
eventBus.install = function (Vue) {
  Vue.prototype.$bus = new Vue()
  Vue.prototype.$bus.refreshPage = function (_page) {
    Vue.prototype.$bus.$emit('refreshPage', { path: _page })
  }
}
Vue.use(eventBus)
