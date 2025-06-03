import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Text } from "../../../components/typography/text.component"; // Use your styled text!

export const MapCallout = ({ artist }) => (
  <View style={styles.callout}>
    <Image
      source={{ uri: artist.photos?.[0] || "https://via.placeholder.com/100" }}
      style={styles.image}
      resizeMode="cover"
    />
    <Text style={styles.name}>{artist.name}</Text>
  </View>
);

const styles = StyleSheet.create({
  callout: {
    alignItems: "center",
    minWidth: 120,
    maxWidth: 180,
    paddingVertical: 2,
    paddingHorizontal: 4,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    elevation: 6,
    shadowColor: "#321b47",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#733B73",
  },
  name: {
    color: "#f55654",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    textShadowColor: "#fff",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    paddingHorizontal: 4,
    paddingBottom: 2,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: -6,
  },
});
