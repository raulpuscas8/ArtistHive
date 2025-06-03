// src/services/location/location.context.js

import React, { createContext, useState, useEffect } from "react";
import * as Location from "expo-location";

export const LocationContext = createContext();

const DEFAULT_LOCATION = {
  lat: 45.7489, // Timișoara
  lng: 21.2087,
  viewport: {
    northeast: { lat: 45.7589, lng: 21.2187 },
    southwest: { lat: 45.7389, lng: 21.1987 },
  },
};

export const LocationContextProvider = ({ children }) => {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState(DEFAULT_LOCATION);

  const search = (searchKeyword) => {
    setKeyword(searchKeyword);
  };

  useEffect(() => {
    let isActive = true;

    const forwardGeocode = async () => {
      // If the search bar is empty, always show default location!
      if (!keyword || keyword.trim() === "") {
        setLocation(DEFAULT_LOCATION);
        return;
      }
      try {
        const results = await Location.geocodeAsync(keyword);
        if (isActive && results.length > 0) {
          const { latitude, longitude } = results[0];
          const delta = 0.01;
          const viewport = {
            northeast: { lat: latitude + delta, lng: longitude + delta },
            southwest: { lat: latitude - delta, lng: longitude - delta },
          };
          setLocation({
            lat: latitude,
            lng: longitude,
            viewport,
          });
        }
      } catch (err) {
        console.error("LocationContext geocode failed:", err);
      }
    };

    forwardGeocode();
    return () => {
      isActive = false;
    };
  }, [keyword]);

  return (
    <LocationContext.Provider
      value={{
        location,
        search,
        keyword,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
