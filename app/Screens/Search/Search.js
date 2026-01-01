import React, { useState } from 'react';
import { SafeAreaView, TextInput, FlatList, View, Text, ScrollView, Image } from 'react-native';
import { IconButton } from 'react-native-paper';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { FONTS, IMAGES } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';
import ProductItem from '../../components/ProductItem';
import { connect } from 'react-redux';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { WooCommerce } from '../../api/Woocommerce';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import LinearGradient from 'react-native-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

const Search = ({navigation,currency}) => {

    const {colors} = useTheme();

    const [items , setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTxt , setSearchTxt] = useState("");

    const itemLoad = [0,1,2,3,4,5];

    const fetchProducts = async (text) => {
        try {
            if(text.length === 0){
                setItems([]);
                setSearchTxt("");
            }else{
                setLoading(true);
                const response = await WooCommerce.get('/products?search='+text);
                console.log("all data",response.data);
                setItems(response.data);
                setSearchTxt(text);
                setLoading(false);
            }
        } catch (error) {
          console.log(error);
        }
    };

    return (
        <SafeAreaView
            style={{
                flex:1,
                backgroundColor:colors.card,
            }}
        >
            <View
                style={{
                    flexDirection:'row',
                    borderBottomWidth:1,
                    borderBottomColor:colors.borderColor,
                }}
            >
                <IconButton
                    onPress={() => {navigation.goBack()}}
                    size={24}
                    icon={() => <FeatherIcon color={colors.text} name='arrow-left' size={22}/>}
                />
                <TextInput
                    style={{
                        ...FONTS.font,
                        flex:1,
                        color:colors.title,
                    }}
                    //value={searchTxt}
                    onChangeText={(val) => fetchProducts(val)}
                    autoFocus={true}
                    placeholder='Search here...'
                    placeholderTextColor={colors.textLight}
                />
            </View>

            <View style={{flex:1}}>
                {items.length === 0 ?
                    searchTxt.length > 0 && 
                        <Text style={{
                            ...FONTS.font,
                            color:colors.text,
                            textAlign:'center',
                            paddingVertical:20,
                        }}>No data found "{searchTxt}"</Text>
                    :
                    loading ?
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
                        <FlatList
                            data={items}
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
                                        image={item.images[0].src}
                                        title={item.name}
                                        currency={currency}
                                        type={item.type}
                                        price={item.price}
                                        oldPrice={item.regular_price}
                                        minPrice={item.min_price}
                                        maxPrice={item.max_price}
                                        rating={item.average_rating}
                                        reviews={item.rating_count}
                                        onSale={item.on_sale}
                                        offer={offer}
                                    />
                                </View>
                            )
                        }}
                    />
                }
            </View>
        </SafeAreaView>
    );
};

const mapStateToProps = (state) => {
    return {
        currency: state.currency,
    };
};

export default connect(mapStateToProps)(Search);