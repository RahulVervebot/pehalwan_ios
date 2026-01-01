import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Categories from '../Screens/Categories/Categories';
import Profile from '../Screens/Account/Profile';
import CustomBottomNavigation from './CustomBottomNavigation';
import Home from '../Screens/Home/Home';
import Wishlist from '../Screens/Wishlist/Wishlist';
import Orders from '../Screens/Orders/Orders';
const Tab = createBottomTabNavigator();

const Cart2 = () => {}

const BottomNavigation = () => {
    return (
        <Tab.Navigator
            screenOptions={{
           headerShown : false,
            }}
            initialRouteName={'Home'}
            tabBar={props => <CustomBottomNavigation {...props} />}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Categories" component={Categories} />
            <Tab.Screen name="Cart2" component={Cart2} />
            <Tab.Screen name="Orders" component={Orders} />
            <Tab.Screen name="Account" component={Profile} />
        </Tab.Navigator>
    );
};

export default BottomNavigation;