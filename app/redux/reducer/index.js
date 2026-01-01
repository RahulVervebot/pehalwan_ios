import { combineReducers } from 'redux';
import authReducer from './authReducer';
import cartReducer from './cartReducer';
import addressReducer from './addressReducer';
import currencyReducer from './currencyReducer';
import taxReducer from './taxReducer';
import wishlistReducer from './wishlistReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    cart: cartReducer,
    address: addressReducer,
    currency: currencyReducer,
    tax: taxReducer,
    wishlist: wishlistReducer,
});
export default rootReducer;