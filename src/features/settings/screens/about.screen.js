import React from "react";
import {
  Linking,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeArea } from "../../../components/utility/safe-area.component";
import { Text } from "../../../components/typography/text.component";
import styled from "styled-components/native";
import { Avatar } from "react-native-paper";
import { Ionicons, AntDesign, FontAwesome } from "@expo/vector-icons";

const BACKGROUND_COLOR = "#733b73";

const CenteredContainer = styled.View`
  flex: 1;
  background-color: ${BACKGROUND_COLOR};
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Card = styled.View`
  background-color: #fff;
  border-radius: 32px;
  align-items: center;
  padding: 32px 24px 28px 24px;
  shadow-color: #733b73;
  shadow-opacity: 0.1;
  shadow-radius: 24px;
  elevation: 10;
  width: 88%;
  max-width: 420px;
`;

const AppTitle = styled(Text)`
  color: #733b73;
  font-size: 32px;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 6px;
  text-align: center;
`;

const AppDesc = styled(Text)`
  color: #222;
  font-size: 17px;
  text-align: center;
  margin-bottom: 18px;
`;

const AuthorLabel = styled(Text)`
  color: #f55654;
  font-size: 15px;
  margin-top: 16px;
  margin-bottom: 1px;
  font-weight: 500;
`;

const Author = styled(Text)`
  color: #2182bd;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const SmallInfo = styled(Text)`
  color: #91b87c;
  font-size: 14px;
  text-align: center;
  margin-top: 12px;
  margin-bottom: 2px;
`;

const LinksRow = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: 14px;
  margin-bottom: 4px;
  gap: 16px;
`;

export const AboutScreen = ({ navigation }) => {
  return (
    <SafeArea style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
      {/* Custom Back Button - Map style */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.menuButton}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={32} color="#733b73" />
      </TouchableOpacity>

      <CenteredContainer>
        <Card>
          <Avatar.Icon
            size={74}
            icon="palette"
            style={{ backgroundColor: "#733b73", marginBottom: 10 }}
            color="#fff"
          />
          <AppTitle>ArtistHive</AppTitle>
          <AppDesc>
            ArtistHive este o aplicație creată pentru a ajuta artiștii să își
            prezinte și să vândă arta – fie că vorbim de pictură, muzică,
            sculptură sau orice altă formă de creație.
            {"\n"}Ai o idee, ai un talent? Îți găsești locul la ArtistHive!
          </AppDesc>
          <AuthorLabel>Dezvoltată de:</AuthorLabel>
          <Author>Raul-Ioan Pușcaș</Author>
          <LinksRow>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Linking.openURL("https://github.com/raulpuscas8")}
              accessibilityLabel="GitHub"
            >
              <AntDesign name="github" size={32} color="#733b73" />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                Linking.openURL(
                  "https://www.linkedin.com/in/raul-ioan-pu%C8%99ca%C8%99-267008210/"
                )
              }
              accessibilityLabel="LinkedIn"
            >
              <FontAwesome name="linkedin-square" size={32} color="#2182bd" />
            </TouchableOpacity>
          </LinksRow>
          <SmallInfo>Versiune: 1.0</SmallInfo>
          <SmallInfo>Anul lansării: 2025</SmallInfo>
        </Card>
      </CenteredContainer>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 52 : 26,
    left: 28,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 8,
    zIndex: 10,
    shadowColor: "#ffffff",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
