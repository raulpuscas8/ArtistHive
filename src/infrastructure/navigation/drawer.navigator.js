import React, { useContext, useState, useEffect } from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Avatar } from "react-native-paper";
import styled from "styled-components/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Text } from "../../components/typography/text.component";
import { SafeArea } from "../../components/utility/safe-area.component";

import { AppNavigator } from "./app.navigator";
import { AuthenticationContext } from "../../services/authentication/authentication.context";

const Drawer = createDrawerNavigator();

const DrawerHeader = styled.View`
  align-items: center;
  padding: 20px;
  background-color: #f5f5f5;
`;

const CustomDrawerContent = (props) => {
  const { user } = useContext(AuthenticationContext);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const loadPhoto = async () => {
      const uri = await AsyncStorage.getItem(`${user.uid}-photo`);
      setPhoto(uri);
    };
    loadPhoto();
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

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={AppNavigator} />
    </Drawer.Navigator>
  );
};
