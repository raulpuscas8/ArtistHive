import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { Spacer } from "../spacer/spacer.component";
import { CompactArtistInfo } from "../hive/compact-artist-info.component";

const FavouritesWrapper = styled.View`
  padding: 12px 0 16px 0;
  background-color: #fff;
  border-radius: 22px;
  margin: 0 16px 12px 16px;
  box-shadow: 0px 4px 20px rgba(115, 59, 115, 0.06);
  elevation: 4;
`;

const FavouritesTitle = styled.Text`
  color: #f55654;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 15px;
  margin-bottom: 10px;
  text-align: center;
  align-self: center;
`;

const FavouriteItemWrapper = styled.View`
  width: 108px;
  height: 122px;
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 2px 10px rgba(115, 59, 115, 0.07);
  elevation: 2;
  margin-right: ${(props) => (props.isLast ? "0px" : "20px")};
  margin-top: 2px;
  align-items: center;
  justify-content: center;
`;

export const FavouritesBar = ({ favourites, onNavigate }) => {
  if (!favourites.length) {
    return null;
  }
  return (
    <FavouritesWrapper>
      <FavouritesTitle>Favorite</FavouritesTitle>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 18 }}
      >
        {favourites.map((artist, index) => {
          const key = artist.name;
          const isLast = index === favourites.length - 1;
          return (
            <Spacer key={key} position="left" size="medium">
              <TouchableOpacity
                onPress={() =>
                  onNavigate("ArtistDetail", {
                    artist,
                  })
                }
              >
                <FavouriteItemWrapper isLast={isLast}>
                  <CompactArtistInfo artist={artist} />
                </FavouriteItemWrapper>
              </TouchableOpacity>
            </Spacer>
          );
        })}
      </ScrollView>
    </FavouritesWrapper>
  );
};
