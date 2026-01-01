import React from 'react';
import { Image, SafeAreaView, Text, View } from 'react-native';
import Swiper from 'react-native-swiper'
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import CustomButton from '../../components/CustomButton';
import { useTheme } from '@react-navigation/native';

const SwiperData = [
  {
    title: 'Indian & Chinese—One Craving, One Place',
    desc: 'From street-style chaats to wok-tossed noodles, explore bold flavors under one roof.',
  },
  {
    title: 'Sweet Treats: Falooda to Gulab Jamun',
    desc: 'Cool down with royal falooda or warm up with syrup-soaked gulab jamun and rich gajar halwa.',
  },
  {
    title: 'Family Meals & Quick Bites',
    desc: 'Combo platters, snacks, and desserts—perfect for sharing or a speedy solo fix.',
  },
];


const Onboarding = (props) => {

    const theme = useTheme();
    const {colors} = theme;

    return (
        <SafeAreaView style={{flex:1,backgroundColor:colors.card}}>
            <View style={{flex:1,backgroundColor:colors.card}}>
                <Image
                    source={IMAGES.onBoardingBg}
                    style={{
                        position:'absolute',
                        width:'100%',
                        top:0,
                        height:undefined,
                        aspectRatio: 2/3,
                    }}
                />
                <LinearGradient
                    locations={[0.3,0.55,0.7]}
                    colors={
                        theme.dark ?
                        ["rgba(12,16,28,0.3)","rgba(12,16,28,.95)","rgba(12,16,28,1)"]
                        :
                        ["rgba(255,255,255,0)","rgba(255,255,255,1)","rgba(255,255,255,1)"]
                    }
                    style={{
                        position:'absolute',
                        height:'100%',
                        width:'100%',
                    }}
                >

                </LinearGradient>
                <View
                    style={{
                        flex:1,
                    }}
                >
                </View>
                <View
                    style={{
                        height:245,
                    }}
                >
                    <Swiper 
                        loop={false}
                        dotStyle={[{
                            height:8,
                            width:8,
                            borderRadius:8,
                        },theme.dark && {
                            backgroundColor:'rgba(255,255,255,.15)'
                        }]}
                        activeDotStyle={{
                            height:8,
                            width:8,
                            borderRadius:8,
                            backgroundColor:COLORS.primary,
                        }}
                        paginationStyle={{
                            bottom:40,
                        }}
                        showsButtons={false}
                    >
                        {SwiperData.map((data,index) => {
                            return(
                                <View style={{padding:20,paddingBottom:50}} key={index}>
                                    <View style={{
                                        padding:10,
                                    }}>
                                        <Text style={{...FONTS.h3,color:colors.title,textAlign:'center',marginBottom:10}}>{data.title}</Text>
                                        <Text style={[FONTS.font,{textAlign:'center',color:colors.text}]}>{data.desc}</Text>
                                    </View>
                                </View>
                            )
                        })}
                    </Swiper>
                </View>
                <View style={{paddingHorizontal:30,paddingBottom:25}}>
                    <CustomButton 
                        onPress={() => props.navigation.navigate('DrawerNavigation')} 
                        color={COLORS.secondary}
                        title="Get Started"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};



export default Onboarding;