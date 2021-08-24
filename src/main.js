import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import chalk from '@/lib/chalk'
import '@/plugins'
import '@/styles/index.less'
Vue.config.productionTip = false
Vue.use(chalk)
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
