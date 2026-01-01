import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import { WooCommerce } from '../../api/Woocommerce';

const OrderDetails = ({route}) => {

    const { orderId } = route.params;
    const { userData }  = useSelector((state) => state.auth);
    
    const {colors} = useTheme();

    const [orderData, setOrderData] = useState({});
    const getOrderData = async () => {
        try{    
            WooCommerce.get('/orders/'+orderId+'?customer='+userData.id).then((res) => {
                setOrderData(res.data);
            })
        }catch(e){
            console.log(e);
        }
    }

    useEffect(() => {
        getOrderData();
    },[])

    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var today  = new Date(orderData.date_created);
    const dateCreate = today.toLocaleDateString("en-US", options)

    const subtotal = orderData.line_items ? orderData?.line_items?.map((data) => { return JSON.parse(data.total)}) : [];
    const tax = orderData.line_items ? orderData?.line_items?.map((data) => { return JSON.parse(data.total_tax)}) : [];
    const total = subtotal?.reduce((a, b) => a + b, 0) + tax.reduce((a, b) => a + b, 0);

    return (
        <SafeAreaView
            style={{
                flex:1,
                backgroundColor:colors.card,
            }}
        >
            <Header
                titleLeft
                leftIcon={'back'}
                title={'Order Detail'}
            />
            <View
                style={{
                    flex:1,
                }}
            >
                <ScrollView>
                    <View
                        style={GlobalStyleSheet.container}
                    >
                        <View
                            style={{
                                borderBottomWidth:1,
                                borderBottomColor:colors.borderColor,
                                paddingBottom:18,
                                marginBottom:18,
                            }}
                        >

                            <View
                                style={{
                                    flexDirection:'row',
                                    marginBottom:15,
                                    marginTop:5,
                                    alignItems:'center',
                                }}
                            >
                                <View
                                    style={{
                                        flex:1
                                    }}
                                >
                                    <Text style={{...FONTS.h5,color:COLORS.primary}}>#{orderData.id}</Text>
                                    <Text style={{...FONTS.font,color:colors.text}}>{dateCreate}</Text>
                                </View>
                                <View>
                                    <View
                                        style={{
                                            position:'absolute',
                                            height:33,
                                            width:'100%',
                                            bottom:-1,
                                            backgroundColor:orderData.status == "completed" ? COLORS.success : 
                                            orderData.status == "canceled" ? COLORS.danger : 
                                            orderData.status == "on delivery" ? COLORS.info : COLORS.primary,
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
                                            color:  orderData.status == "completed" ? COLORS.success : 
                                            orderData.status == "canceled" ? COLORS.danger : 
                                            orderData.status == "on delivery" ? COLORS.info : COLORS.primary,
                                            textTransform:'capitalize',
                                        }}>{orderData.status}</Text>
                                    </View>
                                </View>

                            </View>
                            <View
                                style={{
                                    marginBottom:15
                                }}
                            >
                                <Text style={{
                                    ...FONTS.font,
                                    ...FONTS.fontTitle,
                                    color:colors.title,
                                    marginBottom:2,
                                }}>Delivered to:</Text>
                                <Text
                                    style={{
                                        ...FONTS.font,
                                        fontSize:15,
                                        color:colors.textLight,
                                    }}
                                >{orderData?.shipping?.address_1}</Text>
                            </View>
                            <View>
                                <Text style={{
                                    ...FONTS.font,
                                    ...FONTS.fontTitle,
                                    color:colors.title,
                                    marginBottom:2,
                                }}>Payment Method:</Text>
                                <Text
                                    style={{
                                        ...FONTS.font,
                                        fontSize:15,
                                        color:colors.textLight,
                                    }}
                                >{orderData.payment_method_title}</Text>
                            </View>

                        </View>

                        <View
                            style={{
                                borderBottomWidth:1,
                                borderBottomColor:colors.borderColor,
                                paddingBottom:15,
                                marginBottom:10,
                            }}
                        >
                            {orderData?.line_items?.map((data,index) => {
                                return(
                                    <View
                                        key={index}
                                        style={{
                                            flexDirection:'row',
                                            alignItems:'center',
                                            paddingVertical:4,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                flex:1,
                                                ...FONTS.font,
                                                color:colors.title,
                                            }}
                                        >{data.name}</Text>
                                        <Text
                                            style={{
                                                marginHorizontal:25,
                                                ...FONTS.font,
                                                color:colors.text,
                                            }}
                                        >{data.quantity}x</Text>
                                        <Text style={{...FONTS.font,...FONTS.fontTitle,color:colors.title}}>{orderData.currency_symbol}{data.total}</Text>
                                    </View>
                                )
                            })}
                        </View>
                        <View
                            style={{
                                flexDirection:'row',
                                justifyContent:'space-between',
                            }}
                        >
                            <Text style={{...FONTS.font,color:colors.text}}>Subtotal:</Text>
                            <Text style={{...FONTS.font,...FONTS.fontBold,color:colors.title}}>{orderData.currency_symbol}{subtotal?.reduce((a, b) => a + b, 0)}</Text>
                        </View>
                        <View
                            style={{
                                flexDirection:'row',
                                justifyContent:'space-between',
                                paddingVertical:5,
                            }}
                        >
                            <Text style={{...FONTS.font,color:colors.text}}>Sale:</Text>
                            <Text style={{...FONTS.font,...FONTS.fontBold,color:colors.title}}>{orderData.currency_symbol}{tax?.reduce((a, b) => a + b, 0)}</Text>
                        </View>
                        <View
                            style={{
                                flexDirection:'row',
                                justifyContent:'space-between',
                            }}
                        >
                            <Text
                                style={{
                                    ...FONTS.h6,
                                    color:colors.title,
                                }}
                            >Total:</Text>
                            <Text
                                style={{
                                    ...FONTS.h6,
                                    color:colors.title,
                                }}
                            >{orderData.currency_symbol}{total}</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default OrderDetails;