import { Router } from 'express';
import { findUserByEmail, verifyPassword, toPublicUser, findUserById } from '../data/store.js';
import { authenticate, signToken } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'bad_request', message: 'Email and password are required.' });
  }
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'invalid_credentials', message: 'Invalid email or password.' });
  }
  return res.json({ token: signToken(user) });
});

// The frontend calls this to learn who is logged in and what they may do.
router.get('/me', authenticate, (req, res) => {
  const user = toPublicUser(findUserById(req.user.id));
  res.json({
    user,
    role: { key: req.user.role, label: ROLES[req.user.role].label },
    permissions: req.user.permissions,
  });
});

export default router;
