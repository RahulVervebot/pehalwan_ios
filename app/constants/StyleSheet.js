import { COLORS, FONTS, SIZES } from "./theme";

export const GlobalStyleSheet = {
    container : {
        padding : 15,
    },
    formControl : {
        height : 50,
        borderWidth : 1,
        borderColor : COLORS.borderColor,
        paddingHorizontal : 15,
    },
    activeInput :{
        borderColor : COLORS.primary,
    },
    label : {
        ...FONTS.font,
        color : COLORS.label,
        marginBottom : 8,
    },
    inputGroup:{
        marginBottom:15,
    },
    row : {
        flexDirection : 'row',
        flexWrap : 'wrap',
        marginHorizontal : -5,
    },
    col50 : {
        width:'50%',
        paddingHorizontal : 5,
    },
    col33 : {
        width : '33.33%',
        paddingHorizontal : 5,
    },
    card : {
        marginBottom:15,
        backgroundColor:COLORS.white,
    },
    cardHeader : {
        borderBottomWidth:1,
        borderBottomColors:COLORS.borderColor,
        paddingHorizontal:15,
        paddingVertical:15,
    },
    cardBody : {
        paddingHorizontal:15,
        paddingVertical:15,
    },
    shadow:{
        shadowColor: "rgba(0,0,0,.5)",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    }
}