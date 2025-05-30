// src/features/hive/screens/map-picker.screen.js

import React, { useState, useContext, useEffect } from "react";
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

export const MapPickerScreen = ({ navigation }) => {
  const { location, search } = useContext(LocationContext);
  const [marker, setMarker] = useState(null);
  const [region, setRegion] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // 1) Get device's current location for initial map center
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

  // 2) If user searches via Search bar, update region accordingly
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
      navigation.navigate("AddArtist", {
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
    <View style={StyleSheet.absoluteFill}>
      {/* Search by city/place */}
      <Search />
      <MapView
        style={StyleSheet.absoluteFill}
        region={region}
        onRegionChangeComplete={setRegion}
        onLongPress={onLongPress}
      >
        {marker && <Marker coordinate={marker} />}
      </MapView>
      <TouchableOpacity style={styles.button} onPress={confirmLocation}>
        <Text style={styles.buttonText}>Confirm Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
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
