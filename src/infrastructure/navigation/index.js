import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";

import { DrawerNavigator } from "./drawer.navigator";
import { AccountNavigator } from "./account.navigator";

import { AuthenticationContext } from "../../services/authentication/authentication.context";

export const Navigation = () => {
  const { isAuthenticated } = useContext(AuthenticationContext);

  return (
    <NavigationContainer>
      {isAuthenticated ? <DrawerNavigator /> : <AccountNavigator />}
    </NavigationContainer>
  );
};
