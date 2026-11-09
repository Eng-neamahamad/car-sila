import { api } from '../data/api';

const keyBytes = (value: string) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index);
  return bytes;
};

export const phoneAlertState = () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

export const phoneAlertReady = async () => {
  const status = phoneAlertState();
  if (status !== 'granted') return status;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  return subscription ? 'granted' : 'default';
};

const subscribePhone = async (announce: boolean) => {
  const registration = await navigator.serviceWorker.register('/sw.js');
  const ready = await navigator.serviceWorker.ready;
  const { key } = await api<{ key: string }>('/api/push/key');
  const existing = await ready.pushManager.getSubscription();
  if (existing) await existing.unsubscribe();
  const subscription = await ready.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: keyBytes(key)
  });
  await api('/api/push/subscribe', { ...subscription.toJSON(), announce });
  return registration ? 'granted' as const : 'granted' as const;
};

export const showPhoneNotice = async (title: string, body: string, url = '/', tag = `note-${Date.now()}`) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    await registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag,
      renotify: true,
      requireInteraction: true,
      silent: false,
      data: { url }
    });
    return;
  }
  new Notification(title, { body, requireInteraction: true });
};

export const enablePhoneAlert = async () => {
  if (phoneAlertState() === 'unsupported') return 'unsupported';
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission;
  return subscribePhone(true);
};

export const ensurePhoneAlert = async () => {
  if (phoneAlertState() !== 'granted') return phoneAlertState();
  return subscribePhone(false);
};
