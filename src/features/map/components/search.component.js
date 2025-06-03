import React, { useContext, useState, useEffect } from "react";
import styled from "styled-components/native";
import { Searchbar } from "react-native-paper";

import { LocationContext } from "../../../services/location/location.context";

const SearchContainer = styled.View`
  padding: ${(props) => props.theme.space[3]};
  width: 100%;
`;

export const Search = () => {
  const { keyword, search } = useContext(LocationContext);
  const [searchKeyword, setSearchKeyword] = useState(keyword);

  useEffect(() => {
    setSearchKeyword(keyword);
  }, [keyword]);

  return (
    <SearchContainer>
      <Searchbar
        placeholder="Caută o locație"
        icon="map"
        value={searchKeyword}
        onSubmitEditing={() => search(searchKeyword)}
        onChangeText={setSearchKeyword}
        inputStyle={{
          fontSize: 18,
        }}
        style={{
          backgroundColor: "#fff5e6",
          borderRadius: 20,
          borderColor: "#733B73",
          borderWidth: 1,
          elevation: 4,
        }}
        placeholderTextColor="#733B73"
      />
    </SearchContainer>
  );
};
