import { addToWishlistApi, removeFromWishlistApi } from "../actions/wishlistActions";

const initialState = {
    items: [],
    loading : true
};
  
const wishlistReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_WISHLIST_ITEMS':
            return {
                ...state,
                items: action.payload.items,
                id: action.payload.id,
                loading : false
            };

        case 'ADD_TO_WISHLIST':
            
            
            const newItems = [...state.items, action.payload.item];
            
            if(action.payload.userToken){
                addToWishlistApi(action.payload.item.id,action.payload.userToken);
            }

            return {
                ...state,
                items : newItems,
            };

        case 'REMOVE_TO_WISHLIST':

            const updatedItems = state.items.filter(
                (item) => item.id != action.payload.productId
            );

            if(action.payload.userToken){
                removeFromWishlistApi(action.payload.productId,action.payload.wishlistId,action.payload.userToken);
            }

            return {
                ...state,
                items: updatedItems,
            }    

        default:
            return state;
    }
}

export default wishlistReducer;