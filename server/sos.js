import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const KINDS = new Set(['battery', 'air', 'tow']);
const RADIUS_KM = 15;
const LIFE_MS = 45 * 60 * 1000;
const HELP_MS = 2 * 60 * 60 * 1000;

let client;

const db = () => {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase is not configured');
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { transport: ws }
    });
  }
  return client;
};

const missingTable = (error) => /sos_|PGRST205|schema cache|does not exist/i.test(`${error?.code || ''} ${error?.message || ''}`);

const clean = (value, max) => String(value ?? '')
  .replace(/\0/g, '')
  .replace(/<[^>]*>/g, '')
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '')
  .replace(/\+?\d[\d\s-]{7,}\d/g, '')
  .replace(/\s{2,}/g, ' ')
  .trim()
  .slice(0, max);

const round = (value) => Math.round(Number(value) * 1000) / 1000;

const point = (lat, lng) => {
  const latitude = round(lat);
  const longitude = round(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { lat: latitude, lng: longitude };
};

const distanceKm = (aLat, aLng, bLat, bLng) => {
  const radius = 6371;
  const dLat = (bLat - aLat) * Math.PI / 180;
  const dLng = (bLng - aLng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2
    + Math.cos(aLat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.min(1, Math.sqrt(x)));
};

const rangeFor = (km) => {
  if (km < 1) return 'under_1';
  if (km < 3) return 'about_2';
  if (km < 6) return 'about_5';
  if (km < 11) return 'about_10';
  return 'within_15';
};

const expireOpen = async () => {
  const result = await db().from('sos_requests').update({ status: 'expired' }).eq('status', 'open').lt('expires_at', new Date().toISOString());
  if (result.error && missingTable(result.error)) return { error: 'sos_unavailable' };
  if (result.error) throw result.error;
  return { ok: true };
};

const helperRow = async (userId) => {
  const result = await db().from('sos_helpers').select('*').eq('user_id', userId).maybeSingle();
  if (result.error && missingTable(result.error)) return { error: 'sos_unavailable' };
  if (result.error) throw result.error;
  return { row: result.data };
};

const messagesFor = async (requestId) => {
  const result = await db().from('sos_messages').select('*').eq('request_id', requestId).order('created_at');
  if (result.error) throw result.error;
  return (result.data || []).map((row) => ({
    id: row.id,
    mine: false,
    text: row.body,
    createdAt: row.created_at,
    senderId: row.sender_id
  }));
};

const present = async (row, account, helper) => {
  const mine = row.requester_id === account.id;
  const helping = row.helper_id === account.id;
  const km = helper?.lat != null && helper?.lng != null
    ? distanceKm(helper.lat, helper.lng, row.lat, row.lng)
    : null;
  const visible = mine || helping;
  const messages = visible ? (await messagesFor(row.id)).map((message) => ({
    id: message.id,
    mine: message.senderId === account.id,
    text: message.text,
    createdAt: message.createdAt
  })) : [];
  return {
    id: row.id,
    kind: row.kind,
    note: row.note || '',
    status: row.status,
    range: km == null ? '' : rangeFor(km),
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    mine,
    helping,
    messages,
    mapUrl: visible ? `https://maps.google.com/?q=${row.lat},${row.lng}` : ''
  };
};

const activeAccount = (account) => {
  if (!account) return { error: 'forbidden' };
  if (account.status !== 'active') return { error: 'suspended' };
  return null;
};

export const sosState = async (account) => {
  const blocked = activeAccount(account);
  if (blocked) return blocked;
  const expired = await expireOpen();
  if (expired.error) return expired;
  const helper = await helperRow(account.id);
  if (helper.error) return helper;
  const freshHelper = helper.row && helper.row.active && Date.now() - new Date(helper.row.updated_at).getTime() < HELP_MS
    ? helper.row
    : null;
  const requests = await db().from('sos_requests').select('*').in('status', ['open', 'accepted']).order('created_at', { ascending: false });
  if (requests.error && missingTable(requests.error)) return { error: 'sos_unavailable' };
  if (requests.error) throw requests.error;
  const rows = requests.data || [];
  const mine = rows.find((row) => row.requester_id === account.id && (row.status === 'open' || row.status === 'accepted'));
  const nearby = freshHelper
    ? rows.filter((row) => row.status === 'open' && row.requester_id !== account.id && distanceKm(freshHelper.lat, freshHelper.lng, row.lat, row.lng) <= RADIUS_KM)
    : [];
  const accepted = rows.filter((row) => row.status === 'accepted' && row.helper_id === account.id);
  return {
    ready: Boolean(freshHelper),
    mine: mine ? await present(mine, account, freshHelper) : null,
    nearby: await Promise.all(nearby.map((row) => present(row, account, freshHelper))),
    accepted: await Promise.all(accepted.map((row) => present(row, account, freshHelper)))
  };
};

export const sosToggle = async (account, input) => {
  const blocked = activeAccount(account);
  if (blocked) return blocked;
  const active = Boolean(input?.active);
  if (!active) {
    const result = await db().from('sos_helpers').upsert({
      user_id: account.id,
      active: false,
      lat: null,
      lng: null,
      updated_at: new Date().toISOString()
    });
    if (result.error && missingTable(result.error)) return { error: 'sos_unavailable' };
    if (result.error) throw result.error;
    return sosState(account);
  }
  const where = point(input?.lat, input?.lng);
  if (!where) return { error: 'sos_location' };
  const result = await db().from('sos_helpers').upsert({
    user_id: account.id,
    active: true,
    lat: where.lat,
    lng: where.lng,
    updated_at: new Date().toISOString()
  });
  if (result.error && missingTable(result.error)) return { error: 'sos_unavailable' };
  if (result.error) throw result.error;
  return sosState(account);
};

export const sosCreate = async (account, input) => {
  const blocked = activeAccount(account);
  if (blocked) return blocked;
  const expired = await expireOpen();
  if (expired.error) return expired;
  const kind = KINDS.has(input?.kind) ? input.kind : '';
  const where = point(input?.lat, input?.lng);
  const note = clean(input?.note, 160);
  if (!kind || !where) return { error: 'invalid_input' };
  const existing = await db().from('sos_requests').select('id').eq('requester_id', account.id).eq('status', 'open').maybeSingle();
  if (existing.error && missingTable(existing.error)) return { error: 'sos_unavailable' };
  if (existing.error) throw existing.error;
  if (existing.data) return { error: 'sos_open' };
  const now = new Date();
  const inserted = await db().from('sos_requests').insert({
    id: `sos_${randomUUID()}`,
    requester_id: account.id,
    kind,
    note,
    lat: where.lat,
    lng: where.lng,
    status: 'open',
    helper_id: null,
    created_at: now.toISOString(),
    expires_at: new Date(now.getTime() + LIFE_MS).toISOString()
  });
  if (inserted.error && missingTable(inserted.error)) return { error: 'sos_unavailable' };
  if (inserted.error) throw inserted.error;
  return sosState(account);
};

export const sosAccept = async (account, requestId) => {
  const blocked = activeAccount(account);
  if (blocked) return blocked;
  const expired = await expireOpen();
  if (expired.error) return expired;
  const helper = await helperRow(account.id);
  if (helper.error) return helper;
  if (!helper.row?.active) return { error: 'forbidden' };
  const row = await db().from('sos_requests').select('*').eq('id', requestId).maybeSingle();
  if (row.error && missingTable(row.error)) return { error: 'sos_unavailable' };
  if (row.error) throw row.error;
  if (!row.data || row.data.status !== 'open') return { error: 'not_found' };
  if (row.data.requester_id === account.id) return { error: 'forbidden' };
  if (new Date(row.data.expires_at).getTime() <= Date.now()) return { error: 'sos_expired' };
  const updated = await db().from('sos_requests').update({ status: 'accepted', helper_id: account.id }).eq('id', requestId).eq('status', 'open');
  if (updated.error) throw updated.error;
  return sosState(account);
};

export const sosClose = async (account, requestId) => {
  const blocked = activeAccount(account);
  if (blocked) return blocked;
  const row = await db().from('sos_requests').select('*').eq('id', requestId).maybeSingle();
  if (row.error && missingTable(row.error)) return { error: 'sos_unavailable' };
  if (row.error) throw row.error;
  if (!row.data) return { error: 'not_found' };
  if (row.data.requester_id !== account.id && row.data.helper_id !== account.id) return { error: 'forbidden' };
  const updated = await db().from('sos_requests').update({ status: 'closed' }).eq('id', requestId);
  if (updated.error) throw updated.error;
  return sosState(account);
};

export const sosMessage = async (account, requestId, text) => {
  const blocked = activeAccount(account);
  if (blocked) return blocked;
  const body = clean(text, 300);
  if (!body) return { error: 'invalid_input' };
  const row = await db().from('sos_requests').select('*').eq('id', requestId).maybeSingle();
  if (row.error && missingTable(row.error)) return { error: 'sos_unavailable' };
  if (row.error) throw row.error;
  if (!row.data || row.data.status !== 'accepted') return { error: 'forbidden' };
  if (row.data.requester_id !== account.id && row.data.helper_id !== account.id) return { error: 'forbidden' };
  const inserted = await db().from('sos_messages').insert({
    id: `sosm_${randomUUID()}`,
    request_id: requestId,
    sender_id: account.id,
    body,
    created_at: new Date().toISOString()
  });
  if (inserted.error && missingTable(inserted.error)) return { error: 'sos_unavailable' };
  if (inserted.error) throw inserted.error;
  return sosState(account);
};

export const sosSummary = async (account) => {
  if (!account || account.role !== 'admin') return { error: 'forbidden' };
  const expired = await expireOpen();
  if (expired.error) return expired;
  const result = await db().from('sos_requests').select('id', { count: 'exact', head: true }).eq('status', 'open');
  if (result.error && missingTable(result.error)) return { open: 0 };
  if (result.error) throw result.error;
  return { open: result.count || 0 };
};
