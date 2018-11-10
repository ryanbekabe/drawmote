import 'es6-promise/auto'
import './assets/scss/main.scss'

import Vue from 'vue'
import App from './App.vue'

import Vuetamin from 'vuetamin'
import Track from './plugins/Track'
import Settings from './plugins/Settings'

import store from './store'
import i18n from './i18n'

import { getServerUrl } from '@/tools/helpers.js'
import { BREAKPOINT_REMOTE } from '@/settings'

function getGymote () {
  if (window.innerWidth > BREAKPOINT_REMOTE) {
    return import('./plugins/GymoteScreen')
  } else {
    return import('./plugins/GymoteRemote')
  }
}

getGymote().then(({ default: Gymote }) => {
  Vue.use(Vuetamin, { store })
  Vue.use(Gymote, { serverUrl: getServerUrl() })
  Vue.use(Track)
  Vue.use(Settings)

  Vue.config.productionTip = false

  new Vue({
    i18n,
    render: h => h(App)
  }).$mount('#drawmote')
})
