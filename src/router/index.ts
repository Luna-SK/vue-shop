import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: () => import('@/components/LoginModule.vue')
    },
    {
      path: '/home',
      component: () => import('@/components/HomeModule.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path == '/login') {
    next()
  }
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    next('/login')
  }
  next()
})

export default router
