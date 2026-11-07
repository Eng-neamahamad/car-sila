import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const webpush = createRequire(import.meta.url)('web-push');
const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'push.json');

let client;
let configured = false;

const supabase = () => {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase is not configured');
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
};

const load = () => {
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
};

let disk = load();

const persist = () => {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(disk));
};

const missing = (error) => ['PGRST205', 'PGRST204', '42703'].includes(error?.code);

const ready = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY || '';
  const privateKey = process.env.VAPID_PRIVATE_KEY || '';
  if (!publicKey || !privateKey) return false;
  if (!configured) {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@carsila.com', publicKey, privateKey);
    configured = true;
  }
  return true;
};

export const pushPublicKey = () => process.env.VAPID_PUBLIC_KEY || '';

const validSubscription = (value) => {
  const endpoint = String(value?.endpoint || '');
  const p256dh = String(value?.keys?.p256dh || '');
  const auth = String(value?.keys?.auth || '');
  if (!endpoint.startsWith('https://') || endpoint.length > 500) return null;
  if (p256dh.length < 20 || p256dh.length > 200 || auth.length < 10 || auth.length > 80) return null;
  return { endpoint, p256dh, auth };
};

export const savePushSubscription = async (userId, value) => {
  const subscription = validSubscription(value);
  if (!subscription) return { error: 'invalid_input' };
  const row = {
    endpoint: subscription.endpoint,
    user_id: userId,
    p256dh: subscription.p256dh,
    auth: subscription.auth,
    created_at: new Date().toISOString()
  };
  const saved = await supabase().from('push_subscriptions').upsert(row);
  if (saved.error && !missing(saved.error)) throw saved.error;
  disk[subscription.endpoint] = row;
  persist();
  return { ok: true };
};

export const removePushSubscription = async (userId, endpoint) => {
  const target = String(endpoint || '');
  const saved = disk[target];
  if (saved?.user_id === userId) {
    delete disk[target];
    persist();
  }
  const removed = await supabase().from('push_subscriptions').delete().eq('endpoint', target).eq('user_id', userId);
  if (removed.error && !missing(removed.error)) throw removed.error;
  return { ok: true };
};

const subscriptionsFor = async (userId) => {
  const local = Object.values(disk).filter((item) => item.user_id === userId);
  const rows = await supabase().from('push_subscriptions').select('endpoint,user_id,p256dh,auth').eq('user_id', userId);
  if (rows.error) return local;
  const merged = new Map(local.map((item) => [item.endpoint, item]));
  for (const row of rows.data || []) merged.set(row.endpoint, row);
  return [...merged.values()];
};

const forget = async (endpoint) => {
  delete disk[endpoint];
  persist();
  const removed = await supabase().from('push_subscriptions').delete().eq('endpoint', endpoint);
  if (removed.error && !missing(removed.error)) console.error(removed.error);
};

export const sendCallAlert = async (userId, { title, body }) => {
  if (!ready()) return;
  const subscriptions = await subscriptionsFor(userId);
  const payload = JSON.stringify({
    title,
    body,
    url: '/'
  });
  await Promise.all(subscriptions.map(async (item) => {
    try {
      await webpush.sendNotification({
        endpoint: item.endpoint,
        keys: { p256dh: item.p256dh, auth: item.auth }
      }, payload, { TTL: 90, urgency: 'high' });
    } catch (error) {
      if (error?.statusCode === 404 || error?.statusCode === 410) await forget(item.endpoint);
      else console.error(error);
    }
  }));
};
