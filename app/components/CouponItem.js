import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../constants/StyleSheet';

const CouponItem = ({off,desc,category}) => {

    const {colors} = useTheme();

    return (
        <View>
            <TouchableOpacity
                style={{
                    backgroundColor:colors.card,
                    paddingHorizontal:15,
                    paddingVertical:10,
                    flexDirection:'row',
                    alignItems:'center',
                    marginBottom:15,
                    ...GlobalStyleSheet.shadow,
                }}
            >
                <View
                    style={{
                        alignItems:'center',
                        width:70,
                        marginLeft:-10,
                        borderRightWidth:1,
                        borderColor:colors.borderColor,
                        marginRight:15,
                        borderStyle:'solid',
                    }}
                >
                    <Text style={{...FONTS.h5,color:COLORS.primary,top:2}}>{off}</Text>
                    <Text style={{...FONTS.font,color:COLORS.primary}}>Off</Text>
                </View>
                <View>
                    <Text style={{...FONTS.font,color:colors.textLight,marginBottom:3}}>{category}</Text>
                    <Text style={{...FONTS.font,...FONTS.fontTitle,color:colors.title,marginBottom:-1}}>{desc}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default CouponItem;