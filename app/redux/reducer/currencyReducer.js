const initialState = {
    symbol: "",
    position : "",
    thousand: "",
    decimal: "",
    decimalNum: "",
};

const currencyReducer = (state = initialState , action) => {

    switch(action.type){

        case 'SET_CURRENCY_DATA':
            return {
                ...state,
                symbol : action.payload.symbol,
                position : action.payload.position,
                thousand : action.payload.thousand,
                decimal : action.payload.decimal,
                decimalNum : action.payload.decimalNum,
            };
        
        default :
            return state;
    }
}

export default currencyReducer;