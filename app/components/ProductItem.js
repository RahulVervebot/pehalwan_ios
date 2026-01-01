// components/ProductItem.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS, FONTS } from '../constants/theme';
import { getPrice } from '../helper/common';
import { WooCommerce } from '../api/Woocommerce';

const ProductItem = ({
  // navigation
  onPress,

  // product basics
  id,
  image,
  title,
  currency,
  type,
  price,
  oldPrice,
  rating,
  reviews,
  onSale,
  offer,

  // wishlist
  isWishlist,
  addToWishlist,
  removeFromWishlist,
  wishlistId,
  userToken,
  handleItemLike,

  // cart
  addToCart,
  removeFromCart,
  inCart = false,
}) => {
  const { colors } = useTheme();

  // Availability fetched from Woo /products/{id}
  const [availability, setAvailability] = useState(null);
  const isAvailableNow = availability?.is_available_now ?? true;
  const windowLabel = availability?.window_label || null;

  // Fetch latest availability when id changes
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await WooCommerce.get(`/products/${id}`);
        if (!alive) return;
        setAvailability(res?.data?.availability || null);
      } catch (e) {
        if (!alive) return;
        setAvailability((prev) => prev ?? null); // fail-open
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // cart payload (kept light for grid)
  const cartPayload = useMemo(
    () => ({
      cart_id: `${id}-${Date.now()}`,
      session_id: '',
      product_id: id,
      variation_id: undefined,
      type,
      name: title,
      image,
      price: String(price ?? ''),
      oldPrice: oldPrice ?? null,
      subtotal: String(price ?? ''),
      tax_class: null,
      taxable: null,
      tax: 0,
      total: Number(price ?? 0),
      quantity: 1,
      date_added: '',
      date_modified: '',
      on_sale: onSale,
    }),
    [id, image, title, price, oldPrice, type, onSale]
  );

  const handleAdd = () => {
    if (!isAvailableNow) return;
    if (typeof addToCart === 'function') addToCart(cartPayload);
  };

  const handleRemove = () => {
    if (typeof removeFromCart === 'function') removeFromCart(id);
  };

  const toggleWishlist = () => {
    if (!userToken) return;
    if (isWishlist >= 0) {
      removeFromWishlist?.(id, wishlistId, userToken);
    } else {
      const item = {
        id,
        price,
        regular_price: oldPrice,
        sale_price: price,
        on_sale: onSale,
        average_rating: rating,
        rating_count: reviews,
        title,
        type,
        image,
      };
      addToWishlist?.(item, userToken);
    }
    handleItemLike?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.card }]}
    >
      <View>
        <Image
          style={{ width: '100%', aspectRatio: 1 }}
          source={{ uri: image }}
        />

        {/* Left badge: offer/sale */}
        {onSale !== false && type !== 'variable' && (
          <View
            style={[
              styles.badgeLeft,
              { backgroundColor: offer === 'sale' ? COLORS.primary : COLORS.secondary },
            ]}
          >
            <Text
              style={[
                { ...FONTS.fontXs, color: COLORS.white },
                offer === 'sale' && { textTransform: 'uppercase' },
              ]}
            >
              {offer}
            </Text>
          </View>
        )}

        {/* Right badge: availability */}
        <View
          style={[
            styles.badgeRight,
            { backgroundColor: isAvailableNow ? '#2ecc71' : (COLORS.danger || '#e74c3c') },
          ]}
        >
          <Text style={{ ...FONTS.fontXs, color: COLORS.white }}>
            {isAvailableNow ? 'Available' : 'Not available'}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
        <Text numberOfLines={2} style={{ ...FONTS.font, ...FONTS.fontTitle, color: colors.title }}>
          {title}
        </Text>

        {/* Schedule window */}
        {windowLabel ? (
          <Text style={{ ...FONTS.fontXs, color: colors.textLight, marginTop: 4 }}>
            {`Available ${windowLabel}`}
          </Text>
        ) : null}

        <View style={styles.row}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...FONTS.h5, color: COLORS.primary }}>
              {getPrice(price, currency)}
            </Text>
            {onSale !== false && oldPrice ? (
              <Text
                style={{
                  ...FONTS.font,
                  color: colors.textLight,
                  textDecorationLine: 'line-through',
                  marginLeft: 6,
                  opacity: 0.7,
                }}
              >
                {getPrice(oldPrice, currency)}
              </Text>
            ) : null}
          </View>

          {/* Right icons: wishlist + cart */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Wishlist */}
            {/* <TouchableOpacity
              onPress={toggleWishlist}
              style={[styles.iconBtn, { backgroundColor: '#eee', marginRight: 8 }]}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <FontAwesome
                name={isWishlist >= 0 ? 'heart' : 'heart-o'}
                size={16}
                color={isWishlist >= 0 ? '#F9427B' : colors.title}
              />
            </TouchableOpacity> */}

            {/* Cart: add/remove */}
            {inCart ? (
              <TouchableOpacity
                onPress={handleRemove}
                style={[styles.iconBtn, { backgroundColor: COLORS.danger || '#e74c3c' }]}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <FontAwesome name="trash" size={16} color={COLORS.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleAdd}
                style={[
                  styles.iconBtn,
                  { backgroundColor: isAvailableNow ? COLORS.secondary : '#cfcfcf' },
                ]}
                disabled={!isAvailableNow}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <Feather name="shopping-cart" size={16} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Subtle note when unavailable */}
        {/* {!isAvailableNow && windowLabel ? (
          <Text style={{ ...FONTS.fontXs, color: colors.textLight, marginTop: 6 }}>
            {`Order hours: ${windowLabel}`}
          </Text>
        ) : null} */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
    shadowColor: 'rgba(0,0,0,.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  row: {
    marginTop: 8,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    height: 34,
    width: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderBottomRightRadius: 6,
  },
  badgeRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderBottomLeftRadius: 6,
  },
});

export default ProductItem;
