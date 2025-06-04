import React, { useState, useContext, useEffect } from "react";
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
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../../utils/firebase.config";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { onLogin, error, isLoading } = useContext(AuthenticationContext);

  // Google Auth Session setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.GOOGLE_WEB_CLIENT_ID, // or just paste the value if testing
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then((userCredential) => {
          console.log(
            "Firebase Google login success:",
            userCredential.user.email
          );
          // Optional: navigate, show toast, etc.
        })
        .catch((err) => {
          console.log("Firebase Google login error:", err);
        });
    }
  }, [response]);

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
            <Subtitle style={{ marginBottom: 6 }}>Bine ai revenit!</Subtitle>
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
              label="Parolă"
              value={password}
              textContentType="password"
              secureTextEntry
              autoCapitalize="none"
              onChangeText={setPassword}
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
                icon="lock-open-outline"
                mode="contained"
                onPress={() => onLogin(email, password)}
                style={{
                  backgroundColor: "#733b73",
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
                Conectare
              </AuthButton>
            ) : (
              <ActivityIndicator
                animating={true}
                color="#f99551"
                size="large"
              />
            )}

            {/* Google Login Button */}
            <AuthButton
              icon="google"
              mode="outlined"
              onPress={() => promptAsync()}
              style={{
                borderRadius: 16,
                borderWidth: 2,
                borderColor: "#db4437",
                width: "100%",
                minHeight: 50,
                marginBottom: 14,
              }}
              labelStyle={{
                fontWeight: "bold",
                fontSize: 18,
                color: "#db4437",
                letterSpacing: 1,
              }}
              disabled={!request}
            >
              Conectare cu Google
            </AuthButton>

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
