import React from "react";

import { createStackNavigator } from "@react-navigation/stack";

import { ArtistScreen } from "../../features/hive/screens/artist.screen";
import { Text } from "react-native";

const ArtistStack = createStackNavigator();

export const ArtistsNavigator = () => {
  return (
    <ArtistStack.Navigator headerMode="none">
      <ArtistStack.Screen name="Artists" component={ArtistScreen} />
      <ArtistStack.Screen
        name="ArtistDetail"
        component={() => <Text>Artist Detail</Text>}
      />
    </ArtistStack.Navigator>
  );
};
