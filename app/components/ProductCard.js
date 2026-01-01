// ProductCard.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { COLORS, FONTS } from '../constants/theme';
import { getPrice } from '../helper/common';
import { WooCommerce } from '../api/Woocommerce'; // <-- adjust path if needed

const ProductCard = ({
  onPress,
  id,
  image,
  category,
  title,
  price,
  oldPrice,
  isWishlist,
  offer,
  currency,
  onSale,
  rating,
  reviews,
  type,

  // cart actions
  addToCart,
  removeFromCart,
  inCart = false,
}) => {
  const { colors } = useTheme();
  const [isLike] = useState(isWishlist >= 0);

  // NEW: availability state fetched from Woo product endpoint
  const [availability, setAvailability] = useState(null);
  const isAvailableNow = availability?.is_available_now ?? true;
  const windowLabel = availability?.window_label || null;

  // Fetch latest availability whenever product id changes
  useEffect(() => {
    let isActive = true;
    (async () => {
      try {
        if (!id) return;
        const res = await WooCommerce.get(`/products/${id}`);
        if (!isActive) return;
        setAvailability(res?.data?.availability || null);
      } catch (e) {
        // fail-open: if API shape missing, keep as null (treat as available)
        setAvailability((prev) => prev ?? null);
      }
    })();
    return () => {
      isActive = false;
    };
  }, [id]);

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
    if (!isAvailableNow) return; // client guard
    if (typeof addToCart === 'function') addToCart(cartPayload);
  };

  const handleRemove = () => {
    if (typeof removeFromCart === 'function') removeFromCart(id);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress && onPress()}
      style={[styles.productCard, { backgroundColor: colors.card }]}
    >
      <View>
        <Image
          style={{ width: '100%', height: undefined, aspectRatio: 1 / 1 }}
          source={{ uri: image }}
        />

        {/* Existing sale/offer badge (left) */}
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

        {/* NEW: availability badge (right) */}
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
        {!!category && (
          <Text style={{ ...FONTS.fontSm, color: colors.text, marginBottom: 5 }}>{category}</Text>
        )}

        <Text
          numberOfLines={1}
          style={{ ...FONTS.h6, ...FONTS.fontTitle, color: colors.title, fontSize: 14 }}
        >
          {title}
        </Text>

        {/* NEW: show the schedule window */}
        {windowLabel ? (
          <Text style={{ ...FONTS.fontXs, color: colors.textLight, marginTop: 4 }}>
            {`Available ${windowLabel}`}
          </Text>
        ) : null}

        {/* Price row + Add / Remove icons */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
            marginBottom: 2,
            justifyContent: 'space-between',
          }}
        >
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

          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* Remove icon */}
            {inCart ? (
              <TouchableOpacity
                onPress={handleRemove}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                style={[
                  styles.iconBtn,
                  { backgroundColor: inCart ? (COLORS.danger || '#e74c3c') : '#cfcfcf' },
                ]}
                disabled={!inCart}
              >
                <FontAwesome name="trash" size={16} color={COLORS.white} />
              </TouchableOpacity>
            ) : (
              // Add icon: disabled / greyed when not available
              <TouchableOpacity
                onPress={handleAdd}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                style={[
                  styles.iconBtn,
                  { backgroundColor: isAvailableNow ? COLORS.secondary : '#cfcfcf' },
                ]}
                disabled={!isAvailableNow}
              >
                <FontAwesome name="shopping-cart" size={16} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>

      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    shadowColor: 'rgba(0,0,0,.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
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

export default ProductCard;
