import React from 'react';
import { Platform, Text, View, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, IMAGES } from '../constants/theme';
import FeatherIcon from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useTheme } from '@react-navigation/native';
import DropShadow from 'react-native-drop-shadow';
import { IconButton } from 'react-native-paper';
import { connect } from 'react-redux';

const Header = ({cartTotal,...props}) => {

    const navigation = useNavigation();
    const {colors} = useTheme();

    return (
        <DropShadow
            style={[{
                shadowColor: COLORS.secondary,
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: .1,
                shadowRadius: 5,
                zIndex:2,
            },Platform.OS === 'ios' && {
                backgroundColor:colors.card,
            }]}
        >
            <View
                style={[{
                    height: props.productId ? 60 : 50,
                    flexDirection:'row',
                    alignItems:'center',
                    paddingHorizontal:10,
                    backgroundColor:colors.card,
                },props.transparent && {
                    position:'absolute',
                    left:0,
                    right:0,
                    borderBottomWidth:0,
                }]}    
            >
                {props.leftIcon == "back" &&
                    <IconButton
                        onPress={() => props.backAction ? props.backAction() : navigation.goBack()}
                        icon={props => <MaterialIcons name="arrow-back-ios" {...props}/>}
                        iconColor={colors.title}
                        size={20}
                    />
                }
                <View style={{flex:1}}>
                    <Text style={{...FONTS.h6,color:colors.title,textAlign:props.titleLeft ? 'left' : 'center'}}>{props.title}</Text>
                    {props.productId &&
                        <Text style={{...FONTS.fontSm,color:colors.text,textAlign:'center',marginTop:2}}>{props.productId}</Text>
                    }
                </View>
                {props.rightIcon2 == "search" &&
                    <IconButton
                        onPress={() => navigation.navigate('Search')}
                        size={20}
                        iconColor={colors.title} 
                        icon={props => <FeatherIcon name="search" {...props} />} 
                    />
                }
                {props.rightIcon == "more" &&
                    <IconButton 
                        iconColor={props.transparent ? "#fff" : colors.title} 
                        icon={props => <MaterialIcons name="more-vert" {...props} />} 
                    />
                }
                {props.rightIcon == "wishlist" &&
                    <IconButton 
                        onPress={() => props.handleLike()}
                        size={20}
                        iconColor={props.isLike ? "#F9427B" : colors.title} 
                        icon={val => <FontAwesome name={props.isLike ? "heart" : "heart-o"} {...val} />} 
                    />
                }
                {props.rightIcon === "cart" &&
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Cart')}
                        style={{
                            padding:12,
                        }}
                    >
                        <Image
                            source={IMAGES.bag}
                            style={{
                                height:20,
                                width:20,
                                tintColor:colors.title,
                            }}
                        />
                        <View
                            style={{
                                position:'absolute',
                                backgroundColor:COLORS.danger,
                                height:16,
                                width:16,
                                borderRadius:14,
                                alignItems:'center',
                                justifyContent:'center',
                                top:6,
                                right:6,
                            }}
                        >
                            <Text style={{...FONTS.fontXs,color:COLORS.white}}>{cartTotal}</Text>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        </DropShadow>
    );
};


const mapStateToProps = (state) => {
    return {
        cartTotal: state.cart.totalItems,
    };
};
export default connect(mapStateToProps)(Header);