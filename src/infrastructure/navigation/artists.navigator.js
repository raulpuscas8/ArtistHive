import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ArtistScreen } from "../../features/hive/screens/artist.screen";
import { ArtistDetailScreen } from "../../features/hive/screens/artist-detail.screen";

const ArtistStack = createStackNavigator();

export const ArtistsNavigator = () => {
  return (
    <ArtistStack.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTitleAlign: "center",
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ paddingLeft: 16 }}
          >
            <Ionicons name="menu" size={24} color="black" />
          </TouchableOpacity>
        ),
      })}
    >
      <ArtistStack.Screen name="ArtistsList" component={ArtistScreen} />
      <ArtistStack.Screen
        name="ArtistDetail"
        component={ArtistDetailScreen}
        options={{ headerShown: false }}
      />
    </ArtistStack.Navigator>
  );
};
