import React, { useState } from 'react';
import { 
    KeyboardAvoidingView, 
    Platform, 
    SafeAreaView, 
    ScrollView, 
    Text, 
    TextInput, 
    View 
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS } from '../../constants/theme';
import Header from '../../layout/Header';

const EditProfile = () => {

    const {colors} = useTheme();
    const [isFocused , setisFocused] = useState(false);
    const [isFocused2 , setisFocused2] = useState(false);
    const [isFocused3 , setisFocused3] = useState(false);

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
                    title={'Edit Profile'}
                />
                <KeyboardAvoidingView
                    style={{flex:1}}
                    behavior={Platform.OS === "ios" ? "padding" : ""}
                >
                    <View style={{flex:1}}>
                        <ScrollView>
                            <View style={GlobalStyleSheet.container}>
                                <View style={GlobalStyleSheet.inputGroup}>
                                    <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>Display Name</Text>
                                    <TextInput
                                        style={[GlobalStyleSheet.formControl,
                                            {
                                                backgroundColor:colors.input,
                                                color:colors.title,
                                                borderColor:colors.borderColor,
                                            },
                                            isFocused2 && GlobalStyleSheet.activeInput
                                        ]}
                                        defaultValue={'Yatin'}
                                        onFocus={() => setisFocused2(true)}
                                        onBlur={() => setisFocused2(false)}
                                        placeholder='Type your name'
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
                                            isFocused3 && GlobalStyleSheet.activeInput
                                        ]}
                                        defaultValue={'yatinxarma@gmail.com'}
                                        onFocus={() => setisFocused3(true)}
                                        onBlur={() => setisFocused3(false)}
                                        placeholder='Type your email'
                                        placeholderTextColor={colors.textLight}
                                    />
                                </View>
                                <View style={GlobalStyleSheet.inputGroup}>
                                    <Text style={[GlobalStyleSheet.label,{color:colors.title}]}>Mobile Number</Text>
                                    <TextInput
                                        style={[GlobalStyleSheet.formControl,
                                            {
                                                backgroundColor:colors.input,
                                                color:colors.title,
                                                borderColor:colors.borderColor,
                                            },
                                            isFocused && GlobalStyleSheet.activeInput
                                        ]}
                                        defaultValue={'0015 1545 4815'}
                                        onFocus={() => setisFocused(true)}
                                        onBlur={() => setisFocused(false)}
                                        placeholder='Type Mobile number'
                                        placeholderTextColor={colors.textLight}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                    <View style={GlobalStyleSheet.container}>
                        <CustomButton color={COLORS.secondary} title={'Save Details'}/>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
};

export default EditProfile;