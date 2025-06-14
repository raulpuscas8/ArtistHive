import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthenticationContext } from "../authentication/authentication.context";

export const FavouritesContext = createContext();

export const FavouritesContextProvider = ({ children }) => {
  const { user } = useContext(AuthenticationContext);
  const [favourites, setFavourites] = useState([]); // Array of artist IDs

  const saveFavourites = async (value, uid) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(`@favourites-${uid}`, jsonValue);
    } catch (e) {
      console.log("Error storing favourites:", e);
    }
  };

  const loadFavourites = async (uid) => {
    try {
      const value = await AsyncStorage.getItem(`@favourites-${uid}`);
      if (value) {
        const parsedValue = JSON.parse(value);
        if (Array.isArray(parsedValue)) {
          setFavourites(parsedValue);
        } else {
          setFavourites([]);
        }
      } else {
        setFavourites([]);
      }
    } catch (e) {
      console.log("Error loading favourites:", e);
    }
  };

  const add = (artistId) => {
    if (!favourites.includes(artistId)) {
      const newFavourites = [...favourites, artistId];
      setFavourites(newFavourites);
      saveFavourites(newFavourites, user.uid);
    }
  };

  const remove = (artistId) => {
    const newFavourites = favourites.filter((id) => id !== artistId);
    setFavourites(newFavourites);
    saveFavourites(newFavourites, user.uid);
  };

  useEffect(() => {
    if (user) {
      loadFavourites(user.uid);
    } else {
      setFavourites([]);
    }
  }, [user]);

  return (
    <FavouritesContext.Provider
      value={{
        favourites, // Array of artist IDs
        addToFavourites: add,
        removeFromFavourites: remove,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
};
