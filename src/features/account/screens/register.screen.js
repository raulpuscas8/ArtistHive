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

  // Error messages per field
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [repeatError, setRepeatError] = useState("");

  const { onRegister, error, isLoading } = useContext(AuthenticationContext);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email); // basic email check

  const validatePassword = (password) =>
    password.length >= 6 && /[A-Z]/.test(password); // at least 6 chars + 1 uppercase

  const handleRegister = () => {
    let valid = true;

    // Reset errors
    setEmailError("");
    setPasswordError("");
    setRepeatError("");

    if (!validateEmail(email)) {
      setEmailError("Email invalid");
      valid = false;
    }

    if (!validatePassword(password)) {
      setPasswordError(
        "Parola trebuie să aibă cel puțin 6 caractere și o literă mare"
      );
      valid = false;
    }

    if (password !== repeatedPassword) {
      setRepeatError("Parolele nu coincid");
      valid = false;
    }

    if (!valid) return;

    // All validations passed
    onRegister(email, password, repeatedPassword);
  };

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
            <Subtitle style={{ marginBottom: 6 }}>Creează noul cont!</Subtitle>
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
                marginBottom: emailError ? 4 : 16,
                borderRadius: 10,
              }}
              outlineColor="#91b87c"
              activeOutlineColor="#733b73"
              contentStyle={{
                paddingVertical: 6,
                paddingHorizontal: 10,
              }}
            />
            {emailError ? (
              <Text variant="error" style={{ marginBottom: 12 }}>
                {emailError}
              </Text>
            ) : null}

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
                marginBottom: passwordError ? 4 : 16,
                borderRadius: 10,
              }}
              outlineColor="#91b87c"
              activeOutlineColor="#733b73"
              contentStyle={{
                paddingVertical: 6,
                paddingHorizontal: 10,
              }}
            />
            {passwordError ? (
              <Text variant="error" style={{ marginBottom: 12 }}>
                {passwordError}
              </Text>
            ) : null}

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
                marginBottom: repeatError ? 4 : 18,
                borderRadius: 10,
              }}
              outlineColor="#91b87c"
              activeOutlineColor="#733b73"
              contentStyle={{
                paddingVertical: 6,
                paddingHorizontal: 10,
              }}
            />
            {repeatError ? (
              <Text variant="error" style={{ marginBottom: 12 }}>
                {repeatError}
              </Text>
            ) : null}

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
                onPress={handleRegister}
                style={{
                  backgroundColor: "#f55654",
                  minHeight: 50,
                  borderRadius: 16,
                  width: "100%",
                  marginBottom: 14,
                }}
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: 17,
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
                fontSize: 17,
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
