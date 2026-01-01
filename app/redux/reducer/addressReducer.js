import AsyncStorage from "@react-native-async-storage/async-storage";

const initialState = {
    list: [],
    selectedAddress : {},
};

const addressReducer = (state = initialState, action) => {

    switch (action.type) {
      
        case 'INIT_ADDRESS':

            const address = {
                selectedAddress : action.payload,
                list : [action.payload]
            }
            AsyncStorage.setItem('address', JSON.stringify(address))
                .then(() => console.log('Address data saved to local storage'))
                .catch((error) => console.log('Error saving address data to local storage:', error));

            return{
                ...state,
                selectedAddress : address.selectedAddress,
                list : address.list
            }

        case 'SET_ADDRESS':

            return{
                ...state,
                selectedAddress : action.payload.selectedAddress,
                list : action.payload.list,
            }

        default:
            return state; 
    }   
}

export default addressReducer;