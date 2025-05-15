// src/features/hive/components/artist-info-card.component.js

import React from "react";
import { View } from "react-native";
import { SvgXml } from "react-native-svg";
import { Spacer } from "../../../components/spacer/spacer.component";
import { Text } from "../../../components/typography/text.component";
import { Favourite } from "../../../components/favourites/favourite.component";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import star from "../../../../assets/star";

import {
  ArtistCard,
  ArtistCardCover,
  Info,
  Section,
  SectionEnd,
  Rating,
  Icon,
  Address,
} from "./artist-info-card.styles.js";

// map each category string to an Ionicon name
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

export const ArtistInfoCard = ({ artist = {} }) => {
  const theme = useTheme();
  const {
    name = "Some Artist",
    icon = "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/lodging-71.png",
    photos = ["https://via.placeholder.com/400"],
    address = "100 some random street",
    rating = 4,
    category = "Other",
    placeId,
  } = artist;

  const ratingArray = Array.from(new Array(Math.floor(rating)));
  const catIconName = categoryIcons[category] || categoryIcons.Other;

  return (
    <ArtistCard elevation={5}>
      <View>
        <Favourite artist={artist} />
        <ArtistCardCover source={{ uri: photos[0] }} />
      </View>
      <Info>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text variant="label">{name}</Text>
          <Spacer position="left" size="medium" />
          <Ionicons
            name={catIconName}
            size={20}
            color={theme.colors.ui.primary}
          />
        </View>

        <Section>
          <Rating>
            {ratingArray.map((_, i) => (
              <SvgXml
                key={`star-${placeId}-${i}`}
                xml={star}
                width={20}
                height={20}
              />
            ))}
          </Rating>
          <SectionEnd>
            <Spacer position="left" size="large">
              <Icon source={{ uri: icon }} />
            </Spacer>
          </SectionEnd>
        </Section>

        <Address>{address}</Address>
      </Info>
    </ArtistCard>
  );
};
