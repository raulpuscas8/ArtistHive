import React, { useState } from "react";
import styled from "styled-components/native";
import { Searchbar } from "react-native-paper";
import { FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RNModal from "react-native-modal";

// Styled components
const SearchContainer = styled.View`
  padding: ${(props) => props.theme.space[3]};
  flex-direction: row;
  align-items: center;
`;

const LocationButton = styled.TouchableOpacity`
  height: 50px;
  padding: 0 20px;
  margin-left: 10px;
  background-color: #fff3e0;
  border-radius: 24px;
  flex-direction: row;
  align-items: center;
  border: 3px solid #91b87c;
  shadow-color: #ffb74d;
  shadow-opacity: 0.1;
  shadow-radius: 12px;
  shadow-offset: 0px 2px;
  elevation: 2;
`;

const ModalContainer = styled.View`
  background-color: rgba(224, 225, 225, 0.95);
  padding: 20px;
  border-radius: 28px;
  max-height: 400px;
  width: 80%;
  align-items: center;
  shadow-color: #733b73;
  shadow-opacity: 0.13;
  shadow-radius: 22px;
  shadow-offset: 0px 4px;
  elevation: 12;
`;

const LocationLabel = styled.Text`
  color: #427c80;
  margin-left: 5px;
  font-size: 16px;
  font-weight: bold;
`;

const ItemText = styled.Text`
  font-size: 17px;
  color: #733b73;
  font-weight: ${({ selected }) => (selected ? "bold" : "normal")};
`;

export const Search = ({
  searchName,
  onSearchNameChange,
  selectedLocation,
  onLocationChange,
  locations = [],
  isFavouritesToggled,
  onFavouritesToggle,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <SearchContainer>
        <Searchbar
          placeholder="Caută după nume"
          value={searchName}
          onChangeText={onSearchNameChange}
          style={{ flex: 1 }}
          icon={isFavouritesToggled ? "heart" : "heart-outline"}
          size={26}
          iconColor="#F55654"
          onIconPress={onFavouritesToggle}
        />
        <LocationButton onPress={() => setModalVisible(true)}>
          <Ionicons name="location-outline" size={20} color="#F55654" />
          <LocationLabel>
            {selectedLocation ? selectedLocation : "Toate"}
          </LocationLabel>
        </LocationButton>
      </SearchContainer>
      <RNModal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        backdropColor="#fff"
        backdropOpacity={0.2}
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <ModalContainer>
          <FlatList
            data={["", ...locations]}
            keyExtractor={(item) => item || "all-locations"}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onLocationChange(item);
                  setModalVisible(false);
                }}
                style={{
                  padding: 14,
                  backgroundColor:
                    item === selectedLocation
                      ? "rgba(245, 86, 84, 0.92)"
                      : "transparent",
                  borderRadius: 12,
                  marginBottom: 6,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <ItemText selected={item === selectedLocation}>
                  {item ? item : "Toate locațiile"}
                </ItemText>
              </TouchableOpacity>
            )}
          />
        </ModalContainer>
      </RNModal>
    </>
  );
};
