import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ArtistScreen } from "../../features/hive/screens/artist.screen";
import { ArtistDetailScreen } from "../../features/hive/screens/artist-detail.screen";
import { PaymentWebViewScreen } from "../../features/payment/screens/payment-webview.screen";
import { AuthenticationContext } from "../../services/authentication/authentication.context";
import { useTheme } from "styled-components/native";
import { EditArtistScreen } from "../../features/hive/screens/edit-artist.screen";
import { MapPickerScreen } from "../../features/hive/screens/map-picker.screen";

const ArtistStack = createStackNavigator();

export const ArtistsNavigator = () => {
  const { user } = useContext(AuthenticationContext);
  const theme = useTheme();

  const name =
    user?.displayName ||
    (user?.email &&
      user.email.split("@")[0].charAt(0).toUpperCase() +
        user.email.split("@")[0].slice(1)) ||
    "Artist";

  return (
    <ArtistStack.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: theme.colors.brand.teal,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: "white",
          fontFamily: theme.fonts.heading,
          fontWeight: "bold",
          fontSize: 24,
          letterSpacing: 1,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ paddingLeft: 16 }}
          >
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
        ),
      })}
    >
      <ArtistStack.Screen
        name="ArtistsList"
        component={ArtistScreen}
        options={{
          headerTitle: `Salut, ${name}!`,
        }}
      />
      <ArtistStack.Screen
        name="ArtistDetail"
        component={ArtistDetailScreen}
        options={{ headerShown: false }}
      />
      <ArtistStack.Screen
        name="Stripe Web Payment"
        component={PaymentWebViewScreen}
        options={{
          headerShown: true,
          headerTitle: "Plată",
        }}
      />
      <ArtistStack.Screen
        name="EditArtist"
        component={EditArtistScreen}
        options={{
          headerShown: false,
        }}
      />
      <ArtistStack.Screen
        name="MapPicker"
        component={MapPickerScreen}
        options={{
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      />
    </ArtistStack.Navigator>
  );
};
