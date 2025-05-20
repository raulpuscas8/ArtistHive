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
  const [visibleArtists, setVisibleArtists] = useState([]);

  // 1) Recompute zoom delta when location changes
  useEffect(() => {
    if (location?.viewport) {
      const ne = location.viewport.northeast.lat;
      const sw = location.viewport.southwest.lat;
      setLatDelta(ne - sw);
    }
  }, [location]);

  // 2) Filter artists into the current viewport bounds
  useEffect(() => {
    if (location?.viewport && artists.length) {
      const { northeast, southwest } = location.viewport;
      const inBounds = artists.filter((artist) => {
        const aLat = artist.geometry.location.lat;
        const aLng = artist.geometry.location.lng;
        return (
          aLat <= northeast.lat &&
          aLat >= southwest.lat &&
          aLng <= northeast.lng &&
          aLng >= southwest.lng
        );
      });
      setVisibleArtists(inBounds);
    }
  }, [artists, location]);

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
        {visibleArtists.map((artist) => (
          <Marker
            key={artist.id}
            title={artist.name}
            coordinate={{
              latitude: artist.geometry.location.lat,
              longitude: artist.geometry.location.lng,
            }}
          >
            <Callout
              onPress={() =>
                navigation.navigate("Artists", {
                  screen: "ArtistDetail",
                  params: { artist },
                })
              }
            >
              <MapCallout artist={artist} />
            </Callout>
          </Marker>
        ))}
      </Map>
    </>
  );
};
