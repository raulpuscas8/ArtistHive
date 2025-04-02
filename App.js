import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React from "react";
import { ThemeProvider } from "styled-components/native";
import {
  useFonts as useOswald,
  Oswald_400Regular,
} from "@expo-google-fonts/oswald";
import { useFonts as useLato, Lato_400Regular } from "@expo-google-fonts/lato";

import { theme } from "./src/infrastructure/theme";
import { Navigation } from "./src/infrastructure/navigation";
import { AuthenticationContextProvider } from "./src/services/authentication/authentication.context";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDO3VBNkgDjbiZ5gEWbixQhEgnruJgdoWw",
  authDomain: "artisthive-3d6da.firebaseapp.com",
  projectId: "artisthive-3d6da",
  storageBucket: "artisthive-3d6da.firebasestorage.app",
  messagingSenderId: "936810334037",
  appId: "1:936810334037:web:04679ca1dc6732306451dc",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default function App() {
  const [oswaldLoaded] = useOswald({
    Oswald_400Regular,
  });

  const [latoLoaded] = useLato({
    Lato_400Regular,
  });

  if (!oswaldLoaded || !latoLoaded) {
    return null;
  }

  return (
    <AuthenticationContextProvider>
      <ThemeProvider theme={theme}>
        <Navigation />
        <ExpoStatusBar style="auto" />
      </ThemeProvider>
    </AuthenticationContextProvider>
  );
}
