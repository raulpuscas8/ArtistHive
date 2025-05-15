// src/features/hive/screens/artist.screen.js

import React, { useContext, useState } from "react";
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
        style={{ flexGrow: 0 }} // don’t expand vertically
        contentContainerStyle={{
          paddingHorizontal: 16,
          flexGrow: 0, // keep content tight
          alignItems: "center", // vertical centering
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
