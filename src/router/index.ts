import { createRouter, createWebHashHistory } from 'vue-router';

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
        },
        {
          path: '/categories',
          component: () => import('@/components/goods/CateManage.vue')
        },
        {
          path: '/params',
          component: () => import('@/components/goods/CateParams.vue')
        },
        {
          path: '/goods',
          component: () => import('@/components/goods/GoodsList.vue'),
        },
        {
          path: '/goods/add',
          component: () => import('@/components/goods/AddGoods.vue'),
        },
        {
          path: '/orders',
          component: () => import('@/components/order/OrderList.vue'),
        },
        {
          path: '/reports',
          component: () => import('@/components/report/ReportChart.vue'),
        }
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.path == '/login') {
    next();
  }
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) {
    next('/login');
  }
  next();
});

export default router;
