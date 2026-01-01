
export const initAddress = (address) => {
    return {
        type: 'INIT_ADDRESS',
        payload: address,
    };
};

export const setAddress = (address) => {
    return {
        type: 'SET_ADDRESS',
        payload: address,
    };
};
