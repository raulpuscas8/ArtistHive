import React, { useState, createContext, useEffect } from "react";
import {
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";

export const AuthenticationContext = createContext();

export const AuthenticationContextProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const onLogin = (email, password) => {
    setIsLoading(true);
    setError(null);

    signInWithEmailAndPassword(auth, email, password)
      .then((u) => {
        setUser(u.user);
        setIsLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Login failed");
        setIsLoading(false);
      });
  };

  const onRegister = (email, password, repeatedPassword) => {
    setIsLoading(true);
    setError(null);

    if (password !== repeatedPassword) {
      setIsLoading(false);
      setError("Passwords do not match");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((u) => {
        setUser(u.user);
        setIsLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Registration failed");
        setIsLoading(false);
      });
  };

  const onLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        setError(null);
      })
      .catch((e) => console.log("Logout error", e));
  };

  return (
    <AuthenticationContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        isLoading,
        error,
        onLogin,
        onRegister,
        onLogout,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
