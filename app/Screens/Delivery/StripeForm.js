// screens/Checkout/StripeForm.js
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text } from 'react-native';

let StripeReactNative;
try {
  StripeReactNative = require('@stripe/stripe-react-native');
} catch (e) {
  StripeReactNative = {};
}
const { CardField, useStripe } = StripeReactNative;

const StripeCardForm = forwardRef((props, ref) => {
  if (!useStripe || !CardField) {
    return (
      <View>
        <Text style={{ color: 'red' }}>Stripe native module not found. Reinstall pods / rebuild the app.</Text>
      </View>
    );
  }

  const { createToken } = useStripe();
  const [complete, setComplete] = useState(false);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (!complete) return { ok: false, errorMessage: 'Please complete your card details.' };
      try {
        const { token, error } = await createToken({ type: 'Card' });
        if (error || !token?.id) return { ok: false, errorMessage: error?.message || 'Unable to tokenize card.' };
        return { ok: true, token: token.id }; // tok_...
      } catch {
        return { ok: false, errorMessage: 'Unexpected error while creating token.' };
      }
    },
  }));

  return (
    <View>
      <Text style={{ marginBottom: 8 }}>
        Card (TEST): 4242 4242 4242 4242 • any future expiry • any CVC
      </Text>
      <CardField
        postalCodeEnabled={false}
        autofocus
        cardStyle={{ backgroundColor: '#FFA239', textColor: '#000000' }}
        style={{ width: '100%', height: 50 }}
        onCardChange={(details) => setComplete(details.complete)}
      />
    </View>
  );
});

export default StripeCardForm;
