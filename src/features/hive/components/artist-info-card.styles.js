import styled from "styled-components/native";
import { Card } from "react-native-paper";

export const ArtistCard = styled(Card).attrs({
  elevation: 6,
})`
  background-color: ${(props) => props.theme.colors.bg.secondary};
  shadow-color: #91b87c;
  shadow-offset: 0px 4px;
  shadow-opacity: 1;
  shadow-radius: 15px;
  border-radius: 20px;
  elevation: 6;
`;

export const ArtistCardCover = styled(Card.Cover)`
  padding: ${(props) => props.theme.space[3]};
  background-color: ${(props) => props.theme.colors.bg.secondary};
`;

export const Address = styled.Text`
  font-family: ${(props) => props.theme.fonts.body};
  font-size: ${(props) => props.theme.fontSizes.caption};
`;

export const Info = styled.View`
  padding: ${(props) => props.theme.space[3]};
`;

export const Rating = styled.View`
  flex-direction: row;
  padding-top: ${(props) => props.theme.space[2]};
  padding-bottom: ${(props) => props.theme.space[2]};
`;

export const Section = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const SectionEnd = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: flex-end;
`;
