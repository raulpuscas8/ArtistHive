import React, { useContext, useState } from "react";
import {
  FlatList,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
} from "react-native";

import styled from "styled-components/native";
import { Spacer } from "../../../components/spacer/spacer.component";
import { SafeArea } from "../../../components/utility/safe-area.component";
import { ArtistsContext } from "../../../services/hive/artists.context";
import { MD3Colors } from "react-native-paper";
import { Search } from "../components/search.component";
import { ArtistInfoCard } from "../components/artist-info-card.component";
import { FavouritesBar } from "../../../components/favourites/favourites-bar.component";
import { FavouritesContext } from "../../../services/favourites/favourites.context";

const ArtistList = styled(FlatList).attrs({
  contentContainerStyle: {
    padding: 16,
  },
})``;

const Loading = styled(ActivityIndicator)`
  margin-left: -25px;
`;
const LoadingContainer = styled.View`
  position: absolute;
  top: 50%;
  left: 50%;
`;

export const ArtistScreen = ({ navigation }) => {
  const { isLoading, artists } = useContext(ArtistsContext);
  const { favourites } = useContext(FavouritesContext);
  const [isToggled, setIsToggled] = useState(false);

  return (
    <SafeArea>
      {isLoading && (
        <LoadingContainer>
          <Loading size={50} animating={true} color={MD3Colors.primary10} />
        </LoadingContainer>
      )}
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
      <ArtistList
        data={artists}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ArtistDetail", {
                  artist: item,
                })
              }
            >
              <Spacer position="bottom" size="large">
                <ArtistInfoCard artist={item} />
              </Spacer>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.name}
      />
    </SafeArea>
  );
};
