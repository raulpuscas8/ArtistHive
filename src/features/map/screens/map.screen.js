import React, { useContext, useState, useEffect } from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import styled from "styled-components/native";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "../../../components/typography/text.component"; // <-- use your custom Text!
import { Search } from "../components/search.component";
import { LocationContext } from "../../../services/location/location.context";
import { ArtistsContext } from "../../../services/hive/artists.context";
import { MapCallout } from "../components/map-callout.component";

const Map = styled(MapView)`
  flex: 1;
`;

export const MapScreen = ({ navigation }) => {
  const { location } = useContext(LocationContext);
  const { artists = [] } = useContext(ArtistsContext);

  const [latDelta, setLatDelta] = useState(0);
  const [pins, setPins] = useState([]);

  useEffect(() => {
    if (location?.viewport) {
      const ne = location.viewport.northeast.lat;
      const sw = location.viewport.southwest.lat;
      setLatDelta(ne - sw);
    }
  }, [location]);

  useEffect(() => {
    const withLocation = artists.filter((a) => a.location);
    const mapped = withLocation.map((a) => ({
      id: a.id,
      title: a.name,
      coordinate: {
        latitude: a.location.latitude,
        longitude: a.location.longitude,
      },
      artist: a,
    }));
    setPins(mapped);
  }, [artists]);

  if (!location) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#733B73",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="map-outline" size={48} color="#F55654" />
        <Text style={{ color: "#F55654", fontSize: 20, marginTop: 12 }}>
          Loading map…
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#733B73" }}>
      {/* Drawer menu button */}
      <TouchableOpacity
        onPress={() => navigation.openDrawer()}
        style={styles.menuButton}
        activeOpacity={0.7}
      >
        <Ionicons name="menu" size={32} color="#F55654" />
      </TouchableOpacity>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Ionicons
          name="map"
          size={28}
          color="#F55654"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.headerText}>Harta artiștilor</Text>
      </View>
      {/* Search Bar */}
      <View style={styles.mapCard}>
        <Map
          region={{
            latitude: location.lat,
            longitude: location.lng,
            latitudeDelta: latDelta,
            longitudeDelta: 0.02,
          }}
          style={{ borderRadius: 22 }}
        >
          {pins.map((pin) => (
            <Marker key={pin.id} title={pin.title} coordinate={pin.coordinate}>
              <Callout
                onPress={() =>
                  navigation.navigate("Artists", {
                    screen: "ArtistDetail",
                    params: { artist: pin.artist },
                  })
                }
                tooltip={true}
              >
                <MapCallout artist={pin.artist} />
              </Callout>
            </Marker>
          ))}
        </Map>
        {/* Search bar overlay */}
        <View style={styles.searchOverlay}>
          <Search />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    position: "absolute",
    top: 52,
    left: 18,
    backgroundColor: "#fff5e6",
    borderRadius: 16,
    padding: 8,
    zIndex: 10,
    shadowColor: "#f99551",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 90, // << Higher value to move header lower
    marginBottom: 18,
    paddingVertical: 10,
    width: "100%",
  },
  headerText: {
    color: "#fff5e6",
    fontWeight: "bold",
    fontSize: 28,
    letterSpacing: 1,
  },
  mapCard: {
    flex: 1,
    borderRadius: 22,
    marginHorizontal: 1,
    overflow: "hidden",
    shadowColor: "#733B73",
    shadowOpacity: 0.13,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    backgroundColor: "white",
  },
  searchOverlay: {
    position: "absolute",
    top: 22,
    left: 12,
    right: 12,
    zIndex: 100,
    shadowColor: "#321b47",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: "#fff8", // ← if you want a frosted look
    borderRadius: 16,
  },
});
