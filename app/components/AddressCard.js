import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import { COLORS, FONTS } from '../constants/theme';

const AddressCard = ({address,navigation}) => {

    const {colors} = useTheme();

     return (
        <View
            style={{
                padding:12,
                backgroundColor:colors.card,
                ...GlobalStyleSheet.shadow,
            }}
        >
            <View
                style={{
                    marginBottom:10,
                    flexDirection:'row',
                    justifyContent:'space-between',
                    alignItems:'center',
                }}
            >
                <Text style={{...FONTS.font,...FONTS.fontBold,color:colors.title}}>{address.first_name} {address.last_name}</Text>
                <View
                    style={{
                        backgroundColor:colors.background,
                        paddingHorizontal:10,
                        paddingTop:6,
                        paddingBottom:4,
                        borderRadius:15,
                    }}
                >
                    <Text style={{...FONTS.fontXs,...FONTS.fontBold,color:colors.text}}>Default</Text>
                </View>
            </View>
            <Text style={[FONTS.fontSm,{color:colors.textLight,paddingRight:30,marginBottom:4}]}>{address.address_1}</Text>
            <Text style={[FONTS.font,{color:colors.text}]}>{address.city} : {address.postcode}</Text>
            <Text style={[FONTS.font,{color:colors.text,marginBottom:10}]}>{address.state}</Text>
            <View
                style={{
                    flexDirection:'row',
                    alignItems:'center',
                }}
            >
                <Text style={[FONTS.font,{color:colors.text,flex:1}]}>Mobile : <Text style>{address.phone}</Text></Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('AddDeliveryAddress',{editable : true})}
                >
                    <Text style={{...FONTS.font,color:COLORS.primary}}>Edit Address</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default AddressCard