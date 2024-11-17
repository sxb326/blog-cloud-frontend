import { createRouter, createWebHashHistory } from 'vue-router';
import request from '@/utils/request.js';
import { useTitleStore } from '@/store/modules/title.js';

// 本地静态路由
export const constantRoutes = [
  {
    path: '/',
    component: () => import('@/views/index.vue'),
    redirect: '/home',
    children: [
      { path: '/home', component: () => import('@/views/home.vue'), meta: { title: '首页' } },
      {
        path: '/preview/:id',
        component: () => import('@/views/preview.vue'),
      },
      {
        path: '/search/:keyword',
        component: () => import('@/views/search.vue'),
      },
      {
        path: '/message',
        component: () => import('@/views/message.vue'),
        redirect: { name: 'like' },
        children: [
          { name: 'like', path: 'like', component: () => import('@/components/message/Like.vue') },
          { name: 'comment', path: 'comment', component: () => import('@/components/message/Comment.vue') },
          { name: 'collect', path: 'collect', component: () => import('@/components/message/Collect.vue') },
          { name: 'follow', path: 'follow', component: () => import('@/components/message/Follow.vue') },
          { name: 'chat', path: 'chat', component: () => import('@/components/message/Chat.vue') },
          { name: 'notice', path: 'notice', component: () => import('@/components/message/Notice.vue') },
        ],
      },
      {
        path: '/user/:id',
        component: () => import('@/views/user.vue'),
        redirect: { name: 'article' },
        children: [
          { name: 'article', path: 'article', component: () => import('@/components/user/Article.vue') },
          { name: 'column', path: 'column', component: () => import('@/components/user/Column.vue') },
        ],
      },
    ],
  },
  {
    path: '/editor',
    component: () => import('@/views/editor.vue'),
    meta: { title: '写文章', needLogin: true },
  },
  {
    path: '/editor/:id',
    component: () => import('@/views/editor.vue'),
    meta: { title: '写文章', needLogin: true },
  },
];

// 创建路由
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
});

//前置路由守卫 主要用于未登录时，需要登录的页面禁止访问
router.beforeEach((to, from, next) => {
  const meta = to.meta;
  if (meta && meta.needLogin) {
    //需要登录，校验当前是否已登录
    request.get('/user/getAuthUser').then((result) => {
      if (!result.data) {
        next('/home');
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

//后置路由守卫
router.afterEach((to) => {
  const userTitleStore = useTitleStore();
  if (to.meta && to.meta.title) {
    userTitleStore.setTitle(to.meta.title);
  }
});

export default router;
