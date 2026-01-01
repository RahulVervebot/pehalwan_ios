// App.tsx
import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { Alert, Linking } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import Routes from './app/Navigations/Route';
import store from './app/redux/store';
import {
  OneSignal,
  LogLevel,
  NotificationWillDisplayEvent,
  NotificationClickEvent,
  OSNotification,
} from 'react-native-onesignal';

// this id need to change based on customer account and need more notification just like order.
const ONESIGNAL_APP_ID = 'dd9d5174-4a31-4311-93b4-a5140e8fda5f';

export default class App extends Component {
  private onForeground?: (e: NotificationWillDisplayEvent) => void;
  private onClick?: (e: NotificationClickEvent) => void;
  
  async componentDidMount() {

    // JS init (native initWithContext runs in MainApplication)
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(ONESIGNAL_APP_ID);
    // Ask for permission (Android 13+ / iOS)
    await this.ensureNotificationPermission();
    // Foreground: show OS notif + in-app prompt
    this.onForeground = (event: NotificationWillDisplayEvent) => {
      event.preventDefault();
      const n: OSNotification = event.notification;

      // Post to notification shade
      try { n.display(); } catch {}

      // Always show an in-app prompt while foregrounded
      Alert.alert(
        n.title || 'Update',
        n.body || 'You have a new message',
        [
          { text: 'Ok', onPress: () => this.handleOpenFromData(n.additionalData as any) },
        ],
        { cancelable: true }
      );
    };
  
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', this.onForeground);

    // Taps when app is backgrounded/closed
    this.onClick = (e: NotificationClickEvent) => {
      const data = (e?.notification?.additionalData || {}) as Record<string, any>;
      this.handleOpenFromData(data);
    };
    OneSignal.Notifications.addEventListener('click', this.onClick);
  }

  componentWillUnmount() {
    if (this.onForeground)
      OneSignal.Notifications.removeEventListener('foregroundWillDisplay', this.onForeground);
    if (this.onClick)
      OneSignal.Notifications.removeEventListener('click', this.onClick);
  }

  private ensureNotificationPermission = async () => {
    try {
      const has = await OneSignal.Notifications.hasPermission();
      if (!has) await OneSignal.Notifications.requestPermission(true);
      const nowHas = await OneSignal.Notifications.hasPermission();
      if (!nowHas) {
        Alert.alert(
          'Enable notifications',
          'To receive order updates, please enable notifications in system settings.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
          { cancelable: true }
        );
      }
    } catch {}
  };

  private handleOpenFromData = (data?: Record<string, any>) => {
    if (!data) return;
    const orderId = Number(data.order_id);
    if (orderId) {
      // NavService.navigate('OrderDetail', { orderId });
      console.log('[OS] deep-link to OrderDetail:', orderId);
    }
  };

  render() {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Provider store={store}>
            <Routes />
          </Provider>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }
}