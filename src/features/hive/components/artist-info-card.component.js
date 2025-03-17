import React from "react";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { ThemeProvider } from "styled-components/native";
import star from "../../../../assets/star";
import open from "../../../../assets/open";
import { SvgXml } from "react-native-svg";
import { Spacer } from "../../../components/spacer/spacer.component";
import { Text } from "../../../components/typography/text.component";

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

export const ArtistInfoCard = ({ artist = {} }) => {
  const {
    name = "Some Artist",
    icon = "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/lodging-71.png",
    photos = ["https://m.media-amazon.com/images/I/91LyD5TLnnL.jpg"],
    address = "100 some random street",
    isOpenNow = true,
    rating = 4,
    isClosedTemporarily = true,
    placeId,
  } = artist;

  const ratingArray = Array.from(new Array(Math.floor(rating)));

  return (
    <ArtistCard elevation={5}>
      <ArtistCardCover key={name} source={{ uri: photos[0] }} />
      <Info>
        <Text variant="label">{name}</Text>
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
            {isClosedTemporarily && (
              <Text variant="error">CLOSED TEMPORARILY</Text>
            )}
            <Spacer position="left" size="large">
              {isOpenNow && <SvgXml xml={open} width={20} height={20} />}
            </Spacer>
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
