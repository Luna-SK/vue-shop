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
      component: () => import('@/components/HomeModule.vue'),
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          component: () => import('@/components/WelcomeView.vue')
        },
        {
          path: '/users',
          component: () => import('@/components/user/UserList.vue')
        },
        {
          path: '/rights',
          component: () => import('@/components/power/RightsList.vue')
        },
        {
          path: '/roles',
          component: () => import('@/components/power/RolesList.vue')
        }
      ]
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
