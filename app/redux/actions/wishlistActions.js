import axios from "axios";
import { addToWishlistData, removeFromWishlistData } from "../../api/Wishlist";

export const setWishlistItems = (items,id) => {
    return {
      type: 'SET_WISHLIST_ITEMS',
      payload: {items,id},
    };
};
export const addToWishlist = (item,userToken) => {
    return {
      type: 'ADD_TO_WISHLIST',
      payload: {item,userToken},
    };
};
export const removeFromWishlist = (productId,wishlistId,userToken) => {
    return {
      type: 'REMOVE_TO_WISHLIST',
      payload: {productId,wishlistId,userToken},
    };
};

export const addToWishlistApi = async (productId, userToken) => {
    try {
        await addToWishlistData(productId , userToken);
    } catch (error) {
        console.error('Error creating customer:', error.response?.data || error.message);
    }
};

export const removeFromWishlistApi = async (productId,wishlistId,userToken) => {
  try {
    await removeFromWishlistData(productId,wishlistId,userToken);
  } catch (error) {
      console.error('Error creating customer:', error.response?.data || error.message);
  }
};