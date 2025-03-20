import React from "react";
import styled from "styled-components/native";

const MyText = styled.Text``;
export const MapCallout = ({ artist }) => <MyText>{artist.name}</MyText>;
