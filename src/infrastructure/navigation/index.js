// src/infrastructure/navigation/index.js

import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";

import { DrawerNavigator } from "./drawer.navigator";
import { AccountNavigator } from "./account.navigator";

import { AuthenticationContext } from "../../services/authentication/authentication.context";
import { FavouritesContextProvider } from "../../services/favourites/favourites.context";
import { LocationContextProvider } from "../../services/location/location.context";
import { ArtistsContextProvider } from "../../services/hive/artists.context";

export const Navigation = () => {
  const { isAuthenticated } = useContext(AuthenticationContext);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <FavouritesContextProvider>
          <LocationContextProvider>
            <ArtistsContextProvider>
              <DrawerNavigator />
            </ArtistsContextProvider>
          </LocationContextProvider>
        </FavouritesContextProvider>
      ) : (
        <AccountNavigator />
      )}
    </NavigationContainer>
  );
};
