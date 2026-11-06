// Mirrors backend/src/config/roles.js. The frontend never decides what a role
// can do — it receives the permission list from GET /api/auth/me and only uses
// these constants to label routes and nav items.
export const P = Object.freeze({
  DASHBOARD_VIEW: 'dashboard:view',
  PROFILE_VIEW: 'profile:view',
  TASKS_VIEW: 'tasks:view',
  USERS_VIEW: 'users:view',
  USERS_MANAGE: 'users:manage',
  REPORTS_VIEW: 'reports:view',
  SETTINGS_MANAGE: 'settings:manage',
});
