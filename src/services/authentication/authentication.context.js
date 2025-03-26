import React, { useState, createContext, useRef, useEffect } from "react";
import {
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  getAuth,
} from "firebase/auth";

import { loginRequest } from "./authentication.service";

export const AuthenticationContext = createContext();

export const AuthenticationContextProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const auth = useRef(getAuth()).current;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      if (usr) {
        setUser(usr);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const onLogin = (email, password) => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      loginRequest(auth, email, password)
        .then((u) => {
          setUser(u);
          setIsLoading(false);
        })
        .catch((e) => {
          setIsLoading(false);
          setError(e.message || "Login failed");
        });
    }, 300);
  };

  const onRegister = (email, password, repeatedPassword) => {
    setIsLoading(true);
    setError(null);

    if (password !== repeatedPassword) {
      setTimeout(() => {
        setIsLoading(false);
        setError("Error: Passwords do not match");
      }, 100);
      return;
    }

    setTimeout(() => {
      createUserWithEmailAndPassword(auth, email, password)
        .then((u) => {
          setUser(u);
          setIsLoading(false);
        })
        .catch((e) => {
          setIsLoading(false);
          setError(e.message || "Registration failed");
        });
    }, 100);
  };

  const onLogout = () => {
    signOut(auth).then(() => {
      setUser(null);
      setError(null);
    });
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
