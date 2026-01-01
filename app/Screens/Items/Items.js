// screens/Items/index.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import Ripple from 'react-native-material-ripple';
import Octicons from 'react-native-vector-icons/Octicons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { RadioButton } from 'react-native-paper';
import RBSheet from 'react-native-raw-bottom-sheet';
import { connect, useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import Header from '../../layout/Header';
import ProductItem from '../../components/ProductItem';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { addToWishlist, removeFromWishlist } from '../../redux/actions/wishlistActions';
import { addToCart, removeFromCart } from '../../redux/actions/cartActions'; // NEW
import { WooCommerce } from '../../api/Woocommerce';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
var pageLength = 1;

const Items = ({ navigation, route, currency, wishlist, cart, addToWishlist, removeFromWishlist, addToCart, removeFromCart }) => { // NEW props
  const sheetRef = useRef();
  const theme = useTheme();
  const { colors } = theme;
  const { catId, category, itemLength } = route.params;

  const { userData } = useSelector((state) => state.auth);

  const [itemCount, setItemCount] = useState(itemLength);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [loadingItem, setLoadingItem] = useState(true);
  const [items, setItems] = useState([]);
  const [subcategories, setSubCategories] = useState([]);
  const [sortVal, setSortVal] = useState('title-asc');
  const [sheetType, setSheetType] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [categoryId, setCategoryId] = useState(catId);

  useEffect(() => {
    pageLength = 1;
  }, [catId]);

  const fetchProducts = async () => {
    try {
      const orderVal = sortVal.split('-');
      const response = await WooCommerce.get(
        '/products?category=' +
          categoryId +
          '&per_page=10&page=' +
          pageLength +
          '&orderby=' +
          orderVal[0] +
          '&order=' +
          orderVal[1]
      );
      setItems([...items, ...response.data]);
      setLoadingItem(false);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await WooCommerce.get('/products/categories?parent=' + categoryId);
        setSubCategories(response.data);
        setCatLoading(false);
      } catch (e) {
        console.log(e);
      }
    };

    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProductShorting = async (value) => {
    try {
      setLoading(true);
      setSortVal(value);

      const orderVal = value.split('-');
      const response = await WooCommerce.get(
        '/products?order=' +
          orderVal[1] +
          '&orderby=' +
          orderVal[0] +
          '&category=' +
          categoryId +
          '&per_page=10'
      );
      pageLength = 1;
      setItems(response.data);
      setLoading(false);
      sheetRef.current.close();
    } catch (e) {
      console.log(e);
    }
  };

  const handleProductResult = async (value) => {
    try {
      if (loading !== false) {
        return false;
      }
      setLoading(true);
      setItemCount(value.count);
      setCategoryId(value.id);
      setActiveTab(value.name);
      const orderVal = sortVal.split('-');
      const response = await WooCommerce.get(
        '/products?category=' +
          value.id +
          '&order=' +
          orderVal[1] +
          '&orderby=' +
          orderVal[0] +
          '&per_page=10'
      );
      pageLength = 1;
      setItems(response.data);
      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const itemLoad = [0, 1, 2, 3, 4, 5];

  const renderLoader = () => {
    return <>{loadingItem && <ActivityIndicator size="large" color={COLORS.primary} />}</>;
  };

  const loadMoreItem = () => {
    if (items.length < itemCount && !loadingItem) {
      pageLength++;
      fetchProducts();
      setLoadingItem(true);
    }
  };

  return (
    <>
      <RBSheet
        ref={sheetRef}
        height={sheetType === 'sort' ? 250 : 450}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          container: {
            backgroundColor: colors.card,
          },
          draggableIcon: {
            backgroundColor: colors.background,
          },
        }}
      >
        {sheetType === 'sort' && (
          <RadioButton.Group onValueChange={(value) => { handleProductShorting(value); }} value={sortVal}>
            <RadioButton.Item labelStyle={{ color: colors.title }} color={COLORS.primary} uncheckedColor={COLORS.label} style={{ paddingVertical: 2 }} label="Default Sorting" value="title-asc" />
            <RadioButton.Item labelStyle={{ color: colors.title }} color={COLORS.primary} uncheckedColor={COLORS.label} style={{ paddingVertical: 2 }} label="Sort By Average rating" value="rating-desc" />
            <RadioButton.Item labelStyle={{ color: colors.title }} color={COLORS.primary} uncheckedColor={COLORS.label} style={{ paddingVertical: 2 }} label="Sort By Latest" value="date-desc" />
            <RadioButton.Item labelStyle={{ color: colors.title }} color={COLORS.primary} uncheckedColor={COLORS.label} style={{ paddingVertical: 2 }} label="Price low to high" value="price-asc" />
            <RadioButton.Item labelStyle={{ color: colors.title }} color={COLORS.primary} uncheckedColor={COLORS.label} style={{ paddingVertical: 2 }} label="Price high to low" value="price-desc" />
          </RadioButton.Group>
        )}
      </RBSheet>

      <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
        <Header titleLeft leftIcon={'back'} rightIcon={'cart'} title={category} />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 10,
              paddingVertical: 12,
              backgroundColor: colors.card,
            }}
          >
            <Ripple
              onPress={() => {
                setSheetType('sort');
                sheetRef.current.open();
              }}
              style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.borderColor }]}
            >
              <Octicons size={16} color={colors.textLight} style={{ marginRight: 6 }} name="sort-desc" />
              <Text style={{ ...FONTS.font, top: -1, color: colors.title }}>Sort By</Text>
              <FeatherIcon style={{ marginLeft: 2, marginRight: -6 }} color={colors.title} size={18} name="chevron-down" />
            </Ripple>

            <View style={{ flex: 1 }}>
              {catLoading ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <ShimmerPlaceholder style={{ marginRight: 8 }} width={100} height={36} />
                  <ShimmerPlaceholder style={{ marginRight: 8 }} width={100} height={36} />
                  <ShimmerPlaceholder style={{ marginRight: 8 }} width={100} height={36} />
                </ScrollView>
              ) : (
                subcategories.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                      onPress={() => handleProductResult({ name: 'all', id: catId, count: itemLength })}
                      style={[
                        {
                          backgroundColor: colors.background,
                          paddingHorizontal: 20,
                          marginRight: 8,
                          paddingVertical: 8,
                        },
                        activeTab === 'all' && {
                          backgroundColor: theme.dark ? COLORS.primary : COLORS.secondary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          {
                            ...FONTS.font,
                            fontSize: 15,
                            color: colors.title,
                          },
                          activeTab === 'all' && {
                            color: COLORS.white,
                          },
                        ]}
                      >
                        All
                      </Text>
                    </TouchableOpacity>
                    {subcategories.map((data, index) => {
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleProductResult(data)}
                          style={[
                            {
                              backgroundColor: colors.background,
                              paddingHorizontal: 20,
                              marginRight: 8,
                              paddingVertical: 8,
                            },
                            activeTab === data.name && {
                              backgroundColor: theme.dark ? COLORS.primary : COLORS.secondary,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              {
                                ...FONTS.font,
                                fontSize: 15,
                                color: colors.title,
                              },
                              activeTab === data.name && {
                                color: COLORS.white,
                              },
                            ]}
                          >
                            {data.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )
              )}
            </View>
          </View>

          {loading ? (
            <ScrollView>
              <View style={{ paddingTop: 15, paddingBottom: 15 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 5 }}>
                  {[0, 1, 2, 3, 4, 5].map((_, index) => (
                    <View key={index} style={{ width: '50%', paddingHorizontal: 5 }}>
                      <View style={{ marginBottom: 15, backgroundColor: colors.card, ...GlobalStyleSheet.shadow }}>
                        <ShimmerPlaceholder backgroundColor={colors.borderColor} style={{ width: '100%', aspectRatio: 1 }} />
                        <View style={{ paddingHorizontal: 12, paddingVertical: 12 }}>
                          <ShimmerPlaceholder style={{ marginBottom: 8 }} width={100} height={10} />
                          <ShimmerPlaceholder style={{ marginBottom: 8 }} width={80} height={16} />
                          <ShimmerPlaceholder style={{ marginBottom: 8 }} width={90} height={10} />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              ListFooterComponent={renderLoader}
              onEndReached={loadMoreItem}
              contentContainerStyle={{ paddingHorizontal: 5, paddingTop: 15, paddingBottom: 20 }}
              numColumns={2}
              renderItem={({ item }) => {
                const isWishlist = wishlist.items.findIndex((x) => String(x.id) === String(item.id));
                const offer =
                  item.regular_price && item.sale_price
                    ? (((item.regular_price - item.sale_price) / item.regular_price) * 100).toFixed() + '% off'
                    : 'sale';

                // inCart for this product
                const inCart =
                  Array.isArray(cart?.items) &&
                  cart.items.some((x) => String(x.product_id) === String(item.id));

                return (
                  <View style={{ width: '50%', paddingHorizontal: 5 }}>
                    <ProductItem
                      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                      id={item.id}
                      image={item.images?.[0]?.src}
                      title={item.name}
                      currency={currency}
                      type={item.type}
                      price={item.price}
                      oldPrice={item.regular_price}
                      rating={item.average_rating}
                      reviews={item.rating_count}
                      onSale={item.on_sale}
                      offer={offer}
                      isWishlist={isWishlist}
                      addToWishlist={addToWishlist}
                      removeFromWishlist={removeFromWishlist}
                      wishlistId={wishlist.id}
                      userToken={userData.token}
                      handleItemLike={() => {}}

                      // cart
                      addToCart={addToCart}          // NEW
                      removeFromCart={removeFromCart} // NEW
                      inCart={inCart}                 // NEW
                    />
                  </View>
                );
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const mapStateToProps = (state) => {
  return {
    currency: state.currency,
    wishlist: state.wishlist,
    cart: state.cart, // NEW
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    addToWishlist: (item, userToken) => dispatch(addToWishlist(item, userToken)),
    removeFromWishlist: (productId, wishlistId, userToken) =>
      dispatch(removeFromWishlist(productId, wishlistId, userToken)),
    addToCart: (item) => dispatch(addToCart(item)),         // NEW
    removeFromCart: (productId) => dispatch(removeFromCart(productId)), // NEW
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Items);
