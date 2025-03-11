import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React from "react";
import {
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  Platform,
} from "react-native";
import { ArtistScreen } from "./src/features/hive/screens/artist.screen";

export default function App() {
  return (
    <>
      <ArtistScreen />
      <ExpoStatusBar style="auto" />
    </>
  );
}
