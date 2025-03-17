import React, { useState, useContext, createContext, useEffect } from "react";
import { artistsRequest, artistsTransform } from "./artists.service";
import { LocationContext } from "../location/location.context";

export const ArtistsContext = createContext();

export const ArtistsContextProvider = ({ children }) => {
  const [artists, setartists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { location } = useContext(LocationContext);

  const retrieveartists = (loc) => {
    setIsLoading(true);
    setartists([]);
    setTimeout(() => {
      artistsRequest(loc)
        .then(artistsTransform)
        .then((results) => {
          setIsLoading(false);
          setartists(results);
        })
        .catch((err) => {
          setIsLoading(false);
          setError(err);
        });
    }, 2000);
  };
  useEffect(() => {
    if (location) {
      const locationString = `${location.lat},${location.lng}`;
      retrieveartists(locationString);
    }
  }, [location]);

  return (
    <ArtistsContext.Provider
      value={{
        artists,
        isLoading,
        error,
      }}
    >
      {children}
    </ArtistsContext.Provider>
  );
};
