import React, { useContext, useState } from "react";
import { List, Avatar, Divider } from "react-native-paper";
import styled from "styled-components/native";
import { TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import { SafeArea } from "../../../components/utility/safe-area.component";
import { AuthenticationContext } from "../../../services/authentication/authentication.context";
import { Text } from "../../../components/typography/text.component";
import { Spacer } from "../../../components/spacer/spacer.component";

// Colors from your palette
const ACCENT = "#733b73";
const ACCENT2 = "#f55654";

const PageContainer = styled.View`
  flex: 1;
  background-color: #427c80;
`;

const ProfileCard = styled.View`
  align-items: center;
  background-color: #fff;
  margin: 30px 18px 16px 18px;
  padding: 24px 10px 20px 10px;
  border-radius: 28px;
  box-shadow: 0px 4px 20px rgba(67, 124, 128, 0.06);
  elevation: 5;
`;

const SectionTitle = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: ${ACCENT};
  margin-left: 24px;
  margin-bottom: 7px;
  margin-top: 18px;
  letter-spacing: 0.5px;
`;

const SettingsCard = styled.View`
  background-color: white;
  border-radius: 22px;
  margin: 6px 16px 0 16px;
  padding-bottom: 8px;
  shadow-color: #000;
  shadow-opacity: 0.07;
  shadow-radius: 12px;
  elevation: 3;
`;

const SectionHeaderContainer = styled.View`
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  background-color: #fff;
  padding: 7px 18px;
  border-radius: 18px;
  margin-left: 22px;
  margin-top: 25px;
  margin-bottom: 8px;
  box-shadow: 0px 3px 16px rgba(115, 59, 115, 0.07);
  elevation: 3;
`;

const SectionHeaderText = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  color: ${ACCENT};
  letter-spacing: 0.5px;
  margin-left: 7px;
`;

export const SettingsScreen = ({ navigation }) => {
  const { onLogout, user } = useContext(AuthenticationContext);
  const [photo, setPhoto] = useState(null);

  // Name logic HERE, after user exists!
  const name =
    user?.displayName ||
    (user?.email &&
      user.email.split("@")[0].charAt(0).toUpperCase() +
        user.email.split("@")[0].slice(1)) ||
    "Artist";

  const getProfilePicture = async (currentUser) => {
    const photoUri = await AsyncStorage.getItem(`${currentUser.uid}-photo`);
    setPhoto(photoUri);
  };

  useFocusEffect(() => {
    getProfilePicture(user);
  }, [user]);

  return (
    <SafeArea style={{ flex: 1, backgroundColor: "#427c80" }}>
      <ScrollView>
        <ProfileCard>
          <TouchableOpacity onPress={() => navigation.navigate("Camera")}>
            {!photo && (
              <Avatar.Icon size={110} icon="account" backgroundColor={ACCENT} />
            )}
            {photo && (
              <Avatar.Image
                size={110}
                source={{ uri: photo }}
                backgroundColor={ACCENT}
              />
            )}
          </TouchableOpacity>
          {/* Name */}
          <Spacer position="top" size="medium">
            <Text
              style={{
                color: ACCENT,
                fontWeight: "bold",
                fontSize: 20,
                letterSpacing: 0.2,
                textAlign: "center",
              }}
            >
              {name}
            </Text>
          </Spacer>
          {/* Email */}
          <Spacer position="top" size="small">
            <Text variant="label" style={{ color: "#427c80", fontSize: 16 }}>
              {user.email}
            </Text>
          </Spacer>
        </ProfileCard>
        <SectionHeaderContainer>
          <List.Icon icon="account" color={ACCENT2} style={{ margin: 0 }} />
          <SectionHeaderText>Contul tău</SectionHeaderText>
        </SectionHeaderContainer>{" "}
        <SettingsCard>
          <List.Item
            title="Favorite"
            description="Vezi ce ai salvat"
            left={(props) => (
              <List.Icon {...props} color={ACCENT2} icon="heart" />
            )}
            onPress={() => navigation.navigate("Favourites")}
          />
          <Divider />
          <List.Item
            title="Deconectează-te"
            left={(props) => (
              <List.Icon {...props} color={ACCENT} icon="logout" />
            )}
            onPress={onLogout}
          />
        </SettingsCard>
        <SectionHeaderContainer>
          <List.Icon icon="apps" color={ACCENT} style={{ margin: 0 }} />
          <SectionHeaderText>Aplicație</SectionHeaderText>
        </SectionHeaderContainer>
        <SettingsCard>
          <List.Item
            title="Despre ArtistHive"
            description="Ce e, cine a făcut-o"
            left={(props) => (
              <List.Icon {...props} color={ACCENT} icon="information" />
            )}
            onPress={() => navigation.navigate("About")}
          />
          <Divider />
          <List.Item
            title="Copyright"
            description="Legal & Credits"
            left={(props) => (
              <List.Icon {...props} color="#333" icon="copyright" />
            )}
            onPress={() => navigation.navigate("Copyright")}
          />
        </SettingsCard>
      </ScrollView>
    </SafeArea>
  );
};
