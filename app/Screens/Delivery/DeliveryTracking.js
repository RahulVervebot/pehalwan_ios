import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import pic1 from '../../assets/images/popular/pic1.png';
import Header from '../../layout/Header';
import CheckoutItem from '../../components/CheckoutItem';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { useTheme } from '@react-navigation/native';

const CheckoutData = [
    {
        image : pic1,
        title : "Long Grey Bomber Jackets",
        type  : "Grey Variant",
        quantity : 1,
        price : "$158.2",
        oldPrice : "$170",
    },
]

const DeliveryTracking = () => {

    const {colors} = useTheme();

    return (
        <SafeAreaView style={{flex:1,backgroundColor:colors.card}}>
            <View style={{
                flex:1,
                backgroundColor:colors.background,
            }}>
                <Header
                    leftIcon={'back'}
                    title={"Tracking Orders"}
                    rightIcon={'more'}
                    productId={'#04451255'}
                />
                <ScrollView>
                    <View
                        style={GlobalStyleSheet.container}
                    >
                        {CheckoutData.map((data,index) => (
                            <CheckoutItem
                                key={index}
                                image={data.image}
                                title={data.title}
                                type={data.type}
                                quantity={data.quantity}
                                price={data.price}
                                oldPrice={data.oldPrice}
                            />
                        ))}
                    </View>

                    <View style={[GlobalStyleSheet.container,{backgroundColor:colors.card}]}>
                        <Text style={[FONTS.h5,{marginBottom:12,color:colors.title}]}>History</Text>
                        <View>
                            <View
                                style={styles.delCircle}
                            />
                            <View
                                style={styles.delInfo}
                            >
                                <Text style={{...FONTS.h6,...FONTS.fontTitle,color:COLORS.primary,marginBottom:4}}>On Delivery</Text>
                                <Text style={{...FONTS.fontXs,color:colors.textLight,marginBottom:15}}>Monday June 20th, 2020  12:25 AM</Text>
                                <View
                                    style={{
                                        flexDirection:'row',
                                        alignItems:'center',
                                    }}
                                >
                                    <Image
                                        style={{
                                            height:43,
                                            width:43,
                                            borderRadius:40,
                                            marginRight:10,
                                        }}
                                        source={IMAGES.user}
                                    />
                                    <View style={{flex:1}}>
                                        <Text style={{...FONTS.font,...FONTS.fontTitle,color:colors.title,marginBottom:6}}>Thomas Djono</Text>
                                        <Text style={{...FONTS.fontXs,color:colors.textLight}}>ID 02123141</Text>
                                    </View>
                                    <FeatherIcon color={COLORS.success} size={24} name="phone-call"/>
                                </View>
                            </View>
                        </View>
                        <View>
                            <View
                                style={styles.delCircle}
                            />
                            <View
                                style={styles.delInfo}
                            >
                                <Text style={{...FONTS.h6,...FONTS.fontTitle,color:COLORS.primary,marginBottom:4}}>North Gateway</Text>
                                <Text style={{...FONTS.fontXs,color:colors.textLight,marginBottom:15}}>Monday June 20th, 2020  12:25 AM</Text>
                                <Text style={{...FONTS.font,color:colors.title}}>Your order has been arrived at North Gateway, please wait next info</Text>
                            </View>
                        </View>
                        <View>
                            <View
                                style={styles.delCircle}
                            />
                            <View
                                style={[styles.delInfo,{borderColor:'transparent'}]}
                            >
                                <Text style={{...FONTS.h6,...FONTS.fontTitle,color:COLORS.primary,marginBottom:4}}>Order Created</Text>
                                <Text style={{...FONTS.fontXs,color:colors.textLight,marginBottom:15}}>Monday June 20th, 2020  12:25 AM</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    delCircle : {
        height:16,
        width:16,
        borderRadius:16,
        backgroundColor:COLORS.primary,
        borderWidth:3,
        borderColor:COLORS.white,
        position:'absolute',
        top:0,
        left:5,
        zIndex:2,
    },
    delInfo :{
        paddingLeft:25,
        marginLeft:13,
        borderLeftWidth:1,
        borderColor:COLORS.primary,
        paddingBottom:30,
        paddingRight:10,
    }
})

export default DeliveryTracking;