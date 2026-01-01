import React from 'react';
import { Text, View } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';


const DeliveryMap = () => {
    return (
        <View style={{height:200}}>
            <Text style={{...FONTS.fontMedium,fontSize:18,color:COLORS.title,textAlign:'center'}}>Map Not Found</Text>
        </View>
    );
};


export default DeliveryMap;