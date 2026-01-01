import React, { useRef } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import RBSheet from 'react-native-raw-bottom-sheet';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import Header from '../../layout/Header';
import india from '../../assets/images/flags/india.png';
import UnitedStates from '../../assets/images/flags/UnitedStates.png';
import german from '../../assets/images/flags/german.png';
import italian from '../../assets/images/flags/italian.png';
import spanish from '../../assets/images/flags/spanish.png';
import { useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import CustomButton from '../../components/CustomButton';
import Auth from '../../services/Auth';
import { removeUser } from '../../redux/reducer/authReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OneSignal } from 'react-native-onesignal';
import RewardPointsPopup from '../../components/RewardPointsPopup';
const languagetData = [
  { flag: india,        name: 'Indian'  },
  { flag: UnitedStates, name: 'English' },
  { flag: german,       name: 'German'  },
  { flag: italian,      name: 'Italian' },
  { flag: spanish,      name: 'Spanish' },
];

const Profile = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const RBSheetLanguage = useRef();
  const { login, userData } = useSelector((state) => state.auth);

  // --- Safe name/email derivation (matches CustomDrawer approach) ---
  const displayName =
    userData?.displayName || // if you previously stored camelCase
    userData?.display_name ||
    [userData?.first_name || userData?.billing?.first_name, userData?.last_name || userData?.billing?.last_name]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    'Guest';

  const email =
    userData?.email ||
    userData?.billing?.email ||
    '';

  const avatarInitial = displayName?.charAt(0)?.toUpperCase?.() || 'U';
  // ------------------------------------------------------------------

  const logOut = () =>  {
    dispatch(removeUser(''));
    Auth.logout();
   OneSignal.logout();
    navigation.navigate('SignIn');
    AsyncStorage.removeItem('address');
  };

  return (
    <>
      <RBSheet
        ref={RBSheetLanguage}
        closeOnDragDown={true}
        height={400}
        openDuration={300}
        customStyles={{
          wrapper: { backgroundColor: 'rgba(0,0,0,.3)' },
          container: { backgroundColor: colors.card },
          draggableIcon: { backgroundColor: colors.borderColor },
        }}
      >
        <View style={{ alignItems: 'center', borderBottomWidth: 1, borderColor: colors.borderColor, paddingBottom: 8, paddingTop: 4 }}>
          <Text style={{ ...FONTS.h5, color: colors.title }}>Language</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 15 }}>
          {languagetData.map((data, index) => (
            <TouchableOpacity
              onPress={() => RBSheetLanguage.current.close()}
              key={index}
              style={{
                paddingVertical: 15,
                borderBottomWidth: 1,
                borderColor: colors.borderColor,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Image style={{ height: 20, width: 25, marginRight: 12 }} source={data.flag} />
              <Text style={{ ...FONTS.fontLg, color: colors.title, flex: 1 }}>{data.name}</Text>
              <FeatherIcon name="chevron-right" color={colors.textLight} size={24} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </RBSheet>

      <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <Header leftIcon={'back'} rightIcon={'more'} title={'Profile'} />
          <ScrollView>
            <View style={GlobalStyleSheet.container}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 10 }}>
                <View
                  style={{
                    height: 65,
                    width: 65,
                    borderRadius: 65,
                    backgroundColor: COLORS.secondary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {login ? (
                    <Text style={{ color: COLORS.white, fontSize: 28, textTransform: 'uppercase' }}>
                      {avatarInitial}
                    </Text>
                  ) : (
                    <FeatherIcon color={COLORS.white} size={28} name="user" />
                  )}
                </View>

                {login ? (
                  <View style={{ flex: 1, paddingLeft: 15 }}>
                    <Text style={{ ...FONTS.h6, color: colors.title, marginBottom: 2 }}>
                      {displayName}
                    </Text>
                    {!!email && (
                      <Text style={{ ...FONTS.font, color: colors.textLight }}>
                        {email}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View style={{ flex: 1, paddingLeft: 30 }}>
                    <CustomButton
                      onPress={() => navigation.navigate('SignIn')}
                      btnSm
                      color={COLORS.secondary}
                      title="SignIn / Join"
                    />
                  </View>
                )}
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -10 }}>
                <View style={{ width: '50%', paddingHorizontal: 5 }}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Coupons')}
                    style={[styles.profileBtn, { backgroundColor: colors.card }]}
                  >
                    <FeatherIcon style={{ marginRight: 10 }} color={colors.textLight} size={20} name={'gift'} />
                    <Text style={{ ...FONTS.font, fontSize: 16, ...FONTS.fontTitle, color: colors.title }}>Coupons</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ width: '50%', paddingHorizontal: 5 }}>
                  <TouchableOpacity style={[styles.profileBtn, { backgroundColor: colors.card }]}>
                    <FeatherIcon style={{ marginRight: 10 }} color={colors.textLight} size={20} name={'headphones'} />
                    <Text style={{ ...FONTS.font, fontSize: 16, ...FONTS.fontTitle, color: colors.title }}>Help Center</Text>
                  </TouchableOpacity>
                </View>
                      <RewardPointsPopup navigation={navigation} colors={colors} />
              </View>
            </View>

            <View style={{ ...GlobalStyleSheet.container, borderTopWidth: 1, borderColor: colors.borderColor }}>
              <Text style={{ ...FONTS.h6, color: colors.title, marginBottom: 12 }}>Account Settings</Text>
              <View>
                {login && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Address')}
                    style={[styles.listItem, { borderBottomColor: colors.borderColor }]}
                  >
                    <FeatherIcon style={{ marginRight: 12 }} color={colors.textLight} size={18} name="map-pin" />
                    <Text style={{ ...FONTS.font, color: colors.title, flex: 1 }}>Saved Addresses</Text>
                    <FeatherIcon size={20} color={colors.textLight} name="chevron-right" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => navigation.navigate('AboutUs')}
                  style={[styles.listItem, { borderBottomColor: colors.borderColor }]}
                >
                  <FeatherIcon style={{ marginRight: 12 }} color={colors.textLight} size={20} name="info" />
                  <Text style={{ ...FONTS.font, color: colors.title, flex: 1 }}>About Us</Text>
                  <FeatherIcon size={20} color={colors.textLight} name="chevron-right" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('PrivacyPolicy')}
                  style={[styles.listItem, { borderBottomColor: colors.borderColor }]}
                >
                  <FeatherIcon style={{ marginRight: 12 }} color={colors.textLight} size={20} name="lock" />
                  <Text style={{ ...FONTS.font, color: colors.title, flex: 1 }}>Privacy policies</Text>
                  <FeatherIcon size={20} color={colors.textLight} name="chevron-right" />
                </TouchableOpacity>

                {login && (
                  <TouchableOpacity
                    onPress={logOut}
                    style={[styles.listItem, { borderBottomColor: colors.borderColor }]}
                  >
                    <FeatherIcon style={{ marginRight: 12 }} color={colors.textLight} size={20} name="log-out" />
                    <Text style={{ ...FONTS.font, color: colors.title, flex: 1 }}>Log Out</Text>
                    <FeatherIcon size={20} color={colors.textLight} name="chevron-right" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  profileBtn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...GlobalStyleSheet.shadow,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
});

export default Profile;
