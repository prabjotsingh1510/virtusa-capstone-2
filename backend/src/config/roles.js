// Single source of truth for roles and the permissions each role grants.
// Routes check *permissions*, not role names, so adding a new role
// (e.g. "manager") only requires a new entry here.

export const PERMISSIONS = Object.freeze({
  DASHBOARD_VIEW: 'dashboard:view',
  PROFILE_VIEW: 'profile:view',
  TASKS_VIEW: 'tasks:view',
  USERS_VIEW: 'users:view',
  USERS_MANAGE: 'users:manage',
  REPORTS_VIEW: 'reports:view',
  SETTINGS_MANAGE: 'settings:manage',
});

const P = PERMISSIONS;

export const ROLES = Object.freeze({
  admin: {
    label: 'Administrator',
    permissions: [
      P.DASHBOARD_VIEW,
      P.PROFILE_VIEW,
      P.USERS_VIEW,
      P.USERS_MANAGE,
      P.REPORTS_VIEW,
      P.SETTINGS_MANAGE,
    ],
  },
  user: {
    label: 'Regular User',
    permissions: [P.DASHBOARD_VIEW, P.PROFILE_VIEW, P.TASKS_VIEW],
  },
});

export function isValidRole(role) {
  return Object.prototype.hasOwnProperty.call(ROLES, role);
}

export function permissionsForRole(role) {
  return isValidRole(role) ? [...ROLES[role].permissions] : [];
}

export function roleHasPermission(role, permission) {
  return permissionsForRole(role).includes(permission);
}
