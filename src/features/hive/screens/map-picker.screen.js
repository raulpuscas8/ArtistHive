// src/features/hive/screens/map-picker.screen.js

import React, { useState, useContext, useEffect, useLayoutEffect } from "react";
import {
  View,
  Alert,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { LocationContext } from "../../../services/location/location.context";
import { Search } from "../../map/components/search.component";
import { Ionicons } from "@expo/vector-icons";

export const MapPickerScreen = ({ navigation, route }) => {
  const { location, search } = useContext(LocationContext);
  const [marker, setMarker] = useState(null);
  const [region, setRegion] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  // Get device's current location for initial map center
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Cannot access device location.");
          return;
        }
        const { coords } = await Location.getCurrentPositionAsync({});
        const initialRegion = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setRegion(initialRegion);
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Failed to fetch device location.");
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  // If user searches via Search bar, update region accordingly
  useEffect(() => {
    if (location) {
      const { lat, lng, viewport } = location;
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: viewport.northeast.lat - viewport.southwest.lat,
        longitudeDelta: 0.02,
      });
    }
  }, [location]);

  const onLongPress = ({ nativeEvent }) => {
    const { latitude, longitude } = nativeEvent.coordinate;
    setMarker({ latitude, longitude });
  };

  const confirmLocation = async () => {
    if (!marker) {
      return Alert.alert(
        "Pick a location",
        "Long-press on the map to drop a pin."
      );
    }
    try {
      const [info] = await Location.reverseGeocodeAsync({
        latitude: marker.latitude,
        longitude: marker.longitude,
      });
      const address = [
        info.name,
        info.street,
        info.city,
        info.region,
        info.postalCode,
        info.country,
      ]
        .filter(Boolean)
        .join(", ");
      const returnTo = route.params?.returnTo || "AddArtist";
      navigation.navigate(returnTo, {
        pickedLoc: { lat: marker.latitude, lng: marker.longitude },
        pickedAddress: address,
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Couldn’t reverse-geocode that point.");
    }
  };

  if (loadingLocation || !region) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Floating menu button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          top: 52,
          left: 28,
          backgroundColor: "#fff5e6",
          borderRadius: 16,
          padding: 8,
          zIndex: 20,
          shadowColor: "#f99551",
          shadowOpacity: 0.14,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="menu" size={32} color="#F55654" />
      </TouchableOpacity>

      {/* The rest of your content: */}
      <View style={styles.searchOverlay}>
        <Search />
      </View>
      <MapView
        style={StyleSheet.absoluteFill}
        region={region}
        onRegionChangeComplete={setRegion}
        onLongPress={onLongPress}
      >
        {marker && <Marker coordinate={marker} />}
      </MapView>
      <TouchableOpacity style={styles.button} onPress={confirmLocation}>
        <Text style={styles.buttonText}>Confirmă locația</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchOverlay: {
    position: "absolute",
    top: 90,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  button: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#333",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16 },
});
