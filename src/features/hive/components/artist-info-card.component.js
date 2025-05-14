// src/features/hive/components/artist-info-card.component.js

import React from "react";
import { View } from "react-native";
import { SvgXml } from "react-native-svg";
import { Spacer } from "../../../components/spacer/spacer.component";
import { Text } from "../../../components/typography/text.component";
import { Favourite } from "../../../components/favourites/favourite.component";
import star from "../../../../assets/star";
import open from "../../../../assets/open";

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

  // **DEBUG LOG**: inspect what Firestore actually sent in `photos`
  console.log("ARTIST PHOTOS:", photos);

  const ratingArray = Array.from(new Array(Math.floor(rating)));

  return (
    <ArtistCard elevation={5}>
      <View>
        <Favourite artist={artist} />
        <ArtistCardCover key={name} source={{ uri: photos[0] }} />
      </View>
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
