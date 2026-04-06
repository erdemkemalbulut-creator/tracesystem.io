import { supabase } from '../lib/supabase';

/**
 * Request notification permission and subscribe to push notifications.
 * Returns true if successfully subscribed.
 */
export async function requestNotificationPermission(userId: string): Promise<boolean> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if VAPID public key is configured
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.warn('VAPID public key not configured — push notifications disabled');
      return false;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
    });

    // Store subscription in Supabase
    await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        subscription: subscription.toJSON(),
      },
      { onConflict: 'user_id' }
    );

    return true;
  } catch (err) {
    console.error('Push subscription failed:', err);
    return false;
  }
}

/**
 * Check if notifications are currently enabled for this user.
 */
export async function getNotificationSettings(userId: string) {
  const { data } = await supabase
    .from('push_subscriptions')
    .select('reminders_enabled, streak_alerts_enabled, reminder_time')
    .eq('user_id', userId)
    .maybeSingle();

  return data;
}

/**
 * Update notification preferences.
 */
export async function updateNotificationSettings(
  userId: string,
  settings: {
    reminders_enabled?: boolean;
    streak_alerts_enabled?: boolean;
    reminder_time?: string;
  }
) {
  await supabase
    .from('push_subscriptions')
    .update(settings)
    .eq('user_id', userId);
}

/**
 * Check if push notifications are supported and permission is granted.
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export function isNotificationGranted(): boolean {
  return isNotificationSupported() && Notification.permission === 'granted';
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
