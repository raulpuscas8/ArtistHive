// src/features/hive/screens/artist-detail.screen.js

import React, { useState, useContext, useEffect } from "react";
import {
  ScrollView,
  Linking,
  Alert,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { List, Divider } from "react-native-paper";

import { ArtistInfoCard } from "../components/artist-info-card.component";
import { SafeArea } from "../../../components/utility/safe-area.component";
import { Button } from "react-native";
import { Text } from "../../../components/typography/text.component";

import { AuthenticationContext } from "../../../services/authentication/authentication.context";
import {
  getFirestore,
  doc,
  deleteDoc,
  collection,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { getStorage, ref as storageRef, deleteObject } from "firebase/storage";
import { Ionicons } from "@expo/vector-icons";

export const ArtistDetailScreen = ({ route, navigation }) => {
  const { artist } = route.params;
  const [descExpanded, setDescExpanded] = useState(true);
  const [contactExpanded, setContactExpanded] = useState(false);
  const [pricingExpanded, setPricingExpanded] = useState(false);

  const [avgRating, setAvgRating] = useState(null);
  const [ratingsCount, setRatingsCount] = useState(null);
  const [myRating, setMyRating] = useState(null);
  const [isLoadingRating, setIsLoadingRating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, userRole } = useContext(AuthenticationContext);
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

  // --- Load rating info (live) ---
  useEffect(() => {
    if (!artist?.id) return;

    const db = getFirestore();
    const artistRef = doc(db, "artists", artist.id);

    const unsub = onSnapshot(artistRef, (snap) => {
      const d = snap.data();
      setAvgRating(d?.avgRating ?? 0);
      setRatingsCount(d?.ratingsCount ?? 0);
    });

    // Also check if user already voted
    let unsubMy = null;
    if (user?.uid) {
      const myVoteRef = doc(db, "artists", artist.id, "ratings", user.uid);
      unsubMy = onSnapshot(myVoteRef, (snap) => {
        if (snap.exists()) {
          setMyRating(snap.data().rating);
        } else {
          setMyRating(null);
        }
        setIsLoadingRating(false);
      });
    } else {
      setIsLoadingRating(false);
    }

    return () => {
      unsub();
      if (unsubMy) unsubMy();
    };
  }, [artist.id, user?.uid]);

  // --- Handle voting ---
  const handleVote = async (value) => {
    if (!user?.uid) {
      Alert.alert("You must be logged in to rate.");
      return;
    }
    setIsSubmitting(true);

    try {
      const db = getFirestore();
      const voteRef = doc(db, "artists", artist.id, "ratings", user.uid);
      const artistRef = doc(db, "artists", artist.id);

      // Set/update user vote
      await setDoc(voteRef, { rating: value }, { merge: true });

      // Get all ratings for this artist
      const ratingsSnap = await getDocs(
        collection(db, "artists", artist.id, "ratings")
      );
      let sum = 0;
      let count = 0;
      ratingsSnap.forEach((doc) => {
        sum += doc.data().rating;
        count++;
      });
      const avg = count ? sum / count : 0;

      // Save average & count to artist doc
      await updateDoc(artistRef, {
        avgRating: avg,
        ratingsCount: count,
      });

      setIsSubmitting(false);
      Alert.alert("Thank you for voting!");
    } catch (err) {
      setIsSubmitting(false);
      Alert.alert("Error submitting vote", err.message);
    }
  };

  // ---- Delete logic (admin only) ----
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
                      const base =
                        "https://firebasestorage.googleapis.com/v0/b/";
                      if (url.startsWith(base)) {
                        const pathMatch =
                          decodeURIComponent(url).match(/\/o\/(.+)\?alt/);
                        if (pathMatch && pathMatch[1]) {
                          const filePath = pathMatch[1];
                          const imgRef = storageRef(storage, filePath);
                          await deleteObject(imgRef);
                        }
                      }
                    } catch (imgErr) {
                      console.log("Failed to delete image:", imgErr);
                    }
                  })
                );
              }
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

  // --- UI for star voting ---
  const renderStars = () => {
    // show user selection or current avg
    const displayRating = myRating ?? avgRating ?? 0;
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 12,
          marginBottom: 8,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons
            key={i}
            name={displayRating >= i ? "star" : "star-outline"}
            size={32}
            color="#FFD700"
            style={{ marginHorizontal: 3 }}
            onPress={() => !isSubmitting && handleVote(i)}
            // Only allow voting if not loading or submitting
            disabled={isSubmitting}
          />
        ))}
        <Text variant="body" style={{ marginLeft: 10, fontWeight: "bold" }}>
          {isLoadingRating ? "..." : avgRating ? avgRating.toFixed(2) : "0.00"}
          <Text variant="caption" style={{ fontWeight: "normal" }}>
            {" "}
            ({ratingsCount || 0} votes)
          </Text>
        </Text>

        {myRating ? (
          <Text variant="caption" style={{ marginLeft: 8, color: "green" }}>
            You voted {myRating}★
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeArea>
      <ScrollView>
        <ArtistInfoCard artist={artist} />

        {/* ---- STAR VOTING UI HERE ---- */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 10,
            alignItems: "flex-start",
          }}
        >
          <Text
            variant="label"
            style={{ fontWeight: "bold", fontSize: 16, marginBottom: 4 }}
          >
            Rate this artist:
          </Text>

          {renderStars()}
          {isSubmitting && <ActivityIndicator size="small" color="#FFD700" />}
        </View>

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

        {/* Delete button for admin */}
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
