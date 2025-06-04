import React, { useState, useContext } from "react";
import {
  AccountBackground,
  TopSection,
  LoginCard,
  AuthInput,
  AuthButton,
  ErrorContainer,
  Title,
  Subtitle,
} from "../components/account.styles";
import { Text } from "../../../components/typography/text.component";
import { Spacer } from "../../../components/spacer/spacer.component";
import { AuthenticationContext } from "../../../services/authentication/authentication.context";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

export const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");
  const { onRegister, error, isLoading } = useContext(AuthenticationContext);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <AccountBackground>
          <TopSection style={{ marginBottom: 12 }}>
            <Title style={{ marginTop: 0, marginBottom: 8 }}>ArtistHive</Title>
            <Subtitle style={{ marginBottom: 6 }}>Crează noul cont!</Subtitle>
          </TopSection>
          <LoginCard>
            <AuthInput
              label="E-mail"
              value={email}
              textContentType="emailAddress"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
              mode="outlined"
              style={{
                backgroundColor: "#f9f6fb",
                marginBottom: 16,
                borderRadius: 10,
              }}
              outlineColor="#91b87c"
              activeOutlineColor="#733b73"
              contentStyle={{
                paddingVertical: 6,
                paddingHorizontal: 10,
              }}
            />
            <AuthInput
              label="Parola"
              value={password}
              textContentType="newPassword"
              autoComplete="password-new"
              secureTextEntry
              autoCapitalize="none"
              onChangeText={setPassword}
              mode="outlined"
              style={{
                backgroundColor: "#f9f6fb",
                marginBottom: 16,
                borderRadius: 10,
              }}
              outlineColor="#91b87c"
              activeOutlineColor="#733b73"
              contentStyle={{
                paddingVertical: 6,
                paddingHorizontal: 10,
              }}
            />
            <AuthInput
              label="Repetă parola"
              value={repeatedPassword}
              textContentType="newPassword"
              autoComplete="password-new"
              secureTextEntry
              autoCapitalize="none"
              onChangeText={setRepeatedPassword}
              mode="outlined"
              style={{
                backgroundColor: "#f9f6fb",
                marginBottom: 18,
                borderRadius: 10,
              }}
              outlineColor="#91b87c"
              activeOutlineColor="#733b73"
              contentStyle={{
                paddingVertical: 6,
                paddingHorizontal: 10,
              }}
            />

            {error && (
              <ErrorContainer>
                <Text variant="error">{error}</Text>
              </ErrorContainer>
            )}
            <Spacer size="medium" />

            {!isLoading ? (
              <AuthButton
                icon="email"
                mode="contained"
                onPress={() => onRegister(email, password, repeatedPassword)}
                style={{
                  backgroundColor: "#f55654",
                  minHeight: 50,
                  borderRadius: 16,
                  width: "100%",
                  marginBottom: 14,
                }}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: 18,
                  color: "#fff",
                  letterSpacing: 1,
                }}
              >
                Înregistrare
              </AuthButton>
            ) : (
              <ActivityIndicator
                animating={true}
                color="#f99551"
                size="large"
              />
            )}

            <AuthButton
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={{
                borderRadius: 16,
                borderWidth: 2,
                borderColor: "#733b73",
                width: "100%",
                minHeight: 50,
                backgroundColor: "#fff",
              }}
              labelStyle={{
                fontWeight: "bold",
                fontSize: 18,
                color: "#733b73",
                letterSpacing: 1,
              }}
            >
              Înapoi
            </AuthButton>
          </LoginCard>
        </AccountBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
