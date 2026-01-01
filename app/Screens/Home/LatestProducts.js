import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import ProductCard from '../../components/ProductCard';
import { useSelector, useDispatch } from 'react-redux';
import { WooCommerce } from '../../api/Woocommerce';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { addToCart as addToCartAction, removeFromCart as removeFromCartAction } from '../../redux/actions/cartActions';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const LatestProducts = ({ currency, colors, wishlist, removeFromWishlist, addToWishlist }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();                         // ← get dispatch
  const { userData } = useSelector((state) => state.auth);

  const [items, setItems] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // expose addToCart to pass into ProductCard
  const cartItems = useSelector((state) => state.cart.items); // to know if inCart

  const addToCart = (product) => dispatch(addToCartAction(product));
  const removeFromCart = (productId) => dispatch(removeFromCartAction(productId));
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await WooCommerce.get('/products');
        setItems(response.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const itemLoad = [0, 1, 2, 3, 4, 5];

  return (
   <View style={GlobalStyleSheet.row}>
      {loading ? /* skeletons */ null : items.map((data) => {
        const isWishlist = wishlist.items.findIndex((x) => x.id == data.id);
        const inCart = cartItems?.some(ci => ci.product_id === data.id); // simple check
        return (
          <View key={data.id} style={[GlobalStyleSheet.col50, { marginBottom: 15 }]}>
            <ProductCard
              onPress={() => navigation.navigate('ProductDetail', { productId: data.id })}
              id={data.id}
              category={data?.categories?.[0]?.name || ''}
              image={data?.images?.[0]?.src || ''}
              title={data.name}
              price={data.price}
              currency={currency}
            //   offer={offer}
              oldPrice={data.regular_price}
              onSale={data.on_sale}
              addToWishlist={addToWishlist}
              removeFromWishlist={removeFromWishlist}
              rating={data.average_rating}
              reviews={data.rating_count}
              isWishlist={isWishlist}
              wishlistId={wishlist.id}
              userToken={userData.token}
              type={data.type}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              inCart={inCart}
            />
          </View>
        );
      })}
    </View>
  );
};

export default LatestProducts;
