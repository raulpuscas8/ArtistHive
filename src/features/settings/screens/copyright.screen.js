import React from "react";
import { View, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { SafeArea } from "../../../components/utility/safe-area.component";
import styled from "styled-components/native";
import { Text } from "../../../components/typography/text.component";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const BACKGROUND_COLOR = "#427C80"; // New color!

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
  shadow-color: #427c80;
  shadow-opacity: 0.1;
  shadow-radius: 24px;
  elevation: 10;
  width: 88%;
  max-width: 420px;
`;

const CardIcon = styled.View`
  margin-bottom: 10px;
`;

const CopyrightTitle = styled(Text)`
  color: #427c80;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
`;

const CopyrightText = styled(Text)`
  color: #222;
  font-size: 16px;
  text-align: center;
  margin-bottom: 16px;
`;

const InfoText = styled(Text)`
  color: #91b87c;
  font-size: 13px;
  text-align: center;
  margin-top: 12px;
`;

export const CopyrightScreen = ({ navigation }) => (
  <SafeArea style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
    {/* Custom Back Button */}
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={styles.menuButton}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={32} color="#427C80" />
    </TouchableOpacity>

    <CenteredContainer>
      <Card>
        <CardIcon>
          <MaterialIcons name="copyright" size={58} color="#427C80" />
        </CardIcon>
        <CopyrightTitle>Copyright & Licență</CopyrightTitle>
        <CopyrightText>
          © 2025 Raul-Ioan Pușcaș. Toate drepturile rezervate. {"\n\n"}
          Această aplicație este dezvoltată ca proiect personal pentru artiști.
          Orice reproducere, distribuire sau utilizare neautorizată a codului
          sau designului aplicației este interzisă fără acordul autorului.
          {"\n\n"}
          ArtistHive, iconițele și conținutul aparțin exclusiv dezvoltatorului.
          {"\n"}
          Pentru întrebări legate de licență, scrie la: raul.puscas86@gmail.com
        </CopyrightText>
        <InfoText>Ultima actualizare: 2025</InfoText>
      </Card>
    </CenteredContainer>
  </SafeArea>
);

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
