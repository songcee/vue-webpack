import Vue from 'vue'
import Router from 'vue-router'
import page2 from '@/components/page2'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'page2',
      component: page2
    }
  ]
})
