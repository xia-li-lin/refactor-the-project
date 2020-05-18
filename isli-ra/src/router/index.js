import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const LoginComponent = () => import('../pages/login/Login.vue')

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginComponent
    }
  ]
})
