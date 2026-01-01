import { WooCommerce } from "./Woocommerce";

export const getCurrencyData = async () => {
    try{    
        const response = await WooCommerce.get('/settings/general');

        const symbol = response.data.findIndex((item) => item.id === "woocommerce_currency");
        const position = response.data.findIndex((item) => item.id === "woocommerce_currency_pos");
        const thousand = response.data.findIndex((item) => item.id === "woocommerce_price_thousand_sep");
        const decimal = response.data.findIndex((item) => item.id === "woocommerce_price_decimal_sep");
        const decimalNum = response.data.findIndex((item) => item.id === "woocommerce_price_num_decimals");

        return {
            status: true,
            symbol : response.data[symbol].value,
            position : response.data[position].value,
            thousand : response.data[thousand].value,
            decimal : response.data[decimal].value,
            decimalNum : response.data[decimalNum].value,
        }
        
    }catch(e){
        return {
            status : e,
            error : e,
        }
    }
}