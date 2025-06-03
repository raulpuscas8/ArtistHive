// src/features/account/screens/favourites.screen.js

import React, { useContext } from "react";
import { SafeArea } from "../../../components/utility/safe-area.component";
import { FavouritesContext } from "../../../services/favourites/favourites.context";
import { ArtistsContext } from "../../../services/hive/artists.context";
import { ArtistInfoCard } from "../../hive/components/artist-info-card.component";
import { FlatList, TouchableOpacity } from "react-native";
import { Text } from "../../../components/typography/text.component";
import { Spacer } from "../../../components/spacer/spacer.component";

export const FavouritesScreen = ({ navigation }) => {
  const { favourites } = useContext(FavouritesContext);
  const { artists } = useContext(ArtistsContext);

  // Only show favourited artists
  const favouriteArtists = artists.filter((artist) =>
    favourites.includes(artist.id)
  );

  return (
    <SafeArea>
      {favouriteArtists.length === 0 ? (
        <Text variant="caption" style={{ margin: 32, textAlign: "center" }}>
          You don't have any favourites yet.
        </Text>
      ) : (
        <FlatList
          data={favouriteArtists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ArtistDetail", { artist: item })
              }
            >
              <Spacer position="bottom" size="large">
                <ArtistInfoCard artist={item} />
              </Spacer>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </SafeArea>
  );
};
