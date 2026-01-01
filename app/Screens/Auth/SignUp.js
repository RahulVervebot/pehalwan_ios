import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import FeatherIcon from "react-native-vector-icons/Feather";
import { useTheme } from '@react-navigation/native';
import { Snackbar } from 'react-native-paper';
import { WooCommerce } from '../../api/Woocommerce'; // already used elsewhere

const SignUp = (props) => {

    const theme = useTheme();
    const {colors} = theme;

    const [isFocused , setisFocused] = useState(false);
    const [isFocused2 , setisFocused2] = useState(false);
    const [isFocused3 , setisFocused3] = useState(false);
    const [isFocused4 , setisFocused4] = useState(false);
    const [isFocused5 , setisFocused5] = useState(false);
    const [handlePassword,setHandlePassword] = useState(true);

    const [firstName , setFirstName] = useState("");
    const [lastName , setLastName] = useState("");
    const [username , setUserName] = useState("");
    const [email , setEmail] = useState("");
    const [password , setPassword] = useState("");

    const [Loading , setLoading] = useState(false);
    const [snackVisible , setSnackVisible] = useState(false);
    const [snackText , setSnackText] = useState("");


 const createCustomer = async () => {
  try {
    // Basic validation
    if (!username?.trim() || !email?.trim() || !password) {
      setSnackText('Please fill all required fields.');
      setSnackVisible(true);
      return;
    }

    setLoading(true);

    // WooCommerce Customers payload
    const customerData = {
      email: email.trim(),
      first_name: firstName?.trim() || '',
      last_name: lastName?.trim() || '',
      username: username.trim(),
      password, // Woo accepts password here
    };

    // Create customer via WooCommerce REST (uses CK/CS inside WooCommerce client)
    const res = await WooCommerce.post('/customers', customerData);

    // Success → go to SignIn
    setLoading(false);
    props.navigation.navigate('SignIn');
  } catch (e) {
    setLoading(false);
    // Surface helpful error from Woo if available
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      'Something went wrong.';
    console.log('Create customer error:', e?.response?.data || e);
    setSnackText(String(msg));
    setSnackVisible(true);
  }
};



    return (
        <SafeAreaView style={{flex:1,backgroundColor:colors.background}}>

            {Loading &&
                
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

            <ScrollView contentContainerStyle={{flexGrow:1}}>
                <View style={{...GlobalStyleSheet.container,flex:1,backgroundColor:colors.background}}>
                    <View style={{marginBottom:30,alignItems:'center',marginTop:30}}>
                        <Image
                            style={{
                                height:40,
                                width:160,
                                resizeMode:'contain',
                                marginBottom:20,
                            }}
                            source={theme.dark ? IMAGES.logoWhite : IMAGES.logo}
                        />
                        <Text style={{...FONTS.h3,marginBottom:6,color:colors.title}}>Create your account</Text>
                        {/* <Text style={{...FONTS.font,color:colors.text}}>Lets get started with your 30 days free trial</Text> */}
                    </View>
                    <View style={GlobalStyleSheet.row}>
                        <View style={GlobalStyleSheet.col50}>
                            <View style={GlobalStyleSheet.inputGroup}>
                                <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>First Name</Text>
                                <TextInput
                                    style={[GlobalStyleSheet.formControl,
                                        {
                                            backgroundColor:colors.input,
                                            color:colors.title,
                                            borderColor:colors.borderColor,
                                        },
                                        isFocused4 && GlobalStyleSheet.activeInput
                                    ]}
                                    value={firstName}
                                    onChangeText={(value) => setFirstName(value)}
                                    onFocus={() => setisFocused4(true)}
                                    onBlur={() => setisFocused4(false)}
                                    placeholder='Type First Name'
                                    placeholderTextColor={colors.textLight}
                                />
                            </View>
                        </View>
                        <View style={GlobalStyleSheet.col50}>
                            <View style={GlobalStyleSheet.inputGroup}>
                                <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>Last Name</Text>
                                <TextInput
                                    style={[GlobalStyleSheet.formControl,
                                        {
                                            backgroundColor:colors.input,
                                            color:colors.title,
                                            borderColor:colors.borderColor,
                                        },
                                        isFocused5 && GlobalStyleSheet.activeInput
                                    ]}
                                    value={lastName}
                                    onChangeText={(value) => setLastName(value)}
                                    onFocus={() => setisFocused5(true)}
                                    onBlur={() => setisFocused5(false)}
                                    placeholder='Type Last Name'
                                    placeholderTextColor={colors.textLight}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={GlobalStyleSheet.inputGroup}>
                        <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>Username</Text>
                        <TextInput
                            style={[GlobalStyleSheet.formControl,
                                {
                                    backgroundColor:colors.input,
                                    color:colors.title,
                                    borderColor:colors.borderColor,
                                },
                                isFocused && GlobalStyleSheet.activeInput
                            ]}
                            value={username}
                            onChangeText={(value) => setUserName(value)}
                            onFocus={() => setisFocused(true)}
                            onBlur={() => setisFocused(false)}
                            placeholder='Type Username Here'
                            placeholderTextColor={colors.textLight}
                        />
                    </View>
                    <View style={GlobalStyleSheet.inputGroup}>
                        <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>Email</Text>
                        <TextInput
                            style={[GlobalStyleSheet.formControl,
                                {
                                    backgroundColor:colors.input,
                                    color:colors.title,
                                    borderColor:colors.borderColor,
                                },
                                isFocused2 && GlobalStyleSheet.activeInput
                            ]}
                            value={email}
                            onChangeText={(value) => setEmail(value)}
                            onFocus={() => setisFocused2(true)}
                            onBlur={() => setisFocused2(false)}
                            placeholder='Type Email Here'
                            placeholderTextColor={colors.textLight}
                        />
                    </View>
                    <View style={GlobalStyleSheet.inputGroup}>
                        <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>Password</Text>
                        <View>
                            <TouchableOpacity
                                onPress={() => setHandlePassword(!handlePassword)}
                                style={{
                                    position:'absolute',
                                    zIndex:1,
                                    height:50,
                                    width:50,
                                    alignItems:'center',
                                    justifyContent:'center',
                                    right:0,
                                    opacity:.5,
                                }}
                            >
                                {handlePassword ?
                                    <FeatherIcon name='eye' color={colors.title} size={18}/>
                                    :
                                    <FeatherIcon name='eye-off' color={colors.title} size={18}/>
                                }
                            </TouchableOpacity>
                            <TextInput
                                style={[GlobalStyleSheet.formControl,
                                    {
                                        backgroundColor:colors.input,
                                        color:colors.title,
                                        borderColor:colors.borderColor,
                                    },
                                    isFocused3 && GlobalStyleSheet.activeInput
                                ]}
                                value={password}
                                onChangeText={(value) => setPassword(value)}
                                onFocus={() => setisFocused3(true)}
                                onBlur={() => setisFocused3(false)}
                                secureTextEntry={handlePassword}
                                placeholder='Type Password Here'
                                placeholderTextColor={colors.textLight}
                            />
                        </View>
                    </View>

                    <CustomButton 
                        //onPress={() => props.navigation.navigate('SignIn')}
                        onPress={createCustomer}
                        color={COLORS.secondary}
                        title="Register"
                    />
                    <View
                        style={{
                            flexDirection:'row',
                            marginTop:12,
                        }}
                    >
                        <Text style={{...FONTS.font,color:colors.text,marginRight:5}}>Already have an account ?</Text>
                        <TouchableOpacity
                            onPress={() => props.navigation.navigate('SignIn')}
                        >
                            <Text style={{...FONTS.font,color:COLORS.primary}}>Log in</Text>
                        </TouchableOpacity>
                    </View>
                    

                </View>
            </ScrollView>
            <Snackbar
                visible={snackVisible}
                onDismiss={() => setSnackVisible(false)}
            >
                {snackText}
            </Snackbar>
        </SafeAreaView>
    );
};


export default SignUp;

