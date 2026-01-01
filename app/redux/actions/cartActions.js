export const addToCart = (item) => {
    return {
      type: 'ADD_TO_CART',
      payload: item,
    };
};
export const updateCartQuatity = (itemId,quantity,tax) => {

    return {
      type: 'UPDATE_ITEM_QUATITY',
      payload: {itemId,quantity,tax},
    };
};
export const setCartItems = (items,totalItems) => {
    return {
      type: 'SET_CART_ITEMS',
      payload: {items,totalItems},
    };
};
export const removeFromCart = (itemId) => {
    return {
      type: 'REMOVE_TO_CART',
      payload: itemId,
    };
};
export const clearAllCart = () => {
    return {
      type : 'CLEAR_ALL_CART',
      payload : {}
    }
}