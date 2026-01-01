import React from 'react';
import { Platform, SafeAreaView, ScrollView, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import Header from '../../layout/Header';
import ListStyle1 from '../../components/list/ListStyle1';
import { Snackbar } from 'react-native-paper';



const Snackbars = () => {

    const { colors } = useTheme();

    const [visible, setVisible] = React.useState(false);
	const [snackText, setSnackText] = React.useState("");
	const [snackType, setSnackType] = React.useState("");
	
	const onDismissSnackBar = () => setVisible(false);

    const onToggleSnackBar = (type,text) => {
		setSnackText(text);
		setSnackType(type);
		setVisible(!visible);
	};

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <View
                    style={[{
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 2,
                            height: 2,
                        },
                        shadowOpacity: .1,
                        shadowRadius: 5,
                    }, Platform.OS === "ios" && {
                        backgroundColor: colors.card,
                    }]}
                >
                    <Header title={'Snackbars'} titleLeft leftIcon={'back'} />
                </View>
                <ScrollView>
                    <View style={{ ...GlobalStyleSheet.container }}>
                        <View style={[GlobalStyleSheet.card, GlobalStyleSheet.shadow, { backgroundColor: colors.card }]}>
                            <View style={GlobalStyleSheet.cardBody}>
                                <ListStyle1
                                    onPress={() => onToggleSnackBar('success',"Something's wrong!")}
                                    arrowRight
                                    icon={<FontAwesome size={18} color={colors.card} name={'check'} />}
                                    title={'Confirmation Snackbar'}
                                />
                                <ListStyle1
                                    onPress={() => onToggleSnackBar('warning',"Something's wrong!")}
                                    arrowRight
                                    icon={<FontAwesome size={18} color={colors.card} name={'warning'} />}
                                    title={'Warning Snackbar'}
                                />
                                <ListStyle1
                                    onPress={() => onToggleSnackBar('info',"We're on it")}
                                    arrowRight
                                    icon={<FontAwesome size={18} color={colors.card} name={'refresh'} />}
                                    title={'Loading Snackbar'}
                                />
                                <ListStyle1
                                    onPress={() => onToggleSnackBar('error',"Error Occured")}
                                    arrowRight
                                    icon={<FontAwesome size={18} color={colors.card} name={'close'} />}
                                    title={'Error Snackbar'}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
            <View style={[GlobalStyleSheet.container,{padding:0}]}>
                <Snackbar
                    visible={visible}
                    onDismiss={onDismissSnackBar}
                    style={{
                        backgroundColor:
                            snackType === 'success' ? '#4CAF50' : // Green
                            snackType === 'warning' ? '#FFC107' : // Amber
                            snackType === 'info'    ? '#2196F3' : // Blue
                            snackType === 'error'   ? '#F44336' : // Red
                            colors.primary
                    }}
                >
                    {snackText}
                </Snackbar>
            </View>
        </SafeAreaView>
    );
};


export default Snackbars;