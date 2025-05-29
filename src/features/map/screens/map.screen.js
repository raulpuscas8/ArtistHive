// src/features/map/screens/map.screen.js

import React, { useContext, useState, useEffect } from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import styled from "styled-components/native";

import { Search } from "../components/search.component";
import { LocationContext } from "../../../services/location/location.context";
import { ArtistsContext } from "../../../services/hive/artists.context";
import { MapCallout } from "../components/map-callout.component";

const Map = styled(MapView)`
  height: 100%;
  width: 100%;
`;

export const MapScreen = ({ navigation }) => {
  const { location } = useContext(LocationContext);
  const { artists = [] } = useContext(ArtistsContext);

  const [latDelta, setLatDelta] = useState(0);
  const [pins, setPins] = useState([]);

  // 1) Recompute zoom delta when location changes
  useEffect(() => {
    if (location?.viewport) {
      const ne = location.viewport.northeast.lat;
      const sw = location.viewport.southwest.lat;
      setLatDelta(ne - sw);
    }
  }, [location]);

  // 2) Turn your Firestore GeoPoints into markers
  useEffect(() => {
    const withLocation = artists.filter((a) => a.location);
    const mapped = withLocation.map((a) => ({
      id: a.id,
      title: a.name,
      coordinate: {
        latitude: a.location.latitude,
        longitude: a.location.longitude,
      },
      // pass the full artist object down to the Callout
      artist: a,
    }));
    setPins(mapped);
  }, [artists]);

  if (!location) {
    return null; // or a loader
  }

  return (
    <>
      <Search />
      <Map
        region={{
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: latDelta,
          longitudeDelta: 0.02,
        }}
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
            >
              <MapCallout artist={pin.artist} />
            </Callout>
          </Marker>
        ))}
      </Map>
    </>
  );
};
