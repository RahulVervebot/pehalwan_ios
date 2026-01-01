const initialState = {
    list: [],
};

const taxReducer = (state = initialState , action) => {

    switch(action.type){

        case 'SET_TAX_DATA':
            return {
                ...state,
                list : action.payload,
            };
        
        default :
            return state;
    }
}

export default taxReducer;