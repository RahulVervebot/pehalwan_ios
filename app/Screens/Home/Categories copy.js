import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FONTS } from '../../constants/theme';
import { WooCommerce } from '../../api/Woocommerce';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import LinearGradient from 'react-native-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)

const Categories = ({colors}) => {

    const navigation = useNavigation();
    const [categoriesData , setCategories] = useState([]);
    const [loading , setLoading] = useState(true);
    
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await WooCommerce.get('/products/categories');
                console.log("response:",response);
                console.log('[Woo call] baseURL:', WooCommerce.defaults.baseURL);
                console.log('[Woo call] auth:', WooCommerce.defaults.auth);
                setCategories(response.data);
                setLoading(false);

            }  catch (error) {
    console.log('Categories error status:', error?.response?.status);
    console.log('Categories error data:', error?.response?.data);
    console.log('[Woo call] baseURL:', WooCommerce.defaults.baseURL);
}
        };
        fetchCategories();
    }, []);

  
    return (
        <View
            style={{
                backgroundColor:colors.card,
                paddingVertical:12,
            }}
        >
            {loading ?
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingLeft:15
                    }}
                >
                    <ShimmerPlaceholder style={{ marginRight : 10 }} width={100} height={36}/>
                    <ShimmerPlaceholder style={{ marginRight : 10 }} width={100} height={36}/>
                    <ShimmerPlaceholder style={{ marginRight : 10 }} width={100} height={36}/>
                    <ShimmerPlaceholder style={{ marginRight : 10 }} width={100} height={36}/>
                </ScrollView>
                :
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingLeft:15,
                    }}
                >
                    {categoriesData.map((data,index) => {
                        if(data.parent == 0){
                            return(
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Items',{catId : data.id, category : data.name, itemLength : data.count})}
                                    key={index}
                                    style={[{
                                        backgroundColor:colors.background,
                                        paddingHorizontal:20,
                                        marginRight:10,
                                        paddingVertical:8,
                                    }]}
                                >
                                    <Text style={[{
                                        ...FONTS.font,
                                        fontSize:15,
                                        color:colors.title,
                                    }]}>{data.name}</Text>
                                </TouchableOpacity>
                            )
                        }
                    })}
                </ScrollView>
            }
        </View>
    )
}
export default Categories;