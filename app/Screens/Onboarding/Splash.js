import React, { useEffect } from 'react';
import { Image, ImageBackground, Text, View } from 'react-native';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../redux/reducer/authReducer';
import { setAddress } from '../../redux/actions/addressActions';
import { setCartItems } from '../../redux/actions/cartActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Auth from '../../services/Auth';
import { setCurrencyData } from '../../redux/actions/currencyActions';
import { setTaxData } from '../../redux/actions/taxActions';
import { setWishlistItems } from '../../redux/actions/wishlistActions';
import { getCurrencyData } from '../../api/Currency';
import { getTax } from '../../api/taxes';
import { getWishlist } from '../../api/Wishlist';

const Splash = ({navigation}) => {

    const dispatch = useDispatch();
    const { userData }  = useSelector((state) => state.auth);

    const getUser = async () => {
        let data = await Auth.getAccount();
        if(data != null){
            dispatch(setUser(JSON.parse(data)));
        }
    }

    const getCartItems = async () => {
        try {
            const storedCartItems = await AsyncStorage.getItem('cart');
            if (storedCartItems) {
                const parsedCartItems = JSON.parse(storedCartItems);
                const cartQuantity = parsedCartItems.map((item) => {  
                return item.quantity++;
            });
            let totalQuantity = 0;
            for (let i = 0; i < cartQuantity.length; i++ ) {
                totalQuantity += cartQuantity[i];
            }
            dispatch(setCartItems(JSON.parse(storedCartItems),totalQuantity));
          }
        } catch (error) {
            console.log('Error initializing cart items from local storage:', error);
        }
    }
    
    const getAddress = async () => {
        try{
            const address = await AsyncStorage.getItem('address');
            if(address){
                const addressData = JSON.parse(address);
                dispatch(setAddress(addressData));
            }
        }catch(e){
            console.log(e);
        }
    }
    
    const getCurrencySetting = async () => {
        try{    
            const { symbol , position , thousand, decimal, decimalNum , status} = await getCurrencyData();
            if(status == true){
                dispatch(setCurrencyData(symbol,position,thousand,decimal,decimalNum));
                navigation.navigate('Onboarding')
            }
        }catch(e){
            console.log(e);
        }
    }
      
    const getTaxData = async () => {
        try{    
            const {status , data} = await getTax();
            if(status == true){
                dispatch(setTaxData(data));
            }
        }catch(e){
            console.log(e);
        }
    }

    useEffect(() => {
        if(userData.token){
            getWishlistData();
        }
    },[userData]);

    const getWishlistData = async () => {
        try{
            const { data , status } = await getWishlist(userData.token);
            if(data?.product && status == true){
                dispatch(setWishlistItems(data.product,data.wishlist.id));
            }

        }catch(error){
            console.log(error);
        }
    }

    useEffect(()=>{
        getUser();
        getCartItems();
        getAddress();
        getCurrencySetting();
        getTaxData();
    },[])



    return (
        
        <ImageBackground source={IMAGES.bg1} style={{flex:1}}>
            <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                <Image
                    style={{
                        height:100,
                        resizeMode:'contain',
                    }}
                    source={IMAGES.logo}
                />
            </View>
            <View style={{alignItems:'center',paddingVertical:15}}>
                <Text style={{...FONTS.h5,color:COLORS.primary}}>Pehalwan  Dhaba</Text>
                <Text style={{...FONTS.font,marginBottom:4}}>Rastaurant App</Text>
                <Text style={{...FONTS.font}}>v2.0</Text>
            </View>
        </ImageBackground>
    );
};

export default Splash;