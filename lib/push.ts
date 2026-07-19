'use client';

import { api } from './api';

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch {
    return null;
  }
}

/**
 * Register the service worker, request notification permission, and store a
 * push subscription on the server. Returns false if unsupported / denied /
 * server push not configured.
 */
export async function ensurePushSubscription(): Promise<boolean> {
  if (typeof window === 'undefined' || !('PushManager' in window)) return false;
  const { key } = await api.get<{ key: string | null }>('/push/public-key');
  if (!key) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const reg = await getRegistration();
  if (!reg) return false;
  await navigator.serviceWorker.ready;

  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    }));

  const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh: string; auth: string } };
  if (!json.endpoint || !json.keys) return false;
  await api.post('/push/subscribe', { endpoint: json.endpoint, keys: json.keys });
  return true;
}

export async function removePushSubscription(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await api.del('/push/subscribe', { endpoint: sub.endpoint });
    await sub.unsubscribe();
  }
}
