import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { sendCallAlert } from './push.js';

const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'safety.json');
const RING_MS = 90 * 1000;
const LIVE_MS = 20 * 60 * 1000;

const load = () => {
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    return {
      returns: data.returns && typeof data.returns === 'object' ? data.returns : {},
      photos: data.photos && typeof data.photos === 'object' ? data.photos : {},
      calls: data.calls && typeof data.calls === 'object' ? data.calls : {}
    };
  } catch {
    return { returns: {}, photos: {}, calls: {} };
  }
};

let disk = load();
let chain = Promise.resolve();
let mode = 'unknown';
let client;
let announced = false;

const supabase = () => {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase is not configured');
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
};

const missing = (error) => ['PGRST205', 'PGRST204', '42703', 'PGRST202'].includes(error?.code);

const locked = (fn) => {
  const run = chain.then(fn, fn);
  chain = run.then(() => undefined, () => undefined);
  return run;
};

const persist = () => {
  try {
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify(disk));
  } catch (error) {
    console.error(error);
  }
};

const future = (value) => {
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) && time > Date.now() ? new Date(time).toISOString() : '';
};

const detect = async () => {
  if (mode !== 'unknown') return mode;
  const [calls, photos, vehicles] = await Promise.all([
    supabase().from('calls').select('id').limit(1),
    supabase().from('report_photos').select('report_id').limit(1),
    supabase().from('vehicles').select('return_at').limit(1)
  ]);
  mode = !calls.error && !photos.error && !vehicles.error ? 'db' : 'file';
  if (mode === 'file' && !announced) {
    announced = true;
    console.log('CAR-SILA safety features are stored locally until server/safety.sql is run in Supabase.');
  }
  return mode;
};

const callFromRow = (row) => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  ownerId: row.owner_id,
  visitId: row.visit_id,
  status: row.status,
  offer: row.offer || '',
  answer: row.answer || '',
  visitorIce: parseList(row.visitor_ice),
  ownerIce: parseList(row.owner_ice),
  plate: row.plate,
  car: row.car,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const parseList = (value) => {
  try {
    const data = JSON.parse(value || '[]');
    return Array.isArray(data) ? data.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const expire = (call) => {
  const created = new Date(call.createdAt).getTime();
  const updated = new Date(call.updatedAt || call.createdAt).getTime();
  if (call.status === 'ringing' && Date.now() - created > RING_MS) call.status = 'missed';
  if (call.status === 'active' && Date.now() - updated > LIVE_MS) call.status = 'ended';
  return call;
};

const present = (call, side) => ({
  id: call.id,
  status: call.status,
  plate: call.plate,
  car: call.car,
  createdAt: call.createdAt,
  offer: side === 'owner' ? call.offer : undefined,
  answer: side === 'visitor' ? call.answer : undefined,
  ice: side === 'owner' ? call.visitorIce : call.ownerIce
});

const saveCall = async (call) => {
  if (await detect() === 'db') {
    const row = {
      id: call.id,
      vehicle_id: call.vehicleId,
      owner_id: call.ownerId,
      visit_id: call.visitId,
      status: call.status,
      offer: call.offer,
      answer: call.answer,
      visitor_ice: JSON.stringify(call.visitorIce),
      owner_ice: JSON.stringify(call.ownerIce),
      plate: call.plate,
      car: call.car,
      created_at: call.createdAt,
      updated_at: call.updatedAt
    };
    const saved = await supabase().from('calls').upsert(row);
    if (!saved.error) return;
    if (!missing(saved.error)) throw saved.error;
    mode = 'file';
  }
  disk.calls[call.id] = call;
  persist();
};

const readCall = async (id) => {
  if (await detect() === 'db') {
    const row = await supabase().from('calls').select('*').eq('id', id).maybeSingle();
    if (row.error) {
      if (!missing(row.error)) throw row.error;
      mode = 'file';
    } else if (row.data) return expire(callFromRow(row.data));
  }
  const call = disk.calls[id];
  return call ? expire(call) : null;
};

const offerOk = (value) => {
  const text = String(value || '');
  return text.startsWith('v=0') && text.length >= 20 && text.length <= 20000;
};

const candidateOk = (value) => {
  const text = String(value || '');
  if (!text || text.length > 2000) return false;
  try {
    const data = JSON.parse(text);
    return typeof data.candidate === 'string' && data.candidate.length < 1500;
  } catch {
    return false;
  }
};

const pushIce = (list, candidate) => {
  if (!candidateOk(candidate) || list.includes(candidate) || list.length >= 40) return list;
  return [...list, candidate];
};

export const cachedReturn = (id) => future(disk.returns[id]);

export const saveReturn = (id, returnAt) => locked(async () => {
  const stamp = future(returnAt);
  if (await detect() === 'db') {
    const updated = await supabase().from('vehicles').update({ return_at: stamp || null }).eq('id', id);
    if (!updated.error) {
      delete disk.returns[id];
      persist();
      return stamp;
    }
    if (!missing(updated.error)) throw updated.error;
    mode = 'file';
  }
  if (stamp) disk.returns[id] = stamp;
  else delete disk.returns[id];
  persist();
  return stamp;
});

export const savePhoto = (id, photo, capturedAt) => locked(async () => {
  if (await detect() === 'db') {
    const saved = await supabase().from('report_photos').upsert({
      report_id: id,
      photo,
      captured_at: capturedAt
    });
    if (!saved.error) return;
    if (!missing(saved.error)) throw saved.error;
    mode = 'file';
  }
  disk.photos[id] = { photo, capturedAt };
  persist();
});

export const readPhoto = (id) => locked(async () => {
  if (await detect() === 'db') {
    const row = await supabase().from('report_photos').select('photo,captured_at').eq('report_id', id).maybeSingle();
    if (row.error) {
      if (!missing(row.error)) throw row.error;
      mode = 'file';
    } else if (row.data?.photo) {
      return { photo: row.data.photo, capturedAt: row.data.captured_at };
    }
  }
  const saved = disk.photos[id];
  return saved?.photo ? saved : null;
});

const notifyCall = async (call) => {
  const note = await supabase().from('notifications').insert({
    id: `notif_${randomUUID()}`,
    user_id: call.ownerId,
    vehicle_id: call.vehicleId,
    report_id: null,
    type: 'voice_call',
    title: 'اتصال صوتي طارئ',
    message: `شخص بجانب السيارة ${call.plate} يطلب التحدث معك. لن يظهر رقم هاتف أي طرف.`,
    time_ago: 'Just now',
    created_at: call.createdAt,
    is_read: false,
    severity: 'urgent'
  });
  if (note.error) console.error(note.error);
  await sendCallAlert(call.ownerId, {
    title: 'اتصال صوتي طارئ',
    body: `${call.car} • ${call.plate}. شخص بجانب السيارة يطلب التحدث معك.`
  }).catch((error) => console.error(error));
};

export const startCall = ({ vehicle, visitId, offer }) => locked(async () => {
  if (!offerOk(offer)) return { error: 'invalid_input' };
  const existing = Object.values(await callsForVehicle(vehicle.id)).map(expire);
  for (const call of existing) {
    if (call.status !== 'ringing' && call.status !== 'active') await saveCall(call);
  }
  const same = existing.find((call) => call.visitId === visitId && call.status === 'ringing');
  if (same) {
    same.offer = String(offer);
    same.answer = '';
    same.visitorIce = [];
    same.ownerIce = [];
    same.updatedAt = new Date().toISOString();
    await saveCall(same);
    return { call: present(same, 'visitor') };
  }
  if (existing.some((call) => call.status === 'ringing' || call.status === 'active')) return { error: 'call_busy' };
  const now = new Date().toISOString();
  const call = {
    id: `call_${randomUUID()}`,
    vehicleId: vehicle.id,
    ownerId: vehicle.ownerId,
    visitId,
    status: 'ringing',
    offer: String(offer),
    answer: '',
    visitorIce: [],
    ownerIce: [],
    plate: vehicle.plateNumber,
    car: `${vehicle.brand} ${vehicle.model}`,
    createdAt: now,
    updatedAt: now
  };
  await saveCall(call);
  await notifyCall(call);
  return { call: present(call, 'visitor') };
});

const callsForVehicle = async (vehicleId) => {
  if (await detect() === 'db') {
    const rows = await supabase().from('calls').select('*').eq('vehicle_id', vehicleId).in('status', ['ringing', 'active']);
    if (rows.error) {
      if (!missing(rows.error)) throw rows.error;
      mode = 'file';
    } else {
      return Object.fromEntries((rows.data || []).map((row) => {
        const call = callFromRow(row);
        return [call.id, call];
      }));
    }
  }
  return Object.fromEntries(Object.values(disk.calls).filter((call) => call.vehicleId === vehicleId).map((call) => [call.id, call]));
};

export const visitorCall = (id, visitId) => locked(async () => {
  const call = await readCall(id);
  if (!call || call.visitId !== visitId) return { error: 'forbidden' };
  if (call.status === 'missed' || call.status === 'ended') await saveCall(call);
  return { call: present(call, 'visitor') };
});

export const visitorIce = (id, visitId, candidate) => locked(async () => {
  const call = await readCall(id);
  if (!call || call.visitId !== visitId) return { error: 'forbidden' };
  if (call.status !== 'ringing' && call.status !== 'active') return { error: 'ended' };
  call.visitorIce = pushIce(call.visitorIce, candidate);
  call.updatedAt = new Date().toISOString();
  await saveCall(call);
  return { call: present(call, 'visitor') };
});

export const visitorHangup = (id, visitId) => locked(async () => {
  const call = await readCall(id);
  if (!call || call.visitId !== visitId) return { error: 'forbidden' };
  if (call.status === 'ringing' || call.status === 'active') {
    call.status = 'ended';
    call.updatedAt = new Date().toISOString();
    await saveCall(call);
  }
  return { call: present(call, 'visitor') };
});

export const ownerCall = (id, ownerId) => locked(async () => {
  const call = await readCall(id);
  if (!call || call.ownerId !== ownerId) return { error: 'forbidden' };
  if (call.status === 'missed' || call.status === 'ended' || call.status === 'declined') await saveCall(call);
  return { call: present(call, 'owner') };
});

export const incomingCalls = (ownerId) => locked(async () => {
  let calls = [];
  if (await detect() === 'db') {
    const rows = await supabase().from('calls').select('*').eq('owner_id', ownerId).in('status', ['ringing', 'active']).order('created_at', { ascending: false }).limit(5);
    if (rows.error) {
      if (!missing(rows.error)) throw rows.error;
      mode = 'file';
    } else calls = (rows.data || []).map(callFromRow);
  }
  if (mode === 'file') calls = Object.values(disk.calls).filter((call) => call.ownerId === ownerId);
  const live = [];
  for (const call of calls.map(expire)) {
    if (call.status === 'ringing' || call.status === 'active') live.push(call);
    else await saveCall(call);
  }
  live.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { calls: live.slice(0, 1).map((call) => present(call, 'owner')) };
});

export const ownerSignal = (id, ownerId, { answer, candidate, action }) => locked(async () => {
  const call = await readCall(id);
  if (!call || call.ownerId !== ownerId) return { error: 'forbidden' };
  if (call.status === 'missed' || call.status === 'ended' || call.status === 'declined') {
    await saveCall(call);
    return { error: 'ended' };
  }
  if (action === 'decline' && call.status === 'ringing') call.status = 'declined';
  if (action === 'hangup') call.status = 'ended';
  if (action === 'accept') {
    const text = String(answer || '');
    if (!text.startsWith('v=0') || text.length < 20 || text.length > 20000) return { error: 'invalid_input' };
    call.answer = text;
    call.status = 'active';
  }
  if (candidate) call.ownerIce = pushIce(call.ownerIce, candidate);
  call.updatedAt = new Date().toISOString();
  await saveCall(call);
  return { call: present(call, 'owner') };
});
