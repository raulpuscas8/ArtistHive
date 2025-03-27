import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Text, Button } from "react-native";

import { SafeArea } from "../../components/utility/safe-area.component";
import { ArtistsNavigator } from "./artists.navigator";
import { MapScreen } from "../../features/map/screens/map.screen";
import { AuthenticationContext } from "../../services/authentication/authentication.context";
import { ArtistsContextProvider } from "../../services/hive/artists.context";
import { LocationContextProvider } from "../../services/location/location.context";
import { FavouritesContextProvider } from "../../services/favourites/favourites.context";

const Tab = createBottomTabNavigator();

const TAB_ICON = {
  Artists: "color-palette-sharp",
  Map: "map",
  Settings: "settings",
};

const SettingsScreen = () => {
  const { onLogout } = useContext(AuthenticationContext);
  return (
    <SafeArea>
      <Text>Settings</Text>
      <Button title="Logout" onPress={onLogout} />
    </SafeArea>
  );
};

export const AppNavigator = () => (
  <FavouritesContextProvider>
    <LocationContextProvider>
      <ArtistsContextProvider>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={TAB_ICON[route.name]} size={size} color={color} />
            ),
            tabBarActiveTintColor: "tomato",
            tabBarInactiveTintColor: "gray",
            headerShown: false,
          })}
        >
          <Tab.Screen name="Artists" component={ArtistsNavigator} />
          <Tab.Screen name="Map" component={MapScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </ArtistsContextProvider>
    </LocationContextProvider>
  </FavouritesContextProvider>
);
