import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';

const AboutUs = () => {
    return (
        <SafeAreaView
            style={{
                flex:1,
            }}
        >
            <Header 
                leftIcon={'back'}
                titleLeft
                title={'About Us'}
            />
            <View style={[GlobalStyleSheet.container,{flex:1}]}>
            <Text style={{...FONTS.fontRegular,fontSize:16,color:COLORS.text,lineHeight:26}}>
                Welcome to Pehalwan Ka Dhaba, your one-stop shop for all essentials.
                We offer quality products at great prices with fast delivery.
                Our goal is to make shopping easy, safe, and enjoyable.
                Your trust means everything to us.
                Happy shopping with Pehalwan Ka Dhaba!</Text>
            </View>
        </SafeAreaView>
    )
}

export default AboutUs;