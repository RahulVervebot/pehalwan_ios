// Normalizes the import for both CJS/ESM builds of OneSignal
import * as OneSignalNS from 'react-native-onesignal';

// Prefer default if present, else the namespace object
const OS: any = (OneSignalNS as any)?.default ?? (OneSignalNS as any);

export const ONESIGNAL_APP_ID = 'dd9d5174-4a31-4311-93b4-a5140e8fda5f';

function dbg(label: string, val: any) {
  try {
    // keep logs compact
    console.log(`[OneSignalCompat] ${label}:`, val);
  } catch {}
}

export function initOneSignal() {
  dbg('keys', Object.keys(OS || {}));
  dbg('has initialize', !!OS?.initialize);
  dbg('has setAppId', !!OS?.setAppId);
  dbg('has Notifications', !!OS?.Notifications);
  dbg('has setNotificationOpenedHandler', !!OS?.setNotificationOpenedHandler);

  // v5
  if (OS?.initialize) {
    try {
      OS.Debug?.setLogLevel?.(6);
    } catch {}
    OS.initialize(ONESIGNAL_APP_ID);
    OS.Notifications?.requestPermission?.(true);

    OS.Notifications?.addEventListener?.('foregroundWillDisplay', (event: any) => {
      const n = event.notification;
      event.preventDefault?.();
      OS.Notifications?.display?.(n);
    });

    OS.Notifications?.addEventListener?.('click', (event: any) => {
      const data = event?.notification?.additionalData;
      // TODO: deep-link with data?.order_id
    });

    return;
  }

  // v4
  if (OS?.setAppId) {
    OS.setAppId(ONESIGNAL_APP_ID);
    OS.promptForPushNotificationsWithUserResponse?.();

    OS.setNotificationWillShowInForegroundHandler?.((event: any) => {
      const notif = event.getNotification?.() ?? event.notification;
      event.complete?.(notif);
    });

    OS.setNotificationOpenedHandler?.((opened: any) => {
      const data = opened?.notification?.additionalData;
      // TODO: deep-link with data?.order_id
    });

    return;
  }

  console.warn('OneSignal SDK not detected (neither v4 nor v5). Check package version & rebuild.');
}

export function mapDeviceToUser(userId: string | number) {
  const uid = String(userId);

  // v5
  if (OS?.login) {
    OS.login(uid);
    dbg('login() called with', uid);
    return;
  }

  // v4
  if (OS?.setExternalUserId) {
    OS.setExternalUserId(uid);
    dbg('setExternalUserId() called with', uid);
    return;
  }

  console.warn('OneSignal: no login/external user method found (v4/v5).');
}

export function unmapDevice() {
  if (OS?.logout) {
    OS.logout();
    dbg('logout() called', true);
    return;
  }
  if (OS?.removeExternalUserId) {
    OS.removeExternalUserId();
    dbg('removeExternalUserId() called', true);
    return;
  }
  console.warn('OneSignal: no logout/removeExternalUserId found.');
}
