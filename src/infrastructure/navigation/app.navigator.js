// src/infrastructure/navigation/app.navigator.js

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";

import { ArtistsNavigator } from "./artists.navigator";
import { MapScreen } from "../../features/map/screens/map.screen";
import { SettingsNavigator } from "./settings.navigator";

const Tab = createBottomTabNavigator();

const TAB_ICON = {
  Artists: "color-palette-sharp",
  Map: "map",
  Settings: "settings",
};

export const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => (
        <Ionicons name={TAB_ICON[route.name]} size={size} color={color} />
      ),
      tabBarActiveTintColor: "#F55654",
      tabBarInactiveTintColor: "gray",
      headerShown: false,
      tabBarStyle: {
        backgroundColor: "#FAF7F2",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 18,
        position: "absolute",
        height: 70,
      },
      tabBarLabelStyle: {
        fontWeight: "bold",
      },
    })}
  >
    <Tab.Screen
      name="Artists"
      component={ArtistsNavigator}
      options={{
        tabBarLabel: ({ focused }) => (
          <Text
            style={{
              color: focused ? "#F55654" : "gray",
              fontWeight: "bold",
              fontSize: 12,
            }}
          >
            Artists
          </Text>
        ),
      }}
    />
    <Tab.Screen
      name="Map"
      component={MapScreen}
      options={{
        tabBarLabel: ({ focused }) => (
          <Text
            style={{
              color: focused ? "#F55654" : "gray",
              fontWeight: "bold",
              fontSize: 12,
            }}
          >
            Map
          </Text>
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsNavigator}
      options={{
        tabBarLabel: ({ focused }) => (
          <Text
            style={{
              color: focused ? "#F55654" : "gray",
              fontWeight: "bold",
              fontSize: 12,
            }}
          >
            Settings
          </Text>
        ),
      }}
    />
  </Tab.Navigator>
);
