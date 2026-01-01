import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme } from '@react-navigation/native';
import ThemeBtn from '../components/ThemeBtn';
import { useDispatch, useSelector } from 'react-redux';
import Auth from '../services/Auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { removeUser } from '../redux/reducer/authReducer';
import { COLORS, FONTS } from '../constants/theme';
import Restaurent from '../Screens/Categories/Restaurent';
const CustomDrawer = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const { login, userData } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Robust display name + email getters
  const displayName =
    userData?.displayName ||
    userData?.display_name || // WP/Woo style
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

  const navItem = [
    { icon: 'home',           name: 'Home',     navigate: 'Home' },
    //  { icon: 'grid',        name: 'Restaurent', navigate: 'Restaurent' },
    // { icon: 'heart',       name: 'Wishlist',   navigate: 'Wishlist' },
    { icon: 'repeat',         name: 'Orders',   navigate: 'Orders' },
    { icon: 'shopping-cart',  name: 'My Cart',  navigate: 'Cart' },
    { icon: 'user',           name: 'Profile',  navigate: 'Account' },
    { icon: 'log-out',        name: 'Logout',   navigate: 'Logout' },
  ];

  const logOut = () => {
    dispatch(removeUser(''));
    Auth.logout();
    navigation.navigate('Onboarding');
    AsyncStorage.removeItem('address');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View
          style={{
            paddingTop: 25,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderColor: colors.borderColor,
            paddingBottom: 20,
            marginBottom: 15,
            alignItems: 'flex-start',
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <View style={{ alignItems: 'flex-start', flex: 1 }}>
              <View style={{ marginBottom: 12 }}>
                <View
                  style={{
                    height: 70,
                    width: 70,
                    borderRadius: 65,
                    backgroundColor: COLORS.secondary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {login ? (
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: 28,
                        textTransform: 'uppercase',
                      }}
                    >
                      {avatarInitial}
                    </Text>
                  ) : (
                    <FeatherIcon color={COLORS.white} size={28} name="user" />
                  )}
                </View>
              </View>
            </View>
            <ThemeBtn />
          </View>

          <View>
            <Text style={{ ...FONTS.h5, color: colors.title, marginBottom: 4 }}>
              {login ? displayName : 'Guest'}
            </Text>
            {!!email && (
              <Text style={{ ...FONTS.font, color: colors.textLight, opacity: 0.9, marginBottom: 2 }}>
                {email}
              </Text>
            )}
          </View>
        </View>

        {/* Nav */}
        <View style={{ flex: 1 }}>
          {navItem.map((data, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                if (data.navigate === 'Account') {
                  navigation.navigate('BottomNavigation', { screen: data.navigate });
                }
                 else if (data.navigate === 'Orders') {
                  navigation.navigate(login ? data.navigate : 'SignIn');
                } else if (data.navigate === 'Home') {
                  navigation.navigate('BottomNavigation', { screen: data.navigate });
                }
                else if (data.navigate === 'Wishlist') {
                  navigation.navigate('BottomNavigation', { screen: data.navigate });
                } else if (data.navigate === 'Logout') {
                  logOut();
                } else if (data.navigate) {
                  navigation.navigate(data.navigate);
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 14,
              }}
            >
              <View style={{ marginRight: 15 }}>
                <FeatherIcon name={data.icon} color={colors.textLight} size={20} />
              </View>
              <Text style={{ ...FONTS.fontTitle, fontSize: 14, color: colors.title, flex: 1 }}>
                {data.name}
              </Text>
              <FeatherIcon size={16} color={colors.textLight} name="chevron-right" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 30,
            marginTop: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ ...FONTS.h6, ...FONTS.fontTitle, color: colors.title, marginBottom: 4 }}>
            Pehalwan Ka Dhaba
          </Text>
          <Text style={{ ...FONTS.fontSm, color: colors.textLight }}>App Version 1.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default CustomDrawer;
