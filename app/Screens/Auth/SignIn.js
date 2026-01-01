// src/screens/Auth/SignIn.jsx
import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme } from '@react-navigation/native';
import axios from 'axios';
import { setUser } from '../../redux/reducer/authReducer';
import Auth from '../../services/Auth';
import { useDispatch } from 'react-redux';
import { Snackbar } from 'react-native-paper';
import { initAddress } from '../../redux/actions/addressActions';
import { baseURL, loadApiConfig } from '../../api/config'; // ⬅️ use baseURL, not getBaseURL
import { dbPromise } from '../../../firebaseConfig';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { OneSignal } from 'react-native-onesignal';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';


const SignIn = (props) => {
  const theme = useTheme();
  const { colors } = theme;
  const dispatch = useDispatch();

  // UI state
  const [isFocused, setisFocused] = useState(false);
  const [isFocused2, setisFocused2] = useState(false);
  const [handlePassword, setHandlePassword] = useState(true);
  const [Loading, setLoading] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackText, setSnackText] = useState('');

  // Config state (from Firebase)
  const [configLoading, setConfigLoading] = useState(true);
  const [webClientId, setWebClientId] = useState(null);
  const [appSecret, setAppSecret] = useState(null);

  // Username/Password
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');

  // Phone OTP
  const [phone, setPhone] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [confirmObj, setConfirmObj] = useState(null);
  const [code, setCode] = useState('');

  const showError = (msg) => {
    setSnackText(String(msg || 'Something went wrong.'));
    setSnackVisible(true);
  };

  async function debugOneSignal() {
    try {
      const ps = OneSignal?.User?.pushSubscription;
      console.log('[OS] pushSubscription keys:', ps ? Object.keys(ps) : 'undefined');

      let externalId;
      try {
        externalId = OneSignal.User.getExternalId
          ? await OneSignal.User.getExternalId()
          : OneSignal.User.externalId;
      } catch (e) {
        externalId = OneSignal?.User?.externalId;
      }
      
      let optedIn;
      if (ps?.getOptedIn) optedIn = await ps.getOptedIn();
      else if (typeof ps?.optedIn !== 'undefined') optedIn = ps.optedIn;
      else if (ps?.state?.optedIn !== undefined) optedIn = ps.state.optedIn;

      let subId;
      if (ps?.getId) subId = await ps.getId();
      else if (ps?.id) subId = ps.id;
      else if (ps?.state?.id) subId = ps.state.id;

      let token;
      if (ps?.getToken) token = await ps.getToken();
      else if (ps?.token) token = ps.token;
      else if (ps?.state?.token) token = ps.state.token;

      console.log('[OS] externalId:', externalId);
      console.log('[OS] optedIn:', optedIn, '| subId:', subId, '| token:', token);
      console.log('[FCM] token:', await messaging().getToken());
    } catch (e) {
      console.log('[OS] debug error:', e);
    }
  }

  const finishLogin = async (payload) => {
    dispatch(setUser(payload));
    await Auth.setAccount(JSON.stringify(payload));

    OneSignal.login(String(payload.id));
    await OneSignal.Notifications.requestPermission(true);
    debugOneSignal();
    console.log('[OS] calling login with Woo user id:', String(payload.id));

    const billing = payload?.billing || {};
    const shipping = payload?.shipping || {};
    const addressData =
      payload?.role === 'customer'
        ? {
            email: billing.email,
            first_name: billing.first_name,
            last_name: billing.last_name,
            address_1: billing.address_1,
            state: billing.state,
            postcode: billing.postcode,
            country: billing.country,
            phone: billing.phone,
            city: billing.city,
          }
        : {
            email: payload.email || billing.email,
            first_name: billing.first_name,
            last_name: billing.last_name,
            address_1: shipping.address_1,
            state: shipping.state,
            postcode: shipping.postcode,
            country: shipping.country,
            phone: billing.phone,
            city: shipping.city,
          };

    dispatch(initAddress(addressData));
    props.navigation.navigate('DrawerNavigation', { screen: 'Profile' });
  };

  // ========= Firebase config (MUST run before any login) =========
  const fetchFirebaseConfig = async () => {
    try {
      setConfigLoading(true);

      const db = await dbPromise;
      const docRef = db.collection('ecommerce_app').doc('vfm');
      const docSnapshot = await docRef.get();

      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        console.log('firebase data:', data);

        const pairs = [];

        if (data.stripe_pk) pairs.push(['stripe_pk', String(data.stripe_pk)]);
        if (data.ONESIGNAL_APP_ID) pairs.push(['ONESIGNAL_APP_ID', String(data.ONESIGNAL_APP_ID)]);
        if (data.google_web_client_id)
          pairs.push(['google_web_client_id', String(data.google_web_client_id)]);
        if (data.mobile_app_secrent)
          pairs.push(['mobile_app_secrent', String(data.mobile_app_secrent)]);
        if (data.store_url) pairs.push(['store_url', String(data.store_url)]);

        // ✅ New: Woo & WP creds -> AsyncStorage
        if (data.woo_username) pairs.push(['woo_username', String(data.woo_username)]);
        if (data.woo_password) pairs.push(['woo_password', String(data.woo_password)]);
        if (data.phone_username) pairs.push(['phone_username', String(data.phone_username)]);
        if (data.phone_password) pairs.push(['phone_password', String(data.phone_password)]);
        if (data.restaurant_id) pairs.push(['restaurant_id', String(data.restaurant_id)]);
        if (pairs.length > 0) {
          await AsyncStorage.multiSet(pairs);
        }

        // Set into local state for SignIn
        setWebClientId(data.google_web_client_id || null);
        setAppSecret(data.mobile_app_secrent || null);

        // Configure Google Sign-In with dynamic web client ID
        if (data.google_web_client_id) {
          GoogleSignin.configure({
            webClientId: data.google_web_client_id,
            offlineAccess: true,
          });
        } else {
          console.warn('google_web_client_id not found in Firebase config');
        }

        // ✅ Update baseURL + ApiConstants from AsyncStorage values
        await loadApiConfig();
 


      } else {
        console.error('Firebase document does not exist');
        showError('App config not found. Please contact support.');
      }
    } catch (error) {
      console.error('Failed to retrieve Firebase data:', error);
      showError('Failed to load app config. Please check your internet and reopen the app.');
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      await fetchFirebaseConfig();
      if (cancelled) return;
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  // ========= Username / Password =========
  const Login = async () => {
    try {
      if (configLoading || !webClientId || !appSecret) {
        showError('App is still initializing. Please wait a moment and try again.');
        return;
      }

      if (!username || !password) {
        showError('Please enter username and password.');
        return;
      }

      setLoading(true);

      // baseURL is already updated by loadApiConfig()
      const url = `${baseURL}wc-mobile/v1/login`;

      const res = await axios.post(url, { username, password });
      const payload = res?.data?.data;
      if (!payload?.id) throw new Error('Invalid response from server.');
      setLoading(false);
      await finishLogin(payload);
    } catch (err) {
      console.log('Login error:', err?.response?.data || err.message);
      setLoading(false);
      const msg = err?.response?.data?.message || 'Invalid username or password.';
      showError(msg);
    }
  };

  // ========= Google Sign-In =========
  const handleGoogleLogin = async () => {
    try{
      if (configLoading) {
        showError('App is still initializing. Please wait and try again.');
        return;
      }
      if (!webClientId) {
        showError('Google client ID not loaded. Please reopen the app.');
        return;
      }

      setLoading(true);

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          await GoogleSignin.signOut();
          await GoogleSignin.revokeAccess();
        }
      } catch {}

      const res = await GoogleSignin.signIn();
      let idToken = res?.idToken;

      if (!idToken) {
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens?.idToken || null;
      }

      if (!idToken) {
        throw new Error(
          'No idToken from Google. Check that google_web_client_id in Firebase is a Web OAuth client and platform configs are correct.'
        );
      }

      const api = `${baseURL}wc-mobile/v1/social-login/google`;
      const server = await axios.post(api, { idToken, aud: webClientId });
      const payload = server?.data?.data;
      if (!payload?.id) throw new Error('Invalid server response.');

      setLoading(false);
      await finishLogin(payload);
    } catch (err) {
      setLoading(false);
      if (err?.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (err?.code === statusCodes.IN_PROGRESS) {
        return showError('Google sign-in is already in progress.');
      }
      if (err?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return showError('Google Play Services not available or outdated.');
      }
      console.log('Google login error:', err?.response?.data || err?.message || err);
      showError(err?.response?.data?.message || 'Google sign-in failed.');
    }
  };

  // ========= Phone OTP =========
  const sendOtp = async () => {
    try {
      if (configLoading || !appSecret) {
        showError('App is still initializing. Please wait and try again.');
        return;
      }

      if (!phone?.startsWith('+')) {
        showError('Include country code, e.g. +91XXXXXXXXXX');
        return;
      }
      setLoading(true);
      const confirmation = await auth().signInWithPhoneNumber(phone);
      setConfirmObj(confirmation);
      setOtpRequested(true);
      setLoading(false);
      setSnackText('OTP sent. Please check your messages.');
      setSnackVisible(true);
    } catch (err) {
      console.log('sendOtp error:', err?.message || err);
      setLoading(false);
      showError('Failed to send OTP. Check the number and try again.');
    }
  };

  const confirmOtp = async () => {
    try {
      if (!confirmObj) return;

      if (configLoading || !appSecret) {
        showError('App is still initializing. Please wait and try again.');
        return;
      }

      setLoading(true);
      const credUser = await confirmObj.confirm(code);
      const phoneNumber = credUser?.user?.phoneNumber || phone;
      if (!phoneNumber) throw new Error('No phone number found after OTP confirm');

      const url = `${baseURL}wc-mobile/v1/social-login/phone`;

      const res = await axios.post(url, {
        phone: phoneNumber,
        appSecret: appSecret,
      });

      const payload = res?.data?.data;
      if (!payload?.id) throw new Error('Invalid server response.');
      setLoading(false);
      await finishLogin(payload);
    } catch (err) {
      console.log('confirmOtp error (server):', err?.response?.data || err.message);
      setLoading(false);
      showError(err?.response?.data?.message || 'Invalid OTP / phone auth failed.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {(Loading || configLoading) && (
        <View
          style={{
            position: 'absolute',
            zIndex: 1,
            height: '100%',
            width: '100%',
            backgroundColor: 'rgba(0,0,0,.3)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color={COLORS.white} size={'large'} />
        </View>
      )}

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ ...GlobalStyleSheet.container, flex: 1, backgroundColor: colors.background }}>
          {/* Header */}
          <View style={{ marginBottom: 30, alignItems: 'center', marginTop: 30 }}>
            <Image
              style={{ height: 40, width: 160, resizeMode: 'contain', marginBottom: 20 }}
              source={theme.dark ? IMAGES.logoWhite : IMAGES.logo}
            />
            <Text style={{ ...FONTS.h3, color: colors.title, marginBottom: 6 }}>Welcome back!</Text>
          </View>

          {/* Username */}
          <View style={GlobalStyleSheet.inputGroup}>
            <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>Username</Text>
            <TextInput
              style={[
                GlobalStyleSheet.formControl,
                { backgroundColor: colors.input, color: colors.title, borderColor: colors.borderColor },
                isFocused && GlobalStyleSheet.activeInput,
              ]}
              value={username}
              onChangeText={setUserName}
              onFocus={() => setisFocused(true)}
              onBlur={() => setisFocused(false)}
              placeholder="Type Username Here"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={GlobalStyleSheet.inputGroup}>
            <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>Password</Text>
            <View>
              <TouchableOpacity
                onPress={() => setHandlePassword(!handlePassword)}
                style={{
                  position: 'absolute',
                  zIndex: 1,
                  height: 50,
                  width: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                  right: 0,
                  opacity: 0.5,
                }}
              >
                {handlePassword ? (
                  <FeatherIcon name="eye" color={colors.title} size={18} />
                ) : (
                  <FeatherIcon name="eye-off" color={colors.title} size={18} />
                )}
              </TouchableOpacity>
              <TextInput
                style={[
                  GlobalStyleSheet.formControl,
                  { backgroundColor: colors.input, color: colors.title, borderColor: colors.borderColor },
                  isFocused2 && GlobalStyleSheet.activeInput,
                ]}
                onFocus={() => setisFocused2(true)}
                onBlur={() => setisFocused2(false)}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={handlePassword}
                placeholder="Type Password Here"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          {/* Login button */}
          <View style={{ marginTop: 5 }}>
            <CustomButton onPress={Login} color={COLORS.secondary} title="Login" />
          </View>

          {/* Divider */}
          <View style={{ marginVertical: 20, alignItems: 'center', flexDirection: 'row' }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.borderColor }} />
            <Text style={{ marginHorizontal: 10, color: colors.textLight, ...FONTS.font }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.borderColor }} />
            <View style={{ flex: 1, height: 1, backgroundColor: colors.borderColor }} />
          </View>

          {/* Google Sign-In */}
          <View style={{ marginBottom: 10 }}>
            <CustomButton onPress={handleGoogleLogin} color={COLORS.primary} title="Continue with Google" />
          </View>

          {/* Phone OTP Section */}
          <View style={{ marginTop: 16 }}>
            <Text style={{ ...FONTS.h6, color: colors.title, marginBottom: 8 }}>Login with Mobile</Text>

            <View style={GlobalStyleSheet.inputGroup}>
              <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>Phone (with country code)</Text>
              <TextInput
                style={[
                  GlobalStyleSheet.formControl,
                  { backgroundColor: colors.input, color: colors.title, borderColor: colors.borderColor },
                ]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91XXXXXXXXXX"
                keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'phone-pad'}
                placeholderTextColor={colors.textLight}
              />
            </View>

            {!otpRequested ? (
              <CustomButton title="Send OTP" color={COLORS.secondary} onPress={sendOtp} />
            ) : (
              <>
                <View style={GlobalStyleSheet.inputGroup}>
                  <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>OTP Code</Text>
                  <TextInput
                    style={[
                      GlobalStyleSheet.formControl,
                      { backgroundColor: colors.input, color: colors.title, borderColor: colors.borderColor },
                    ]}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    placeholder="123456"
                    placeholderTextColor={colors.textLight}
                  />
                </View>
                <CustomButton title="Verify & Login" color={COLORS.secondary} onPress={confirmOtp} />
              </>
            )}
          </View>

          {/* Register */}
          <View style={{ marginTop: 30 }}>
            <Text style={{ ...FONTS.font, color: colors.title, textAlign: 'center', marginBottom: 12 }}>
              Don’t have an account?
            </Text>
            <CustomButton onPress={() => props.navigation.navigate('SignUp')} outline title="Register now" />
          </View>
        </View>
      </ScrollView>

      <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)}>
        {snackText}
      </Snackbar>
    </SafeAreaView>
  );
};

export default SignIn;
