import { readFileSync } from 'node:fs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import helmet from 'helmet';
import { pushPublicKey, removePushSubscription, savePushSubscription } from './push.js';
import { translateInto } from './translate.js';
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
  ownerCallSignal,
  ownerCallState,
  ownerIncoming,
  regenerateToken,
  registerAccount,
  reportPhotoFor,
  sendMessage,
  setVehicleReturn,
  startVisitorCall,
  visitorCallEnd,
  visitorCallIce,
  visitorCallState,
  cleanText,
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

const originAllowed = (origin) => {
  if (!origin || allowedOrigins.has(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    return host === 'localhost' || host.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin(origin, callback) {
    callback(null, originAllowed(origin));
  },
  credentials: true
}));
app.use(express.json({ limit: '800kb' }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
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

const translateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${clientAddress(req)}:translate`,
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

const callLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${clientAddress(req)}:call`,
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
  if (res.headersSent) return;
  const missingTable = error?.code === 'PGRST205';
  res.status(500).json({ error: missingTable ? 'schema_missing' : 'request_failed' });
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
    if (result.error) return res.status(result.error === 'not_found' ? 404 : 400).json({ error: result.error });
    res.status(201).json({ conversation: result.conversation });
  } catch (error) {
    fail(res, error);
  }
});

const openVisit = async (req, res) => {
  const visitId = await ensureVisit(currentVisit(req));
  if (visitId !== currentVisit(req)) {
    res.cookie('carsila_visit', visitId, { ...cookieOptions, maxAge: 12 * 60 * 60 * 1000 });
  }
  return visitId;
};

app.post('/api/public/calls', callLimiter, async (req, res) => {
  try {
    const visitId = await openVisit(req, res);
    const result = await startVisitorCall(visitId, req.body?.token, req.body?.offer, await currentAccount(req));
    if (result.error) {
      const status = result.error === 'not_found' ? 404 : result.error === 'forbidden' || result.error === 'own_vehicle' ? 403 : result.error === 'call_busy' ? 409 : 400;
      return res.status(status).json({ error: result.error });
    }
    res.status(201).json(result);
  } catch (error) {
    fail(res, error);
  }
});

app.get('/api/public/calls', async (req, res) => {
  try {
    const result = await visitorCallState(req.query.id, currentVisit(req));
    if (result.error) return res.status(403).json({ error: result.error });
    res.json(result);
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/public/calls/ice', callLimiter, async (req, res) => {
  try {
    const result = await visitorCallIce(req.body?.id, currentVisit(req), req.body?.candidate);
    if (result.error) return res.status(result.error === 'ended' ? 409 : 403).json({ error: result.error });
    res.json(result);
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/public/calls/end', async (req, res) => {
  try {
    const result = await visitorCallEnd(req.body?.id, currentVisit(req));
    if (result.error) return res.status(403).json({ error: result.error });
    res.json(result);
  } catch (error) {
    fail(res, error);
  }
});

app.get('/api/calls/incoming', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = await ownerIncoming(account);
    if (result.error) return res.status(403).json({ error: result.error });
    res.json(result);
  } catch (error) {
    fail(res, error);
  }
});

app.get('/api/calls/live', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = await ownerCallState(account, req.query.id);
    if (result.error) return res.status(403).json({ error: result.error });
    res.json(result);
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/calls/signal', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = await ownerCallSignal(account, req.body?.id, req.body || {});
    if (result.error) return res.status(result.error === 'invalid_input' ? 400 : result.error === 'ended' ? 409 : 403).json({ error: result.error });
    res.json(result);
  } catch (error) {
    fail(res, error);
  }
});

app.get('/api/reports/photo', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = await reportPhotoFor(account, req.query.id);
    if (result.error) return res.status(result.error === 'not_found' ? 404 : 403).json({ error: result.error });
    res.json(result);
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/translate', translateLimiter, async (req, res) => {
  try {
    const text = cleanText(req.body?.text, 500);
    const to = req.body?.to === 'en' ? 'en' : 'ar';
    if (!text) return res.status(400).json({ error: 'invalid_input' });
    const result = await translateInto(text, to);
    if (!result) return res.status(502).json({ error: 'translate_failed' });
    res.json(result);
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

app.post('/api/vehicles/return', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    const result = await setVehicleReturn(account, req.body?.id, req.body?.minutes);
    if (result.error) return res.status(result.error === 'invalid_input' ? 400 : 403).json({ error: result.error });
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
    const result = await markOwnerConversationsRead(account, req.body?.conversationId);
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

app.get('/api/push/key', (_req, res) => {
  const key = pushPublicKey();
  if (!key) return res.status(503).json({ error: 'push_unavailable' });
  res.json({ key });
});

app.post('/api/push/subscribe', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account || account.role !== 'owner') {
      if (account) res.status(403).json({ error: 'forbidden' });
      return;
    }
    const result = await savePushSubscription(account.id, req.body || {});
    if (result.error) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (error) {
    fail(res, error);
  }
});

app.post('/api/push/unsubscribe', async (req, res) => {
  try {
    const account = await requireAccount(req, res);
    if (!account) return;
    res.json(await removePushSubscription(account.id, req.body?.endpoint));
  } catch (error) {
    fail(res, error);
  }
});

const port = Number(process.env.PORT) || 8787;
if (!process.env.VERCEL) {
  app.listen(port, '127.0.0.1', () => {
    console.log(`CAR-SILA API listening on http://127.0.0.1:${port}`);
  });
}

export default app;
