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
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

import { AuthenticationContext } from "../../services/authentication/authentication.context";
import { AppNavigator } from "./app.navigator";
import { AddArtistScreen } from "../../features/hive/screens/add-artist.screen";
import { MapPickerScreen } from "../../features/hive/screens/map-picker.screen";
import { Text } from "../../components/typography/text.component";
import { PaymentWebViewScreen } from "../../features/payment/screens/payment-webview.screen";
import { FavouritesScreen } from "../../features/settings/screens/favourites.screen";
import { MapScreen } from "../../features/map/screens/map.screen";
import { SettingsNavigator } from "./settings.navigator";

// Drawer, Stack
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

// Gradient header
const DrawerHeader = styled(LinearGradient).attrs({
  colors: ["#427c80", "#91b87c"],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
})`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 220px;
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
`;

const DrawerHeaderContent = styled.View`
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  padding-top: 40px;
  padding-bottom: 20px;
  height: 220px;
`;

const DrawerAvatarBorder = styled.View`
  border-width: 4px;
  border-color: #ffd58c;
  border-radius: 100px;
  padding: 2px;
  margin-bottom: 8px;
  background-color: #fff;
  elevation: 6;
`;

const DrawerEmail = styled(Text)`
  color: #ffd58c;
  font-weight: 700;
  margin-top: 12px;
  font-size: 18px;
`;

const CustomDrawerContent = (props) => {
  const { user } = useContext(AuthenticationContext);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(`${user.uid}-photo`).then(setPhoto);
  }, [user]);

  return (
    <DrawerContentScrollView
      {...props}
      style={{
        backgroundColor: "#FAF7F2", // <- from theme
        padding: 0,
        flex: 1,
      }}
      contentContainerStyle={{ padding: 0, flex: 1 }}
    >
      {/* Header with gradient edge-to-edge */}
      <View style={{ height: 220, marginBottom: 0, position: "relative" }}>
        <DrawerHeader pointerEvents="none" />
        <DrawerHeaderContent>
          <DrawerAvatarBorder>
            {photo ? (
              <Avatar.Image size={100} source={{ uri: photo }} />
            ) : (
              <Avatar.Icon
                size={100}
                icon="human"
                backgroundColor="#ffd58c"
                color="#427c80"
              />
            )}
          </DrawerAvatarBorder>
          <DrawerEmail>{user.email}</DrawerEmail>
        </DrawerHeaderContent>
      </View>

      {/* Soft divider */}
      <View
        style={{
          height: 1,
          backgroundColor: "#e5e2eb",
          marginHorizontal: 32,
          marginBottom: 16,
          marginTop: 8,
          opacity: 0.5,
          borderRadius: 1,
        }}
      />

      {/* Drawer Items */}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

export const DrawerNavigator = () => (
  <Drawer.Navigator
    screenOptions={{
      headerShown: false,
      drawerActiveTintColor: "#f55654",
      drawerInactiveTintColor: "#733b73",
      drawerActiveBackgroundColor: "#ffd58c",
      drawerInactiveBackgroundColor: "#FAF7F2",
      drawerLabelStyle: {
        fontWeight: "bold",
        fontSize: 16,
        marginLeft: -2,
        marginRight: 8,
        paddingLeft: 8,
      },
      drawerItemStyle: {
        marginVertical: 6,
        borderRadius: 24,
      },
      drawerStyle: {
        backgroundColor: "#FAF7F2",
        borderTopRightRadius: 28,
        width: 320,
      },
      sceneContainerStyle: {
        backgroundColor: "#FAF7F2",
      },
    }}
    drawerContent={(props) => <CustomDrawerContent {...props} />}
  >
    <Drawer.Screen
      name="Acasă"
      component={AppNavigator}
      options={{
        drawerIcon: ({ size }) => (
          <Avatar.Icon
            icon="home"
            size={size}
            color="#fff"
            style={{ backgroundColor: "#733b73" }}
          />
        ),
      }}
    />
    <Drawer.Screen
      name="Adaugă un anunț"
      component={AddArtistStackNavigator}
      options={{
        drawerIcon: ({ size }) => (
          <Avatar.Icon
            icon="plus"
            size={size}
            color="#fff"
            style={{ backgroundColor: "#f55654" }}
          />
        ),
      }}
    />
    <Drawer.Screen
      name="Favorite"
      component={FavouritesScreen}
      options={{
        drawerIcon: ({ size }) => (
          <Avatar.Icon
            icon="heart"
            size={size}
            color="#fff"
            style={{ backgroundColor: "#f99551" }}
          />
        ),
      }}
    />
    <Drawer.Screen
      name="Donație"
      component={PaymentWebViewScreen}
      options={{
        drawerIcon: ({ size }) => (
          <Avatar.Icon
            icon="credit-card"
            size={size}
            color="#fff"
            style={{ backgroundColor: "#91b87c" }}
          />
        ),
      }}
    />
    <Drawer.Screen
      name="Hartă"
      component={MapScreen}
      options={{
        drawerIcon: ({ size }) => (
          <Avatar.Icon
            icon="map"
            size={size}
            color="#fff"
            style={{ backgroundColor: "#427c80" }}
          />
        ),
      }}
    />
    <Drawer.Screen
      name="Setări"
      component={SettingsNavigator}
      options={{
        drawerIcon: ({ size }) => (
          <Avatar.Icon
            icon="cog"
            size={size}
            color="#fff"
            style={{ backgroundColor: "#733b73" }}
          />
        ),
      }}
    />
  </Drawer.Navigator>
);
