import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS } from '../constants/theme';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import InputSpinner from 'react-native-input-spinner';
import { getPrice } from '../helper/common';

const CheckoutItem = ({id,image,title,price,oldPrice,quantity,type,onPress,removeItem,updateCartItemQuantity,currency,tax,onSale}) => {

    const {colors} = useTheme();

    return (
        <TouchableOpacity 
            activeOpacity={.9}
            onPress={onPress}
            style={{
                flexDirection:'row',
                paddingHorizontal:12,
                paddingBottom:12,
                paddingTop:12,
                backgroundColor:colors.card,
                ...GlobalStyleSheet.shadow,
            }}
        >
            <Image
                style={{
                    height:90,
                    width:75,
                    marginRight:12,
                }}
                source={{uri : image}}
            />
            <View style={{flex:1,paddingVertical:7}}>
                <TouchableOpacity
                    onPress={removeItem && removeItem}
                    style={{
                        position:'absolute',
                        top:0,
                        right:0,
                        padding:5,
                        zIndex:1,
                    }}
                >
                    <FeatherIcon color={COLORS.danger} size={18} name="trash"/>
                </TouchableOpacity>
                <Text numberOfLines={1} style={{...FONTS.font,...FONTS.fontTitle,color:colors.title,marginBottom:4}}>{title}</Text>
                <Text numberOfLines={1} style={{...FONTS.fontXs,color:colors.textLight}}></Text>
                <View
                    style={{
                        flexDirection:'row',
                        alignItems:'center',
                        marginTop:12,
                        marginBottom:-6,
                    }}
                >
                    <View
                        style={{
                            flexDirection:'row',
                            alignItems:'center',
                            flex:1,
                        }}
                    >
                        <Text style={{...FONTS.h6,color:colors.title}}>{getPrice(price,currency)}</Text>
                        {onSale != false && type != "variable" &&
                            <Text style={{...FONTS.fontSm,color:colors.textLight,textDecorationLine:'line-through',marginLeft:8}}>{getPrice(oldPrice,currency)}</Text>
                        }
                    </View>

                    <InputSpinner
                        value={quantity}
                        onChange={(value) => {
                            updateCartItemQuantity(id,value,tax);
                            if(value == 0){
                                removeItem(id);
                            }
                        }}
                        editable={false}
                        buttonStyle={{
                            height:30,
                            width:30,
                            borderRadius:0,
                            backgroundColor:colors.card,
                            borderWidth:1,
                            borderColor:colors.borderColor,
                        }}
                        
                        buttonTextColor={colors.title}
                        colorPress={COLORS.secondary}
                        buttonPressTextColor={COLORS.white}
                        height={28}
                        width={100}
                        inputStyle={{
                            padding:0,
                            color : colors.title,
                            ...FONTS.fontMedium,
                        }}
                        
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};


export default CheckoutItem;