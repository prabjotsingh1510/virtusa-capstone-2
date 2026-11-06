import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import portalRoutes from './routes/portal.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Visiting the API's root in a browser explains what this server is,
// instead of Express's default "Cannot GET /".
app.get('/', (_req, res) => {
  res.json({
    name: 'RBAC Portal API',
    message: 'This is the backend API. Open the portal at http://localhost:5173',
    endpoints: {
      'GET  /api/health': 'public',
      'POST /api/auth/login': 'public',
      'GET  /api/auth/me': 'signed in',
      'GET  /api/dashboard': 'dashboard:view',
      'GET  /api/profile': 'profile:view',
      'GET  /api/tasks': 'tasks:view',
      'PATCH /api/tasks/:id': 'tasks:view (own tasks only)',
      'GET  /api/admin/users': 'admin + users:view',
      'PATCH /api/admin/users/:id/role': 'admin + users:manage',
      'GET  /api/admin/reports': 'admin + reports:view',
      'GET  /api/admin/settings': 'admin + settings:manage',
      'PUT  /api/admin/settings': 'admin + settings:manage',
    },
  });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', portalRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found', message: 'Route not found.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'server_error', message: 'Something went wrong.' });
});

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
