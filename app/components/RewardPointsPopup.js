import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { WooCommerce } from '../api/Woocommerce'
import { COLORS, FONTS } from '../constants/theme';
import { GlobalStyleSheet } from '../constants/StyleSheet';

const RewardPointsPopup = ({ navigation, colors, containerStyle }) => {
  const [visible, setVisible] = useState(false);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openPopup = async () => {
    setVisible(true);
    if (!points && !loading) {
      await fetchPoints();
    }
  };

  const closePopup = () => {
    setVisible(false);
  };

  const fetchPoints = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      // From our custom plugin: /wp-json/rewards/v1/points
      const res = await WooCommerce.get('/rewards/v1/points');
      const fetchedPoints = res?.data?.points ?? 0;
      setPoints(fetchedPoints);
      console.log("reweard res:",res)
    } catch (err) {
      console.log('Error fetching reward points:', err);
      setErrorMsg('Unable to load reward points. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate max discount using rule: 100 points = 5
  const usablePoints = Math.floor(points / 100) * 100;
  const discountAmount = (usablePoints / 100) * 5;

  return (
    <View style={[{ width: '50%', paddingHorizontal: 5 }, containerStyle]}>
      {/* Button that opens popup */}
      <TouchableOpacity
        onPress={openPopup}
        style={[
          styles.profileBtn,
          { backgroundColor: colors.card, borderColor: COLORS.primary },
        ]}
      >
        <FeatherIcon
          style={{ marginRight: 10 }}
          color={COLORS.primary}
          size={20}
          name={'star'}
        />
        <Text
          style={{
            ...FONTS.font,
            fontSize: 16,
            ...FONTS.fontTitle,
            color: COLORS.primary,
          }}
        >
          Reward Points
        </Text>
      </TouchableOpacity>

      {/* Popup */}
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={closePopup}
      >
        <TouchableWithoutFeedback onPress={closePopup}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalCard,
                  { backgroundColor: colors.card, ...GlobalStyleSheet.shadow },
                ]}
              >
                {/* Gradient header */}
                <LinearGradient
                  colors={[COLORS.primary, '#ff8a00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientHeader}
                >
                  <Text
                    style={{
                      ...FONTS.h3,
                      ...FONTS.fontTitle,
                      color: COLORS.white,
                      fontSize: 20,
                    }}
                  >
                    Pending Reward Points
                  </Text>
                </LinearGradient>

                <View style={{ padding: 20 }}>
                  {loading ? (
                    <View style={styles.centerRow}>
                      <ActivityIndicator />
                      <Text
                        style={{
                          ...FONTS.font,
                          marginLeft: 10,
                          color: colors.text,
                        }}
                      >
                        Loading...
                      </Text>
                    </View>
                  ) : (
                    <>
                      {errorMsg ? (
                        <Text
                          style={{
                            ...FONTS.font,
                            color: 'red',
                            marginBottom: 10,
                          }}
                        >
                          {errorMsg}
                        </Text>
                      ) : (
                        <>
                          {/* Big, bold points */}
                          <Text
                            style={{
                              ...FONTS.h1,
                              fontSize: 40,
                              fontWeight: '800',
                              textAlign: 'center',
                              color: COLORS.primary,
                            }}
                          >
                            {points}
                          </Text>
                          <Text
                            style={{
                              ...FONTS.font,
                              textAlign: 'center',
                              marginTop: 4,
                              color: colors.text,
                            }}
                          >
                            total points available
                          </Text>

                          {/* Highlighted discount info */}
                          <View style={styles.highlightBox}>
                            <Text
                              style={{
                                ...FONTS.font,
                                ...FONTS.fontTitle,
                                fontSize: 16,
                                color: COLORS.white,
                                textAlign: 'center',
                              }}
                            >
                              100 points = ₹5 OFF
                            </Text>
                            {usablePoints >= 100 && (
                              <Text
                                style={{
                                  ...FONTS.font,
                                  fontSize: 14,
                                  marginTop: 4,
                                  color: COLORS.white,
                                  textAlign: 'center',
                                }}
                              >
                                If you redeem now, you can get up to{' '}
                                <Text style={{ fontWeight: 'bold' }}>
                                  ₹{discountAmount.toFixed(2)} OFF
                                </Text>
                                .
                              </Text>
                            )}
                          </View>

                          {usablePoints < 100 && (
                            <Text
                              style={{
                                ...FONTS.font,
                                fontSize: 13,
                                textAlign: 'center',
                                marginTop: 8,
                                color: colors.textLight,
                              }}
                            >
                              You need at least{' '}
                              <Text style={{ fontWeight: 'bold' }}>
                                100 points
                              </Text>{' '}
                              to redeem.
                            </Text>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* Buttons */}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      onPress={closePopup}
                      style={[styles.actionBtn, { backgroundColor: colors.card }]}
                    >
                      <Text
                        style={{
                          ...FONTS.font,
                          ...FONTS.fontTitle,
                          color: colors.text,
                        }}
                      >
                        Close
                      </Text>
                    </TouchableOpacity>
{/* 
                    <TouchableOpacity
                      disabled={usablePoints < 100}
                      onPress={() => {
                        closePopup();
                        navigation.navigate('Reward Points');
                      }}
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor:
                            usablePoints < 100
                              ? colors.border
                              : COLORS.primary,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          ...FONTS.font,
                          ...FONTS.fontTitle,
                          color: COLORS.white,
                        }}
                      >
                        Redeem Now
                      </Text>
                    </TouchableOpacity> */}
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = {
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  gradientHeader: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  highlightBox: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
};

export default RewardPointsPopup;
