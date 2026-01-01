import React, { useState } from 'react';
import { 
    KeyboardAvoidingView, 
    Platform, 
    SafeAreaView, 
    ScrollView, 
    Text, 
    TextInput, 
    ActivityIndicator, 
    View 
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import Header from '../../layout/Header';
import { useTheme } from '@react-navigation/native';
import { connect, useDispatch, useSelector } from 'react-redux';
import { initAddress } from '../../redux/actions/addressActions';
import { Snackbar } from 'react-native-paper';
import { setUserAddress } from '../../api/address';

const AddDeliveryAddress = ({navigation,route,addressData}) => {

    const {colors} = useTheme();
    const dispatch = useDispatch();
    const { userData }  = useSelector((state) => state.auth);
    
    const { editable } = route.params;

    const [firstName , setFirstName] = useState(userData?.firstName);
    const [lastName , setLastName] = useState(userData?.lastName);
    const [phoneNumber , setPhoneNumber] = useState(addressData?.phone);
    const [email , setEmail] = useState(userData?.email);
    const [pinCode , setPinCode] = useState(addressData?.postcode);
    const [city , setCity] = useState(addressData?.city);
    const [state , setState] = useState(addressData?.state);
    const [country , setCountry] = useState(addressData?.country);
    const [address , setHomeAddress] = useState(addressData?.address_1);

    const [snackVisible , setSnackVisible] = useState(false);
    const [snackText , setSnackText] = useState("");
    const [loading , setLoading] = useState(false);

    const placeOrder = async () => {
        try{
            if(
                firstName == "" || 
                lastName == "" || 
                phoneNumber == "" || 
                email == "" || 
                pinCode == "" || 
                city == "" || 
                state == "" || 
                country == "" || 
                address == ""
            ){
                setSnackText("Please fill fields.");
                setSnackVisible(true);
                return false;
            }
            setLoading(true);
            const addressData = {
                email : email,
                first_name : firstName,
                last_name : lastName,
                address_1 : address,
                state : state,
                postcode : pinCode,
                country : country,
                phone : phoneNumber,
                city : city,
            }
            dispatch(initAddress(addressData));
            const {data} = await setUserAddress(addressData,userData.id);
            if(data){
                setLoading(false);
                navigation.navigate('Payment');
            }
        }catch(e){
            console.log(e);
        }
    }

    const SaveAddress = async () => {
        try{
            if(
                firstName == "" || 
                lastName == "" || 
                phoneNumber == "" || 
                email == "" || 
                pinCode == "" || 
                city == "" || 
                state == "" || 
                country == "" || 
                address == ""
            ){
                setSnackText("Please fill fields.");
                setSnackVisible(true);
                return false;
            }
            setLoading(true);
            const addressData = {
                email : email,
                first_name : firstName,
                last_name : lastName,
                address_1 : address,
                state : state,
                postcode : pinCode,
                country : country,
                phone : phoneNumber,
                city : city,
            }
            dispatch(initAddress(addressData));
            const {data} = await setUserAddress(addressData,userData.id);
            if(data){
                setLoading(false);
            }
        }catch(e){
            console.log(e);
        }
    }


    return (
        <SafeAreaView
            style={{
                flex:1,
                backgroundColor:colors.card,
            }}
        >

            {loading &&
                <View
                    style={{
                        position:'absolute',
                        zIndex:1,
                        height:'100%',
                        width:'100%',
                        backgroundColor:'rgba(0,0,0,.3)',
                        alignItems:'center',
                        justifyContent:'center',
                    }}
                >
                    <ActivityIndicator color={COLORS.white} size={'large'}/>
                </View>
            }

            <View
                style={{
                    flex:1,
                    backgroundColor:colors.background,
                }}
            >
                <Header
                    titleLeft
                    leftIcon={'back'}
                    title={editable ? 'Edit Address' : 'Add delivery address'}
                />
                <KeyboardAvoidingView
                    style={{flex:1}}
                    behavior={Platform.OS === "ios" ? "padding" : ""}
                >
                    <View style={{flex:1}}>
                        <ScrollView>
                            <View
                                style={GlobalStyleSheet.container}
                            >
                                <View
                                    style={{
                                        borderBottomWidth:1,
                                        borderBottomColor:colors.borderColor,
                                        paddingBottom:10,
                                        marginBottom:20,
                                    }}
                                >
                                    <Text style={{...FONTS.h6,color:colors.title}}>Contact Details</Text>
                                </View>
                                <View style={GlobalStyleSheet.row}>
                                    <View style={GlobalStyleSheet.col50}>
                                        <View style={GlobalStyleSheet.inputGroup}>
                                            <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>First Name</Text>
                                            <TextInput
                                                style={[GlobalStyleSheet.formControl,{
                                                    backgroundColor:colors.input,
                                                    color:colors.title,
                                                    borderColor:colors.borderColor,
                                                }]}
                                                value={firstName}
                                                onChangeText={(val) => setFirstName(val)}
                                                placeholder='First Name'
                                                placeholderTextColor={colors.textLight}
                                            />
                                        </View>
                                    </View>
                                    <View style={GlobalStyleSheet.col50}>
                                        <View style={GlobalStyleSheet.inputGroup}>
                                            <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>Last Name</Text>
                                            <TextInput
                                                style={[GlobalStyleSheet.formControl,{
                                                    backgroundColor:colors.input,
                                                    color:colors.title,
                                                    borderColor:colors.borderColor,
                                                }]}
                                                value={lastName}
                                                onChangeText={(val) => setLastName(val)}
                                                placeholder='Last Name'
                                                placeholderTextColor={colors.textLight}
                                            />
                                        </View>
                                    </View>
                                </View>
                                <View style={GlobalStyleSheet.inputGroup}>
                                    <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>Mobile No.</Text>
                                    <TextInput
                                        style={[GlobalStyleSheet.formControl,{
                                            backgroundColor:colors.input,
                                            color:colors.title,
                                            borderColor:colors.borderColor,
                                        }]}
                                        value={phoneNumber}
                                        onChangeText={(val) => setPhoneNumber(val)}
                                        placeholder='Type your mobile no.'
                                        placeholderTextColor={colors.textLight}
                                    />
                                </View>
                                <View style={GlobalStyleSheet.inputGroup}>
                                    <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>Email Address</Text>
                                    <TextInput
                                        style={[GlobalStyleSheet.formControl,{
                                            backgroundColor:colors.input,
                                            color:colors.title,
                                            borderColor:colors.borderColor,
                                        }]}
                                        value={email}
                                        onChangeText={(val) => setEmail(val)}
                                        placeholder='Type your email'
                                        placeholderTextColor={colors.textLight}
                                    />
                                </View>
                                <View
                                    style={{
                                        borderBottomWidth:1,
                                        borderBottomColor:colors.borderColor,
                                        paddingBottom:10,
                                        marginBottom:20,
                                    }}
                                >
                                    <Text style={{...FONTS.h6,color:colors.title}}>Address</Text>
                                </View>
                                <View style={GlobalStyleSheet.inputGroup}>
                                    <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>Pin Code</Text>
                                    <TextInput
                                        style={[GlobalStyleSheet.formControl,{
                                            backgroundColor:colors.input,
                                            color:colors.title,
                                            borderColor:colors.borderColor,
                                        }]}
                                        value={pinCode}
                                        onChangeText={(val) => setPinCode(val)}
                                        placeholder='Pin Code'
                                        placeholderTextColor={colors.textLight}
                                    />
                                </View>
                                <View style={GlobalStyleSheet.inputGroup}>
                                    <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>Address</Text>
                                    <TextInput
                                        style={[GlobalStyleSheet.formControl,{
                                            backgroundColor:colors.input,
                                            color:colors.title,
                                            borderColor:colors.borderColor,
                                        }]}
                                        value={address}
                                        onChangeText={(val) => setHomeAddress(val)}
                                        placeholder='Address'
                                        placeholderTextColor={colors.textLight}
                                    />
                                </View>
                                <View style={GlobalStyleSheet.inputGroup}>
                                    <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>Country</Text>
                                    <TextInput
                                        style={[GlobalStyleSheet.formControl,{
                                            backgroundColor:colors.input,
                                            color:colors.title,
                                            borderColor:colors.borderColor,
                                        }]}
                                        value={country}
                                        onChangeText={(val) => setCountry(val)}
                                        placeholder='Country'
                                        placeholderTextColor={colors.textLight}
                                    />
                                </View>
                                <View style={[GlobalStyleSheet.row]}>
                                    <View style={[GlobalStyleSheet.col50]}>
                                        <View style={GlobalStyleSheet.inputGroup}>
                                            <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>City/District</Text>
                                            <TextInput
                                                style={[GlobalStyleSheet.formControl,{
                                                    backgroundColor:colors.input,
                                                    color:colors.title,
                                                    borderColor:colors.borderColor,
                                                }]}
                                                value={city}
                                                onChangeText={(val) => setCity(val)}
                                                placeholder='City/District'
                                                placeholderTextColor={colors.textLight}
                                            />
                                        </View>
                                    </View>
                                    <View style={[GlobalStyleSheet.col50]}>
                                        <View style={GlobalStyleSheet.inputGroup}>
                                            <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>State</Text>
                                            <TextInput
                                                style={[GlobalStyleSheet.formControl,{
                                                    backgroundColor:colors.input,
                                                    color:colors.title,
                                                    borderColor:colors.borderColor,
                                                }]}
                                                value={state}
                                                onChangeText={(val) => setState(val)}
                                                placeholder='State'
                                                placeholderTextColor={colors.textLight}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                    <View style={GlobalStyleSheet.container}>
                        {editable ?
                            <CustomButton 
                                onPress={SaveAddress}
                                color={COLORS.secondary}
                                title={'Save Address'}
                            />
                            :
                            <CustomButton 
                                onPress={placeOrder}
                                color={COLORS.secondary}
                                title={'Place order'}
                            />
                        }
                    </View>
                </KeyboardAvoidingView>
            </View>

            <Snackbar
                visible={snackVisible}
                onDismiss={() => setSnackVisible(false)}
                style={{
                    bottom:65,
                }}
            >
                {snackText}
            </Snackbar>
        </SafeAreaView>
    );
};

const mapStateToProps = (state) => {
    return {
        addressData: state.address.selectedAddress,
    };
};

export default connect(mapStateToProps)(AddDeliveryAddress);