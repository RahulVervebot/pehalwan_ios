import React, { useState, useEffect, useRef } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, TextInput } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import Header from '../../layout/Header';
import CustomButton from '../../components/CustomButton';
import { useTheme } from '@react-navigation/native';
import HTMLView from 'react-native-htmlview';
import Stars from 'react-native-stars';
import { connect, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../../redux/actions/cartActions';
import { getPrice, getTaxRate } from '../../helper/common';
import { WooCommerce } from '../../api/Woocommerce';
import { addToWishlist, removeFromWishlist } from '../../redux/actions/wishlistActions';
import RBSheet from 'react-native-raw-bottom-sheet';
import { GlobalStyleSheet } from '../../constants/StyleSheet';

const ProductDetail = ({ navigation, route, addToCart, removeFromCart, currency, taxList, wishlist, addToWishlist, removeFromWishlist, cart }) => {
  const { productId } = route.params;
  const { colors } = useTheme();
  const reviewSheet = useRef();
  const { userData, login } = useSelector((state) => state.auth);

  const [activeColor, setActiveColor] = useState('');
  const [activeSize, setActiveSize] = useState('');
  const [variationId, setVariationId] = useState(0);
  const [reviewData, setReviewData] = useState([]);
  const [starCount, setStarCount] = useState(0);
  const [review, setReview] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const [productDetail, setProductDetail] = useState({});
  const [variationData, setVariationData] = useState([]);

  // NEW: availability from API
  const [availability, setAvailability] = useState(null);

  const inWishlist = wishlist.items.findIndex((x) => String(x.id) === String(productId));
  const [isWishlist, setIsWishlist] = useState(inWishlist >= 0);

  // is this product already in cart?
  const inCart = Array.isArray(cart?.items)
    ? cart.items.some((x) => String(x.product_id) === String(productId))
    : false;

  // Derived fields for availability
  const isAvailableNow = availability?.is_available_now ?? true;
  const windowLabel = availability?.window_label || null;

  const fetchProductReviews = async () => {
    try {
      const response = await WooCommerce.get('/products/reviews?product=' + productId);
      setReviewData(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await WooCommerce.get('/products/' + productId);
        setProductDetail(response.data);
        setAvailability(response.data?.availability || null); // NEW
        setLoading(false);

        if (response.data.type === 'variable') {
          response.data.default_attributes?.forEach((data) => {
            const value = data.option?.charAt(0).toUpperCase() + data.option?.slice(1);
            if (data.name === 'Color') setActiveColor(value);
            if (data.name === 'Size') setActiveSize(value);
          });
          await fetchProductsVariations(response.data.variations?.length || 0);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    const fetchProductsVariations = async (count) => {
      if (!count) return;
      try {
        const response = await WooCommerce.get('/products/' + productId + '/variations?per_page=' + count);
        setVariationData(response.data);
      } catch (e) {
        console.log(e);
      }
    };

    fetchProducts();
    fetchProductReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // add to cart
  const handleAddToCart = () => {
    // Block adding when not available
    if (!isAvailableNow) {
      console.log('This item is not available right now.');
      return;
    }

    if (productDetail.type === 'variable') {
      if (!activeColor || !activeSize) {
        console.log('Please select Color and Size');
        return;
      }
    }

    const priceNum = Number(productDetail?.price ?? 0);
    const tax = getTaxRate(productDetail.price, productDetail.tax_class, taxList, productDetail.tax_status);
    const taxNum = Number(tax || 0);

    const cartPayload = {
      cart_id: `${productId}-${Date.now()}`,
      session_id: '',
      product_id: productId,
      variation_id: variationId || undefined,
      type: productDetail.type,
      name: productDetail.name,
      image: productDetail?.images?.[0]?.src,
      price: String(productDetail.price ?? ''),
      oldPrice: productDetail?.regular_price ?? null,
      subtotal: String(productDetail.price ?? ''),
      tax_class: productDetail.tax_class ?? null,
      taxable: productDetail.tax_status ?? null,
      tax: tax || 0,
      total: Number((priceNum + taxNum).toFixed(2)),
      quantity: 1,
      date_added: '',
      date_modified: '',
      on_sale: productDetail.on_sale,
    };

    addToCart(cartPayload);
  };

  const handleRemoveFromCart = () => {
    removeFromCart(productId);
  };

  useEffect(() => {
    if (!variationData?.length) return;
    const variationMatch = variationData.find((data) => {
      const variation = data.attributes?.map((item) => item.option) || [];
      const variation2 = [activeSize, activeColor];
      const sortedArr1 = variation.slice().sort();
      const sortedArr2 = variation2.slice().sort();
      return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
    });

    if (variationMatch) {
      setVariationId(variationMatch.id);
      setProductDetail((prev) => ({
        ...prev,
        price: variationMatch.price,
        regular_price: variationMatch.regular_price,
        sale_price: variationMatch.sale_price,
        on_sale: variationMatch.on_sale,
        images: variationMatch.image?.src
          ? [{ src: variationMatch.image.src }, ...(prev?.images?.slice(1) || [])]
          : prev?.images || [],
      }));
    }
  }, [activeSize, activeColor, variationData]);

  const wishlistItem = {
    id: productId,
    price: productDetail.price,
    regular_price: productDetail.regular_price,
    sale_price: productDetail.price,
    on_sale: productDetail.on_sale,
    average_rating: productDetail.average_rating,
    rating_count: productDetail.rating_count,
    title: productDetail.name,
    type: productDetail.type,
    image: productDetail.images && productDetail.images[0]?.src,
  };

  const addProductReview = async () => {
    try {
      if (review === '' || starCount === 0) {
        return false;
      }

      setBtnLoading(true);
      await WooCommerce.post('/products/reviews', {
        product_id: productId,
        review: review,
        reviewer: userData.displayName,
        reviewer_email: userData.email,
        rating: starCount,
      }).then((res) => {
        setBtnLoading(false);
        fetchProductReviews();
        setReview('');
        reviewSheet.current?.close();
      });
    } catch (e) {
      console.log(e);
      setBtnLoading(false);
    }
  };

  const images = productDetail?.images || [];
  const mainImageSrc = images?.[currentSlide]?.src || images?.[0]?.src || '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
      <RBSheet
        ref={reviewSheet}
        height={400}
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
        <View style={{ ...GlobalStyleSheet.container, flex: 1 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ ...FONTS.h5, color: colors.title, marginBottom: 25, textAlign: 'center' }}>Add Review</Text>

            <Stars
              default={0}
              count={5}
              half={false}
              starSize={50}
              update={(val) => {
                setStarCount(val);
              }}
              fullStar={<MaterialCommunityIcons size={35} color={'#fdbf44'} name={'star'} />}
              emptyStar={<MaterialCommunityIcons size={35} color={'#dddddd'} name={'star'} />}
            />
            <Text
              style={{
                ...FONTS.font,
                color: colors.title,
                marginTop: 20,
                marginBottom: 6,
              }}
            >
              Your Review
            </Text>
            <TextInput
              placeholder="Review"
              placeholderTextColor={colors.text}
              multiline={true}
              style={{
                ...FONTS.font,
                color: colors.text,
                borderWidth: 1,
                backgroundColor: colors.background,
                borderColor: colors.borderColor,
                paddingHorizontal: 20,
                paddingVertical: 12,
                textAlignVertical: 'top',
              }}
              value={review}
              onChangeText={(val) => setReview(val)}
              numberOfLines={5}
            />
          </View>
          <CustomButton loading={btnLoading} onPress={addProductReview} color={COLORS.secondary} title={'Submit'} />
        </View>
      </RBSheet>

      <Header leftIcon={'back'} title={'Product Detail'} rightIcon={'cart'} />

      {loading ? (
        <View style={{ padding: 15 }}>
          <ActivityIndicator color={COLORS.primary} size={'large'} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
            <View>
              <Image
                style={{
                  width: '100%',
                  height: undefined,
                  aspectRatio: 1 / 1,
                }}
                source={{ uri: mainImageSrc }}
              />

              {/* Thumbnails */}
              {images.length > 1 && (
                <View
                  style={{
                    flexDirection: 'row',
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                  }}
                >
                  {images.map((data, index) => {
                    return (
                      <TouchableOpacity
                        onPress={() => setCurrentSlide(index)}
                        key={index}
                        style={[
                          {
                            marginRight: 10,
                            borderWidth: 2,
                            borderColor: COLORS.white,
                            backgroundColor: COLORS.white,
                          },
                          currentSlide === index && {
                            borderColor: COLORS.primary,
                          },
                        ]}
                      >
                        <Image
                          style={[
                            {
                              height: 45,
                              width: 45,
                            },
                            currentSlide === index && {
                              opacity: 0.7,
                            },
                          ]}
                          source={{ uri: data.src }}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Availability badge (NEW) */}
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  backgroundColor: isAvailableNow ? '#2ecc71' : (COLORS.danger || '#e74c3c'),
                  borderBottomLeftRadius: 6,
                }}
              >
                <Text style={{ ...FONTS.fontXs, color: COLORS.white }}>
                  {isAvailableNow ? 'Available' : 'Not available'}
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: colors.card,
                paddingHorizontal: 20,
                paddingVertical: 20,
              }}
            >
              <Text style={{ ...FONTS.font, color: colors.textLight, marginBottom: 5 }}>
                {(productDetail.categories || []).map((data, index) => {
                  if (index === (productDetail.categories?.length || 1) - 1) {
                    return data.name;
                  } else {
                    return data.name + ' , ';
                  }
                })}
              </Text>
              <Text
                style={{
                  ...FONTS.h5,
                  ...FONTS.fontTitle,
                  color: colors.title,
                  marginBottom: 12,
                  lineHeight: 26,
                }}
              >
                {productDetail.name}
              </Text>

              {/* Availability window label (NEW) */}
              {windowLabel ? (
                <Text style={{ ...FONTS.fontXs, color: colors.textLight, marginBottom: 8 }}>
                  {`Available ${windowLabel}`}
                </Text>
              ) : null}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                  }}
                >
                  {productDetail.on_sale !== true ? (
                    <Text
                      style={{
                        ...FONTS.h4,
                        color: COLORS.primary,
                      }}
                    >
                      {getPrice(productDetail.price, currency)}
                    </Text>
                  ) : (
                    <>
                      <Text
                        style={{
                          ...FONTS.h4,
                          color: COLORS.primary,
                        }}
                      >
                        {getPrice(productDetail.price, currency)}
                      </Text>
                      {productDetail.regular_price && (
                        <Text
                          style={{
                            ...FONTS.fontSm,
                            textDecorationLine: 'line-through',
                            color: colors.textLight,
                            marginLeft: 8,
                            marginTop: 0,
                          }}
                        >
                          {getPrice(productDetail.regular_price, currency)}
                        </Text>
                      )}
                    </>
                  )}
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <FontAwesome style={{ marginRight: 4 }} size={14} color={'#F28D30'} name="star" />
                  <Text style={{ ...FONTS.fontXs, ...FONTS.fontTitle, color: colors.title }}>
                    {productDetail.average_rating}
                  </Text>
                  <TouchableOpacity style={{ marginLeft: 5 }}>
                    <Text style={{ ...FONTS.fontXs }}>({productDetail.rating_count} Reviews)</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {(productDetail?.attributes || []).map((data, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 25,
                    }}
                  >
                    <Text style={{ ...FONTS.h6, ...FONTS.fontTitle, color: colors.title, width: 65 }}>
                      {data.name}:
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                      }}
                    >
                      {data.name === 'Size' &&
                        data.options.map((item, idx) => {
                          return (
                            <TouchableOpacity
                              onPress={() => setActiveSize(item)}
                              key={idx}
                              style={[
                                {
                                  height: 30,
                                  width: 30,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderWidth: 1,
                                  borderColor: colors.borderColor,
                                  marginHorizontal: 4,
                                },
                                activeSize === item && {
                                  backgroundColor: COLORS.secondary,
                                  borderColor: COLORS.secondary,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  { ...FONTS.font, ...FONTS.fontTitle, color: colors.title },
                                  activeSize === item && { color: COLORS.white },
                                ]}
                              >
                                {item}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}

                      {data.name === 'Color' &&
                        data.options.map((item, idx) => {
                          return (
                            <TouchableOpacity
                              onPress={() => setActiveColor(item)}
                              key={idx}
                              style={[
                                {
                                  height: 30,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  paddingHorizontal: 10,
                                  borderWidth: 1,
                                  borderColor: colors.borderColor,
                                  marginHorizontal: 4,
                                },
                                activeColor === item && {
                                  backgroundColor: COLORS.secondary,
                                  borderColor: COLORS.secondary,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  { ...FONTS.font, ...FONTS.fontTitle, color: colors.title },
                                  activeColor === item && { color: COLORS.white },
                                ]}
                              >
                                {item}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                  </View>
                );
              })}

              <View
                style={{
                  paddingTop: 20,
                  marginTop: 10,
                  borderTopWidth: 1,
                  borderColor: colors.borderColor,
                }}
              >
                <Text style={{ ...FONTS.h6, ...FONTS.fontTitle, color: colors.title }}>Description:</Text>
                <HTMLView
                  value={productDetail.description}
                  stylesheet={{
                    p: {
                      ...FONTS.font,
                      color: colors.text,
                      marginBottom: -70,
                    },
                  }}
                />
              </View>

              <View
                style={{
                  paddingTop: 20,
                  marginTop: 10,
                  borderTopWidth: 1,
                  borderColor: colors.borderColor,
                }}
              >
                <Text style={{ ...FONTS.h6, ...FONTS.fontTitle, color: colors.title }}>Reviews:</Text>

                <TouchableOpacity
                  onPress={() => (login ? reviewSheet.current.open() : navigation.navigate('SignIn'))}
                  style={{
                    paddingHorizontal: 15,
                    paddingVertical: 15,
                    backgroundColor: colors.background,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 15,
                    borderRadius: 6,
                  }}
                >
                  <FeatherIcon color={colors.textLight} size={18} name="message-circle" />
                  <Text style={{ ...FONTS.font, ...FONTS.font, color: colors.title, marginLeft: 8 }}>Add Review</Text>
                </TouchableOpacity>

                <View style={{ marginTop: 5 }}>
                  {reviewData.length === 0 ? (
                    <Text style={{ ...FONTS.font, color: colors.text, marginTop: 10 }}>No Reviews yet</Text>
                  ) : (
                    <View style={{ marginTop: 10 }}>
                      {reviewData.map((data, index) => {
                        const rating = [];
                        for (let i = 1; i <= data.rating; i++) rating.push(i);
                        const reviewDate = new Date(data.date_created);

                        return (
                          <View
                            key={index}
                            style={{
                              flexDirection: 'row',
                              paddingVertical: 15,
                            }}
                          >
                            <Image
                              style={{
                                height: 40,
                                width: 40,
                                borderRadius: 40,
                                marginRight: 12,
                              }}
                              source={{ uri: data.reviewer_avatar_urls['24'] }}
                            />
                            <View style={{ flex: 1 }}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  paddingVertical: 8,
                                  marginBottom: 2,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 16,
                                    ...FONTS.fontTitle,
                                    color: colors.title,
                                    flex: 1,
                                  }}
                                >
                                  {data.reviewer}
                                </Text>
                                <View style={{ flexDirection: 'row' }}>
                                  {rating.map((r, i) => (
                                    <FontAwesome key={i} name="star" color={'#F28D30'} size={14} />
                                  ))}
                                  {[1, 2, 3, 4, 5].slice(data.rating).map((r, i) => (
                                    <FontAwesome key={i} name="star-o" color={'#F28D30'} size={14} />
                                  ))}
                                </View>
                              </View>
                              <HTMLView
                                value={data.review}
                                stylesheet={{
                                  p: {
                                    ...FONTS.font,
                                    color: colors.text,
                                    marginBottom: -80,
                                  },
                                }}
                              />
                              <Text
                                style={{
                                  ...FONTS.fontSm,
                                  color: colors.textLight,
                                  marginTop: 10,
                                }}
                              >
                                {reviewDate.toLocaleDateString('en-US')}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 15,
              paddingVertical: 10,
              borderTopWidth: 1,
              borderTopColor: colors.borderColor,
              backgroundColor: colors.card,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ ...FONTS.font, color: colors.textLight, marginBottom: 2 }}>Price</Text>
              <Text style={{ ...FONTS.h3, lineHeight: 30, color: COLORS.primary }}>
                {getPrice(productDetail.price, currency)}
              </Text>
            </View>

            {inCart ? (
              <CustomButton
                onPress={handleRemoveFromCart}
                color={COLORS.danger || '#e74c3c'}
                title="Remove from Cart"
                style={{ paddingHorizontal: 28 }}
              />
            ) : isAvailableNow ? (
              <CustomButton
                onPress={handleAddToCart}
                color={COLORS.secondary}
                title="Add to Cart"
                style={{ paddingHorizontal: 40 }}
              />
            ) : (
              // Hide Add to Cart when not available — show info pill instead
              // <View
              //   style={{
              //     paddingHorizontal: 16,
              //     paddingVertical: 10,
              //     backgroundColor: colors.background,
              //     borderRadius: 8,
              //     borderWidth: 1,
              //     borderColor: colors.borderColor,
              //   }}
              // >
              //   <Text style={{ ...FONTS.fontSm, color: colors.text }}>
              //     {windowLabel ? `Not available now. Order hours: ${windowLabel}` : 'Not available right now.'}
              //   </Text>
              // </View>
              <></>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const mapStateToProps = (state) => {
  return {
    currency: state.currency,
    taxList: state.tax,
    wishlist: state.wishlist,
    cart: state.cart,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addToCart: (item) => dispatch(addToCart(item)),
    addToWishlist: (item, userToken) => dispatch(addToWishlist(item, userToken)),
    removeFromCart: (productId) => dispatch(removeFromCart(productId)),
    removeFromWishlist: (productId, wishlistId, userToken) =>
      dispatch(removeFromWishlist(productId, wishlistId, userToken)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetail);
