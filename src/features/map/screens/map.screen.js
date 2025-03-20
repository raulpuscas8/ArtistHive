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

export const MapScreen = () => {
  const { location } = useContext(LocationContext);
  const { artists = [] } = useContext(ArtistsContext);

  const [latDelta, setLatDelta] = useState(0);

  const { lat, lng, viewport } = location;

  useEffect(() => {
    const northeastLat = viewport.northeast.lat;
    const southwestLat = viewport.southwest.lat;

    setLatDelta(northeastLat - southwestLat);
  }, [location, viewport]);

  if (!location) {
    return null;
  }

  return (
    <>
      <Search />
      <Map
        region={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: latDelta,
          longitudeDelta: 0.02,
        }}
      >
        {artists.map((artist) => {
          return (
            <Marker
              key={artist.name}
              title={artist.name}
              coordinate={{
                latitude: artist.geometry.location.lat,
                longitude: artist.geometry.location.lng,
              }}
            >
              <Callout>
                <MapCallout artist={artist} />
              </Callout>
            </Marker>
          );
        })}
      </Map>
    </>
  );
};
