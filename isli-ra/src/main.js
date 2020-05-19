// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css'
import vueResource from 'vue-resource'
import element from './assets/element/index'
import App from './App'
import router from './router'
import './services'
import store from './store'

Vue.config.productionTip = false

Vue.use(element)
Vue.use(vueResource)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
