import React from 'react';
import { Image, Text, View, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { useNavigation, useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../constants/StyleSheet';


const OrderCard = ({orderId,image,title,price,quantity,size,status,dateCreated}) => {

    const {colors} = useTheme();

    const navigation = useNavigation();

    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var today  = new Date(dateCreated);
    const dateCreate = today.toLocaleDateString("en-US", options)

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('OrderDetails',{orderId : orderId})}
            style={{
                paddingHorizontal:15,
                paddingVertical:20,
                backgroundColor:colors.card,
                marginBottom:10,
                ...GlobalStyleSheet.shadow,
            }}
        >
            <View
                style={{
                    flexDirection:'row',
                }}
            >
                <View style={{flex:1,paddingRight:15}}>
                    <Text style={{...FONTS.font,color:COLORS.primary,marginBottom:6}}>#{orderId}</Text>
                    <Text style={{...FONTS.font,...FONTS.fontTitle,color:colors.title,marginBottom:6}}>{title}</Text>
                    <Text style={{...FONTS.font,color:colors.textLight}}>{dateCreate}</Text>
                </View>
                <Image
                    style={{
                        height:65,
                        width:65,
                        marginBottom:10,
                    }}
                    source={{ uri : image}}
                />
            </View>
            <View style={{flexDirection:'row',alignItems:'center',marginBottom:10}}>
                <Text style={{...FONTS.font,color:colors.textLight,flex:1}}>{size}</Text>
                <Text style={{...FONTS.font,...FONTS.fontBold,color:colors.title}}>{quantity}x</Text>
                <Text style={{...FONTS.h4,color:COLORS.primary,width:100,textAlign:'right'}}>{price}</Text>
            </View>
            <View
                style={{flexDirection:'row',alignItems:'flex-start',alignItems:'center',marginTop:-15}}
            >
                <View>
                    <View
                        style={{
                            position:'absolute',
                            height:33,
                            width:'100%',
                            bottom:-1,
                            backgroundColor:status == "completed" ? COLORS.success : 
                            status == "canceled" ? COLORS.danger : 
                            status == "on delivery" ? COLORS.info : COLORS.primary,
                            opacity:.1
                        }}
                    />
                    <View
                        style={{
                            flexDirection:'row',
                            alignItems:'center',
                            paddingHorizontal:12,
                            paddingVertical:6,
                        }}
                    >
                        <Text style={{
                            ...FONTS.font,
                            ...FONTS.fontTitle,
                            color:  status == "completed" ? COLORS.success : 
                                    status == "canceled" ? COLORS.danger : 
                                    status == "on delivery" ? COLORS.info : COLORS.primary,
                            textTransform:'capitalize',
                        }}>{status}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};


export default OrderCard;