import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Image, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProductBox from '../../components/ProductBox';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { WooCommerce } from '../../api/Woocommerce';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import LinearGradient from 'react-native-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

const TrendingProducts = ({currency,colors,wishlist,removeFromWishlist,addToWishlist}) => {

    const navigation = useNavigation();
    const { userData }  = useSelector((state) => state.auth);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await WooCommerce.get('/products?orderby=popularity');
                setItems(response.data);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        };
        fetchProducts();
    },[])

    const itemLoad = [0,1,2,3,4,5];

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
                paddingLeft:15,
            }}
        >
            {loading ?
                itemLoad.map((_,index) => (
                    <View
                        key={index}
                        style={{width:150,marginRight:15}}
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
                            </View>
                            {/* <SkeletonPlaceholder backgroundColor={colors.borderColor} borderRadius={0}>
                                <Image
                                    style={{
                                        width: '100%',
                                        height: undefined,
                                        aspectRatio: 1 / 1,
                                    }}
                                    source={IMAGES.popularProduct1}
                                />
                                <View
                                    style={{
                                        paddingHorizontal:12,
                                        paddingVertical:12,
                                    }}
                                >
                                    <Text style={{fontSize: 14, lineHeight: 12}}>Hello world</Text>
                                    <SkeletonPlaceholder.Item marginTop={10} width={100} height={16} />
                                </View>
                            </SkeletonPlaceholder> */}
                        </View>
                    </View>
                ))
                :
                items.map((data,index) => {

                    const isWishlist =  wishlist.items.findIndex(x => x.id == data.id);

                    return(
                        <View
                            key={index}
                            style={{
                                width:150,
                                marginRight:15,
                            }}
                        >
                            <ProductBox
                                onPress={() => navigation.navigate('ProductDetail',{productId : data.id})}
                                id={data.id}
                                image={data.images[0].src}
                                title={data.name}
                                price={data.price}
                                oldPrice={data.regular_price}
                                rating={data.average_rating}
                                review={data.rating_count}
                                currency={currency}
                                onSale={data.on_sale}
                                userToken={userData.token}
                                isWishlist={isWishlist}
                                wishlistId={wishlist.id}
                                type={data.type}
                                addToWishlist={addToWishlist}
                                removeFromWishlist={removeFromWishlist}
                            />
                        </View>
                    )
                })
            }
        </ScrollView>
    )
}

export default TrendingProducts;