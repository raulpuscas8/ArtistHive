import React from "react";

import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

import { ArtistScreen } from "../../features/hive/screens/artist.screen";
import { ArtistDetailScreen } from "../../features/hive/screens/artist-detail.screen";

const ArtistStack = createStackNavigator();

export const ArtistsNavigator = () => {
  return (
    <ArtistStack.Navigator
      headerMode="none"
      screenOptions={{
        ...TransitionPresets.ModalPresentationIOS,
      }}
    >
      <ArtistStack.Screen name="ArtistsList" component={ArtistScreen} />
      <ArtistStack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
    </ArtistStack.Navigator>
  );
};
