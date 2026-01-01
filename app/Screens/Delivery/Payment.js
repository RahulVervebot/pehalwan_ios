import React, { useEffect, useRef, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Collapsible from 'react-native-collapsible';
import { useTheme } from '@react-navigation/native';
import { connect, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CustomButton from '../../components/CustomButton';
import AddressCard from '../../components/AddressCard';
import Divider from '../../components/Dividers/Divider';
import { getPrice } from '../../helper/common';
import { COLORS, FONTS } from '../../constants/theme';
import { clearAllCart } from '../../redux/actions/cartActions';
import { WooCommerce } from '../../api/Woocommerce';
import { baseURL } from '../../api/config';

// Stripe RN SDK (initialized on this screen)
import { handleNextAction, initStripe } from '@stripe/stripe-react-native';

// Card form (no provider inside)
import StripeCardForm from './StripeForm';

const Payment = ({ address, cartItems, currency, clearAllCart, navigation }) => {
    const { colors } = useTheme();
    const { userData } = useSelector((state) => state.auth);

    const [publishableKey, setPublishableKey] = useState('');
    const [amountOption, setAmountOption] = useState(true);
    const [paymentOption, setPaymentOption] = useState(false);
    const [orderCreate, setOrderCreate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState({ method: 'cod', title: 'Cash on delivery' });
    const [isPaying, setIsPaying] = useState(false);

    const [paymentData] = useState([
        { id: 'cod', method_title: 'Cash on delivery', description: 'Pay with cash upon delivery.', enabled: true },
        { id: 'stripe', method_title: 'Stripe', description: 'Use 4242 4242 4242 4242 in test mode.', enabled: true },
    ]);

    const stripeRef = useRef(null);

    // Totals from cart
    const subtotal = cartItems.reduce((s, i) => s + JSON.parse(i.subtotal), 0);
    const totalPrice = cartItems.reduce((s, i) => s + JSON.parse(i.total), 0);
    const taxRate = cartItems.reduce((s, i) => s + JSON.parse(i.tax), 0);

    const toMinor = (amt) => Math.round(Number(amt) * 100);
    const currencyCode = (currency?.code || 'usd').toLowerCase();

    // REWARD: state
    const [rewardPoints, setRewardPoints] = useState(0);
    const [discountPer100, setDiscountPer100] = useState(0);
    const [rewardDiscount, setRewardDiscount] = useState(0);
    const [redeemedPoints, setRedeemedPoints] = useState(0); // ✅ how many points user actually uses
    const [rewardLoading, setRewardLoading] = useState(false);

    // Max redeemable points (multiples of 100)
    const maxRedeemablePoints = Math.floor(rewardPoints / 100) * 100;
    const theoreticalDiscount = (maxRedeemablePoints / 100) * discountPer100;
    const maxRewardDiscount = Math.min(theoreticalDiscount, totalPrice);

    // Amount user will pay after applying reward discount
    const payableTotal = Math.max(0, totalPrice - rewardDiscount);

    // Load pk and init Stripe SDK here
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const pk = await AsyncStorage.getItem('stripe_pk'); // pk_test_...
                if (!cancelled) {
                    setPublishableKey(pk || '');
                    if (pk) await initStripe({ publishableKey: pk });
                }
            } catch (e) {
                console.warn('Stripe init failed:', e);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // REWARD: fetch reward points from API
    useEffect(() => {
        let cancelled = false;

        const fetchRewards = async () => {
            if (!userData?.id) return;
            try {
                setRewardLoading(true);
                const res = await WooCommerce.get('/rewards/v1/points');
                if (cancelled) return;
                const pts = res?.data?.points ?? 0;
                const discPer100 = res?.data?.discount_per_100 ?? 0;
                setRewardPoints(Number(pts));
                setDiscountPer100(Number(discPer100));
            } catch (err) {
                console.log('Error fetching rewards:', err?.response?.data || err.message);
            } finally {
                if (!cancelled) setRewardLoading(false);
            }
        };

        fetchRewards();
        return () => { cancelled = true; };
    }, [userData?.id]);

    // REWARD: apply max possible discount (multiples of 100)
    const onApplyReward = () => {
        if (maxRedeemablePoints < 100 || maxRewardDiscount <= 0) {
            Alert.alert('Not enough points', 'You need at least 100 points (in multiples of 100) to redeem.');
            return;
        }
        setRewardDiscount(maxRewardDiscount);
        setRedeemedPoints(maxRedeemablePoints); // ✅ store how many points we’re using
        Alert.alert(
            'Reward Applied',
            `You are using ${maxRedeemablePoints} points for a discount of ${getPrice(maxRewardDiscount, currency)}.`
        );
    };

    // REWARD: remove discount & points usage
    const onRemoveReward = () => {
        setRewardDiscount(0);
        setRedeemedPoints(0);
    };

    // Create Woo order (default set_paid: false)
    // ✅ now returns created order data (or null)
    const createOrder = async ({ overrideStatus, overrideSetPaid } = {}) => {
        try {
            setLoading(true);

            const line_items = cartItems.map((ci) => {
                const out = { product_id: ci.product_id, quantity: Number(ci.quantity || 1) };
                if (ci.variation_id) out.variation_id = ci.variation_id;
                if (ci.subtotal != null) out.subtotal = String(ci.subtotal);
                if (ci.total != null) out.total = String(ci.total ?? ci.subtotal);
                return out;
            });

            const orderPayload = {
                payment_method: paymentMethod.method,
                payment_method_title: paymentMethod.title,
                set_paid: false,
                status: undefined,
                customer_id: userData?.id,
                billing: {
                    first_name: address?.first_name,
                    last_name: address?.last_name,
                    address_1: address?.address_1,
                    city: address?.city,
                    state: address?.state,
                    postcode: address?.postcode,
                    country: address?.country,
                    email: address?.email,
                    phone: address?.phone,
                },
                shipping: {
                    first_name: address?.first_name,
                    last_name: address?.last_name,
                    address_1: address?.address_1,
                    city: address?.city,
                    state: address?.state,
                    postcode: address?.postcode,
                    country: address?.country,
                },
                line_items,
            };

            // REWARD: add negative fee so Woo total matches discount
            if (rewardDiscount > 0) {
                orderPayload.fee_lines = [
                    {
                        name: 'Reward Discount',
                        total: (-rewardDiscount).toFixed(2),
                    },
                ];
            }

            if (typeof overrideSetPaid === 'boolean') orderPayload.set_paid = overrideSetPaid;
            if (overrideStatus) orderPayload.status = overrideStatus;

            const res = await WooCommerce.post('/orders', orderPayload);
            setOrderData(res.data);
            setOrderCreate(true);
            clearAllCart();
            return res.data; // ✅ important
        } catch (error) {
            console.error('Error creating order:', error?.response?.data || error.message);
            Alert.alert('Order Error', 'Failed to create order. Please try again.');
            return null; // ✅ so caller can know it failed
        } finally {
            setLoading(false);
        }
    };

    // ✅ REWARD: POST API to deduct redeemed points after successful order
    const redeemRewardPointsOnServer = async () => {
        try {
            if (!redeemedPoints || redeemedPoints < 100) return;

            await WooCommerce.post('/rewards/v1/points', {
                points: redeemedPoints,
            });

            // Update local state (optional but nice)
            setRewardPoints((prev) => Math.max(0, prev - redeemedPoints));
            setRedeemedPoints(0);
        } catch (err) {
            console.log('Error redeeming points on server:', err?.response?.data || err.message);
            // We usually don't want to fail the whole order UI here.
        }
    };

    // Confirm the PI again on server (used after 3DS if requires_confirmation)
    const confirmPIOnServer = async (paymentIntentId) => {
        const resp = await fetch(`${baseURL}myapp/v1/stripe/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_intent_id: paymentIntentId }),
        });
        const result = await resp.json();
        console.log("confirmPIOnServer:",result);
        return { ok: resp.ok, result };
    };

    const onPayNow = async () => {
        if (isPaying) return;
        setIsPaying(true);

        try {
            if (cartItems.length === 0) {
                Alert.alert('Cart is empty', 'Please add items before paying.');
                return;
            }

            // COD FLOW
            if (paymentMethod.method === 'cod') {
                const order = await createOrder({ overrideStatus: undefined, overrideSetPaid: true });
                if (order) {
                    await redeemRewardPointsOnServer(); // ✅ only after success
                }
                return;
            }

            // STRIPE FLOW
            if (paymentMethod.method === 'stripe') {
                if (!stripeRef.current) {
                    Alert.alert('Stripe', 'Card form not ready. Please try again.');
                    return;
                }
                if (!publishableKey) {
                    Alert.alert('Stripe', 'Publishable key missing.');
                    return;
                }

                setLoading(true);

                // 1) Tokenize card
                const { ok, token, errorMessage } = await stripeRef.current.submit();
                if (!ok || !token) {
                    await createOrder({ overrideStatus: 'failed', overrideSetPaid: false });
                    Alert.alert('Stripe Payment Failed', errorMessage || 'Tokenization failed.');
                    console.log("ok:",errorMessage);
                    return;
                }

                // 2) Create+confirm PI on server (using discounted total)
                const amountMinor = toMinor(payableTotal);
                const createResp = await fetch(`${baseURL}myapp/v1/stripe/charge`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token, amount: amountMinor, currency: currencyCode,
                        billing: {
                            name: `${address?.first_name || ''} ${address?.last_name || ''}`.trim(),
                            email: address?.email || undefined,
                            phone: address?.phone || undefined,
                            address: {
                                line1: address?.address_1 || '',
                                line2: address?.address_2 || undefined,
                                city: address?.city || '',
                                state: address?.state || '',
                                postal_code: address?.postcode || '',
                                country: 'US',
                            },
                        },
                    }),
                });
                const createResult = await createResp.json();
                console.log('PI create result:', createResult);

                // Direct success
                if (createResp.ok && createResult?.status === 'succeeded') {
                    const order = await createOrder({ overrideStatus: 'processing', overrideSetPaid: true });
                    if (order) {
                        await redeemRewardPointsOnServer(); // ✅
                    }
                    return;
                }

                // Requires 3DS / next action
                if (createResp.ok && createResult?.status === 'requires_action' && createResult?.client_secret) {
                    const { error, paymentIntent } = await handleNextAction(createResult.client_secret);
                    if (error) {
                        await createOrder({ overrideStatus: 'failed', overrideSetPaid: false });
                        Alert.alert('Authentication failed', error.message || '3-D Secure not completed.');
                        return;
                    }

                    if (paymentIntent?.status === 'requires_confirmation' && paymentIntent?.id) {
                        const { ok: ok2, result: confirmResult } = await confirmPIOnServer(paymentIntent.id);
                        console.log('PI confirm result:', confirmResult);
                        const order = await createOrder({ overrideStatus: 'processing', overrideSetPaid: true });
                        if (order) {
                            await redeemRewardPointsOnServer(); // ✅
                        }
                        return;
                    }

                    if (paymentIntent?.status === 'succeeded') {
                        const order = await createOrder({ overrideStatus: 'processing', overrideSetPaid: true });
                        if (order) {
                            await redeemRewardPointsOnServer(); // ✅
                        }
                        return;
                    }

                    // Fallback: treat as success but log status
                    const order = await createOrder({ overrideStatus: 'processing', overrideSetPaid: true });
                    if (order) {
                        await redeemRewardPointsOnServer(); // ✅
                    }
                    console.log(`Status: ${paymentIntent?.status || 'unknown'}`);
                    return;
                } else {
                    // Payment failed
                    await createOrder({ overrideStatus: 'failed', overrideSetPaid: false });
                    Alert.alert('Payment failed', `Status: ${createResult?.status || 'unknown'}`);
                    console.log(`Status: ${createResult?.status || 'unknown'}`);
                    return;
                }
            }
        } catch (e) {
            console.log('onPayNow error:', e);
            await createOrder({ overrideStatus: 'failed', overrideSetPaid: false });
            Alert.alert('Error', 'Unexpected error while processing payment.');
        } finally {
            setLoading(false);
            setIsPaying(false);
        }
    };

    return (
        <>
            {loading && (
                <View style={{ position: 'absolute', zIndex: 1, height: '100%', width: '100%', backgroundColor: 'rgba(0,0,0,.3)', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color={COLORS.white} size="large" />
                </View>
            )}

            {orderCreate ? (
                <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 18, marginTop: 10 }}>
                            <View style={{ height: 80, width: 80, opacity: 0.2, backgroundColor: COLORS.success, borderRadius: 80 }} />
                            <View style={{ height: 65, width: 65, backgroundColor: COLORS.success, borderRadius: 65, position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                                <FeatherIcon size={32} color={COLORS.white} name="check" />
                            </View>
                        </View>
                        <Text style={{ ...FONTS.h4, textAlign: 'center', color: colors.title, marginBottom: 10 }}>Thank you for the order</Text>
                        <Text style={{ ...FONTS.font, color: colors.text, marginBottom: 2 }}>Your Order number is {orderData?.id}.</Text>
                        <Text style={{ textAlign: 'center', ...FONTS.font, color: colors.text }}>
                            We've sent a confirmation email to {orderData?.email} with order details and a link to track its progress.
                        </Text>
                        <View style={{ paddingHorizontal: 15, paddingBottom: 30, marginTop: 30, width: '100%' }}>
                            <View style={{ marginBottom: 10 }}>
                                <CustomButton onPress={() => navigation.navigate('DrawerNavigation', { screen: 'Home' })} color={COLORS.secondary} title="Continue Shopping" />
                            </View>
                            <View>
                                <CustomButton onPress={() => navigation.navigate('OrderDetails', { orderId: orderData.id })} color={COLORS.secondary} outline title="View Order" />
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            ) : (
                <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
                    <View style={{ flex: 1, backgroundColor: colors.background }}>
                        <Header titleLeft leftIcon="back" title="Payment" />

                        <View style={{ flex: 1 }}>
                            <ScrollView>
                                <View style={GlobalStyleSheet.container}>

                                    {/* REWARD: Reward points card ABOVE address card */}
                                    <View style={{ backgroundColor: colors.card, ...GlobalStyleSheet.shadow, marginTop: 15, padding: 15 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                            <FeatherIcon name="star" size={20} color={COLORS.primary} />
                                            <Text style={{ marginLeft: 8, ...FONTS.h6, ...FONTS.fontTitle, color: colors.title }}>
                                                Reward Points
                                            </Text>
                                        </View>

                                        {rewardLoading ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <ActivityIndicator size="small" color={COLORS.primary} />
                                                <Text style={{ ...FONTS.font, marginLeft: 8, color: colors.text }}>Loading rewards...</Text>
                                            </View>
                                        ) : (
                                            <>
                                                <Text
                                                    style={{
                                                        ...FONTS.h3,
                                                        fontWeight: '800',
                                                        color: COLORS.primary,
                                                        marginBottom: 4,
                                                    }}
                                                >
                                                    {rewardPoints} pts
                                                </Text>
                                                <Text style={{ ...FONTS.font, color: colors.text }}>
                                                    100 pts = {getPrice(discountPer100, currency)} discount
                                                </Text>

                                                {maxRedeemablePoints >= 100 && maxRewardDiscount > 0 ? (
                                                    <Text style={{ ...FONTS.fontXs, color: colors.textLight, marginTop: 4 }}>
                                                        You can redeem up to{' '}
                                                        <Text style={{ fontWeight: 'bold' }}>{maxRedeemablePoints} pts</Text> for{' '}
                                                        <Text style={{ fontWeight: 'bold' }}>{getPrice(maxRewardDiscount, currency)} OFF</Text> on this order.
                                                    </Text>
                                                ) : (
                                                    <Text style={{ ...FONTS.fontXs, color: colors.textLight, marginTop: 4 }}>
                                                        You need at least <Text style={{ fontWeight: 'bold' }}>100 points</Text> to redeem.
                                                    </Text>
                                                )}

                                                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                                    {rewardDiscount > 0 ? (
                                                        <>
                                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                                <Text style={{ ...FONTS.font, color: COLORS.success }}>
                                                                    Applied: {getPrice(rewardDiscount, currency)} OFF
                                                                </Text>
                                                            </View>
                                                            <TouchableOpacity
                                                                onPress={onRemoveReward}
                                                                style={{
                                                                    paddingHorizontal: 12,
                                                                    paddingVertical: 6,
                                                                    borderRadius: 8,
                                                                    borderWidth: 1,
                                                                    borderColor: colors.borderColor,
                                                                }}
                                                            >
                                                                <Text style={{ ...FONTS.fontXs, ...FONTS.fontTitle, color: colors.text }}>
                                                                    Remove
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </>
                                                    ) : (
                                                        <TouchableOpacity
                                                            disabled={maxRedeemablePoints < 100 || maxRewardDiscount <= 0}
                                                            onPress={onApplyReward}
                                                            style={{
                                                                paddingHorizontal: 16,
                                                                paddingVertical: 8,
                                                                borderRadius: 8,
                                                                backgroundColor:
                                                                    maxRedeemablePoints < 100 || maxRewardDiscount <= 0
                                                                        ? colors.borderColor
                                                                        : COLORS.primary,
                                                            }}
                                                        >
                                                            <Text style={{ ...FONTS.font, ...FONTS.fontTitle, color: COLORS.white }}>
                                                                Redeem Points
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </>
                                        )}
                                    </View>

                                    {/* Address card */}
                                    <AddressCard address={address} navigation={navigation} />

                                    {/* Amount Payable */}
                                    <View style={{ backgroundColor: colors.card, ...GlobalStyleSheet.shadow, marginTop: 20 }}>
                                        <TouchableOpacity onPress={() => setAmountOption(!amountOption)} style={[styles.list]}>
                                            <Text style={[styles.listTitle, { color: colors.title }]}>Amount Payable</Text>
                                            <Text style={{ ...FONTS.h6, marginRight: 15, color: colors.title }}>
                                                {cartItems.length > 0 && getPrice(payableTotal, currency)}
                                            </Text>
                                            <FeatherIcon color={colors.textLight} name={amountOption ? 'chevron-down' : 'chevron-up'} size={22} />
                                        </TouchableOpacity>

                                        <Collapsible collapsed={amountOption}>
                                            <View style={{ paddingHorizontal: 15, paddingBottom: 10 }}>
                                                {cartItems.length > 0 &&
                                                    cartItems.map((data, index) => (
                                                        <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, marginTop: 6 }}>
                                                            <Text numberOfLines={1} style={{ ...FONTS.font, color: colors.text, flex: 1 }}>{data.name}</Text>
                                                            <Text style={{ marginHorizontal: 25, ...FONTS.font, color: colors.text }}>{data.quantity}x</Text>
                                                            <Text style={{ ...FONTS.font, ...FONTS.fontTitle, color: colors.title }}>{getPrice(data.subtotal, currency)}</Text>
                                                        </View>
                                                    ))}

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, marginTop: 12 }}>
                                                    <Text style={{ ...FONTS.font, ...FONTS.fontTitle, color: colors.text }}>Subtotal : </Text>
                                                    <Text style={{ ...FONTS.font, ...FONTS.fontBold, color: colors.title }}>{getPrice(subtotal, currency)}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                                    <Text style={{ ...FONTS.font, ...FONTS.fontTitle, color: colors.text }}>Tax : </Text>
                                                    <Text style={{ ...FONTS.font, ...FONTS.fontBold, color: colors.title }}>{getPrice(taxRate, currency)}</Text>
                                                </View>

                                                {/* REWARD: discount row */}
                                                {rewardDiscount > 0 && (
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                                        <Text style={{ ...FONTS.font, ...FONTS.fontTitle, color: COLORS.success }}>Reward Discount : </Text>
                                                        <Text style={{ ...FONTS.font, ...FONTS.fontBold, color: COLORS.success }}>
                                                            -{getPrice(rewardDiscount, currency)}
                                                        </Text>
                                                    </View>
                                                )}

                                                <Divider dashed color={colors.borderColor} style={{ marginBottom: 0, marginTop: 0 }} />
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, marginTop: 5, alignItems: 'center', paddingTop: 8 }}>
                                                    <Text style={{ ...FONTS.font, ...FONTS.fontTitle, color: colors.text }}>Total : </Text>
                                                    <Text style={{ ...FONTS.h4, color: COLORS.primary }}>{getPrice(payableTotal, currency)}</Text>
                                                </View>
                                            </View>
                                        </Collapsible>
                                    </View>

                                    {/* Payment Option */}
                                    <View style={{ backgroundColor: colors.card, ...GlobalStyleSheet.shadow, marginTop: 10 }}>
                                        <TouchableOpacity onPress={() => setPaymentOption(!paymentOption)} style={[styles.list]}>
                                            <Text style={[styles.listTitle, { color: colors.title }]}>Payment Option</Text>
                                            <FeatherIcon color={colors.textLight} name={paymentOption ? 'chevron-down' : 'chevron-up'} size={22} />
                                        </TouchableOpacity>
                                        <Collapsible collapsed={paymentOption}>
                                            <View style={{ paddingHorizontal: 15 }}>
                                                {paymentData.filter((p) => p.enabled).map((data, index) => {
                                                    const active = data.id === paymentMethod.method;
                                                    return (
                                                        <View key={index}>
                                                            <TouchableOpacity
                                                                onPress={() => setPaymentMethod({ method: data.id, title: data.method_title })}
                                                                style={{ flexDirection: 'row', marginBottom: 15 }}
                                                            >
                                                                <View style={[styles.listRadio, { borderColor: colors.text, marginTop: 4 }]}>
                                                                    {active && <View style={styles.listRadioCircle} />}
                                                                </View>
                                                                <View style={{ flex: 1 }}>
                                                                    <Text style={{ ...FONTS.font, color: colors.title, marginBottom: 4 }}>{data.method_title}</Text>
                                                                    <Collapsible collapsed={!active}>
                                                                        <Text style={{ ...FONTS.fontXs, color: colors.textLight }}>{data.description}</Text>
                                                                    </Collapsible>
                                                                </View>
                                                            </TouchableOpacity>

                                                            {data.id === 'stripe' && active && (
                                                                <View style={{ marginLeft: 30, marginBottom: 10 }}>
                                                                    <StripeCardForm ref={stripeRef} />
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

                        {/* Footer */}
                        <View style={[GlobalStyleSheet.container, { borderTopWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 120 }}>
                                    <Text style={{ ...FONTS.h5, color: colors.title }}>{getPrice(payableTotal, currency)}</Text>
                                    <TouchableOpacity onPress={() => setAmountOption(false)}>
                                        <Text style={{ ...FONTS.font, color: COLORS.primary, lineHeight: 16 }}>View Details</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <CustomButton onPress={onPayNow} title="Pay now" color={COLORS.secondary} />
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
    list: { paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
    listTitle: { ...FONTS.h6, ...FONTS.fontTitle, flex: 1 },
    listRadio: { height: 15, width: 15, borderRadius: 10, borderWidth: 1, marginRight: 15, alignItems: 'center', justifyContent: 'center' },
    listRadioCircle: { height: 8, width: 8, borderRadius: 8, backgroundColor: COLORS.primary },
});

const mapStateToProps = (state) => ({
    cartItems: state.cart.items,
    address: state.address.selectedAddress,
    currency: state.currency,
});
const mapDispatchToProps = (dispatch) => ({ clearAllCart: () => dispatch(clearAllCart()) });
export default connect(mapStateToProps, mapDispatchToProps)(Payment);
