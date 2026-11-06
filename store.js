// In-memory data store (resets on restart). Swap for a real DB in production.
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
}

// Demo accounts — documented in README.md
const seedUsers = [
  { id: 1, name: 'Alice Admin', email: 'admin@demo.test', password: 'admin123', role: 'admin' },
  { id: 2, name: 'Uma User', email: 'user@demo.test', password: 'user123', role: 'user' },
  { id: 3, name: 'Ravi Kumar', email: 'ravi@demo.test', password: 'user123', role: 'user' },
];

export const users = seedUsers.map(({ password, ...u }) => ({
  ...u,
  passwordHash: hashPassword(password),
  createdAt: new Date().toISOString(),
}));

export const tasks = [
  { id: 1, ownerId: 2, title: 'Submit weekly timesheet', done: false },
  { id: 2, ownerId: 2, title: 'Review onboarding docs', done: true },
  { id: 3, ownerId: 3, title: 'Update profile photo', done: false },
];

export const settings = {
  siteName: 'RBAC Portal',
  allowSelfSignup: false,
  maintenanceMode: false,
};

export function toPublicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export function findUserByEmail(email) {
  return users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
}

export function findUserById(id) {
  return users.find((u) => u.id === Number(id));
}
