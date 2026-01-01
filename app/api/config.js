// src/api/config.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback in case AsyncStorage doesn't have config yet
const FALLBACK_STORE_URL = 'https://pehalwan.vervebot.io';

// ✅ live binding; will be updated by loadApiConfig()
export let baseURL = `${FALLBACK_STORE_URL}/wp-json/`;

export const ApiConstants = {
  Woocommerce: {
    path: 'wc/v3',
    // will be overridden from AsyncStorage: woo_username / woo_password
    // username: 'ck_ae16817282538eee710cff8ec7110b991af8061b',
    // password: 'cs_daea5378a41b5667689ea01f248e6c3cc8545a1a',

    //pehalwan app key
      username: 'ck_0ff0112aa5063f0b75688de124f5a47983aa7c8c',
     password: 'cs_a01f97eb658aa86a677b190495d9b56e60419791',
  },
  WpApi: {
    // will be overridden from AsyncStorage: phone_username / phone_password
    username: 'vervebotmail@gmail.com',
    password: 'XJD4 gKdR Jfxx QArr xAli KwGY',
  },
  wishlist: 'yith/wishlist/v1/wishlists',
};

/**
 * Read store_url + credentials from AsyncStorage and
 * update baseURL + ApiConstants in-place.
 *
 * Keys:
 *  - store_url
 *  - woo_username
 *  - woo_password
 *  - phone_username
 *  - phone_password
 */


export const loadApiConfig = async () => {
  try {
    const keys = [
      'store_url',
      'woo_username',
      'woo_password',
      'phone_username',
      'phone_password',
    ];

    const entries = await AsyncStorage.multiGet(keys);
    const map = {};
    entries.forEach(([k, v]) => {
      map[k] = v;
    });

    // baseURL from store_url
    if (map.store_url && map.store_url.trim().length > 0) {
      const clean = map.store_url.trim().replace(/\/+$/, ''); // remove trailing slashes
      baseURL = `${clean}/wp-json/`;
    }

    // WooCommerce credentials
    if (map.woo_username) {
      ApiConstants.Woocommerce.username = map.woo_username;
    }
    if (map.woo_password) {
      ApiConstants.Woocommerce.password = map.woo_password;
    }

    // WP API credentials
    if (map.phone_username) {
      ApiConstants.WpApi.username = map.phone_username;
    }
    if (map.phone_password) {
      ApiConstants.WpApi.password = map.phone_password;
    }

    console.log('[config] baseURL set to:', baseURL);
    console.log('[config] Woo user:', ApiConstants.Woocommerce.username);
    console.log('[config] WP user:', ApiConstants.WpApi.username);
  } catch (e) {
    console.log('[config] loadApiConfig error:', e);
  }
};
