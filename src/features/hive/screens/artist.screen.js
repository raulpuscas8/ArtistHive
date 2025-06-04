// src/features/hive/screens/artist.screen.js

import React, { useContext, useState, useEffect, useMemo } from "react";
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

// ========== Styled Components ==========
const Loading = styled(ActivityIndicator)`
  margin-left: -25px;
`;

const LoadingContainer = styled.View`
  position: absolute;
  top: 50%;
  left: 50%;
`;

// Main floating background for categories
const CategoriesBackground = styled.View`
  background-color: ${(props) => props.theme.colors.bg.secondary};
  border-radius: 24px;
  margin: 14px 16px 0px 16px;
  padding: 8px 0px;
  shadow-color: #91b87c;
  shadow-opacity: 1;
  shadow-radius: 12px;
  shadow-offset: 0px 4px;
  elevation: 5;
`;

// The individual category button "pills"
const CategoryButton = styled(TouchableOpacity)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.space[2]};
  margin-left: ${({ theme }) => theme.space[1]};
  padding: 8px 15px;
  border-radius: 18px;
  background-color: ${({ selected, theme }) =>
    selected ? "#f3e7f7" : "transparent"};
  shadow-color: #733b73;
  shadow-opacity: 0.16;
  shadow-radius: 8px;
  shadow-offset: 0px 2px;
  elevation: 4;
`;

const englishToRomanian = {
  Painting: "Pictură",
  Music: "Muzică",
  Sculpture: "Sculptură",
  Photography: "Fotografie",
  "Digital Art": "Artă digitală",
  PrintMaking: "Gravură și print",
  Ceramics: "Ceramică",
  "Textile & Fiber": "Textile & Fibre",
  "Jewelry & Wearables": "Bijuterii & Accesorii",
  "Graphic Design & Illustration": "Design grafic & Ilustrație",
  "Performance Art": "Artă performativă",
  "Video & Animation": "Video & Animație",
  "Crafts & Handmade": "Lucrate manual",
  Other: "Altele",
};

// ========== Component ==========
export const ArtistScreen = ({ navigation }) => {
  const theme = useTheme();
  const { isLoading, artists, error } = useContext(ArtistsContext);
  const { favourites } = useContext(FavouritesContext);

  const [isFavouritesToggled, setIsFavouritesToggled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // search/filter state
  const [searchName, setSearchName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  // Helper to get all unique locations (e.g., city from address)
  const locations = useMemo(() => {
    const all = artists.map((a) => {
      if (!a.address) return "Fără adresă";
      const addressParts = a.address.split(",");
      return addressParts[3]?.trim() || "Fără adresă";
    });
    return [...new Set(all.filter(Boolean))];
  }, [artists]);

  const displayedArtists = useMemo(() => {
    let filtered = artists;
    if (selectedCategory) {
      filtered = filtered.filter((a) => {
        // Check if a.category is English, map to Romanian
        const catRo = englishToRomanian[a.category] || a.category;
        return catRo === selectedCategory;
      });
    }
    if (searchName) {
      filtered = filtered.filter((a) =>
        a.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    if (selectedLocation) {
      filtered = filtered.filter((a) =>
        (a.address || "").toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }
    return filtered;
  }, [artists, selectedCategory, searchName, selectedLocation]);

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
            if (data.photos && Array.isArray(data.photos)) {
              for (const url of data.photos) {
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
  useEffect(() => {
    console.log("🔥 artists payload:", artists);
  }, [artists]);

  // Categorii în română:
  const categories = [
    "Pictură",
    "Muzică",
    "Sculptură",
    "Fotografie",
    "Artă digitală",
    "Gravură și print",
    "Ceramică",
    "Textile & Fibre",
    "Bijuterii & Accesorii",
    "Design grafic & Ilustrație",
    "Artă performativă",
    "Video & Animație",
    "Lucrate manual",
    "Altele",
  ];

  // Iconițe asociate categoriilor:
  const categoryIcons = {
    Pictură: "color-palette-outline",
    Muzică: "musical-notes-outline",
    Sculptură: "construct-outline",
    Fotografie: "camera-outline",
    "Artă digitală": "desktop-outline",
    "Gravură și print": "print-outline",
    Ceramică: "rose-outline",
    "Textile & Fibre": "shirt-outline",
    "Bijuterii & Accesorii": "diamond-outline",
    "Design grafic & Ilustrație": "brush-outline",
    "Artă performativă": "walk-outline",
    "Video & Animație": "videocam-outline",
    "Lucrate manual": "hand-left-outline",
    Altele: "help-circle-outline",
  };

  if (error) {
    return (
      <SafeArea>
        <Text>Something went wrong: {error.message}</Text>
      </SafeArea>
    );
  }

  return (
    <SafeArea>
      {isLoading && (
        <LoadingContainer>
          <Loading size={50} animating color={MD3Colors.primary10} />
        </LoadingContainer>
      )}

      {/* --- NEW: Search by name and filter by location --- */}
      <Search
        searchName={searchName}
        onSearchNameChange={setSearchName}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        locations={locations}
        isFavouritesToggled={isFavouritesToggled}
        onFavouritesToggle={() => setIsFavouritesToggled(!isFavouritesToggled)}
      />

      {isFavouritesToggled && (
        <FavouritesBar
          favourites={artists.filter((a) => favourites.includes(a.id))}
          onNavigate={navigation.navigate}
        />
      )}

      {/* ---- Category filter bar ---- */}
      <CategoriesBackground>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 8,
            alignItems: "center",
          }}
          style={{ flexGrow: 0 }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <CategoryButton
                key={cat}
                selected={isSelected}
                onPress={() => setSelectedCategory(isSelected ? null : cat)}
              >
                <Ionicons
                  name={categoryIcons[cat]}
                  size={24}
                  color={
                    isSelected
                      ? theme.colors.ui.primary
                      : theme.colors.text.primary
                  }
                />
                <Spacer position="top" size="small">
                  <Text
                    variant="caption"
                    style={{
                      color: isSelected
                        ? theme.colors.ui.primary
                        : theme.colors.ui.primary,
                    }}
                  >
                    {cat}
                  </Text>
                </Spacer>
              </CategoryButton>
            );
          })}
        </ScrollView>
      </CategoriesBackground>

      {/* ---- Artist list, filtered ---- */}
      <ArtistList
        data={displayedArtists}
        renderItem={({ item }) => {
          const isFavourite = favourites.includes(item.id);
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ArtistDetail", {
                  artist: item,
                })
              }
            >
              <Spacer position="bottom" size="large">
                <FadeInView>
                  <ArtistInfoCard artist={item} isFavourite={isFavourite} />
                </FadeInView>
              </Spacer>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
      />
    </SafeArea>
  );
};
