import jwt from 'jsonwebtoken';
import { findUserById } from '../data/store.js';
import { permissionsForRole } from '../config/roles.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';
export const JWT_EXPIRES_IN = '2h';

export function signToken(user) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Authentication: verifies the Bearer token and attaches req.user.
 * The role is re-read from the store on every request, so a role change
 * takes effect immediately instead of waiting for the token to expire.
 * Responds 401 when the caller is not (or no longer) authenticated.
 */
export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'unauthenticated', message: 'Missing bearer token.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'unauthenticated', message: 'User no longer exists.' });
    }
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: permissionsForRole(user.role),
    };
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Session expired.' : 'Invalid token.';
    return res.status(401).json({ error: 'unauthenticated', message });
  }
}

/**
 * Authorization by role: allow only if the user has one of the given roles.
 * Responds 403 (authenticated but not allowed).
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'forbidden',
        message: `Requires role: ${roles.join(' or ')}.`,
        required: { roles },
      });
    }
    return next();
  };
}

/**
 * Authorization by permission: the user must hold ALL listed permissions.
 * Preferred over requireRole because it decouples routes from role names.
 */
export function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
    const missing = permissions.filter((p) => !req.user.permissions.includes(p));
    if (missing.length) {
      return res.status(403).json({
        error: 'forbidden',
        message: `Missing permission: ${missing.join(', ')}.`,
        required: { permissions },
        missing,
      });
    }
    return next();
  };
}
