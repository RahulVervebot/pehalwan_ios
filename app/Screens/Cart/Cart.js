import React from 'react';
import { 
    SafeAreaView, 
    ScrollView, 
    Text, 
    TouchableOpacity, 
    View 
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CheckoutItem from '../../components/CheckoutItem';
import { COLORS, FONTS } from '../../constants/theme';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CustomButton from '../../components/CustomButton';
import Divider from '../../components/Dividers/Divider';
import { useTheme } from '@react-navigation/native';
import { connect, useSelector } from 'react-redux';
import { removeFromCart, updateCartQuatity } from '../../redux/actions/cartActions';
import { getPrice } from '../../helper/common';


const Cart = ({navigation, cartItems, removeFromCart, updateItemQuantity, address, currency, taxList}) => {
    
    const {colors} = useTheme();
    const { login }  = useSelector((state) => state.auth);

    const calculateSubtotal = (cartArray) => {
        let subtotal = 0;
        for (const item of cartArray) {
          subtotal += JSON.parse(item.subtotal);
        }
        return subtotal;
    };
    const caalculateTotalPrice = (cartArray) => {
        let total = 0;
      
        for (const item of cartArray) {
          total += item.total;
        }
      
        return total;
    };
    const caalculateTax = (cartArray) => {
        let tax = 0;
        for (const item of cartArray) {
            tax += item.tax;
        }
        return tax;
    };

    const subtotal = calculateSubtotal(cartItems);
    const totalPrice = caalculateTotalPrice(cartItems);
    const taxRate = caalculateTax(cartItems);

    const checkAddress = (
        address?.address_1 &&
        address?.first_name &&
        address?.last_name &&
        address?.postcode &&
        address?.state &&
        address?.country &&
        address?.phone &&
        address?.city &&
        address?.email
    )

    return (
        <SafeAreaView
            style={{
                flex:1,
                backgroundColor:colors.card,
            }}
        >
            <View
                style={{
                    flex:1,
                    backgroundColor:colors.background,
                }}
            >
                <Header
                    backAction={() => navigation.navigate('DrawerNavigation', {screen: 'BottomNavigation'})}
                    titleLeft
                    title={'Cart'}
                    leftIcon={'back'}
                />
                {cartItems.length == 0 ?
                    <View
                        style={{
                            flex:1,
                            alignItems:'center',
                            justifyContent:'center',
                        }}
                    >
                        <View
                            style={{
                                height:60,
                                width:60,
                                borderRadius:60,
                                alignItems:'center',
                                justifyContent:'center',
                                backgroundColor:COLORS.primaryLight,
                                marginBottom:20,
                            }}
                        >
                            <FeatherIcon color={COLORS.primary} size={24} name='shopping-cart'/>
                        </View>
                        <Text style={{...FONTS.h5,color:colors.title,marginBottom:8}}>Your Bag is Empty!</Text>    
                        <Text
                            style={{
                                ...FONTS.fontSm,
                                color:colors.text,
                                textAlign:'center',
                                paddingHorizontal:40,
                                marginBottom:30,
                            }}
                        >Signin to link products to your account or view products already in your wishlist or bag</Text>
                        <View
                            style={{
                                flexDirection:'row',
                            }}
                        >
                            <CustomButton 
                                outline
                                onPress={() => navigation.navigate('DrawerNavigation',{screen : 'Home'})}
                                color={COLORS.secondary}
                                title={'Return Shop'}
                            />
                            {login != true && 
                                <CustomButton
                                    onPress={() => navigation.navigate('SignIn')}
                                    style={{
                                        marginLeft:10,
                                    }}
                                    color={COLORS.secondary}    
                                    title={'SignIn / Join'}
                                />
                            }
                        </View>
                    </View>
                    :
                    <>
                    <View style={{flex:1}}>
                        <ScrollView>
                            <View style={[GlobalStyleSheet.container,{paddingTop:12}]}>
                                {cartItems.map((data,index) => (
                                    <View
                                        key={index}
                                        style={{
                                            marginBottom:8,
                                        }}
                                    >
                                        <CheckoutItem
                                            removeItem={() => removeFromCart(data.product_id)}
                                            id={data.product_id}
                                            image={data.image}
                                            title={data.name}
                                            type={data.type}
                                            quantity={data.quantity}
                                            price={data.price}
                                            currency={currency}
                                            oldPrice={data.oldPrice}
                                            tax={taxList}
                                            onSale={data.on_sale}
                                            updateCartItemQuantity={updateItemQuantity}
                                        />
                                    </View>
                                ))}
                            </View>
                            <View style={{paddingHorizontal:15}}>
                                <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8,marginTop:12}}>
                                    <Text style={{...FONTS.font,color:colors.text}}>Subtotal : </Text>
                                    <Text style={{...FONTS.font,...FONTS.fontTitle,color:colors.title}}>{getPrice(subtotal,currency)}</Text>
                                </View>
                                <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                                    <Text style={{...FONTS.font,color:colors.text}}>Sale : </Text>
                                    <Text style={{...FONTS.font,...FONTS.fontTitle,color:colors.title}}>{getPrice(taxRate,currency)}</Text>
                                </View>
                                <Divider dashed color={colors.borderColor} style={{marginBottom:0,marginTop:0}}/>
                                <View style={{
                                    flexDirection:'row',
                                    justifyContent:'space-between',
                                    marginBottom:10,
                                    marginTop:5,
                                    alignItems:'center',
                                    paddingTop:8,
                                }}>
                                    <Text style={{...FONTS.font,color:colors.text}}>Total : </Text>
                                    <Text style={{...FONTS.h4,color:COLORS.primary}}>{getPrice(totalPrice,currency)}</Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                    <View
                        style={{
                            flexDirection:'row',
                            paddingHorizontal:15,
                            paddingVertical:10,
                            backgroundColor:colors.card,
                            borderTopWidth:1,
                            borderColor:colors.borderColor,
                        }}
                    >
                        <View style={{flex:1}}>
                            <Text style={{...FONTS.h4,color:colors.title}}>{getPrice(totalPrice,currency)}</Text>
                            <TouchableOpacity>
                                <Text style={{...FONTS.fontXs,color:COLORS.primary,...FONTS.fontTitle}}>View price details</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{flex:1}}>
                            <CustomButton 
                                btnSm
                                color={COLORS.secondary}
                                onPress={() => 
                                    login ? 
                                        checkAddress ?
                                            navigation.navigate('Payment')
                                            :      
                                            navigation.navigate('AddDeliveryAddress',{editable : false}) : 
                                        navigation.navigate('SignIn')
                                    }
                                title="Checkout"
                            />
                        </View>
                    </View>
                    </>
                }
            </View>
        </SafeAreaView>
    );
};

const mapStateToProps = (state) => {
    return {
        cartItems: state.cart.items,
        address: state.address.selectedAddress,
        currency: state.currency,
        taxList: state.tax,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
      removeFromCart: (itemId) => dispatch(removeFromCart(itemId)),
      updateItemQuantity: (itemId,quantity,tax) => dispatch(updateCartQuatity(itemId,quantity,tax)),
    };
};
  
export default connect(mapStateToProps,mapDispatchToProps)(Cart);