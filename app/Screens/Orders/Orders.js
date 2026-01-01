import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SafeAreaView, View, ScrollView, Text, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import OrderCard from '../../components/OrderCard';
import { useSelector } from 'react-redux';
import { WooCommerce } from '../../api/Woocommerce';
import { COLORS , FONTS } from '../../constants/theme';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const Orders = () => {
  const { colors } = useTheme();
  const { userData } = useSelector((state) => state.auth);

  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);        // initial skeleton
  const [loadingItem, setLoadingItem] = useState(false); // footer spinner
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const isFetchingRef = useRef(false); // prevent overlapping fetches

  const fetchOrders = useCallback(async (nextPage = 1) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (nextPage === 1) {
        setLoading(true);
      } else {
        setLoadingItem(true);
      }

      const res = await WooCommerce.get(`/orders?customer=${userData.id}&page=${nextPage}`);

      const rows = Array.isArray(res.data) ? res.data : [];

      // no rows -> no more pages
      if (rows.length === 0) {
        if (nextPage === 1) {
          setOrderData([]); // explicit empty for first page
        }
        setHasMore(false);
      } else {
        // append with functional update + de-dup by id
        setOrderData((prev) => {
          const merged = [...prev, ...rows];
          const seen = new Set();
          return merged.filter((o) => {
            if (seen.has(o.id)) return false;
            seen.add(o.id);
            return true;
          });
        });
      }

      setPage(nextPage);
    } catch (e) {
      console.log('Order fetch error:', e?.response?.data || e.message);
      if (nextPage === 1) setOrderData([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingItem(false);
      isFetchingRef.current = false;
    }
  }, [userData.id]);

  // initial load / reset when screen mounts
  useEffect(() => {
    setOrderData([]);
    setHasMore(true);
    setPage(1);
    fetchOrders(1);
  }, [fetchOrders]);

  const renderLoader = () =>
    loadingItem ? <ActivityIndicator size="large" color={COLORS.primary} /> : null;

  const loadMoreItem = () => {
    if (!loading && !loadingItem && hasMore) {
      fetchOrders(page + 1);
    }
  };

  const orderLoad = [0,1,2,3,4,5];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header titleLeft leftIcon={'back'} title={'Orders'} />

        <View style={{ flex: 1 }}>
          {loading ? (
            <ScrollView>
              <View style={GlobalStyleSheet.container}>
                {orderLoad.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      paddingHorizontal:15,
                      paddingVertical:20,
                      backgroundColor:colors.card,
                      marginBottom:10,
                      ...GlobalStyleSheet.shadow,
                    }}
                  >
                    <View style={{flexDirection:'row'}}>
                      <View style={{flex:1}}>
                        <ShimmerPlaceholder width={100} height={10}/>
                        <ShimmerPlaceholder style={{ marginTop : 10 }} width={150} height={10}/>
                        <ShimmerPlaceholder style={{ marginTop : 10 }} width={120} height={10}/>
                      </View>
                      <ShimmerPlaceholder style={{ marginLeft : 40 }} height={65} width={65}/>
                    </View>
                    <View style={{ marginTop : 20, flexDirection:'row' }}>
                      <ShimmerPlaceholder height={40} width={120}/>
                      <View style={{ flexDirection:'row', flex:1, justifyContent:'flex-end' }}>
                        <ShimmerPlaceholder style={{ marginRight : 40 }} height={18} width={18}/>
                        <ShimmerPlaceholder height={18} width={70} />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : orderData.length === 0 ? (
            <View style={{ alignItems:'center', justifyContent:'center', padding:20 }}>
              <Text style={{ ...FONTS.font, color: colors.title }}>No Orders Found</Text>
            </View>
          ) : (
            <FlatList
              data={orderData}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ paddingTop: 15, paddingBottom: 15 }}
              ListFooterComponent={renderLoader}
              onEndReachedThreshold={0.5}
              onEndReached={loadMoreItem}
              renderItem={({ item }) => {
                const quantity = item.line_items.reduce((sum, li) => sum + (Number(li.quantity) || 0), 0);
                const imgSrc = item?.line_items?.[0]?.image?.src || null;
                return (
                  <View style={{ paddingHorizontal: 15 }}>
                    <OrderCard
                      orderId={item.id}
                      image={imgSrc} // handle null inside OrderCard with a fallback
                      title={item.line_items?.[0]?.name || `Order #${item.id}`}
                      price={item.total}
                      quantity={quantity}
                      size={item.size}
                      status={item.status}
                      dateCreated={item.date_created}
                    />
                  </View>
                );
              }}
            />
          )}
        </View>

        {/* Removed the second orderData.map(...) that caused duplicates */}
      </View>
    </SafeAreaView>
  );
};

export default Orders;
