import React, { useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { COLORS, FONTS } from '../constants/theme';
import { useTheme } from '@react-navigation/native';
import { getPrice } from '../helper/common';

const ProductBox = ({onPress,id,image,title,price,rating,review,isWishlist,addToWishlist,removeFromWishlist,oldPrice,currency,onSale,wishlistId,userToken,type}) => {

    const {colors} = useTheme();

    const [isLike , setIsLike ] = useState(isWishlist >= 0 ? true : false);

    const wishlistItem = {
        id : id,
        price : price,
        regular_price : oldPrice,
        sale_price : price,
        on_sale : onSale,
        average_rating : rating,
        rating_count : review,
        title : title,
        type : type,
        image : image,
    }

  return (
    <TouchableOpacity
        activeOpacity={.8}
        onPress={() => onPress && onPress()}
    >
        <View style={{marginBottom:10}}>
            <Image
                style={{
                    width:'100%',
                    height:undefined,
                    aspectRatio:1/1,
                }}
                source={{uri : image}}
            />
            {/* <TouchableOpacity
                onPress={() => 
                    {setIsLike(!isLike);
                        isLike ?
                            removeFromWishlist(id,wishlistId,userToken)
                            :
                            addToWishlist(wishlistItem,userToken);
                        }
                }
                style={{
                    position:'absolute',
                    top:0,
                    right:0,
                    padding:6,
                }}
            >
                <FontAwesome 
                    size={16}
                    color={isLike ? "#F9427B" : COLORS.text}
                    name={isLike  ? "heart" : "heart-o"}
                />
            </TouchableOpacity> */}

            <View
                style={{
                    position:'absolute',
                    bottom:0,
                    left:0,
                    backgroundColor:"rgba(0,0,0,.75)",
                    paddingHorizontal:8,
                    paddingVertical:1,
                }}
            >
                <View
                    style={{
                        flexDirection:'row',
                        alignItems:'center',
                    }}
                >
                    <FontAwesome color={'#DA8D46'} size={10} name="star"/>
                    <Text style={{...FONTS.fontSm,color:COLORS.white,...FONTS.fontTitle,marginLeft:3}}>{rating}</Text>
                    <Text style={{...FONTS.fontXs,color:COLORS.white,opacity:.7,marginLeft:5}}>| {review}</Text>
                </View>
            </View>

        </View>
        <Text
            numberOfLines={2}
            style={{
                ...FONTS.font,
                ...FONTS.fontTitle,
                color:colors.title,
            }}
        >{title}</Text>
        <View
            style={{
                flexDirection:'row',
                alignItems:'center',
                marginTop:8,
                marginBottom:2,
            }}
        >
            <Text style={{...FONTS.h5,color:COLORS.primary}}>{getPrice(price,currency)}</Text>
            {onSale != false && oldPrice &&
                <Text style={{
                    ...FONTS.font,
                    color:colors.textLight,
                    textDecorationLine:'line-through',
                    marginLeft:6,
                    opacity:.7,
                }}>{getPrice(oldPrice,currency)}</Text>
            }
        </View>
    </TouchableOpacity>
  )
}


export default ProductBox
