import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { sendReportEmail } from './mail.js';
import { sendPush } from './push.js';
import { cachedReturn, incomingCalls, ownerSignal, readPhoto, savePhoto, saveReturn, startCall, visitorCall, visitorHangup, visitorIce, ownerCall } from './safety.js';
import { unpackText } from './translate.js';

export const adminEmail = () => setting('ADMIN_EMAIL').toLowerCase();
const adminPassword = () => setting('ADMIN_PASSWORD');
const CATEGORIES = new Set(['blocking', 'lights', 'accident', 'lost_item', 'contact', 'other']);

let client;

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

const must = (result) => {
  if (result.error) throw result.error;
  return result.data;
};

export const cleanText = (value, max) =>
  String(value ?? '')
    .replace(/\0/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
    .slice(0, max);

export const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 32).toString('hex');
  return `scrypt:${salt}:${hash}`;
};

export const verifyPassword = (password, stored) => {
  const [kind, salt, hash] = String(stored || '').split(':');
  if (kind !== 'scrypt' || !salt || !hash) return false;
  const actual = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, 'hex');
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
};

const compact = (value) => String(value || '').trim().toLowerCase().replace(/[\s\-_.]/g, '');
const MAX_VEHICLES_PER_OWNER = 10;
const KNOWN_BRANDS = new Set([
  'Toyota', 'Honda', 'Nissan', 'Mazda', 'Mitsubishi', 'Subaru',
  'Hyundai', 'Kia', 'Genesis',
  'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Skoda',
  'Ford', 'Chevrolet', 'GMC', 'Jeep', 'Tesla'
]);
const PLATE_PATTERN = /^(?=.*[\p{L}\p{N}])[\p{L}\p{N} -]{3,15}$/u;
const LABEL_PATTERN = /^[\p{L}\p{N} .+-]{1,40}$/u;

const accountFrom = (row) => row && ({
  id: row.id,
  name: row.name,
  email: row.email,
  passwordHash: row.password_hash,
  phone: row.phone || undefined,
  role: row.role,
  status: row.status,
  createdAt: row.created_at,
  avatar: row.avatar || ''
});

const vehicleFrom = (row) => row && ({
  id: row.id,
  ownerId: row.owner_id,
  ownerName: row.owner_name,
  brand: row.brand,
  model: row.model,
  year: row.year,
  color: row.color,
  plateNumber: row.plate_number,
  qrToken: row.qr_token,
  status: row.status,
  scansCount: row.scans_count,
  reportsCount: row.reports_count,
  imageUrl: row.image_url || undefined,
  createdAt: row.created_at,
  returnAt: futureStamp(row.return_at) || cachedReturn(row.id) || undefined
});

const reportFrom = (row) => {
  const title = unpackText(row.title);
  const description = unpackText(row.description);
  return {
  id: row.id,
  vehicleId: row.vehicle_id,
  vehicleName: row.vehicle_name,
  vehiclePlate: row.vehicle_plate,
  category: row.category,
  title: title.text,
  titleTranslation: title.translation || undefined,
  titleSourceLang: title.from || undefined,
  titleTargetLang: title.to || undefined,
  description: description.text,
  translation: description.translation || undefined,
  sourceLang: description.from || undefined,
  targetLang: description.to || undefined,
  hasLocation: row.has_location,
  status: row.status,
  reporterName: row.reporter_name,
  reporterSessionId: row.reporter_session_id,
  createdAt: row.created_at,
  timestamp: row.timestamp
}; };

const photoMarker = (text) => {
  const value = String(text || '');
  const match = value.match(/\[\[photo:([A-Za-z0-9_-]+)\]\]/);
  return {
    text: value.replace(/\s*\[\[photo:[A-Za-z0-9_-]+\]\]\s*/g, ' ').replace(/\s+/g, ' ').trim(),
    photoReportId: match?.[1] || ''
  };
};

const messageFrom = (row) => {
  const body = unpackText(row.body);
  const shown = photoMarker(body.text);
  return {
  id: row.id,
  conversationId: row.conversation_id,
  senderRole: row.sender_role,
  senderName: row.sender_name,
  text: shown.text,
  photoReportId: shown.photoReportId || undefined,
  translation: body.translation || undefined,
  sourceLang: body.from || undefined,
  targetLang: body.to || undefined,
  timestamp: row.timestamp,
  createdAt: row.created_at,
  isRead: row.is_read
}; };

const conversationFrom = (row, messages) => {
  const last = unpackText(photoMarker(row.last_message).text);
  return {
  id: row.id,
  reportId: row.report_id,
  vehicleId: row.vehicle_id,
  vehicleName: row.vehicle_name,
  vehiclePlate: row.vehicle_plate,
  lastMessage: last.text,
  lastMessageTranslation: last.translation || undefined,
  lastMessageSource: last.from || undefined,
  lastMessageTarget: last.to || undefined,
  lastMessageTime: row.last_message_time,
  unreadCount: row.unread_count,
  reporterSessionId: row.reporter_session_id,
  status: row.status,
  messages
};
};

const callMarker = (text) => {
  const value = String(text || '');
  const match = value.match(/\[\[call:([A-Za-z0-9_-]+)\]\]/);
  return {
    text: value.replace(/\s*\[\[call:[A-Za-z0-9_-]+\]\]\s*/g, ' ').replace(/\s+/g, ' ').trim(),
    callId: match?.[1] || ''
  };
};

const notificationFrom = (row) => {
  const marked = callMarker(row.message);
  return {
    id: row.id,
    userId: row.user_id,
    vehicleId: row.vehicle_id || undefined,
    reportId: row.report_id || undefined,
    callId: marked.callId || undefined,
    type: row.type,
    title: row.title,
    message: marked.text,
    timeAgo: row.time_ago,
    createdAt: row.created_at,
    isRead: row.is_read,
    severity: row.severity
  };
};

const activityFrom = (row) => ({
  id: row.id,
  vehicleId: row.vehicle_id || undefined,
  vehicleName: row.vehicle_name || undefined,
  type: row.type,
  title: row.title,
  subtitle: row.subtitle,
  timeStr: row.time_str,
  dateGroup: row.date_group,
  tagText: row.tag_text || undefined,
  tagType: row.tag_type || undefined,
  createdAt: row.created_at
});

const accountByEmail = async (email) => {
  const data = must(await supabase().from('accounts').select('*').eq('email', email).maybeSingle());
  return accountFrom(data);
};

const accountById = async (id) => {
  const data = must(await supabase().from('accounts').select('*').eq('id', id).maybeSingle());
  return accountFrom(data);
};

const vehicleById = async (id) => {
  const data = must(await supabase().from('vehicles').select('*').eq('id', id).maybeSingle());
  return vehicleFrom(data);
};

const plates = async () => must(await supabase().from('vehicles').select('plate_number'));

export const publicUser = (account, vehiclesCount = 0) => ({
  id: account.id,
  name: account.name,
  email: account.email,
  role: account.role,
  avatar: account.avatar || undefined,
  createdAt: account.createdAt,
  status: account.status,
  vehiclesCount
});

const futureStamp = (value) => {
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) && time > Date.now() ? new Date(time).toISOString() : '';
};

const photoData = (value) => {
  const text = String(value || '');
  if (!text) return '';
  if (!text.startsWith('data:image/jpeg;base64,') || text.length > 550000) return null;
  if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=\s]+$/.test(text)) return null;
  return text.replace(/\s/g, '');
};

export const publicVehicle = (vehicle) => ({
  qrToken: vehicle.qrToken,
  brand: vehicle.brand,
  model: vehicle.model,
  year: vehicle.year,
  color: vehicle.color,
  plateNumber: vehicle.plateNumber,
  status: vehicle.status,
  returnAt: vehicle.returnAt || undefined
});

export const setVehicleReturn = async (account, id, minutes) => {
  if (!account || account.role !== 'owner') return { error: 'forbidden' };
  const vehicle = await vehicleById(id);
  if (!vehicle || vehicle.ownerId !== account.id) return { error: 'forbidden' };
  const value = Number(minutes);
  if (![0, 5, 10, 15, 30].includes(value)) return { error: 'invalid_input' };
  const returnAt = value === 0 ? '' : new Date(Date.now() + value * 60 * 1000).toISOString();
  await saveReturn(id, returnAt);
  return {};
};

export const reportPhotoFor = async (account, id, visitId = '') => {
  const row = must(await supabase().from('reports').select('id,vehicle_id,reporter_session_id,created_at').eq('id', id).maybeSingle());
  if (!row) return { error: 'not_found' };
  const vehicle = await vehicleById(row.vehicle_id);
  const owner = account && (account.role === 'admin' || vehicle?.ownerId === account.id);
  const reporter = visitId && row.reporter_session_id === visitId;
  if (!owner && !reporter) return { error: 'forbidden' };
  const saved = await readPhoto(id);
  if (!saved) return { error: 'not_found' };
  return { photo: saved.photo, capturedAt: saved.capturedAt || row.created_at };
};

export const startVisitorCall = async (visitId, token, offer, account) => {
  const vehicle = await findVehicleByPublicCode(token);
  if (!vehicle || vehicle.status === 'inactive') return { error: 'not_found' };
  if (account && account.id === vehicle.ownerId) return { error: 'own_vehicle' };
  return startCall({ vehicle, visitId, offer });
};

export const visitorCallState = (id, visitId) => visitorCall(id, visitId);
export const visitorCallIce = (id, visitId, candidate) => visitorIce(id, visitId, candidate);
export const visitorCallEnd = (id, visitId) => visitorHangup(id, visitId);
export const ownerIncoming = (account) => account?.role === 'owner' ? incomingCalls(account.id) : { error: 'forbidden' };
export const ownerCallState = (account, id) => account?.role === 'owner' ? ownerCall(id, account.id) : { error: 'forbidden' };
export const ownerCallSignal = (account, id, body) => account?.role === 'owner'
  ? ownerSignal(id, account.id, body || {})
  : { error: 'forbidden' };

export const findVehicleByPublicCode = async (code) => {
  const typed = compact(code);
  if (!typed) return null;
  const rows = must(await supabase().from('vehicles').select('*'));
  return rows.map(vehicleFrom).find((vehicle) =>
    compact(vehicle.qrToken) === typed || compact(vehicle.plateNumber) === typed
  ) || null;
};

const withMessages = async (rows) => {
  if (!rows.length) return [];
  const ids = rows.map((row) => row.id);
  const messageRows = must(await supabase().from('messages').select('*').in('conversation_id', ids).order('created_at'));
  return rows.map((row) => conversationFrom(
    row,
    messageRows.filter((message) => message.conversation_id === row.id).map(messageFrom)
  ));
};

const presentConversation = (conversation, audience, vehicle, ownerName) => ({
  ...conversation,
  side: audience === 'visitor' ? 'reporter' : 'owner',
  vehicleId: audience === 'visitor' ? (vehicle?.qrToken || '') : conversation.vehicleId,
  reporterSessionId: '',
  messages: conversation.messages.map((message) => ({
    ...message,
    senderName: audience === 'visitor'
      ? (message.senderRole === 'owner' ? 'Owner' : 'Reporter')
      : (message.senderRole === 'owner' ? ownerName || 'Owner' : 'Anonymous Reporter')
  }))
});

const unifyChats = async (rows) => {
  const groups = new Map();
  for (const row of rows || []) {
    const key = String(row.vehicle_id || row.id);
    const list = groups.get(key) || [];
    list.push(row);
    groups.set(key, list);
  }
  const remove = new Set();
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    const ids = list.map((row) => row.id);
    const messages = must(await supabase().from('messages').select('id,conversation_id,body,timestamp,created_at').in('conversation_id', ids).order('created_at', { ascending: true })) || [];
    const newest = messages[messages.length - 1];
    const keeper = list.find((row) => row.id === newest?.conversation_id) || list[0];
    for (const extra of list) {
      if (extra.id === keeper.id) continue;
      must(await supabase().from('messages').update({ conversation_id: keeper.id }).eq('conversation_id', extra.id));
      remove.add(extra.id);
    }
    const plain = photoMarker(String(newest?.body || keeper.last_message || '')).text;
    const unread = list.reduce((sum, row) => sum + Number(row.unread_count || 0), 0);
    must(await supabase().from('conversations').update({
      last_message: plain || keeper.last_message,
      last_message_time: newest?.timestamp || keeper.last_message_time,
      unread_count: unread,
      status: 'open'
    }).eq('id', keeper.id));
    keeper.last_message = plain || keeper.last_message;
    keeper.last_message_time = newest?.timestamp || keeper.last_message_time;
    keeper.unread_count = unread;
    keeper.status = 'open';
  }
  if (remove.size) must(await supabase().from('conversations').delete().in('id', [...remove]));
  return (rows || []).filter((row) => !remove.has(row.id));
};

const decorate = async (conversations, audience) => {
  const vehicleIds = [...new Set(conversations.map((item) => item.vehicleId))];
  const vehicleRows = vehicleIds.length
    ? must(await supabase().from('vehicles').select('*').in('id', vehicleIds))
    : [];
  const vehicles = vehicleRows.map(vehicleFrom);
  const ownerIds = [...new Set(vehicles.map((item) => item.ownerId))];
  const ownerRows = ownerIds.length
    ? must(await supabase().from('accounts').select('id,name').in('id', ownerIds))
    : [];
  return conversations.map((conversation) => {
    const vehicle = vehicles.find((item) => item.id === conversation.vehicleId);
    const owner = ownerRows.find((item) => item.id === vehicle?.ownerId);
    return presentConversation(conversation, audience, vehicle, owner?.name);
  });
};

const countFor = async (ownerId) => {
  const result = await supabase().from('vehicles').select('id', { count: 'exact', head: true }).eq('owner_id', ownerId);
  if (result.error) throw result.error;
  return result.count || 0;
};

let linkedPhotos = false;

const linkReportPhotos = async () => {
  if (linkedPhotos) return;
  linkedPhotos = true;
  const photos = await supabase().from('report_photos').select('report_id');
  if (photos.error || !photos.data?.length) return;
  for (const photo of photos.data) {
    const marker = `[[photo:${photo.report_id}]]`;
    const report = await supabase().from('reports').select('id,vehicle_id,reporter_session_id,created_at').eq('id', photo.report_id).maybeSingle();
    if (report.error || !report.data) continue;
    const chats = await supabase().from('conversations').select('id').eq('vehicle_id', report.data.vehicle_id).eq('reporter_session_id', report.data.reporter_session_id);
    const ids = (chats.data || []).map((row) => row.id);
    if (!ids.length) continue;
    const messages = await supabase().from('messages').select('id,body,created_at').in('conversation_id', ids).eq('sender_role', 'reporter').order('created_at', { ascending: true });
    const rows = messages.data || [];
    if (rows.some((row) => String(row.body).includes(marker))) continue;
    const reportTime = new Date(report.data.created_at).getTime();
    const target = rows
      .filter((row) => !String(row.body).includes('[[photo:'))
      .sort((a, b) => Math.abs(new Date(a.created_at).getTime() - reportTime) - Math.abs(new Date(b.created_at).getTime() - reportTime))[0];
    if (!target) continue;
    await supabase().from('messages').update({ body: `${target.body}\n${marker}` }).eq('id', target.id);
  }
};

export const workspaceFor = async (account, visitId) => {
  await linkReportPhotos();
  if (!account) {
    const rows = visitId
      ? await unifyChats(must(await supabase().from('conversations').select('*').eq('reporter_session_id', visitId)))
      : [];
    return {
      user: null,
      vehicles: [],
      reports: [],
      conversations: await decorate(await withMessages(rows), 'visitor'),
      notifications: [],
      activities: [],
      users: []
    };
  }

  if (account.role === 'admin') {
    const [vehicles, reports, conversationRows, notifications, activities, users] = await Promise.all([
      supabase().from('vehicles').select('*'),
      supabase().from('reports').select('*'),
      supabase().from('conversations').select('*'),
      supabase().from('notifications').select('*').order('created_at', { ascending: false }),
      supabase().from('activities').select('*'),
      supabase().from('accounts').select('*')
    ]);
    const accountRows = must(users);
    const vehicleRows = must(vehicles).map(vehicleFrom);
    return {
      user: publicUser(account, vehicleRows.filter((item) => item.ownerId === account.id).length),
      vehicles: vehicleRows,
      reports: must(reports).map(reportFrom),
      conversations: await decorate(await withMessages(await unifyChats(must(conversationRows))), 'owner'),
      notifications: must(notifications).map(notificationFrom),
      activities: must(activities).map(activityFrom),
      users: accountRows.map((row) => publicUser(
        accountFrom(row),
        vehicleRows.filter((item) => item.ownerId === row.id).length
      )),
      mailReady: Boolean(String(process.env.SMTP_USER || '').trim() && String(process.env.SMTP_PASS || '').trim()),
      visitors: await visitorSummary()
    };
  }

  const vehicleRows = must(await supabase().from('vehicles').select('*').eq('owner_id', account.id)).map(vehicleFrom);
  const ids = vehicleRows.map((item) => item.id);
  const [reports, ownedConversationRows, notifications, activities, visitConversationRows] = await Promise.all([
    ids.length ? supabase().from('reports').select('*').in('vehicle_id', ids) : Promise.resolve({ data: [] }),
    ids.length ? supabase().from('conversations').select('*').in('vehicle_id', ids) : Promise.resolve({ data: [] }),
    supabase().from('notifications').select('*').eq('user_id', account.id).order('created_at', { ascending: false }),
    ids.length ? supabase().from('activities').select('*').in('vehicle_id', ids) : Promise.resolve({ data: [] }),
    visitId
      ? supabase().from('conversations').select('*').eq('reporter_session_id', visitId)
      : Promise.resolve({ data: [] })
  ]);
  const ownedRows = await unifyChats(must(ownedConversationRows));
  const ownedIds = new Set(ownedRows.map((row) => row.id));
  const reporterRows = await unifyChats(must(visitConversationRows).filter((row) => !ownedIds.has(row.id)));
  const conversations = [
    ...(await decorate(await withMessages(ownedRows), 'owner')),
    ...(await decorate(await withMessages(reporterRows), 'visitor'))
  ];
  return {
    user: publicUser(account, vehicleRows.length),
    vehicles: vehicleRows,
    reports: must(reports).map(reportFrom),
    conversations,
    notifications: must(notifications).map(notificationFrom),
    activities: must(activities).map(activityFrom),
    users: []
  };
};

export const createSession = async (userId, lifetimeMs = 14 * 24 * 60 * 60 * 1000) => {
  const id = randomUUID();
  must(await supabase().from('sessions').insert({
    id,
    user_id: userId,
    expires_at: Date.now() + lifetimeMs
  }));
  return id;
};

export const deleteSession = async (id) => {
  if (!id) return;
  must(await supabase().from('sessions').delete().eq('id', id));
};

export const accountForSession = async (id) => {
  if (!id) return null;
  const session = must(await supabase().from('sessions').select('*').eq('id', id).maybeSingle());
  if (!session || Number(session.expires_at) < Date.now()) return null;
  const account = await accountById(session.user_id);
  return account?.status === 'active' ? account : null;
};

export const VISIT_MS = 365 * 24 * 60 * 60 * 1000;

export const ensureVisit = async (id) => {
  if (id) {
    const existing = must(await supabase().from('visits').select('id, expires_at').eq('id', id).maybeSingle());
    if (existing && Number(existing.expires_at) > Date.now()) return existing.id;
  }
  const created = randomUUID();
  const expiresAt = Date.now() + VISIT_MS;
  const inserted = await supabase().from('visits').insert({
    id: created,
    expires_at: expiresAt,
    created_at: new Date().toISOString()
  });
  if (inserted.error && /created_at/i.test(inserted.error.message || '')) {
    must(await supabase().from('visits').insert({ id: created, expires_at: expiresAt }));
  } else if (inserted.error) {
    throw inserted.error;
  }
  return created;
};

const visitStarted = (row) => {
  if (row.created_at) {
    const time = new Date(row.created_at).getTime();
    if (!Number.isNaN(time)) return time;
  }
  const expires = Number(row.expires_at);
  if (!Number.isFinite(expires)) return 0;
  return expires > Date.now() + 24 * 60 * 60 * 1000 ? expires - VISIT_MS : expires;
};

export const visitorSummary = async () => {
  const withCreated = await supabase().from('visits').select('created_at, expires_at');
  const rows = withCreated.error && /created_at/i.test(withCreated.error.message || '')
    ? must(await supabase().from('visits').select('expires_at'))
    : must(withCreated);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  const weekStart = start.getTime();
  const points = [0, 0, 0, 0, 0, 0, 0];
  let week = 0;
  rows.forEach((row) => {
    const time = visitStarted(row);
    if (time >= weekStart) week += 1;
    const index = Math.floor((time - weekStart) / 86400000);
    if (index >= 0 && index < 7) points[index] += 1;
  });
  return { total: rows.length, week, points };
};

const owns = (account, vehicle) =>
  !!account && !!vehicle && (account.role === 'admin' || (account.role === 'owner' && vehicle.ownerId === account.id));

const insertActivity = async (activity) => {
  must(await supabase().from('activities').insert({
    id: activity.id,
    vehicle_id: activity.vehicleId || null,
    vehicle_name: activity.vehicleName || null,
    type: activity.type,
    title: activity.title,
    subtitle: activity.subtitle,
    time_str: activity.timeStr,
    date_group: activity.dateGroup,
    tag_text: activity.tagText || null,
    tag_type: activity.tagType || null,
    created_at: activity.createdAt
  }));
};

const vehicleLabel = (value, max) =>
  cleanText(value, max).replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '').trim();

export const addVehicle = async (account, input) => {
  if (!account || account.role !== 'owner') return { error: 'forbidden' };
  if (account.status !== 'active') return { error: 'suspended' };
  const source = input || {};
  const plate = vehicleLabel(source.plateNumber, 40);
  const requestedBrand = vehicleLabel(source.brand, 40);
  const brand = requestedBrand === 'Other' ? vehicleLabel(source.customBrand, 40) : requestedBrand;
  const model = vehicleLabel(source.model, 40);
  const color = vehicleLabel(source.color, 30) || 'White';
  const year = Number(source.year);
  if (!brand || brand === 'Other' || (!KNOWN_BRANDS.has(brand) && !LABEL_PATTERN.test(brand))) {
    return { error: 'invalid_brand' };
  }
  if (!model || !LABEL_PATTERN.test(model) || !LABEL_PATTERN.test(color)) return { error: 'invalid_input' };
  if (!Number.isInteger(year) || year < 1990 || year > 2027) return { error: 'invalid_input' };
  if (!PLATE_PATTERN.test(plate)) return { error: 'invalid_plate' };
  const owned = await supabase()
    .from('vehicles')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', account.id);
  if (owned.error) throw owned.error;
  if ((owned.count || 0) >= MAX_VEHICLES_PER_OWNER) return { error: 'vehicle_limit' };
  const existingPlates = await plates();
  if (existingPlates.some((item) => compact(item.plate_number) === compact(plate))) return { error: 'plate_taken' };
  const vehicle = {
    id: `veh_${randomUUID()}`,
    ownerId: account.id,
    ownerName: account.name,
    brand,
    model,
    year,
    color,
    plateNumber: plate,
    qrToken: randomUUID(),
    status: 'active',
    scansCount: 0,
    reportsCount: 0,
    createdAt: new Date().toISOString().slice(0, 10)
  };
  try {
    must(await supabase().from('vehicles').insert({
      id: vehicle.id,
      owner_id: vehicle.ownerId,
      owner_name: vehicle.ownerName,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      plate_number: vehicle.plateNumber,
      qr_token: vehicle.qrToken,
      status: vehicle.status,
      scans_count: 0,
      reports_count: 0,
      created_at: vehicle.createdAt
    }));
  } catch (error) {
    if (error?.code === '23505') return { error: 'plate_taken' };
    throw error;
  }
  await insertActivity({
    id: `act_${randomUUID()}`,
    vehicleId: vehicle.id,
    vehicleName: `${vehicle.brand} ${vehicle.model}`,
    type: 'vehicle_added',
    title: 'New Vehicle Added',
    subtitle: `${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})`,
    timeStr: 'Just now',
    dateGroup: 'today',
    tagText: 'Info',
    tagType: 'info',
    createdAt: new Date().toISOString()
  });
  return { vehicle };
};

export const deleteVehicle = async (account, id) => {
  const vehicle = await vehicleById(id);
  if (!owns(account, vehicle) || account.role !== 'owner') return { error: 'forbidden' };
  must(await supabase().from('vehicles').delete().eq('id', id));
  return { ok: true };
};

export const clearOwnVehicles = async (account) => {
  if (!account || account.role !== 'owner') return { error: 'forbidden' };
  must(await supabase().from('vehicles').delete().eq('owner_id', account.id));
  return { ok: true };
};

export const updateVehicleStatus = async (account, id, status) => {
  const vehicle = await vehicleById(id);
  if (!owns(account, vehicle)) return { error: 'forbidden' };
  if (!['active', 'dnd', 'maintenance', 'inactive'].includes(status)) return { error: 'invalid_input' };
  must(await supabase().from('vehicles').update({ status }).eq('id', id));
  return { ok: true };
};

export const regenerateToken = async (account, id) => {
  const vehicle = await vehicleById(id);
  if (!owns(account, vehicle) || account.role !== 'owner') return { error: 'forbidden' };
  const qrToken = randomUUID();
  must(await supabase().from('vehicles').update({ qr_token: qrToken }).eq('id', id));
  return { qrToken };
};

export const submitReport = async (visitId, input, account) => {
  const vehicle = await findVehicleByPublicCode(input.token);
  if (!vehicle || vehicle.status === 'inactive') return { error: 'not_found' };
  const category = CATEGORIES.has(input.category) ? input.category : 'other';
  const title = cleanText(input.title, 80) || 'Report';
  const description = cleanText(input.description, 500) || title;
  const photo = photoData(input.photo);
  if (photo === null) return { error: 'invalid_input' };
  const reporterName = account?.status === 'active' && account.name
    ? cleanText(account.name, 60)
    : 'زائر';
  const reporterEmail = account?.status === 'active' && String(account.email || '').includes('@')
    ? account.email
    : '';
  const reporterLabel = reporterEmail ? `${reporterName} (${reporterEmail})` : reporterName;
  const carLabel = `${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})`;
  const notice = `${reporterLabel} أرسل بلاغاً عن السيارة ${carLabel}: ${title}`;
  const now = new Date();
  const reportId = `rep_${randomUUID()}`;
  const stamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  must(await supabase().from('reports').insert({
    id: reportId,
    vehicle_id: vehicle.id,
    vehicle_name: `${vehicle.brand} ${vehicle.model} (${vehicle.year} • ${vehicle.color})`,
    vehicle_plate: vehicle.plateNumber,
    category,
    title,
    description,
    has_location: false,
    status: 'new',
    reporter_name: reporterLabel,
    reporter_session_id: visitId,
    created_at: now.toISOString(),
    timestamp: `Today • ${stamp}`
  }));
  if (photo) await savePhoto(reportId, photo, now.toISOString());
  must(await supabase().from('vehicles').update({
    reports_count: vehicle.reportsCount + 1,
    scans_count: vehicle.scansCount + 1
  }).eq('id', vehicle.id));
  must(await supabase().from('notifications').insert({
    id: `notif_${randomUUID()}`,
    user_id: vehicle.ownerId,
    vehicle_id: vehicle.id,
    report_id: reportId,
    type: category === 'lights' ? 'lights_warning' : 'new_report',
    title: `بلاغ عن ${vehicle.plateNumber}`,
    message: notice.slice(0, 300),
    time_ago: 'Just now',
    created_at: now.toISOString(),
    is_read: false,
    severity: category === 'blocking' ? 'urgent' : 'warning'
  }));
  await sendPush(vehicle.ownerId, {
    title: `بلاغ عن ${vehicle.plateNumber}`,
    body: notice.slice(0, 140),
    url: '/',
    tag: `report-${reportId}`
  }).catch((error) => console.error(error));
  await insertActivity({
    id: `act_${randomUUID()}`,
    vehicleId: vehicle.id,
    vehicleName: `${vehicle.brand} ${vehicle.model}`,
    type: category === 'lights' ? 'lights_warning' : 'report_received',
    title: `بلاغ عن ${vehicle.plateNumber}`,
    subtitle: notice.slice(0, 120),
    timeStr: stamp,
    dateGroup: 'today',
    tagText: 'New',
    tagType: 'new',
    createdAt: now.toISOString()
  });
  const storedBody = photo ? `${description}\n[[photo:${reportId}]]` : description;
  const openChats = await unifyChats(must(await supabase().from('conversations').select('*').eq('vehicle_id', vehicle.id)) || []);
  const existing = openChats.find((row) => row.status !== 'closed') || openChats[0];
  const conversationId = existing?.id || `conv_${randomUUID()}`;
  const unreadCount = existing ? Number(existing.unread_count || 0) + 1 : 1;
  if (existing) {
    must(await supabase().from('conversations').update({
      report_id: reportId,
      last_message: description,
      last_message_time: stamp,
      unread_count: unreadCount,
      status: 'open'
    }).eq('id', conversationId));
  } else {
    must(await supabase().from('conversations').insert({
      id: conversationId,
      report_id: reportId,
      vehicle_id: vehicle.id,
      vehicle_name: `${vehicle.brand} ${vehicle.model}`,
      vehicle_plate: vehicle.plateNumber,
      last_message: description,
      last_message_time: stamp,
      unread_count: unreadCount,
      reporter_session_id: visitId,
      status: 'open'
    }));
  }
  must(await supabase().from('messages').insert({
    id: `msg_${randomUUID()}`,
    conversation_id: conversationId,
    sender_role: 'reporter',
    sender_name: reporterName,
    body: storedBody,
    timestamp: stamp,
    created_at: now.toISOString(),
    is_read: false
  }));
  const messageRows = must(await supabase().from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true })) || [];
  const conversation = conversationFrom({
    id: conversationId,
    report_id: reportId,
    vehicle_id: vehicle.id,
    vehicle_name: `${vehicle.brand} ${vehicle.model}`,
    vehicle_plate: vehicle.plateNumber,
    last_message: description,
    last_message_time: stamp,
    unread_count: unreadCount,
    reporter_session_id: visitId,
    status: 'open'
  }, messageRows.map(messageFrom));
  try {
    const owner = must(await supabase().from('accounts').select('name,email').eq('id', vehicle.ownerId).maybeSingle());
    if (owner?.email) {
      await sendReportEmail({
        to: owner.email,
        ownerName: owner.name,
        reporterLabel: reporterName,
        vehicle,
        title,
        description
      });
    }
  } catch (error) {
    console.error('report email failed', error?.message || error);
  }
  return { conversation: presentConversation(conversation, 'visitor', vehicle, '') };
};

export const sendMessage = async ({ account, visitId, conversationId, text, senderRole }) => {
  const row = must(await supabase().from('conversations').select('*').eq('id', conversationId).maybeSingle());
  if (!row) return { error: 'not_found' };
  const conversation = conversationFrom(row, []);
  const vehicle = await vehicleById(conversation.vehicleId);
  const body = cleanText(text, 500);
  if (!body) return { error: 'invalid_input' };
  const asOwner = senderRole === 'owner' || owns(account, vehicle);
  if (asOwner && !owns(account, vehicle)) return { error: 'forbidden' };
  if (!asOwner) {
    const reported = visitId
      ? must(await supabase().from('reports').select('id').eq('vehicle_id', conversation.vehicleId).eq('reporter_session_id', visitId).limit(1)) || []
      : [];
    if (conversation.reporterSessionId !== visitId && !reported.length) return { error: 'forbidden' };
  }
  const now = new Date();
  const stamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  must(await supabase().from('messages').insert({
    id: `msg_${randomUUID()}`,
    conversation_id: conversationId,
    sender_role: asOwner ? 'owner' : 'reporter',
    sender_name: asOwner ? account.name : 'Reporter',
    body,
    timestamp: stamp,
    created_at: now.toISOString(),
    is_read: false
  }));
  must(await supabase().from('conversations').update({
    last_message: body,
    last_message_time: stamp,
    ...(!asOwner ? { unread_count: Number(conversation.unreadCount || 0) + 1 } : {})
  }).eq('id', conversationId));
  if (!asOwner && vehicle) {
    must(await supabase().from('notifications').insert({
      id: `notif_${randomUUID()}`,
      user_id: vehicle.ownerId,
      vehicle_id: vehicle.id,
      type: 'chat_message',
      title: 'New message from reporter',
      message: body,
      time_ago: 'Just now',
      created_at: now.toISOString(),
      is_read: false,
      severity: 'info'
    }));
    await sendPush(vehicle.ownerId, {
      title: `رسالة عن ${vehicle.plateNumber}`,
      body: body.slice(0, 140),
      url: '/',
      tag: `chat-${conversationId}`
    }).catch((error) => console.error(error));
  }
  return { ok: true };
};

export const updateReportStatus = async (account, reportId, status) => {
  const row = must(await supabase().from('reports').select('*').eq('id', reportId).maybeSingle());
  const report = row ? reportFrom(row) : null;
  const vehicle = report ? await vehicleById(report.vehicleId) : null;
  if (!report || !owns(account, vehicle)) return { error: 'forbidden' };
  if (!['new', 'in_progress', 'resolved'].includes(status)) return { error: 'invalid_input' };
  must(await supabase().from('reports').update({ status }).eq('id', reportId));
  if (status === 'resolved') {
    await insertActivity({
      id: `act_${randomUUID()}`,
      vehicleId: vehicle.id,
      vehicleName: report.vehicleName,
      type: 'report_resolved',
      title: 'Report Resolved',
      subtitle: `${report.title} - ${report.vehiclePlate}`,
      timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateGroup: 'today',
      tagText: 'Resolved',
      tagType: 'resolved',
      createdAt: new Date().toISOString()
    });
  }
  return { ok: true };
};

export const updateProfile = async (account, input) => {
  const name = cleanText(input.name, 80);
  const email = cleanText(input.email, 120).toLowerCase();
  if (!name || !email || !email.includes('@')) return { error: 'invalid_input' };
  if (account.role === 'admin' && email !== adminEmail()) return { error: 'reserved_email' };
  if (account.role !== 'admin' && adminEmail() && email === adminEmail()) return { error: 'reserved_email' };
  const taken = await accountByEmail(email);
  if (taken && taken.id !== account.id) return { error: 'email_taken' };
  must(await supabase().from('accounts').update({ name, email }).eq('id', account.id));
  must(await supabase().from('vehicles').update({ owner_name: name }).eq('owner_id', account.id));
  return { ok: true };
};

export const toggleUserStatus = async (admin, userId) => {
  if (!admin || admin.role !== 'admin') return { error: 'forbidden' };
  const target = await accountById(userId);
  if (!target || target.role === 'admin' || target.id === admin.id) return { error: 'forbidden' };
  const status = target.status === 'active' ? 'inactive' : 'active';
  must(await supabase().from('accounts').update({ status }).eq('id', userId));
  return { ok: true };
};

const insertAccount = async (account) => {
  must(await supabase().from('accounts').insert({
    id: account.id,
    name: account.name,
    email: account.email,
    password_hash: account.passwordHash,
    phone: account.phone || null,
    role: account.role,
    status: account.status,
    avatar: account.avatar || '',
    created_at: account.createdAt
  }));
};

export const registerAccount = async ({ name, email, password, phone }) => {
  const cleanEmail = cleanText(email, 120).toLowerCase();
  const cleanName = cleanText(name, 80);
  if (!cleanName) return { error: 'invalid_input' };
  if (!cleanEmail || !cleanEmail.includes('@')) return { error: 'invalid_email' };
  if (String(password || '').length < 6) return { error: 'short_password' };
  const cleanPhone = cleanText(phone, 20);
  if (!cleanPhone) return { error: 'invalid_phone' };
  if (adminEmail() && cleanEmail === adminEmail()) return { error: 'reserved_email' };
  if (await accountByEmail(cleanEmail)) return { error: 'email_taken' };
  const account = {
    id: `usr_${randomUUID()}`,
    name: cleanName,
    email: cleanEmail,
    passwordHash: hashPassword(password),
    phone: cleanPhone,
    role: 'owner',
    status: 'active',
    createdAt: new Date().toISOString().slice(0, 10),
    avatar: ''
  };
  await insertAccount(account);
  try {
    await insertActivity({
      id: `act_${randomUUID()}`,
      type: 'account_registered',
      title: 'تسجيل حساب جديد',
      subtitle: cleanName,
      timeStr: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      dateGroup: 'today',
      tagText: 'New',
      tagType: 'info',
      createdAt: new Date().toISOString()
    });
  } catch {
    // The account is already saved. A missing activity row should not undo registration.
  }
  return { account };
};

export const recordFailedLogin = async (kind) => {
  const subtitle = kind === 'admin' ? 'دخول الإدارة' : kind === 'suspended' ? 'حساب موقوف' : 'دخول الحساب';
  try {
    await insertActivity({
      id: `act_${randomUUID()}`,
      type: 'login_failed',
      title: 'محاولة دخول فاشلة',
      subtitle,
      timeStr: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      dateGroup: 'today',
      tagText: 'Failed',
      tagType: 'warning',
      createdAt: new Date().toISOString()
    });
  } catch {
    // The login response matters more than the audit row.
  }
};

export const loginAccount = async (email, password) => {
  const account = await accountByEmail(cleanText(email, 120).toLowerCase());
  if (!account || !verifyPassword(password, account.passwordHash)) return { error: 'invalid_credentials' };
  if (account.status !== 'active') return { error: 'suspended' };
  return { account };
};

export const loginAdmin = async (password) => {
  const email = adminEmail();
  const admin = email ? await accountByEmail(email) : null;
  const accepted = !!admin && admin.role === 'admin' && admin.status === 'active' && verifyPassword(String(password || ''), admin.passwordHash);
  if (!accepted) {
    await recordFailedLogin('admin');
    return { error: 'invalid_credentials' };
  }
  return { account: admin };
};

export const loginGoogleAccount = async ({ email, name }) => {
  const cleanEmail = cleanText(email, 120).toLowerCase();
  if (!cleanEmail || (adminEmail() && cleanEmail === adminEmail())) return { error: 'admin_google' };
  const existing = await accountByEmail(cleanEmail);
  if (existing) {
    if (existing.status !== 'active') return { error: 'suspended' };
    if (existing.role === 'admin') return { error: 'admin_google' };
    return { account: existing };
  }
  const account = {
    id: `usr_${randomUUID()}`,
    name: cleanText(name, 80) || cleanEmail.split('@')[0],
    email: cleanEmail,
    passwordHash: hashPassword(randomUUID()),
    role: 'owner',
    status: 'active',
    createdAt: new Date().toISOString().slice(0, 10),
    avatar: ''
  };
  await insertAccount(account);
  return { account };
};

export const markOwnerConversationsRead = async (account, conversationId) => {
  if (!account || account.role === 'admin') return { error: 'forbidden' };
  const vehicles = must(await supabase().from('vehicles').select('id').eq('owner_id', account.id)) || [];
  const vehicleIds = vehicles.map((row) => row.id);
  if (!vehicleIds.length) return { ok: true };
  const conversations = must(await supabase().from('conversations').select('id').in('vehicle_id', vehicleIds)) || [];
  let ids = conversations.map((row) => row.id);
  if (conversationId) {
    if (!ids.includes(conversationId)) return { error: 'forbidden' };
    ids = [conversationId];
  }
  if (!ids.length) return { ok: true };
  must(await supabase().from('conversations').update({ unread_count: 0 }).in('id', ids));
  must(await supabase().from('messages').update({ is_read: true }).in('conversation_id', ids));
  return { ok: true };
};

export const markNotification = async (account, id) => {
  const row = must(await supabase().from('notifications').select('*').eq('id', id).maybeSingle());
  if (!row) return { error: 'not_found' };
  const item = notificationFrom(row);
  if (account.role !== 'admin' && item.userId !== account.id) return { error: 'forbidden' };
  must(await supabase().from('notifications').update({ is_read: true }).eq('id', id));
  return { ok: true };
};

export const markAllNotifications = async (account) => {
  const query = supabase().from('notifications').update({ is_read: true });
  must(await (account.role === 'admin' ? query.not('id', 'is', null) : query.eq('user_id', account.id)));
  return { ok: true };
};

const importLocalSnapshot = async () => {
  try {
    const file = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'db.json');
    const local = JSON.parse(readFileSync(file, 'utf8'));
    for (const account of local.accounts || []) {
      if (await accountByEmail(String(account.email || '').toLowerCase())) continue;
      await insertAccount({
        id: account.id,
        name: account.name,
        email: String(account.email).toLowerCase(),
        passwordHash: account.passwordHash,
        phone: account.phone,
        role: account.role === 'admin' ? 'admin' : 'owner',
        status: account.status === 'inactive' ? 'inactive' : 'active',
        createdAt: account.createdAt || '2026-01-01',
        avatar: account.avatar || ''
      });
    }
    for (const vehicle of local.vehicles || []) {
      const owner = await accountById(vehicle.ownerId);
      if (!owner) continue;
      const exists = await vehicleById(vehicle.id);
      if (exists) continue;
      must(await supabase().from('vehicles').insert({
        id: vehicle.id,
        owner_id: vehicle.ownerId,
        owner_name: vehicle.ownerName || owner.name,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        plate_number: vehicle.plateNumber,
        qr_token: vehicle.qrToken,
        status: vehicle.status || 'active',
        scans_count: vehicle.scansCount || 0,
        reports_count: vehicle.reportsCount || 0,
        created_at: vehicle.createdAt || '2026-01-01'
      }));
    }
  } catch {
    // A missing local file just means this browser starts from the shared database.
  }
};

export const loadDatabase = async () => {
  const email = adminEmail();
  const password = adminPassword();
  if (email && password) {
    const admin = await accountByEmail(email);
    if (!admin) {
      await insertAccount({
        id: `usr_${randomUUID()}`,
        name: 'CAR-SILA Admin',
        email,
        passwordHash: hashPassword(password),
        role: 'admin',
        status: 'active',
        createdAt: '2025-01-01',
        avatar: ''
      });
    } else if (admin.role === 'admin' && !verifyPassword(password, admin.passwordHash)) {
      must(await supabase().from('accounts').update({ password_hash: hashPassword(password) }).eq('id', admin.id));
    }
  }
  await importLocalSnapshot();
};
