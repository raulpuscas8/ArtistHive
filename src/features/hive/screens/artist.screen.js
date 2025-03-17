import React, { useContext } from "react";
import { FlatList, ActivityIndicator } from "react-native";

import styled from "styled-components/native";
import { Spacer } from "../../../components/spacer/spacer.component";
import { SafeArea } from "../../../components/utility/safe-area.component";
import { ArtistsContext } from "../../../services/hive/artists.context";
import { MD3Colors } from "react-native-paper";
import { Search } from "../components/search.component";
import { ArtistInfoCard } from "../components/artist-info-card.component";

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

export const ArtistScreen = () => {
  const { isLoading, error, artists } = useContext(ArtistsContext);
  return (
    <SafeArea>
      {isLoading && (
        <LoadingContainer>
          <Loading size={50} animating={true} color={MD3Colors.primary10} />
        </LoadingContainer>
      )}
      <Search />
      <ArtistList
        data={artists}
        renderItem={({ item }) => {
          return (
            <Spacer position="bottom" size="large">
              <ArtistInfoCard artist={item} />
            </Spacer>
          );
        }}
        keyExtractor={(item) => item.name}
      />
    </SafeArea>
  );
};
