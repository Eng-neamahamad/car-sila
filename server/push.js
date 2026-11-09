import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const require = createRequire(import.meta.url);
let webpush;
const pushLibrary = () => {
  if (!webpush) webpush = require('web-push');
  return webpush;
};
const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'push.json');

let client;
let configured = false;

const setting = (name) => String(process.env[name] || '').trim().replace(/^["']|["']$/g, '');

const supabase = () => {
  if (!client) {
    const url = setting('SUPABASE_URL');
    const key = setting('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) throw new Error('Supabase is not configured');
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { transport: ws }
    });
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
  try {
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify(disk));
  } catch (error) {
    console.error(error);
  }
};

const missing = (error) => ['PGRST205', 'PGRST204', '42703'].includes(error?.code);

const ready = () => {
  const publicKey = setting('VAPID_PUBLIC_KEY');
  const privateKey = setting('VAPID_PRIVATE_KEY');
  if (!publicKey || !privateKey) return false;
  if (!configured) {
    pushLibrary().setVapidDetails(setting('VAPID_SUBJECT') || 'mailto:carsila@localhost', publicKey, privateKey);
    configured = true;
  }
  return true;
};

export const pushPublicKey = () => setting('VAPID_PUBLIC_KEY');

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

export const sendPush = async (userId, { title, body, url = '/', tag }) => {
  if (!ready() || !userId) return;
  const subscriptions = await subscriptionsFor(userId);
  const payload = JSON.stringify({
    title,
    body,
    url,
    tag: tag || `note-${Date.now()}`
  });
  await Promise.all(subscriptions.map(async (item) => {
    let timer;
    try {
      await Promise.race([
        pushLibrary().sendNotification({
          endpoint: item.endpoint,
          keys: { p256dh: item.p256dh, auth: item.auth }
        }, payload, { TTL: 60 * 60, urgency: 'high' }),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('push timeout')), 4000);
        })
      ]);
    } catch (error) {
      if (error?.statusCode === 404 || error?.statusCode === 410) await forget(item.endpoint);
      else console.error(error?.message || error);
    } finally {
      clearTimeout(timer);
    }
  }));
};
