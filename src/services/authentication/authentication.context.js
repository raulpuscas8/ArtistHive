import React, { useState, createContext, useEffect } from "react";
import {
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

export const AuthenticationContext = createContext();

export const AuthenticationContextProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // Add this line
  const [error, setError] = useState(null);

  const auth = getAuth();
  const db = getFirestore();

  // Helper function to fetch user role from Firestore
  const fetchUserRole = async (uid) => {
    try {
      console.log("Fetching user role for uid:", uid);
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        console.log("User doc found. Data:", userDoc.data());
        setUserRole(userDoc.data().role);
      } else {
        console.log("User doc NOT found for uid:", uid);
        setUserRole(null);
      }
    } catch (err) {
      console.log("Error fetching user role:", err);
      setUserRole(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (usr) {
        fetchUserRole(usr.uid);
      } else {
        setUserRole(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLogin = (email, password) => {
    setIsLoading(true);
    setError(null);

    signInWithEmailAndPassword(auth, email, password)
      .then(async (u) => {
        setUser(u.user);
        await fetchUserRole(u.user.uid);
        setIsLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Parola greșită");
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
      .then(async (u) => {
        // Create user profile in Firestore with default role "user"
        await setDoc(doc(db, "users", u.user.uid), {
          email: email,
          role: "user",
        });
        setUser(u.user);
        await fetchUserRole(u.user.uid);
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
        setUserRole(null);
        setError(null);
      })
      .catch((e) => console.log("Logout error", e));
  };

  return (
    <AuthenticationContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        userRole, // Add this
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
