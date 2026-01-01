import React, { useRef, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, FlatList, Image } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import Header from '../../layout/Header';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CustomButton from '../../components/CustomButton';
import { connect, useSelector } from 'react-redux';
import ProductItem from '../../components/ProductItem';
import RBSheet from 'react-native-raw-bottom-sheet';
import { removeFromWishlist } from '../../redux/actions/wishlistActions';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import LinearGradient from 'react-native-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

const Wishlist = ({navigation,currency,wishlistData,removeFromWishlist}) => {
    
    const theme = useTheme();
    const {colors} = theme;
    const { userData }  = useSelector((state) => state.auth);
    const confirmSheet = useRef();

    const [productId , setProductId] = useState("");

    const itemLoad = [0,1,2,3,4,5];

    return (
        <SafeAreaView
            style={{
                flex:1,
                backgroundColor:colors.card,
            }}
        >
            <RBSheet
                ref={confirmSheet}
                height={220}
                closeOnDragDown={true}
                closeOnPressMask={true}
                customStyles={{
                    container:{
                        backgroundColor:colors.card,
                    },
                    draggableIcon:{
                        backgroundColor:colors.background,
                    }
                }}
            >
                <View style={GlobalStyleSheet.container}>
                    <Text style={{...FONTS.h5,color:colors.title,marginBottom:8}}>Remove from wishlist?</Text>
                    <Text style={{...FONTS.font,color:colors.text,marginBottom:25}}>Are you sure to delete this product from wishlist?</Text>
                    <View
                        style={GlobalStyleSheet.row}
                    >   
                        <View style={GlobalStyleSheet.col50}>
                            <CustomButton
                                onPress={() => confirmSheet.current.close()}
                                outline
                                color={COLORS.secondary}
                                title={'Cancel'}
                            />
                        </View>
                        <View style={GlobalStyleSheet.col50}>
                            <CustomButton
                                onPress={() => {removeFromWishlist(productId,wishlistData.id,userData.token);confirmSheet.current.close()}}
                                color={COLORS.secondary}
                                title={'Remove'}
                            />
                        </View>
                    </View>
                </View>
            </RBSheet>
            <View
                style={{
                    flex:1,
                    backgroundColor:colors.background,
                }}
            >
                <Header
                    leftIcon={'back'}
                    title={'Wishlist'}
                    titleLeft
                />
                <View style={{
                    flex:1,
                }}>
                {wishlistData.loading && wishlistData.id ?
                    <ScrollView>
                        <View
                            style={{
                                paddingTop:15,
                                paddingBottom:15,
                            }}
                        >
                            <View style={{
                                flexDirection:'row',
                                flexWrap:'wrap',
                                paddingHorizontal:5,
                            }}>
                                {itemLoad.map((_,index) => (
                                    <View
                                        key={index}
                                        style={{width:'50%',paddingHorizontal:5}}
                                    >
                                        <View
                                            style={{
                                                marginBottom:15,
                                                backgroundColor:colors.card,
                                                ...GlobalStyleSheet.shadow,
                                            }}
                                        >
                                            <ShimmerPlaceholder 
                                                backgroundColor={colors.borderColor} 
                                                style={{
                                                    width: '100%',
                                                    height: undefined,
                                                    aspectRatio: 1 / 1,
                                                }}
                                            />
                                            <View
                                                style={{
                                                    paddingHorizontal:12,
                                                    paddingVertical:12,
                                                }}
                                            >
                                                <ShimmerPlaceholder style={{ marginBottom : 8 }} width={100} height={10} />
                                                <ShimmerPlaceholder style={{ marginBottom : 8 }} width={80} height={16} />
                                                <ShimmerPlaceholder style={{ marginBottom : 8 }} width={90} height={10} />
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                    :
                    wishlistData.items.length === 0 ?
                        <View
                            style={{
                                flex:1,
                                alignItems:'center',
                                justifyContent:'center',
                            }}
                        >
                            <View
                                style={{
                                    height:60,
                                    width:60,
                                    borderRadius:60,
                                    alignItems:'center',
                                    justifyContent:'center',
                                    backgroundColor:COLORS.primaryLight,
                                    marginBottom:20,
                                }}
                            >
                                <FeatherIcon color={COLORS.primary} size={24} name='heart'/>
                            </View>
                            <Text style={{...FONTS.h5,color:colors.title,marginBottom:8}}>Your Wishlist is Empty!</Text>    
                            <Text
                                style={{
                                    ...FONTS.fontSm,
                                    color:colors.text,
                                    textAlign:'center',
                                    paddingHorizontal:40,
                                    marginBottom:30,
                                }}
                            >Add Product to you favourite and shop now.</Text>
                            <View
                                style={{
                                    flexDirection:'row',
                                }}
                            >
                                <CustomButton
                                    style={{
                                        paddingHorizontal:40
                                    }}
                                    onPress={() => navigation.navigate('SignIn')}
                                    color={COLORS.secondary}
                                    title={'Sign In'}
                                />
                            </View>
                        </View>
                        :
                        <FlatList
                            data={wishlistData.items}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{
                                paddingHorizontal:5,
                                paddingTop:15,
                                paddingBottom:20,
                            }}
                            numColumns={2}
                            renderItem={({item}) => {
                                const offer =  (((item.regular_price - item.sale_price) / item.regular_price) * 100).toFixed() + "% off";
                                return(
                                    <View
                                        style={{width:'50%',paddingHorizontal:5}}
                                    >
                                        <ProductItem
                                            onPress={() => navigation.navigate('ProductDetail',{productId : item.id})}
                                            id={item.id}
                                            image={item.image}
                                            title={item.title}
                                            currency={currency}
                                            price={item.price}
                                            oldPrice={item.regular_price}
                                            rating={item.average_rating}
                                            reviews={item.rating_count}
                                            onSale={item.on_sale}
                                            offer={offer}
                                            type={item.type}
                                            removeIcon={true}
                                            confirmSheet={confirmSheet}
                                            setProductId={setProductId}
                                        />
                                    </View>
                                )
                            }}
                        />
                }
                </View>
            </View>
        </SafeAreaView>
    );
};

const mapStateToProps = (state) => {
    return {
        currency: state.currency,
        wishlistData: state.wishlist,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        removeFromWishlist: (productId,wishlistId,userToken) => dispatch(removeFromWishlist(productId , wishlistId, userToken)),
    };
};
export default connect(mapStateToProps,mapDispatchToProps)(Wishlist);