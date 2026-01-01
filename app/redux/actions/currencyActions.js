export const setCurrencyData = (symbol,position,thousand,decimal,decimalNum) => {
    return {
      type: 'SET_CURRENCY_DATA',
      payload: {symbol,position,thousand,decimal,decimalNum},
    };
};