// src/features/hive/screens/artist.screen.js
import React, { useContext, useState } from "react";
import { ActivityIndicator, TouchableOpacity, Text } from "react-native";
import styled from "styled-components/native";

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

export const ArtistScreen = ({ navigation }) => {
  const { isLoading, artists, error } = useContext(ArtistsContext);
  const { favourites } = useContext(FavouritesContext);
  const [isToggled, setIsToggled] = useState(false);

  // 1) Error state
  if (error) {
    return (
      <SafeArea>
        <Text>Something went wrong: {error.message}</Text>
      </SafeArea>
    );
  }

  return (
    <SafeArea>
      {/* 2) Loading spinner */}
      {isLoading && (
        <LoadingContainer>
          <Loading size={50} animating color={MD3Colors.primary10} />
        </LoadingContainer>
      )}

      {/* 3) Search + favourites toggle */}
      <Search
        isFavouritesToggled={isToggled}
        onFavouritesToggle={() => setIsToggled(!isToggled)}
      />

      {isToggled && (
        <FavouritesBar
          favourites={favourites}
          onNavigate={navigation.navigate}
        />
      )}

      {/* 4) Artist list from Firestore */}
      <ArtistList
        data={artists}
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
        keyExtractor={(item) => item.id} // use the Firestore doc id
      />
    </SafeArea>
  );
};
