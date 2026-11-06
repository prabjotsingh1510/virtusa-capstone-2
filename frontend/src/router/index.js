import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import { P } from '../config/permissions.js';
import { checkAccess, getRequirements } from './access.js';

import AppLayout from '../layouts/AppLayout.vue';
import LoginView from '../views/LoginView.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true, title: 'Sign In' },
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'dashboard' } },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: { title: 'Dashboard', permissions: [P.DASHBOARD_VIEW] },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('../views/ProfileView.vue'),
        meta: { title: 'My Profile', permissions: [P.PROFILE_VIEW] },
      },
      {
        path: 'tasks',
        name: 'tasks',
        component: () => import('../views/TasksView.vue'),
        meta: { title: 'My Tasks', permissions: [P.TASKS_VIEW] },
      },
      {
        // Coarse gate: the whole /admin subtree requires the admin role.
        path: 'admin',
        meta: { roles: ['admin'] },
        children: [
          { path: '', redirect: { name: 'admin-users' } },
          {
            path: 'users',
            name: 'admin-users',
            component: () => import('../views/admin/UsersView.vue'),
            meta: { title: 'User Management', permissions: [P.USERS_VIEW] },
          },
          {
            path: 'reports',
            name: 'admin-reports',
            component: () => import('../views/admin/ReportsView.vue'),
            meta: { title: 'Reports', permissions: [P.REPORTS_VIEW] },
          },
          {
            path: 'settings',
            name: 'admin-settings',
            component: () => import('../views/admin/SettingsView.vue'),
            meta: { title: 'System Settings', permissions: [P.SETTINGS_MANAGE] },
          },
        ],
      },
      {
        path: 'forbidden',
        name: 'forbidden',
        component: () => import('../views/ForbiddenView.vue'),
        meta: { title: 'Access Denied' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: 'Page Not Found' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ---- Global route guard -------------------------------------------------
router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.restore(); // rehydrate user/permissions after a page refresh

  if (getRequirements(to).guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' };
  }

  const result = checkAccess(auth, to);
  if (result.allowed) return true;

  if (result.reason === 'unauthenticated') {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  // Authenticated but not authorised -> dedicated 403 page.
  return {
    name: 'forbidden',
    query: {
      from: to.fullPath,
      missing: result.missingPermissions.join(',') || undefined,
      roles: result.requiredRoles.join(',') || undefined,
    },
    replace: true,
  };
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · RBAC Portal` : 'RBAC Portal';
});

export default router;
