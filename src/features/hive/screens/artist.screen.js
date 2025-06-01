// src/features/hive/screens/artist.screen.js

import React, { useContext, useState, useEffect } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import styled, { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

import { Spacer } from "../../../components/spacer/spacer.component";
import { SafeArea } from "../../../components/utility/safe-area.component";
import { ArtistsContext } from "../../../services/hive/artists.context";
import { MD3Colors } from "react-native-paper";
import { Search } from "../components/search.component";
import { ArtistInfoCard } from "../components/artist-info-card.component";
import { FavouritesBar } from "../../../components/favourites/favourites-bar.component";
import { FavouritesContext } from "../../../services/favourites/favourites.context";
import { ArtistList } from "../components/artist-list.styles";
import { FadeInView } from "../../../components/animations/fade.animation";

// FIREBASE imports for deletion
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

import { getStorage, ref as storageRef, deleteObject } from "firebase/storage";

const Loading = styled(ActivityIndicator)`
  margin-left: -25px;
`;

const LoadingContainer = styled.View`
  position: absolute;
  top: 50%;
  left: 50%;
`;

// remove vertical padding so it hugs the ScrollView height
const CategoryFilterContainer = styled.View`
  flex-direction: row;
  padding: 0;
`;

const CategoryButton = styled(TouchableOpacity)`
  margin: 0 ${({ theme }) => theme.space[2]};
  align-items: center;

  padding-top: ${({ theme }) => theme.space[1]};
`;

export const ArtistScreen = ({ navigation }) => {
  const theme = useTheme();
  const { isLoading, artists, error } = useContext(ArtistsContext);
  const { favourites } = useContext(FavouritesContext);

  const [isFavouritesToggled, setIsFavouritesToggled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ----------- AUTO DELETE EXPIRED ANNOUNCEMENTS -----------
  useEffect(() => {
    const deleteExpiredAnnouncements = async () => {
      try {
        const db = getFirestore();
        const storage = getStorage();
        const now = new Date();
        const artistsCol = collection(db, "artists");
        const snapshot = await getDocs(artistsCol);

        const toDelete = [];
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const expiresAt = data.expiresAt?.toDate?.();
          if (expiresAt && expiresAt < now) {
            // Delete all images in Storage (if any)
            if (data.photos && Array.isArray(data.photos)) {
              for (const url of data.photos) {
                // Parse the storage path from the URL
                const base = "https://firebasestorage.googleapis.com/v0/b/";
                if (url.startsWith(base)) {
                  const pathMatch =
                    decodeURIComponent(url).match(/\/o\/(.+)\?alt/);
                  if (pathMatch && pathMatch[1]) {
                    const filePath = pathMatch[1];
                    const imgRef = storageRef(storage, filePath);
                    try {
                      await deleteObject(imgRef);
                    } catch (err) {
                      console.log(
                        "Could not delete image:",
                        filePath,
                        err.message
                      );
                    }
                  }
                }
              }
            }
            toDelete.push(docSnap.ref);
          }
        }

        await Promise.all(toDelete.map((ref) => deleteDoc(ref)));
        if (toDelete.length > 0) {
          console.log(
            `🔥 Deleted ${toDelete.length} expired announcements and images.`
          );
        }
      } catch (err) {
        console.error("Error deleting expired announcements:", err);
      }
    };

    deleteExpiredAnnouncements();
  }, []);
  // ---------------------------------------------------------

  // DEBUG: inspect the artists payload
  useEffect(() => {
    console.log("🔥 artists payload:", artists);
  }, [artists]);

  const categories = [
    "Painting",
    "Music",
    "Sculpture",
    "Photography",
    "Digital Art",
    "PrintMaking",
    "Ceramics",
    "Textile & Fiber",
    "Jewelry & Wearables",
    "Graphic Design & Illustration",
    "Performance Art",
    "Video & Animation",
    "Crafts & Handmade",
    "Other",
  ];

  const categoryIcons = {
    Painting: "color-palette-outline",
    Music: "musical-notes-outline",
    Sculpture: "construct-outline",
    Photography: "camera-outline",
    "Digital Art": "desktop-outline",
    PrintMaking: "print-outline",
    Ceramics: "mud-outline",
    "Textile & Fiber": "shirt-outline",
    "Jewelry & Wearables": "diamond-outline",
    "Graphic Design & Illustration": "brush-outline",
    "Performance Art": "walk-outline",
    "Video & Animation": "videocam-outline",
    "Crafts & Handmade": "hand-left-outline",
    Other: "help-circle-outline",
  };

  if (error) {
    return (
      <SafeArea>
        <Text>Something went wrong: {error.message}</Text>
      </SafeArea>
    );
  }

  const displayedArtists = selectedCategory
    ? artists.filter((a) => a.category === selectedCategory)
    : artists;

  return (
    <SafeArea>
      {isLoading && (
        <LoadingContainer>
          <Loading size={50} animating color={MD3Colors.primary10} />
        </LoadingContainer>
      )}

      {/* Search + Favourites toggle */}
      <Search
        isFavouritesToggled={isFavouritesToggled}
        onFavouritesToggle={() => setIsFavouritesToggled(!isFavouritesToggled)}
      />
      {isFavouritesToggled && (
        <FavouritesBar
          favourites={favourites}
          onNavigate={navigation.navigate}
        />
      )}

      {/* 1. Category filter bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          flexGrow: 0,
          alignItems: "center",
        }}
      >
        <CategoryFilterContainer>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <CategoryButton
                key={cat}
                onPress={() => setSelectedCategory(isSelected ? null : cat)}
              >
                <Ionicons
                  name={categoryIcons[cat]}
                  size={24}
                  color={
                    isSelected
                      ? theme.colors.ui.primary
                      : theme.colors.ui.disabled
                  }
                />
                <Spacer position="top" size="small">
                  <Text
                    variant="caption"
                    color={isSelected ? "ui.primary" : "ui.disabled"}
                  >
                    {cat}
                  </Text>
                </Spacer>
              </CategoryButton>
            );
          })}
        </CategoryFilterContainer>
      </ScrollView>

      {/* 2. Artist list, filtered */}
      <ArtistList
        data={displayedArtists}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ArtistDetail", {
                artist: item,
              })
            }
          >
            <Spacer position="bottom" size="large">
              <FadeInView>
                <ArtistInfoCard artist={item} />
              </FadeInView>
            </Spacer>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />
    </SafeArea>
  );
};
