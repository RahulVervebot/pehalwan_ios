import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
//import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, IMAGES, SIZES } from '../constants/theme';
import Swiper from 'react-native-swiper';

const BannerSlider = () => {

    //const navigation = useNavigation();

    return (
        <View style={{
            height:SIZES.width / 2.4,
        }}>
            <Swiper
                paginationStyle={{
                    flexDirection:'column',
                    alignItems:'flex-end',
                    bottom:0,
                    justifyContent:'center',
                    height:'100%',
                    paddingHorizontal:10,
                }}
                dotStyle={{
                    height:7,
                    width:7,
                }}
                activeDotStyle={{
                    height:7,
                    width:7,
                }}
                activeDotColor={COLORS.primary}
            >
                <View>
                    <Image
                        style={{
                            width:'100%',
                            height:undefined,
                            aspectRatio: 2.4 / 1,
                        }}
                        source={IMAGES.bannerimg1}
                    />

                    <View
                        style={{
                            position:'absolute',
                            left:15,
                            height:'100%',
                            justifyContent:'center',
                            alignItems:'flex-start',
                        }}
                    >
                        {/* <Text style={{...FONTS.fontSm,...FONTS.fontMedium,color:COLORS.primary,marginBottom:4}}>#FASHION DAY</Text>
                        <Text style={{...FONTS.h2,color:COLORS.title}}>35% Off</Text>
                        <Text style={{...FONTS.fontSm}}>Discover our latest Products</Text> */}
                        {/* <TouchableOpacity
                            //onPress={() => navigation.navigate('Items')}
                            style={{
                                backgroundColor:COLORS.primary,
                                paddingHorizontal:15,
                                paddingVertical:6,
                                marginTop:15,
                            }}
                        >
                            <Text style={{
                                ...FONTS.fontXs,
                                color:COLORS.white,
                            }}>Shop Now</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
                <View>
                    <Image
                        style={{
                            width:'100%',
                            height:undefined,
                            aspectRatio: 2.4 / 1,
                        }}
                        source={IMAGES.bannerimg2}
                    />

                    <View
                        style={{
                            position:'absolute',
                            left:0,
                            height:'100%',
                            justifyContent:'center',
                            alignItems:'flex-start',
                            paddingLeft:'50%',
                        }}
                    >
                        {/* <Text style={{...FONTS.fontSm,...FONTS.fontMedium,color:COLORS.primary,marginBottom:4}}>#WINTER SALE</Text>
                        <Text style={{...FONTS.h2,color:COLORS.title}}>25% Off</Text>
                        <Text style={{...FONTS.fontSm}}>Discover our latest Products</Text> */}
                        {/* <TouchableOpacity
                            //onPress={() => navigation.navigate('Items')}
                            style={{
                                backgroundColor:COLORS.primary,
                                paddingHorizontal:15,
                                paddingVertical:6,
                                marginTop:15,
                            }}
                        >
                            <Text style={{
                                ...FONTS.fontXs,
                                color:COLORS.white,
                            }}>Shop Now</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
                <View>
                    <Image
                        style={{
                            width:'100%',
                            height:undefined,
                            aspectRatio: 2.4 / 1,
                        }}
                        source={IMAGES.bannerimg3}
                    />

                    <View
                        style={{
                            position:'absolute',
                            left:15,
                            height:'100%',
                            justifyContent:'center',
                            alignItems:'flex-start',
                        }}
                    >
                        {/* <Text style={{...FONTS.fontSm,...FONTS.fontMedium,color:COLORS.primary,marginBottom:4}}>#FASHION DAY</Text>
                        <Text style={{...FONTS.h2,color:COLORS.title}}>35% Off</Text>
                        <Text style={{...FONTS.fontSm}}>Discover our latest Products</Text>
                        <TouchableOpacity
                           // onPress={() => navigation.navigate('Items')}
                            style={{
                                backgroundColor:COLORS.primary,
                                paddingHorizontal:15,
                                paddingVertical:6,
                                marginTop:15,
                            }}
                        >
                            <Text style={{
                                ...FONTS.fontXs,
                                color:COLORS.white,
                            }}>Shop Now</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
            </Swiper>
        </View>
    )
}

export default BannerSlider;