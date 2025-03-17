import React, { useContext } from "react";
import { Searchbar } from "react-native-paper";
import { FlatList } from "react-native";

import { ArtistInfoCard } from "../components/artist-info-card.component";
import styled from "styled-components/native";
import { Spacer } from "../../../components/spacer/spacer.component";
import { SafeArea } from "../../../components/utility/safe-area.component";
import { ArtistsContext } from "../../../services/hive/artists.context";

const SearchContainer = styled.View`
  padding: ${(props) => props.theme.space[3]};
`;

const ArtistList = styled(FlatList).attrs({
  contentContainerStyle: {
    padding: 16,
  },
})``;

export const ArtistScreen = () => {
  const { isLoading, error, artists } = useContext(ArtistsContext);
  console.log(error);
  return (
    <SafeArea>
      <SearchContainer>
        <Searchbar />
      </SearchContainer>
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
