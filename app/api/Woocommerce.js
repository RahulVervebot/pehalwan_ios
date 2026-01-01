// src/api/Woocommerce.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔒 Fallbacks if AsyncStorage is empty
let STORE_URL = 'https://pehalwan.vervebot.io'; // no trailing slash
let CK = 'ck_0ff0112aa5063f0b75688de124f5a47983aa7c8c';
let CS = 'cs_a01f97eb658aa86a677b190495d9b56e60419791';

// Single axios instance for WooCommerce
export const WooCommerce = axios.create();

/**
 * Apply current STORE_URL, CK, CS to axios defaults.
 */
const applyWooConfig = () => {
  const cleanUrl = STORE_URL.replace(/\/+$/, '');
  WooCommerce.defaults.baseURL = `${cleanUrl}/wp-json/wc/v3`;
  WooCommerce.defaults.auth = {
    password: CS,
  };

  console.log('[Woo] baseURL:', WooCommerce.defaults.baseURL);
  console.log('[Woo] auth prefix:', {
    user: CK.slice(0, 6),
    pass: CS.slice(0, 6),
  });
};

/**
 * Load url + keys from AsyncStorage:
 *  - store_url
 *  - woo_username (ck_....)
 *  - woo_password (cs_....)
 *
 * Call this once AFTER you save data from Firebase.
 */
export const initWooCommerceFromStorage = async () => {
  try {
    const entries = await AsyncStorage.multiGet([
      'store_url',
      'woo_username',
      'woo_password',
    ]);

    const map = {};
    entries.forEach(([key, value]) => {
      map[key] = value;
    });

    if (map.store_url && map.store_url.trim().length > 0) {
      STORE_URL = map.store_url.trim();
    }

    // Only override if they look like real REST keys
    if (map.woo_username && map.woo_username.startsWith('ck_')) {
      CK = map.woo_username.trim();
    }
    if (map.woo_password && map.woo_password.startsWith('cs_')) {
      CS = map.woo_password.trim();
    }

    applyWooConfig();
  } catch (e) {
    console.log('[Woo] initWooCommerceFromStorage error:', e);
    // even on error, keep fallbacks
    applyWooConfig();
  }
};

// 🔁 Interceptor: force correct baseURL/auth & strip cookies/auth so login can’t break Woo calls
WooCommerce.interceptors.request.use((config) => {
  // Always enforce our URL + basic auth on every request
  const cleanUrl = STORE_URL.replace(/\/+$/, '');
  config.baseURL = `${cleanUrl}/wp-json/wc/v3`;
  config.auth = {
    username: CK,
    password: CS,
  };

  // Do NOT send WP login cookies / bearer tokens
  config.withCredentials = false;

  if (config.headers) {
    delete config.headers.Authorization;
    delete config.headers.authorization;
    delete config.headers.Cookie;
    delete config.headers.cookie;
  }

  console.log('[Woo REQUEST]', (config.baseURL || '') + config.url, {
    userPrefix: (config.auth.username || '').slice(0, 6),
  });

  return config;
});

// Initialize once with fallback values on app start
applyWooConfig();
