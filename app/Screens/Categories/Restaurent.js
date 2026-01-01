import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Image
} from 'react-native';
import Header from '../../layout/Header';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import { WooCommerce } from '../../api/Woocommerce';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const DEFAULT_BANNER = { uri: 'https://pehalwan.vervebot.io/wp-content/uploads/2025/appbanner/default-restaurant-banner.png' };

const Restaurent = ({ navigation }) => {
    const { colors } = useTheme();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [useFallback, setUseFallback] = React.useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);

                // Get parent category ID from AsyncStorage
                const restaurantId = await AsyncStorage.getItem('restaurant_id');
                console.log('restaurant_id from storage:', restaurantId);

                if (!restaurantId) {
                    console.log('No restaurant_id found in AsyncStorage');
                    setCategories([]);
                    setLoading(false);
                    return;
                }

                // If your WooCommerce instance supports params:
                // const response = await WooCommerce.get('/products/categories', {
                //     parent: Number(restaurantId),
                // });

                // Or using query string (works with plain axios baseURL):
                const response = await WooCommerce.get(
                    `/products/categories?parent=${Number(restaurantId)}`
                );

                console.log('categories:', response);
                setCategories(response.data || []);
            } catch (error) {
                console.log('Error fetching categories:', error?.response?.data || error.message || error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const catLoad = [0, 1, 2, 3, 4, 5];

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: colors.card,
            }}
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.background,
                }}
            >
                <Header
                    backAction={() => navigation.navigate('DrawerNavigation', { screen: 'Home' })}
                    titleLeft
                    title={'Our Menu'}
                    leftIcon={'back'}
                />

                {loading ? (
                    <ScrollView>
                        <View
                            style={{
                                padding: 15,
                            }}
                        >
                            {catLoad.map((_, index) => (
                                <View
                                    key={index}
                                    style={{
                                        backgroundColor: colors.card,
                                        paddingHorizontal: 20,
                                        paddingVertical: 25,
                                        marginBottom: 15,
                                        ...GlobalStyleSheet.shadow,
                                    }}
                                >
                                    <ShimmerPlaceholder width={160} height={22} />
                                    <ShimmerPlaceholder style={{ marginTop: 6 }} width={80} height={10} />
                                    <ShimmerPlaceholder style={{ marginTop: 35 }} width={100} height={28} />
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                ) : (
                    <ScrollView>
                        <View style={GlobalStyleSheet.container}>
                            {categories.map((data, index) => {
                                const source =
                                    !useFallback && data?.image?.src
                                        ? { uri: data.image.src }
                                        : DEFAULT_BANNER;

                                return (
                                    <TouchableOpacity
                                        onPress={() =>
                                            navigation.navigate('Items', {
                                                catId: data.id,
                                                category: data.name,
                                                itemLength: data.count,
                                            })
                                        }
                                        key={data.id ?? index}
                                        style={{
                                            marginBottom: 15,
                                            backgroundColor: colors.card,
                                            ...GlobalStyleSheet.shadow,
                                        }}
                                    >
                                        <Image
                                            style={{
                                                width: '100%',
                                                height: undefined,
                                                aspectRatio: 2.2 / 1,
                                            }}
                                            source={source}
                                            onError={() => setUseFallback(true)}
                                            resizeMode="cover"
                                            accessible
                                            accessibilityLabel="Restaurant banner"
                                        />
                                        <View
                                            style={{
                                                position: 'absolute',
                                                height: '100%',
                                                bottom: 0,
                                                left: 0,
                                                paddingHorizontal: 20,
                                                paddingVertical: 25,
                                                alignItems: 'flex-start',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    backgroundColor: '#ffffff',
                                                    paddingHorizontal: '5%',
                                                    paddingVertical: '2%',
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        ...FONTS.h3,
                                                        color: COLORS.title,
                                                    }}
                                                >
                                                    {data.name}
                                                </Text>
                                                <Text style={{ ...FONTS.font }}>
                                                    {data.count} Items
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
};

export default Restaurent;
