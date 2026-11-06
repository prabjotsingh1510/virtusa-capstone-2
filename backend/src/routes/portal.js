// Routes available to any authenticated user that holds the right permission.
import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { PERMISSIONS as P } from '../config/roles.js';
import { tasks, users, toPublicUser, findUserById } from '../data/store.js';

const router = Router();
router.use(authenticate);

router.get('/dashboard', requirePermission(P.DASHBOARD_VIEW), (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const myTasks = tasks.filter((t) => t.ownerId === req.user.id);
  res.json({
    greeting: `Welcome back, ${req.user.name}!`,
    stats: isAdmin
      ? [
          { label: 'Total users', value: users.length },
          { label: 'Admins', value: users.filter((u) => u.role === 'admin').length },
          { label: 'Open tasks (all)', value: tasks.filter((t) => !t.done).length },
        ]
      : [
          { label: 'My tasks', value: myTasks.length },
          { label: 'Completed', value: myTasks.filter((t) => t.done).length },
          { label: 'Pending', value: myTasks.filter((t) => !t.done).length },
        ],
  });
});

router.get('/profile', requirePermission(P.PROFILE_VIEW), (req, res) => {
  res.json({ user: toPublicUser(findUserById(req.user.id)), permissions: req.user.permissions });
});

router.get('/tasks', requirePermission(P.TASKS_VIEW), (req, res) => {
  res.json({ tasks: tasks.filter((t) => t.ownerId === req.user.id) });
});

router.patch('/tasks/:id', requirePermission(P.TASKS_VIEW), (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  // Ownership check: a user may only touch their own tasks.
  if (!task || task.ownerId !== req.user.id) {
    return res.status(404).json({ error: 'not_found', message: 'Task not found.' });
  }
  task.done = Boolean(req.body?.done);
  res.json({ task });
});

export default router;
