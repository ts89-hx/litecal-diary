import Vue from 'vue';
import Router from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import UserManagement from '@/views/UserManagement.vue';
import AboutView from '@/views/AboutView.vue';
import LoginView from '@/views/LoginView.vue';
import DietManagement from '@/views/DietManagement.vue';
import SportManagement from '@/views/SportManagement.vue';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/users',
      name: 'UserManagement',
      component: UserManagement
    },
    {
      path: '/about',
      name: 'About',
      component: AboutView
    },
    {
      path: '/diet',
      name: 'DietManagement',
      component: DietManagement
    },
    {
      path: '/sport',
      name: 'SportManagement',
      component: SportManagement
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    }
  ]
});

// 路由白名单
const whiteList = ['/login'];

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    // 如果有 token，直接放行
    next();
  } else {
    // 如果没有 token，检查是否在白名单中
    if (whiteList.includes(to.path)) {
      next();
    } else {
      // 如果不在白名单中，重定向到登录页面
      next('/login');
    }
  }
});

export default router; 