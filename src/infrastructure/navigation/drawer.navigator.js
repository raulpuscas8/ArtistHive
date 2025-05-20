// src/infrastructure/navigation/drawer.navigator.js

import React, { useContext, useState, useEffect } from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { Avatar } from "react-native-paper";
import styled from "styled-components/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AuthenticationContext } from "../../services/authentication/authentication.context";
import { AppNavigator } from "./app.navigator";
import { AddArtistScreen } from "../../features/hive/screens/add-artist.screen";
import { MapPickerScreen } from "../../features/hive/screens/map-picker.screen";
import { Text } from "../../components/typography/text.component";

const Drawer = createDrawerNavigator();
const AddArtistStack = createStackNavigator();

function AddArtistStackNavigator() {
  return (
    <AddArtistStack.Navigator screenOptions={{ headerShown: false }}>
      <AddArtistStack.Screen name="AddArtist" component={AddArtistScreen} />
      <AddArtistStack.Screen name="MapPicker" component={MapPickerScreen} />
    </AddArtistStack.Navigator>
  );
}

const DrawerHeader = styled.View`
  align-items: center;
  padding: 20px;
  background-color: #f5f5f5;
`;

const CustomDrawerContent = (props) => {
  const { user } = useContext(AuthenticationContext);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(`${user.uid}-photo`).then(setPhoto);
  }, [user]);

  return (
    <DrawerContentScrollView {...props}>
      <DrawerHeader>
        {photo ? (
          <Avatar.Image size={100} source={{ uri: photo }} />
        ) : (
          <Avatar.Icon size={100} icon="human" backgroundColor="#2182BD" />
        )}
        <Text variant="label" style={{ marginTop: 10 }}>
          {user.email}
        </Text>
      </DrawerHeader>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

export const DrawerNavigator = () => (
  <Drawer.Navigator
    screenOptions={{ headerShown: false }}
    drawerContent={(props) => <CustomDrawerContent {...props} />}
  >
    <Drawer.Screen name="Home" component={AppNavigator} />
    <Drawer.Screen name="Add Artist" component={AddArtistStackNavigator} />
  </Drawer.Navigator>
);
