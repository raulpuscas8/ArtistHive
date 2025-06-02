import React, { useState } from "react";
import styled from "styled-components/native";
import { Searchbar } from "react-native-paper";
import { FlatList, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RNModal from "react-native-modal";

// Styled components
const SearchContainer = styled.View`
  padding: ${(props) => props.theme.space[3]};
  flex-direction: row;
  align-items: center;
`;

const LocationButton = styled.TouchableOpacity`
  margin-left: 8px;
  background-color: #fff3e0;
  border-radius: 24px;
  padding: 7px 14px;
  flex-direction: row;
  align-items: center;
  border: 1px solid #ffb74d;
`;

const ModalContainer = styled.View`
  background-color: rgba(41, 82, 255, 0.9); /* cobalt blue */
  padding: 20px;
  border-radius: 28px;
  max-height: 400px;
  width: 80%;
  align-items: center;
  shadow-color: #ff9800;
  shadow-opacity: 0.15;
  shadow-radius: 24px;
  shadow-offset: 0px 4px;
  elevation: 10;
`;

const LocationLabel = styled.Text`
  color: #f57c00;
  margin-left: 5px;
  font-size: 16px;
  font-weight: bold;
`;

const ItemText = styled.Text`
  font-size: 17px;
  color: #333;
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
          placeholder="Search by announcement name"
          value={searchName}
          onChangeText={onSearchNameChange}
          style={{ flex: 1 }}
          icon={isFavouritesToggled ? "heart" : "heart-outline"}
          onIconPress={onFavouritesToggle}
        />
        <LocationButton onPress={() => setModalVisible(true)}>
          <Ionicons name="location-outline" size={20} color="#f57c00" />
          <LocationLabel>
            {selectedLocation ? selectedLocation : "All"}
          </LocationLabel>
        </LocationButton>
      </SearchContainer>
      <RNModal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        backdropColor="#FFB74D"
        backdropOpacity={0.16}
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
                      ? "rgba(255, 152, 0, 0.16)"
                      : "transparent",
                  borderRadius: 12,
                  marginBottom: 6,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <ItemText
                  style={{
                    fontWeight: item === selectedLocation ? "bold" : "normal",
                    color: item === selectedLocation ? "#f57c00" : "#333",
                  }}
                >
                  {item ? item : "All locations"}
                </ItemText>
              </TouchableOpacity>
            )}
          />
        </ModalContainer>
      </RNModal>
    </>
  );
};
