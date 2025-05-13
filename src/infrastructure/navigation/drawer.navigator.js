import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { AppNavigator } from "./app.navigator";
import { SafeArea } from "../../components/utility/safe-area.component";
import { Text } from "react-native";

const Drawer = createDrawerNavigator();

const CustomSettings = () => (
  <SafeArea>
    <Text>Drawer Settings</Text>
  </SafeArea>
);

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Home" component={AppNavigator} />

      <Drawer.Screen name="Settings" component={CustomSettings} />
    </Drawer.Navigator>
  );
};
