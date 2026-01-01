import React from 'react';
import { Image, Platform, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import FeatherIcon from "react-native-vector-icons/Feather";
import { useTheme } from '@react-navigation/native';
import { IconButton } from 'react-native-paper';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import DropShadow from 'react-native-drop-shadow';
import BannerSlider from '../../components/bannerSlider';
import LatestProducts from './LatestProducts';
import { connect } from 'react-redux';
import TrendingProducts from './TrendingProducts';
import Categories from './Categories';
import { addToWishlist, removeFromWishlist } from '../../redux/actions/wishlistActions';

const Home = ({navigation, wishlist, currency, addToWishlist, removeFromWishlist }) => {
    
    const theme = useTheme();
    const {colors} = theme;

    return (
        <SafeAreaView style={{flex:1,backgroundColor:colors.card}}>
            <View
                style={{
                    flex:1,
                    backgroundColor:colors.background,
                }}
            >
                <DropShadow
                    style={[{
                        shadowColor: COLORS.secondary,
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: .1,
                        shadowRadius: 5,
                        zIndex:1,
                    },Platform.OS === 'ios' && {
                        backgroundColor:colors.card,
                    }]}
                >
                    <View
                        style={{
                            flexDirection:'row',
                            backgroundColor:colors.card,
                            justifyContent:'space-between',
                            height:48,
                            alignItems:'center',
                        }}
                    >
                        <IconButton
                            icon={() => <Image style={{height:26,width:26,tintColor:colors.title}} source={IMAGES.menu}/>}
                            onPress={() => navigation.openDrawer()}
                        />
                        <Image
                            style={{
                                height:60,
                                width:60,
                                resizeMode:'contain',
                            }}
                            source={theme.dark ? IMAGES.logoWhite : IMAGES.logo}
                        />
                        <IconButton
                            icon={(props) => <FeatherIcon name="search" {...props}/>}
                            size={20}
                            iconColor={colors.title}
                            onPress={() => navigation.navigate('Search')}
                        />
                    </View>
                </DropShadow>
                <ScrollView>

                    <BannerSlider/>
                    
                    <Categories colors={colors}/>

                    <View style={GlobalStyleSheet.container}>
                        <View
                            style={{
                                flexDirection:'row',
                                alignItems:'center',
                                marginTop:5,
                            }}
                        >
                            <Text style={{
                                ...FONTS.h5,
                                color:colors.title,
                                flex:1,
                            }}>Latest Products</Text>
                        </View>
                    </View>
                    
                    <View
                        style={[GlobalStyleSheet.container,{paddingTop:0}]}
                    >
                        <LatestProducts 
                            wishlist={wishlist} 
                            removeFromWishlist={removeFromWishlist}
                            addToWishlist={addToWishlist}
                            colors={colors} 
                            currency={currency}
                        />
                    </View>


                    <View style={[GlobalStyleSheet.container,{paddingTop:0}]}>
                        <View
                            style={{
                                flexDirection:'row',
                                alignItems:'center',
                                marginTop:5,
                            }}
                        >
                            <Text style={{
                                ...FONTS.h5,
                                color:colors.title,
                                flex:1,
                            }}>Trending Now</Text>
                        </View>
                    </View>
                    
                    <View
                        style={{
                            paddingBottom:50,
                        }}
                    >
                        <TrendingProducts 
                            wishlist={wishlist} 
                            removeFromWishlist={removeFromWishlist}
                            addToWishlist={addToWishlist}
                            colors={colors} 
                            currency={currency}
                        />
                    </View>

                </ScrollView>
            </View>

        </SafeAreaView>
    );

};

const mapStateToProps = (state) => {
    return {
        currency: state.currency,
        wishlist: state.wishlist,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        addToWishlist: (item,userToken) => dispatch(addToWishlist(item,userToken)),
        removeFromWishlist: (productId,wishlistId,userToken) => dispatch(removeFromWishlist(productId , wishlistId, userToken)),
    };
};
export default connect(mapStateToProps,mapDispatchToProps)(Home);