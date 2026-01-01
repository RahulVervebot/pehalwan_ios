import React from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { useTheme } from '@react-navigation/native';
import DropShadow from 'react-native-drop-shadow';
import { connect } from 'react-redux';

const home = require('../assets/images/icons/home3.png');
const category = require('../assets/images/icons/category.png');
const wishlist = require('../assets/images/icons/heart.png');
const user = require('../assets/images/icons/user3.png');
const polygon = require('../assets/images/icons/polygon.png');
const bag = require('../assets/images/icons/bag.png');
const orders = require('../assets/images/icons/modal.png');
const CustomBottomNavigation = ({ state, descriptors, navigation, cartTotal }) => {

    const theme = useTheme();
    const {colors} = theme;

    return (
        <DropShadow
            style={[{
                shadowColor: COLORS.secondary,
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: .2,
                shadowRadius: 5,
            },Platform.OS === 'ios' && {
                backgroundColor:colors.card,
            }]}
        >
            <View
                style={{
                    height:60,
                    backgroundColor:colors.card,
                    flexDirection:'row',
                }}
            >
                {state.routes.map((route, index) => {

                    const { options } = descriptors[route.key];
                    const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                        ? options.title
                        : route.name;

                    const isFocused = state.index === index;
                    
                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate({ name: route.name, merge: true });
                        }
                    }
                    if(label === 'Cart2'){
                        return(
                            <View
                                key={index}
                                style={{
                                    width:'20%',
                                    alignItems:'center',
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Cart')}
                                    activeOpacity={.8}
                                    style={{
                                        alignItems:'center',
                                        justifyContent:'center',
                                        marginTop:-20,
                                    }}
                                >
                                    <Image
                                        style={{
                                            height:60,
                                            width:60,
                                            resizeMode:'contain',
                                            tintColor:theme.dark ? COLORS.primary : COLORS.secondary,
                                        }}
                                        source={polygon}
                                    />
                                    <Image
                                        style={{
                                            position:'absolute',
                                            height:30,
                                            width:30,
                                            resizeMode:'contain',
                                            tintColor:COLORS.white,
                                        }}
                                        source={bag}
                                    />
                                    {cartTotal > 0 &&
                                        <View
                                            style={{
                                                height:18,
                                                width:18,
                                                borderRadius:18,
                                                backgroundColor:COLORS.danger,
                                                position:'absolute',
                                                top:14,
                                                right:12,
                                                alignItems:'center',
                                                justifyContent:'center',
                                            }}
                                        >
                                            <Text style={{fontSize:11,...FONTS.fontBold,color:COLORS.white}}>{cartTotal}</Text>
                                        </View>
                                    }
                                </TouchableOpacity>
                            </View>
                        )
                    }else{
                        return(
                            <View
                                key={index}
                                style={{
                                    width:'20%',
                                    alignItems:'center',
                                }}
                            >
                                <TouchableOpacity
                                    onPress={onPress}
                                    style={{
                                        alignItems:'center',
                                        paddingVertical:9,
                                    }}
                                >
                                    <Image
                                        style={{
                                            height:20,
                                            width:20,
                                            tintColor:isFocused ? COLORS.primary : colors.title,
                                            opacity:isFocused ? 1 : .5,
                                            marginBottom:3,
                                            marginTop:1,
                                        }}
                                        source={
                                            label === 'Home' ? home :
                                            label === 'Categories' ? category :
                                            label === 'Wishlist' ? wishlist :
                                              label === 'Orders' ? orders :
                                            label === 'Account' ? user : home
                                        }
                                    />
                                    <Text style={{...FONTS.fontSm,color:colors.title,opacity:isFocused ? 1 : .6}}>{label}</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    }
                })}
            </View>
        </DropShadow>
    );
};

const mapStateToProps = (state) => {
    return {
        cartTotal: state.cart.totalItems,
    };
};
  
export default connect(mapStateToProps)(CustomBottomNavigation);