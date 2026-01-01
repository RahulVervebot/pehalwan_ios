import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import Octicons from 'react-native-vector-icons/Octicons';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { GlobalStyleSheet } from '../constants/StyleSheet';

const ItemList = ({title,price,oldPrice,offer,rating,review,image}) => {

    const {colors} = useTheme();
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            activeOpacity={.9}
            onPress={() => navigation.navigate('ProductDetail')}
            style={{
                flexDirection:'row',
                marginBottom:12,
                alignItems:'center',
                backgroundColor:colors.card,
                paddingHorizontal:12,
                paddingVertical:12,
                ...GlobalStyleSheet.shadow,
            }}
        >
            <View style={{marginRight:15}}>
                <Image
                    source={image}
                    style={{
                        width:85,
                        height:100,
                    }}
                />
            </View>
            <View style={{flex:1}}>
                <View style={{flexDirection:'row',alignItems:'center',marginBottom:4}}>
                    <View style={{flexDirection:'row',marginRight:5,alignItems:'center'}}>
                       <Text style={{...FONTS.font,color:colors.title,...FONTS.fontBold}}>{rating}</Text>
                       <Octicons
                            size={14}
                            style={{marginRight:5,marginLeft:3}}
                            color={"#FFA800"}
                            name="star-fill"
                        />
                    </View>
                    <Text style={{...FONTS.font,color:colors.text}}>({review} Reviews)</Text>
                </View>
                <Text style={{...FONTS.font,...FONTS.fontTitle,color:colors.title,fontSize:15}}>{title}</Text>
                <View style={{
                    flexDirection:'row',
                    alignItems:'center',
                    marginTop:8,
                    flex:1,
                }}>
                    <Text style={[FONTS.h5,{marginRight:6,color:COLORS.primary}]}>{price}</Text>
                    <Text style={[FONTS.font,{textDecorationLine:'line-through',color:colors.textLight}]}>{oldPrice}</Text>
                    <Text style={
                        [FONTS.fontSm,FONTS.fontMedium,
                        {
                            color:COLORS.primary,
                            marginLeft:10,
                        }
                    ]}>{offer}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};


export default ItemList;