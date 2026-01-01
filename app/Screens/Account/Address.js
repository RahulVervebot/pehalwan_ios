import React from 'react';
import { 
    SafeAreaView, 
    ScrollView, 
    Text, 
    View 
} from 'react-native';
import { connect } from 'react-redux';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { FONTS } from '../../constants/theme';
import Header from '../../layout/Header';
import { useTheme } from '@react-navigation/native';
import AddressCard from '../../components/AddressCard';

const Address = ({navigation,address}) => {

    const {colors} = useTheme();

    return (
        <SafeAreaView
            style={{
                flex:1,
                backgroundColor:colors.card,
            }}
        >
            <View
                style={{
                    flex:1,
                    backgroundColor:colors.background,
                }}
            >
                <Header
                    titleLeft
                    leftIcon={'back'}
                    title={'Address'}
                />
                <ScrollView>
                    <View style={GlobalStyleSheet.container}>
                       
                        <Text style={[FONTS.font,FONTS.fontTitle,{color:colors.title,marginBottom:10,marginTop:18}]}>Default Address</Text>

                        <AddressCard
                            address={address}
                            navigation={navigation}
                        />

                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const mapStateToProps = (state) => {
    return {
        address: state.address.selectedAddress,
    };
};

export default connect(mapStateToProps)(Address);