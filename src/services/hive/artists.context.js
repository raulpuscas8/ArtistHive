import React, { useState, createContext, useEffect, useMemo } from "react";
import { artistsRequest, artistsTransform } from "./artists.service";

export const ArtistsContext = createContext();

export const ArtistsContextProvider = ({ children }) => {
  const [artists, setartists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const retrieveartists = () => {
    setIsLoading(true);
    setTimeout(() => {
      artistsRequest()
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
    retrieveartists();
  }, []);

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
