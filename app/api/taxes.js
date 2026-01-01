import { WooCommerce } from "./Woocommerce";

export const getTax = async () => {
    try{    
        const response = await WooCommerce.get('/taxes');

        return {
            status : true ,
            data : response.data,
        }

    }catch(e){
        return {
            status : e
        }
    }
}