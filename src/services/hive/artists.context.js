// src/services/hive/artists.context.js
import React, { createContext, useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../utils/firebase.config";

export const ArtistsContext = createContext();

export const ArtistsContextProvider = ({ children }) => {
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // start loading
    setIsLoading(true);

    // create a query against the "artists" collection, ordered by name
    const q = query(collection(db, "artists"), orderBy("name"));

    // subscribe to changes
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setArtists(list);
        setIsLoading(false);
      },
      (err) => {
        console.error("Artists subscription error:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    // cleanup on unmount
    return () => unsubscribe();
  }, []);

  return (
    <ArtistsContext.Provider value={{ artists, isLoading, error }}>
      {children}
    </ArtistsContext.Provider>
  );
};
