import React, { useState, useContext } from "react";
import {
  Alert,
  ScrollView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { TextInput, ActivityIndicator } from "react-native-paper";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthenticationContext } from "../../../services/authentication/authentication.context";
import {
  getAuth,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { SafeArea } from "../../../components/utility/safe-area.component";
import { Text } from "../../../components/typography/text.component";

// Main palette
const ACCENT = "#F55654";
const BACKGROUND = "#808080";

const CenteredContainer = styled.View`
  flex: 1;
  background-color: ${BACKGROUND};
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Card = styled.View`
  background-color: #fff;
  border-radius: 32px;
  align-items: stretch;
  padding: 34px 24px 28px 24px;
  shadow-color: #427c80;
  shadow-opacity: 0.12;
  shadow-radius: 24px;
  elevation: 9;
  width: 92%;
  max-width: 470px;
  margin-top: 32px;
  margin-bottom: 28px;
`;

const SectionTitle = styled(Text)`
  color: ${ACCENT};
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 28px;
  text-align: left;
`;

const Label = styled(Text)`
  color: ${ACCENT};
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const OrangeButton = styled.TouchableOpacity`
  background-color: ${ACCENT};
  padding: 14px;
  border-radius: 18px;
  align-items: center;
  margin-top: 1px;
  margin-bottom: 22px;
  elevation: 2;
`;

const ButtonText = styled(Text)`
  color: #fff;
  font-size: 17px;
  font-weight: bold;
  letter-spacing: 0.3px;
`;

export const EditAccountScreen = ({ navigation }) => {
  const { user } = useContext(AuthenticationContext);

  const auth = getAuth();
  const db = getFirestore();

  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [email, setEmail] = useState(user.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Update Name
  const handleNameChange = async () => {
    if (!displayName.trim()) {
      Alert.alert("Numele nu poate fi gol.");
      return;
    }
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      await updateDoc(doc(db, "users", user.uid), { name: displayName });
      Alert.alert("Succes", "Numele a fost actualizat!");
    } catch (e) {
      Alert.alert("Eroare", e.message);
    }
    setLoading(false);
  };

  // Update Email (needs re-auth)
  const handleEmailChange = async () => {
    if (email === user.email) {
      Alert.alert("Nu ai schimbat adresa de email.");
      return;
    }
    if (!currentPassword) {
      Alert.alert("Introduceți parola curentă pentru a schimba emailul.");
      return;
    }
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateEmail(auth.currentUser, email);
      await updateDoc(doc(db, "users", user.uid), { email });
      Alert.alert("Succes", "Emailul a fost actualizat!");
    } catch (e) {
      Alert.alert("Eroare", e.message);
    }
    setLoading(false);
  };

  // Update Password (needs re-auth)
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Introduceți parola curentă și noua parolă.");
      return;
    }
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      Alert.alert("Succes", "Parola a fost actualizată!");
      setNewPassword("");
      setCurrentPassword("");
    } catch (e) {
      Alert.alert("Eroare", e.message);
    }
    setLoading(false);
  };

  return (
    <SafeArea style={{ flex: 1, backgroundColor: BACKGROUND }}>
      {/* Custom Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.menuButton}
        activeOpacity={0.72}
      >
        <Ionicons name="arrow-back" size={32} color={BACKGROUND} />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingTop: Platform.OS === "ios" ? 54 : 16,
          paddingBottom: 48,
          minHeight: "100%",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <SectionTitle>Modifică datele contului</SectionTitle>

          {/* Name */}
          <Label>Nume (afișat în aplicație)</Label>
          <TextInput
            placeholder="Nume"
            value={displayName}
            onChangeText={setDisplayName}
            mode="outlined"
            style={{ marginBottom: 6, backgroundColor: "#fff" }}
            outlineColor={ACCENT}
            activeOutlineColor={ACCENT}
          />
          <OrangeButton onPress={handleNameChange} disabled={loading}>
            <ButtonText>Salvează numele</ButtonText>
          </OrangeButton>

          {/* Email */}
          <Label>Schimbă adresa de email</Label>
          <TextInput
            placeholder="Adresă de email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ marginBottom: 6, backgroundColor: "#fff" }}
            outlineColor={ACCENT}
            activeOutlineColor={ACCENT}
          />
          <TextInput
            placeholder="Parola curentă"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            mode="outlined"
            secureTextEntry
            style={{ marginBottom: 6, backgroundColor: "#fff" }}
            outlineColor={ACCENT}
            activeOutlineColor={ACCENT}
          />
          <OrangeButton onPress={handleEmailChange} disabled={loading}>
            <ButtonText>Schimbă emailul</ButtonText>
          </OrangeButton>

          {/* Password */}
          <Label>Schimbă parola</Label>
          <TextInput
            placeholder="Noua parolă"
            value={newPassword}
            onChangeText={setNewPassword}
            mode="outlined"
            secureTextEntry
            style={{ marginBottom: 6, backgroundColor: "#fff" }}
            outlineColor={ACCENT}
            activeOutlineColor={ACCENT}
          />
          <OrangeButton onPress={handlePasswordChange} disabled={loading}>
            <ButtonText>Schimbă parola</ButtonText>
          </OrangeButton>

          {loading && (
            <ActivityIndicator
              animating={true}
              color={ACCENT}
              style={{ marginTop: 10 }}
            />
          )}
        </Card>
      </ScrollView>
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
