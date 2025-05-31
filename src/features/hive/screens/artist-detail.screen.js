// src/features/hive/screens/artist-detail.screen.js

import React, { useState, useContext } from "react";
import { ScrollView, Linking, Alert } from "react-native";
import { List, Divider } from "react-native-paper";

import { ArtistInfoCard } from "../components/artist-info-card.component";
import { SafeArea } from "../../../components/utility/safe-area.component";
import { Button } from "react-native";

import { AuthenticationContext } from "../../../services/authentication/authentication.context";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref as storageRef, deleteObject } from "firebase/storage";

export const ArtistDetailScreen = ({ route, navigation }) => {
  const { artist } = route.params;
  const [descExpanded, setDescExpanded] = useState(true);
  const [contactExpanded, setContactExpanded] = useState(false);
  const [pricingExpanded, setPricingExpanded] = useState(false);

  // NEW: Get userRole from context
  const { userRole } = useContext(AuthenticationContext);

  const handlePress = async (type, value) => {
    let url = value;
    if (type === "email") {
      url = `mailto:${value}`;
    } else if (type === "phone") {
      url = `tel:${value}`;
    } else {
      url = value.startsWith("http") ? value : `https://${value}`;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Can't handle this URL:", url);
        return;
      }
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert("An error occurred:", err.message);
    }
  };

  const getPriceLabel = () => {
    if (!artist.price || !artist.currency) return "Not specified.";
    let label = "";
    if (artist.currency === "RON") label = "lei";
    if (artist.currency === "EUR") label = "euro";
    if (artist.currency === "USD") label = "USD";
    return `${artist.price} ${label}`;
  };

  const handleBuy = () => {
    navigation.navigate("Stripe Web Payment", {
      amount: artist.price,
      currency: artist.currency,
      name: artist.name,
    });
  };

  // NEW: Delete logic (admin only)
  const handleDelete = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this announcement?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const db = getFirestore();
              const storage = getStorage();

              // Delete all photos in the artist.photos array (if exists)
              if (artist.photos && Array.isArray(artist.photos)) {
                await Promise.all(
                  artist.photos.map(async (url) => {
                    try {
                      // Get path from full URL (works for default Firebase Storage URLs)
                      const base =
                        "https://firebasestorage.googleapis.com/v0/b/";
                      if (url.startsWith(base)) {
                        // Parse the path after `/o/` and before `?alt=`
                        const pathMatch =
                          decodeURIComponent(url).match(/\/o\/(.+)\?alt/);
                        if (pathMatch && pathMatch[1]) {
                          const filePath = pathMatch[1];
                          const imgRef = storageRef(storage, filePath);
                          await deleteObject(imgRef);
                        }
                      }
                    } catch (imgErr) {
                      // Log and continue; you might want to handle or notify for failed deletes
                      console.log("Failed to delete image:", imgErr);
                    }
                  })
                );
              }

              // Now delete the Firestore doc
              await deleteDoc(doc(db, "artists", artist.id));
              Alert.alert("Announcement and images deleted.");
              navigation.goBack();
            } catch (error) {
              Alert.alert("Failed to delete", error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeArea>
      <ScrollView>
        <ArtistInfoCard artist={artist} />

        <List.Section>
          {/* Description */}
          <List.Accordion
            title="Description"
            left={(props) => (
              <List.Icon {...props} icon="information-outline" />
            )}
            expanded={descExpanded}
            onPress={() => setDescExpanded(!descExpanded)}
          >
            <List.Item
              title={artist.description || "No description provided."}
            />
          </List.Accordion>
          <Divider />

          {/* Contact */}
          <List.Accordion
            title="Contact"
            left={(props) => <List.Icon {...props} icon="phone-outline" />}
            expanded={contactExpanded}
            onPress={() => setContactExpanded(!contactExpanded)}
          >
            {artist.email ? (
              <List.Item
                title={artist.email}
                description="Email"
                left={(props) => <List.Icon {...props} icon="email-outline" />}
                onPress={() => handlePress("email", artist.email)}
              />
            ) : null}

            {artist.phone ? (
              <List.Item
                title={artist.phone}
                description="Phone"
                left={(props) => <List.Icon {...props} icon="phone-outline" />}
                onPress={() => handlePress("phone", artist.phone)}
              />
            ) : null}

            {artist.website ? (
              <List.Item
                title={artist.website}
                description="Website"
                left={(props) => <List.Icon {...props} icon="web" />}
                onPress={() => handlePress("website", artist.website)}
              />
            ) : null}

            {!artist.email && !artist.phone && !artist.website && (
              <List.Item title="No contact info provided." />
            )}
          </List.Accordion>
          <Divider />

          {/* Pricing */}
          <List.Accordion
            title="Pricing"
            left={(props) => <List.Icon {...props} icon="cash" />}
            expanded={pricingExpanded}
            onPress={() => setPricingExpanded(!pricingExpanded)}
          >
            <List.Item title={getPriceLabel()} />
            {artist.price && artist.currency && (
              <Button title="Cumpără" onPress={handleBuy} color="#8BC34A" />
            )}
          </List.Accordion>
        </List.Section>

        {/* NEW: Delete button for admin */}
        {userRole === "admin" && (
          <Button
            title="Delete Announcement"
            onPress={handleDelete}
            color="#f44336"
          />
        )}
      </ScrollView>
    </SafeArea>
  );
};
