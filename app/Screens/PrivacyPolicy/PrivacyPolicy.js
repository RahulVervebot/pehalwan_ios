import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';

const PrivacyPolicy = () => {
    return (
        <SafeAreaView
            style={{
                flex:1,
            }}
        >
            <Header 
                leftIcon={'back'}
                titleLeft
                title={'Privacy Policy'}
            />
            <View style={[GlobalStyleSheet.container,{flex:1}]}>
                <Text style={{...FONTS.fontRegular,fontSize:16,color:COLORS.text,lineHeight:26}}>
                We collect your basic info to process orders and improve your shopping experience.
                Your data is safe with us and never sold to anyone.
                We only share it with trusted partners like delivery and payment services.
                You can contact us anytime to update or delete your data.
                By using our app, you agree to this policy.</Text>
            </View>
        </SafeAreaView>
    )
}

export default PrivacyPolicy;