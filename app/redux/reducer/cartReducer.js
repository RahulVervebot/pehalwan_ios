import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTaxRate } from "../../helper/common";

const initialState = {
    items: [],
    totalItems: 0,
};
  
const cartReducer = (state = initialState, action) => {

    switch (action.type) {
        case 'ADD_TO_CART':
            const existingProduct = state.items.findIndex((item) => item.product_id === action.payload.product_id);
            
            
            if(existingProduct >= 0){
                const updateCartitems = [...state.items];
                updateCartitems[existingProduct].quantity = updateCartitems[existingProduct].quantity + 1;
                updateCartitems[existingProduct].subtotal = updateCartitems[existingProduct].price * updateCartitems[existingProduct].quantity;
                updateCartitems[existingProduct].tax = action.payload.tax * updateCartitems[existingProduct].quantity;
                updateCartitems[existingProduct].total = 
                    updateCartitems[existingProduct].price * updateCartitems[existingProduct].quantity +  updateCartitems[existingProduct].tax;
                
                AsyncStorage.setItem('cart', JSON.stringify(updateCartitems))
                .then(() => console.log('Cart data saved to local storage'))
                .catch((error) => console.log('Error saving cart data to local storage:', error));
                
                return {
                    ...state,
                    totalItems : state.totalItems + 1
                }
            }else{
                const updatedItems = [...state.items, action.payload];

                AsyncStorage.setItem('cart', JSON.stringify(updatedItems))
                .then(() => console.log('Cart data saved to local storage'))
                .catch((error) => console.log('Error saving cart data to local storage:', error));

                return {
                    ...state,
                    items: updatedItems,
                    totalItems: state.totalItems + 1
                };
            }

        case 'UPDATE_ITEM_QUATITY':

        //console.log(action.payload.tax);

            const newItems = state.items.map((item) => {
                if (item.product_id === action.payload.itemId) {
                    console.log(getTaxRate(item.price,item.tax_class,action.payload.tax,item.tax_status));
                    return { 
                        ...item, 
                        quantity: action.payload.quantity, 
                        subtotal : JSON.stringify(action.payload.quantity * item.price), 
                        tax : action.payload.quantity * getTaxRate(item.price,item.tax_class,action.payload.tax,item.taxable),
                        total : action.payload.quantity * item.price + action.payload.quantity * getTaxRate(item.price,item.tax_class,action.payload.tax,item.taxable),
                    };
                }
                return item;
            });
            const itemIndex = state.items.findIndex((item) => item.product_id === action.payload.itemId);
    
            AsyncStorage.setItem('cart', JSON.stringify(newItems))
                .then(() => console.log('Cart data saved to local storage'))
                .catch((error) => console.log('Error saving cart data to local storage:', error));

            return {
                ...state,
                items: newItems,
                totalItems : state.totalItems - state.items[itemIndex].quantity + action.payload.quantity,
            };

        case 'SET_CART_ITEMS':
            return {
                ...state,
                items: action.payload.items,
                totalItems : action.payload.totalItems,
            };

        case 'REMOVE_TO_CART':
            const removeItems = state.items.findIndex((item) => item.product_id === action.payload);
            const updatedItems = state.items.filter(
                (item) => item.product_id !== action.payload
            );

            AsyncStorage.setItem('cart', JSON.stringify(updatedItems))
                .then(() => console.log('Cart data saved to local storage'))
                .catch((error) => console.log('Error saving cart data to local storage:', error));

            return {
                ...state,
                items: updatedItems,
                totalItems : state.totalItems - state.items[removeItems].quantity,
            };
        
        case 'CLEAR_ALL_CART':
            AsyncStorage.removeItem('cart');
            return {
                ...state,
                items : [],
                totalItems : 0,
            }

        default:
            return state;
    }
};
  
export default cartReducer;