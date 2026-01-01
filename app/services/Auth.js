import AsyncStorage from '@react-native-async-storage/async-storage';

async function getAccount() {
  return await AsyncStorage.getItem('account');
}

async function setAccount(data) {
  return await AsyncStorage.setItem('account', data);
}


async function logout() {
  return await AsyncStorage.setItem('account', "");
}


export default {
  logout,
  getAccount,
  setAccount
};