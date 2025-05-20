// src/services/location/location.context.js

import React, { createContext, useState, useEffect } from "react";
import * as Location from "expo-location";

export const LocationContext = createContext();

export const LocationContextProvider = ({ children }) => {
  // the current text in the search bar
  const [keyword, setKeyword] = useState("Search for a location");
  // the geocoded result we share with consumers
  const [location, setLocation] = useState(null);

  // <-- called by your Search component -->
  const search = (searchKeyword) => {
    setKeyword(searchKeyword);
  };

  // whenever `keyword` changes, forward‐geocode it:
  useEffect(() => {
    let isActive = true;
    const forwardGeocode = async () => {
      try {
        // geocodeAsync works in Expo Go on iOS & Android
        const results = await Location.geocodeAsync(keyword);
        if (isActive && results.length > 0) {
          const { latitude, longitude } = results[0];
          // build a viewport so your map zooms reasonably
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
