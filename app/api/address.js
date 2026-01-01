// address.js
import { WooCommerce } from './Woocommerce';

/**
 * Update WooCommerce customer billing/shipping.
 * Expects addressData keys in snake_case (as you send from AddDeliveryAddress),
 * but also tolerates camelCase via fallbacks.
 */
export const setUserAddress = async (addressData, userId) => {
  try {
    const first_name = addressData.first_name ?? addressData.firstName ?? '';
    const last_name  = addressData.last_name  ?? addressData.lastName  ?? '';
    const address_1  = addressData.address_1  ?? addressData.address   ?? '';
    const postcode   = String(addressData.postcode ?? addressData.pinCode ?? '');
    const country    = addressData.country ?? '';
    const city       = addressData.city ?? '';
    const state      = addressData.state ?? '';
    const phone      = String(addressData.phone ?? addressData.phoneNumber ?? '');
    const email      = addressData.email ?? '';

    const payload = {
      // Optional: keep Woo customer email in sync
      ...(email ? { email } : {}),
      billing: {
        first_name,
        last_name,
        address_1,
        city,
        state,
        postcode,
        country,
        phone,
        ...(email ? { email } : {}),
      },
      shipping: {
        first_name,
        last_name,
        address_1,
        city,
        state,
        postcode,
        country,
      },
    };

    const response = await WooCommerce.put(`/customers/${userId}`, payload);
    return { data: response.data };
  } catch (e) {
    console.log('setUserAddress error:', e?.response?.data || e.message);
    // surface the error to caller so UI can show a Snackbar
    throw e;
  }
};
