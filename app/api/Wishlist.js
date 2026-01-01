import axios from "axios";
import { ApiConstants, baseURL } from "./config";


export const getWishlist = async (userToken) => {
    try{
        const response = await axios.get(`${baseURL}${ApiConstants.wishlist}`,{
            headers: {
                Authorization: `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        return {
            status : true,
            data : response.data[0]
        }

    }catch(error){
        console.error('wishlist:', error.response?.data || error.message);
        return {
            status : error
        }
    }
}

export const addToWishlistData = async (productId, userToken) => {
    try {
        const response = await axios.post(`${baseURL}${ApiConstants.wishlist}/0/product/${productId}`,{},{
            headers: {
                Authorization: `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error creating customer:', error.response?.data || error.message);
    }
};

export const removeFromWishlistData = async (productId,wishlistId,userToken) => {
    try {
        const response = await axios.delete(`${baseURL}${ApiConstants.wishlist}/${wishlistId}/product/${productId}`,{
            headers: {
                Authorization: `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Response:', response.data);
  
    } catch (error) {
        console.error('Error creating customer:', error.response?.data || error.message);
    }
  };