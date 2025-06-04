import React from "react";
import { SettingsScreen } from "../../features/settings/screens/settings.screen";
import { FavouritesScreen } from "../../features/settings/screens/favourites.screen";
import { CameraScreen } from "../../features/settings/screens/camera.screen";
// Add the imports below
import { AboutScreen } from "../../features/settings/screens/about.screen";
import { CopyrightScreen } from "../../features/settings/screens/copyright.screen";
import { EditAccountScreen } from "../../features/settings/screens/edit-account.screen";

import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";

const SettingsStack = createStackNavigator();

export const SettingsNavigator = ({ route, navigation }) => {
  return (
    <SettingsStack.Navigator
      headerMode="screen"
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <SettingsStack.Screen
        options={{
          header: () => null,
        }}
        name="SettingsHome"
        component={SettingsScreen}
      />
      <SettingsStack.Screen name="Favourites" component={FavouritesScreen} />
      <SettingsStack.Screen name="Camera" component={CameraScreen} />
      <SettingsStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerShown: false,
        }}
      />
      <SettingsStack.Screen
        name="Copyright"
        component={CopyrightScreen}
        options={{ headerShown: false }}
      />
      {/* Your new screen below */}
      <SettingsStack.Screen
        name="EditAccount"
        component={EditAccountScreen}
        options={{
          headerShown: false,
        }}
      />
    </SettingsStack.Navigator>
  );
};
