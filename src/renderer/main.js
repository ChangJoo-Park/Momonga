import Vue from 'vue'
import axios from 'axios'
import PouchDB from 'pouchdb-browser'
import HoodieStore from '@hoodie/store-client'
import App from './App'
import router from './router'
import store from './store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* Initialize Database */
const hoodieStore = new HoodieStore('momonga', {
  PouchDB,
  remoteBaseUrl: 'http://localhost:5984'
})

Vue.prototype.$db = hoodieStore

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
