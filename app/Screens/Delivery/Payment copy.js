import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Collapsible from 'react-native-collapsible';
import { COLORS, FONTS } from '../../constants/theme';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CustomButton from '../../components/CustomButton';
import { useTheme } from '@react-navigation/native';
import { connect, useSelector } from 'react-redux';
import AddressCard from '../../components/AddressCard';
import Divider from '../../components/Dividers/Divider';
import { getPrice } from '../../helper/common';
import { clearAllCart } from '../../redux/actions/cartActions';
import { WooCommerce } from '../../api/Woocommerce';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from '../../api/config';
// ⬇️ NEW: local Stripe Form
import StripeCardForm from './StripeForm';


const Payment = ({ address, cartItems, currency, clearAllCart, navigation }) => {

  const theme = useTheme();
  const { colors } = theme;
const [stripesk, setStripeSK] = useState('');
  const { userData } = useSelector((state) => state.auth);

  const [amountOption, setAmountOption] = useState(true);
  const [paymentOption, setPaymentOption] = useState(false);

  // ⬇️ PRE-SET TWO OPTIONS: COD + STRIPE
  const [paymentData, setPaymentData] = useState([
    {
      id: 'cod',
      method_title: 'Cash on delivery',
      description: 'Pay with cash upon delivery.',
      enabled: true,
    },
    {
      id: 'stripe',
      method_title: 'Stripe',
      description: 'Pay securely with your card (test mode). Use 4242 4242 4242 4242.',
      enabled: true,
    },
  ]);
useEffect(() => {
  let cancelled = false;
  // 3) Run your async work
  const run = async () => {
    try {
   const stripekey =  await AsyncStorage.getItem('stripe_pk');
   setStripeSK(stripekey);
      if (cancelled) return;
      // setState(...) or any post-fetch logic
    } catch (err) {
      // handle/log error
      console.warn('fetchFirebaseDataAfterLogin failed:', err);
    }
  };

  run();

  // 4) Cleanup
  return () => {
    cancelled = true;
  };
}, []);

  const [orderCreate, setOrderCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState('');
  const [paymentMethod, setPaymentMethod] = useState({ method: 'cod', title: 'Cash on delivery' });

  // Stripe form ref to trigger tokenization from parent "Pay now" button
  const stripeRef = useRef/** @type {React.MutableRefObject<StripeCardFormHandle | null>} */(null);

  // ===== Totals =====
  const calculateSubtotal = (cartArray) => {
    let subtotal = 0;
    for (const item of cartArray) {
      subtotal += JSON.parse(item.subtotal);
    }
    return subtotal;
  };
  const caalculateTotalPrice = (cartArray) => {
    let total = 0;
    for (const item of cartArray) {
      total += JSON.parse(item.total);
    }
    return total;
  };
  const caalculateTax = (cartArray) => {
    let tax = 0;
    for (const item of cartArray) {
      tax += JSON.parse(item.tax);
    }
    return tax;
  };
  const subtotal = calculateSubtotal(cartItems);
  const totalPrice = caalculateTotalPrice(cartItems);
  const taxRate = caalculateTax(cartItems);

  // ===== (Commented out) Remote gateways fetch =====
  // const getPaymentGateways = async () => {
  //   try{
  //     WooCommerce.get('/payment_gateways').then((res) => {
  //       setPaymentData(res.data);
  //       console.log("res:",res.data);
  //     })
  //   }catch(e){
  //     console.log(e);
  //   }
  // }

  // useEffect(() => {
  //   getPaymentGateways();
  // }, [])

  // ===== createOrder (with optional status + set_paid override) =====
  const createOrder = async ({ overrideStatus, overrideSetPaid } = {}) => {
    try {
      setLoading(true);

      const line_items = cartItems.map((ci) => {
        const out = {
          product_id: ci.product_id,
          quantity: Number(ci.quantity || 1),
        };
        if (ci.variation_id) out.variation_id = ci.variation_id;
        if (ci.subtotal != null) out.subtotal = String(ci.subtotal);
        if (ci.total != null) out.total = String(ci.total ?? ci.subtotal);
        return out;
      });
      const orderPayload = {
        payment_method: paymentMethod.method,
        payment_method_title: paymentMethod.title,

        // Defaults (can be overridden below)
        set_paid: true,
        status: undefined, // let Woo decide unless overridden

        customer_id: userData.id,
        billing: {
          first_name: address.first_name,
          last_name: address.last_name,
          address_1: address.address_1,
          city: address.city,
          state: address.state,
          postcode: address.postcode,
          country: address.country,
          email: address.email,
          phone: address.phone,
        },
        shipping: {
          first_name: address.first_name,
          last_name: address.last_name,
          address_1: address.address_1,
          city: address.city,
          state: address.state,
          postcode: address.postcode,
          country: address.country,
        },
        line_items,
      };

      // Apply overrides for Stripe results / COD logic
      if (typeof overrideSetPaid === 'boolean') orderPayload.set_paid = overrideSetPaid;
      if (overrideStatus) orderPayload.status = overrideStatus;

      const res = await WooCommerce.post('/orders', orderPayload);

      setOrderData(res.data);
      setOrderCreate(true);
      clearAllCart();
    } catch (error) {
      console.error('Error creating order:', error?.response?.data || error.message);
      Alert.alert('Order Error', 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== Pay Now handler =====
  const onPayNow = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart is empty', 'Please add items before paying.');
      return;
    }

    if (paymentMethod.method === 'cod') {
      // COD → normal order (paid immediately)
      await createOrder({ overrideStatus: undefined, overrideSetPaid: true});
      return;
    }

    if (paymentMethod.method === 'stripe') {
      // Ask the Stripe form to tokenize. If token created → treat as success (demo).
      if (!stripeRef.current) {
        Alert.alert('Stripe', 'Card form not ready. Please try again.');
        return;
      }
      setLoading(true);
      try {
        const { ok, token, errorMessage } = await stripeRef.current.submit(); // tokenization
        if (ok && token) {
          // Treat as payment success (TEST MODE DEMO)
          console.log("stripe token",token);
          await createOrder({ overrideStatus: 'processing', overrideSetPaid: true});
 const pi = await stripeRef.paymentIntents.create({
  amount: 12345,
  currency: 'usd',
  payment_method_data: { type: 'card', card: { token: token } },
  confirm: true
});
        } else {
          // Treat as payment failed
          await createOrder({ overrideStatus: 'failed', overrideSetPaid: false });
          Alert.alert('Stripe Payment Failed', errorMessage || 'Tokenization failed.');
        }
      } catch (e) {
        console.log('Stripe submit error:', e);
        await createOrder({ overrideStatus: 'failed', overrideSetPaid: false });
        Alert.alert('Stripe Error', 'Unexpected error while processing card.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      {loading && (
        <View
          style={{
            position: 'absolute',
            zIndex: 1,
            height: '100%',
            width: '100%',
            backgroundColor: 'rgba(0,0,0,.3)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color={COLORS.white} size={'large'} />
        </View>
      )}

      {orderCreate ? (
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: colors.card,
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 30,
            }}
          >
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
                marginTop: 10,
              }}
            >
              <View
                style={{
                  height: 80,
                  width: 80,
                  opacity: 0.2,
                  backgroundColor: COLORS.success,
                  borderRadius: 80,
                }}
              />
              <View
                style={{
                  height: 65,
                  width: 65,
                  backgroundColor: COLORS.success,
                  borderRadius: 65,
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FeatherIcon size={32} color={COLORS.white} name="check" />
              </View>
            </View>
            <Text
              style={{
                ...FONTS.h4,
                textAlign: 'center',
                color: colors.title,
                marginBottom: 10,
              }}
            >
              Thank you for the order
            </Text>
            <Text
              style={{
                ...FONTS.font,
                color: colors.text,
                marginBottom: 2,
              }}
            >
              Your Order number is {orderData?.id}.
            </Text>
            <Text
              style={{
                textAlign: 'center',
                ...FONTS.font,
                color: colors.text,
              }}
            >
              We've sent a confirmation email to {orderData?.email} with order details and a link to track it's
              progress.
            </Text>
            <View
              style={{
                paddingHorizontal: 15,
                paddingBottom: 30,
                marginTop: 30,
                width: '100%',
              }}
            >
              <View style={{ marginBottom: 10 }}>
                <CustomButton
                  onPress={() => navigation.navigate('DrawerNavigation', { screen: 'Home' })}
                  color={COLORS.secondary}
                  title={'Continue Shopping'}
                />
              </View>
              <View>
                <CustomButton
                  onPress={() => navigation.navigate('OrderDetails', { orderId: orderData.id })}
                  color={COLORS.secondary}
                  outline
                  title={'View Order'}
                />
              </View>
            </View>
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Header titleLeft leftIcon={'back'} title={'Payment'} />

            <View style={{ flex: 1 }}>
              <ScrollView>
                <View style={GlobalStyleSheet.container}>
                  <AddressCard address={address} navigation={navigation} />

                  {/* Amount Payable */}
                  <View
                    style={{
                      backgroundColor: colors.card,
                      ...GlobalStyleSheet.shadow,
                      marginTop: 20,
                    }}
                  >
                    <TouchableOpacity onPress={() => setAmountOption(!amountOption)} style={[styles.list]}>
                      <Text style={[styles.listTitle, { color: colors.title }]}>Amount Payable</Text>
                      <Text style={{ ...FONTS.h6, marginRight: 15, color: colors.title }}>
                        {cartItems.length > 0 && getPrice(totalPrice, currency)}
                      </Text>
                      <FeatherIcon
                        color={colors.textLight}
                        name={amountOption ? 'chevron-down' : 'chevron-up'}
                        size={22}
                      />
                    </TouchableOpacity>

                    <Collapsible collapsed={amountOption}>
                      <View style={{ paddingHorizontal: 15, paddingBottom: 10 }}>
                        {cartItems.length > 0 &&
                          cartItems.map((data, index) => {
                            return (
                              <View
                                key={index}
                                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, marginTop: 6 }}
                              >
                                <Text numberOfLines={1} style={{ ...FONTS.font, color: colors.text, flex: 1 }}>
                                  {data.name}
                                </Text>
                                <Text
                                  style={{
                                    marginHorizontal: 25,
                                    ...FONTS.font,
                                    color: colors.text,
                                  }}
                                >
                                  {data.quantity}x
                                </Text>
                                <Text style={{ ...FONTS.font, ...FONTS.fontTitle, color: colors.title }}>
                                  {getPrice(data.subtotal, currency)}
                                </Text>
                              </View>
                            );
                          })}

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, marginTop: 12 }}>
                          <Text style={{ ...FONTS.font, ...FONTS.fontTitle, color: colors.text }}>Subtotal : </Text>
                          <Text style={{ ...FONTS.font, ...FONTS.fontBold, color: colors.title }}>
                            {getPrice(subtotal, currency)}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text style={{ ...FONTS.font, ...FONTS.fontTitle, color: colors.text }}>Tax : </Text>
                          <Text style={{ ...FONTS.font, ...FONTS.fontBold, color: colors.title }}>
                            {getPrice(taxRate, currency)}
                          </Text>
                        </View>
                        <Divider dashed color={colors.borderColor} style={{ marginBottom: 0, marginTop: 0 }} />
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 10,
                            marginTop: 5,
                            alignItems: 'center',
                            paddingTop: 8,
                          }}
                        >
                          <Text style={{ ...FONTS.font, ...FONTS.fontTitle, color: colors.text }}>Total : </Text>
                          <Text style={{ ...FONTS.h4, color: COLORS.primary }}>{getPrice(totalPrice, currency)}</Text>
                        </View>
                      </View>
                    </Collapsible>
                  </View>

                  {/* Payment Option */}
                  <View
                    style={{
                      backgroundColor: colors.card,
                      ...GlobalStyleSheet.shadow,
                      marginTop: 10,
                    }}
                  >
                    <TouchableOpacity onPress={() => setPaymentOption(!paymentOption)} style={[styles.list]}>
                      <Text style={[styles.listTitle, { color: colors.title }]}>Payment Option</Text>
                      <FeatherIcon
                        color={colors.textLight}
                        name={paymentOption ? 'chevron-down' : 'chevron-up'}
                        size={22}
                      />
                    </TouchableOpacity>
                    <Collapsible collapsed={paymentOption}>
                      <View style={{ paddingHorizontal: 15 }}>
                        {paymentData
                          .filter((p) => p.enabled)
                          .map((data, index) => {
                            const active = data.id === paymentMethod.method;
                            return (
                              <View key={index}>
                                <TouchableOpacity
                                  onPress={() => setPaymentMethod({ method: data.id, title: data.method_title })}
                                  style={{
                                    flexDirection: 'row',
                                    marginBottom: 15,
                                  }}
                                >
                                  <View
                                    style={[
                                      styles.listRadio,
                                      {
                                        borderColor: colors.text,
                                        marginTop: 4,
                                      },
                                    ]}
                                  >
                                    {active && <View style={styles.listRadioCircle} />}
                                  </View>
                                  <View style={{ flex: 1 }}>
                                    <Text style={{ ...FONTS.font, color: colors.title, marginBottom: 4 }}>{data.method_title}</Text>
                                    <Collapsible collapsed={!active}>
                                      <Text
                                        style={{
                                          ...FONTS.fontXs,
                                          color: colors.textLight,
                                        }}
                                      >
                                        {data.description}
                                      </Text>
                                    </Collapsible>
                                  </View>
                                </TouchableOpacity>

                                {/* Show the Stripe form inline when Stripe is selected */}
                                {data.id === 'stripe' && active && (
                                  <View style={{ marginLeft: 30, marginBottom: 10 }}>
                                    <StripeCardForm
                                      ref={stripeRef}
                                      publishableKey={stripesk}
                                    />
                                  </View>
                                )} 
                              </View>
                            );
                          })} 
                      </View>
                    </Collapsible>
                  </View>
                </View>
              </ScrollView>
            </View>

            {/* Footer: Pay now */}
            <View
              style={[
                GlobalStyleSheet.container,
                {
                  borderTopWidth: 1,
                  borderColor: colors.borderColor,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View style={{ width: 120 }}>
                  <Text style={{ ...FONTS.h5, color: colors.title }}>{getPrice(totalPrice, currency)}</Text>
                  <TouchableOpacity onPress={() => setAmountOption(false)}>
                    <Text style={{ ...FONTS.font, color: COLORS.primary, lineHeight: 16 }}>View Details</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <CustomButton onPress={onPayNow} title={'Pay now'} color={COLORS.secondary} />
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  stepItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIcon: {
    height: 30,
    width: 30,
    borderRadius: 35,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary2,
  },
  list: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
  },
  listImg: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    marginRight: 12,
  },
  listTitle: {
    ...FONTS.h6,
    ...FONTS.fontTitle,
    flex: 1,
  },
  detailList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  payList: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  listRadio: {
    height: 15,
    width: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRadioCircle: {
    height: 8,
    width: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
});

const mapStateToProps = (state) => {
  return {
    cartItems: state.cart.items,
    address: state.address.selectedAddress,
    currency: state.currency, 
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    clearAllCart: () => dispatch(clearAllCart()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Payment);
