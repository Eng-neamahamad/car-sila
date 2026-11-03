import { readFileSync } from 'node:fs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import helmet from 'helmet';
import {
  accountForSession,
  addVehicle,
  ADMIN_EMAIL,
  clearOwnVehicles,
  createSession,
  deleteSession,
  deleteVehicle,
  ensureVisit,
  findVehicleByPublicCode,
  loadDatabase,
  loginAccount,
  loginGoogleAccount,
  markAllNotifications,
  markNotification,
  markOwnerConversationsRead,
  publicVehicle,
  regenerateToken,
  registerAccount,
  sendMessage,
  submitReport,
  toggleUserStatus,
  updateProfile,
  updateReportStatus,
  updateVehicleStatus,
  workspaceFor
} from './store.js';

const loadEnvFile = () => {
  try {
    const text = readFileSync(new URL('../.env', import.meta.url), 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // The Google button stays unavailable until a client id is configured.
  }
};

loadEnvFile();
await loadDatabase();

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

const allowedOrigins = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']);
if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') allowedOrigins.add(process.env.APP_URL);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) callback(null, true);
    else callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/'
};

const clientAddress = (req) => ipKeyGenerator(req.ip || '');

const reportLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 1,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${clientAddress(req)}:${String(req.body?.token || '').slice(0, 80).toLowerCase()}`,
  handler: (_req, res) => res.status(429).json({ error: 'rate_limited' })
});

const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${clientAddress(req)}:message`,
  handler: (_req, res) => res.status(429).json({ error: 'rate_limited' })
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => clientAddress(req),
  handler: (_req, res) => res.status(429).json({ error: 'rate_limited' })
});

const currentAccount = (req) => accountForSession(req.cookies.carsila_sid);
const currentVisit = (req) => req.cookies.carsila_visit || '';

const sendWorkspace = async (res, account, visitId) => {
  res.json(await workspaceFor(account, visitId));
};

const setSession = async (res, account) => {
  res.cookie('carsila_sid', await createSession(account.id), { ...cookieOptions, maxAge: 14 * 24 * 60 * 60 * 1000 });
};

const fail = (res, error) => {
  console.error(error);
  if (!res.headersSent) res.status(500).json({ error: 'request_failed' });
};

app.get('/api/bootstrap', async (req, res) => {
  try {
    await sendWorkspace(res, await currentAccount(req), currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const result = await registerAccount(req.body || {});
    if (result.error) return res.status(400).json({ error: result.error });
    await setSession(res, result.account);
    await sendWorkspace(res, result.account, currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const result = await loginAccount(req.body?.email, req.body?.password);
    if (result.error) return res.status(401).json({ error: result.error });
    await setSession(res, result.account);
    await sendWorkspace(res, result.account, currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/auth/google', authLimiter, async (req, res) => {
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID?.trim();
  const credential = String(req.body?.credential || '');
  if (!clientId || !credential) return res.status(400).json({ error: 'google_failed' });
  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload?.email || payload.email_verified === false) {
      return res.status(401).json({ error: 'google_failed' });
    }
    if (payload.email.toLowerCase() === ADMIN_EMAIL) {
      return res.status(403).json({ error: 'admin_google' });
    }
    const result = await loginGoogleAccount({ email: payload.email, name: payload.name || '' });
    if (result.error) return res.status(403).json({ error: result.error });
    await setSession(res, result.account);
    await sendWorkspace(res, result.account, currentVisit(req));
  } catch {
    res.status(401).json({ error: 'google_failed' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    await deleteSession(req.cookies.carsila_sid);
    res.clearCookie('carsila_sid', cookieOptions);
    await sendWorkspace(res, null, currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

app.get('/api/public/vehicle', async (req, res) => {
  try {
    const vehicle = await findVehicleByPublicCode(req.query.code);
    if (!vehicle || vehicle.status === 'inactive') return res.status(404).json({ error: 'not_found' });
    res.json({ vehicle: publicVehicle(vehicle) });
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/public/reports', reportLimiter, async (req, res) => {
  try {
    const visitId = await ensureVisit(currentVisit(req));
    if (visitId !== currentVisit(req)) {
      res.cookie('carsila_visit', visitId, { ...cookieOptions, maxAge: 12 * 60 * 60 * 1000 });
    }
    const result = await submitReport(visitId, req.body || {}, await currentAccount(req));
    if (result.error) return res.status(404).json({ error: result.error });
    res.status(201).json({ conversation: result.conversation });
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/public/messages', messageLimiter, async (req, res) => {
  try {
    const result = await sendMessage({
      account: null,
      visitId: currentVisit(req),
      conversationId: req.body?.conversationId,
      text: req.body?.text,
      senderRole: 'reporter'
    });
    if (result.error) return res.status(403).json({ error: result.error });
    await sendWorkspace(res, await currentAccount(req), currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

const requireAccount = async (req, res) => {
  const account = await currentAccount(req);
  if (!account) {
    res.status(401).json({ error: 'forbidden' });
    return null;
  }
  return account;
};

app.post('/api/vehicles', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = await addVehicle(account, req.body || {});
    if (result.error) {
      const status = { forbidden: 403, suspended: 403, vehicle_limit: 403, plate_taken: 409 }[result.error] || 400;
      return res.status(status).json({ error: result.error });
    }
    await sendWorkspace(res, account, currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/vehicles/delete', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = await deleteVehicle(account, req.body?.id);
    if (result.error) return res.status(403).json({ error: result.error });
    await sendWorkspace(res, account, currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/vehicles/clear', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = await clearOwnVehicles(account);
    if (result.error) return res.status(403).json({ error: result.error });
    await sendWorkspace(res, account, currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/vehicles/status', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = await updateVehicleStatus(account, req.body?.id, req.body?.status);
    if (result.error) return res.status(403).json({ error: result.error });
    await sendWorkspace(res, account, currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/vehicles/token', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = await regenerateToken(account, req.body?.id);
    if (result.error) return res.status(403).json({ error: result.error });
    await sendWorkspace(res, account, currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/reports/status', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = await updateReportStatus(account, req.body?.id, req.body?.status);
    if (result.error) return res.status(403).json({ error: result.error });
    await sendWorkspace(res, account, currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/messages', messageLimiter, async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = await sendMessage({
      account,
      visitId: '',
      conversationId: req.body?.conversationId,
      text: req.body?.text,
      senderRole: 'owner'
    });
    if (result.error) return res.status(403).json({ error: result.error });
    await sendWorkspace(res, account, currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = await updateProfile(account, req.body || {});
    if (result.error) return res.status(400).json({ error: result.error });
    await sendWorkspace(res, account, currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/admin/users/status', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = await toggleUserStatus(account, req.body?.userId);
    if (result.error) return res.status(403).json({ error: result.error });
    await sendWorkspace(res, account, currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/messages/read', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = await markOwnerConversationsRead(account);
    if (result.error) return res.status(403).json({ error: result.error });
    await sendWorkspace(res, account, currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/notifications/read', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = req.body?.all
      ? await markAllNotifications(account)
      : await markNotification(account, req.body?.id);
    if (result.error) return res.status(403).json({ error: result.error });
    await sendWorkspace(res, account, currentVisit(req));
  } catch (error) {
    fail(res, error);
  }
});

const port = Number(process.env.PORT) || 8787;
app.listen(port, '127.0.0.1', () => {
  console.log(`CAR-SILA API listening on http://127.0.0.1:${port}`);
});
