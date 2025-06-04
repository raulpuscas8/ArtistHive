// src/infrastructure/navigation/index.js

import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { DrawerNavigator } from "./drawer.navigator";
import { AccountNavigator } from "./account.navigator";

import { PaymentWebViewScreen } from "../../features/payment/screens/payment-webview.screen";
import { AuthenticationContext } from "../../services/authentication/authentication.context";
import { FavouritesContextProvider } from "../../services/favourites/favourites.context";
import { LocationContextProvider } from "../../services/location/location.context";
import { ArtistsContextProvider } from "../../services/hive/artists.context";

// Create the root stack
const RootStack = createStackNavigator();

export const Navigation = () => {
  const { isAuthenticated } = useContext(AuthenticationContext);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <FavouritesContextProvider>
          <LocationContextProvider>
            <ArtistsContextProvider>
              <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {/* Drawer holds the whole app */}
                <RootStack.Screen name="Drawer" component={DrawerNavigator} />
                {/* Register global Stripe Web Payment here */}
                <RootStack.Screen
                  name="Stripe Web Payment"
                  component={PaymentWebViewScreen}
                />
              </RootStack.Navigator>
            </ArtistsContextProvider>
          </LocationContextProvider>
        </FavouritesContextProvider>
      ) : (
        <AccountNavigator />
      )}
    </NavigationContainer>
  );
};
