// Administrator-only routes. Every route is gated twice:
//   1. requireRole('admin') at the router level (coarse gate)
//   2. requirePermission(...) per route (fine-grained gate)
import { Router } from 'express';
import { authenticate, requireRole, requirePermission } from '../middleware/auth.js';
import { PERMISSIONS as P, ROLES, isValidRole } from '../config/roles.js';
import { users, settings, tasks, toPublicUser, findUserById } from '../data/store.js';

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/users', requirePermission(P.USERS_VIEW), (_req, res) => {
  res.json({
    users: users.map(toPublicUser),
    roles: Object.entries(ROLES).map(([key, r]) => ({ key, label: r.label })),
  });
});

router.patch('/users/:id/role', requirePermission(P.USERS_MANAGE), (req, res) => {
  const target = findUserById(req.params.id);
  const { role } = req.body || {};
  if (!target) return res.status(404).json({ error: 'not_found', message: 'User not found.' });
  if (!isValidRole(role)) return res.status(400).json({ error: 'bad_request', message: 'Unknown role.' });
  if (target.id === req.user.id && role !== 'admin') {
    return res.status(400).json({ error: 'bad_request', message: 'You cannot remove your own admin role.' });
  }
  target.role = role;
  res.json({ user: toPublicUser(target) });
});

router.get('/reports', requirePermission(P.REPORTS_VIEW), (_req, res) => {
  res.json({
    generatedAt: new Date().toISOString(),
    usersByRole: Object.keys(ROLES).map((key) => ({
      role: ROLES[key].label,
      count: users.filter((u) => u.role === key).length,
    })),
    taskCompletion: {
      total: tasks.length,
      done: tasks.filter((t) => t.done).length,
    },
  });
});

router.get('/settings', requirePermission(P.SETTINGS_MANAGE), (_req, res) => {
  res.json({ settings });
});

router.put('/settings', requirePermission(P.SETTINGS_MANAGE), (req, res) => {
  const { siteName, allowSelfSignup, maintenanceMode } = req.body || {};
  if (typeof siteName === 'string' && siteName.trim()) settings.siteName = siteName.trim();
  if (typeof allowSelfSignup === 'boolean') settings.allowSelfSignup = allowSelfSignup;
  if (typeof maintenanceMode === 'boolean') settings.maintenanceMode = maintenanceMode;
  res.json({ settings });
});

export default router;
