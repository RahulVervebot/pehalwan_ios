import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS } from '../constants/theme';
import CustomButton from './CustomButton';

const ConfirmationModal = ({clearAllCart}) => {

    const {colors} = useTheme();

    const navigation = useNavigation();

    return (
        <View style={{
            alignItems:'center',
            paddingHorizontal:30,
            paddingVertical:20,
            paddingBottom:30,
            backgroundColor:colors.card,
            marginHorizontal:30,
            width:320,
        }}>
            <View
                style={{
                    alignItems:'center',
                    justifyContent:'center',
                    marginBottom:15,
                    marginTop:10,
                }}
            >
                <View
                    style={{
                        height:80,
                        width:80,
                        opacity:.2,
                        backgroundColor:COLORS.success,
                        borderRadius:80,
                    }}
                />
                <View
                    style={{
                        height:65,
                        width:65,
                        backgroundColor:COLORS.success,
                        borderRadius:65,
                        position:'absolute',
                        alignItems:'center',
                        justifyContent:'center',
                    }}
                >
                    <FeatherIcon size={32} color={COLORS.white} name="check"/>
                </View>
            </View>
            <Text style={{...FONTS.h5,color:COLORS.title,marginBottom:10}}>Congratulations!</Text>
            <Text style={{...FONTS.font,color:COLORS.text,textAlign:'center'}}>Your Order Confirmed successfully.</Text>
            <View
                style={{
                    width:'100%',
                    marginTop:30,
                }}
            >
                <CustomButton
                    onPress={() => {
                        clearAllCart();
                        navigation.navigate('Orders')
                    }}
                    color={COLORS.secondary}
                    title={'View Orders'}
                />
            </View>
        </View>
    )
}

export default ConfirmationModal