import React, { useContext } from "react";
import { Spacer } from "../../../components/spacer/spacer.component";
import {
  AccountBackground,
  AccountContainer,
  AccountCover,
  AuthButton,
  Title,
} from "../components/account.styles";
import { AuthenticationContext } from "../../../services/authentication/authentication.context";

export const AccountScreen = ({ navigation }) => {
  const { isAuthenticated, onLogout } = useContext(AuthenticationContext);

  return (
    <AccountBackground>
      <AccountCover />
      <Title>ArtistHive</Title>
      <AccountContainer>
        {isAuthenticated ? (
          <AuthButton icon="logout" mode="contained" onPress={onLogout}>
            Logout
          </AuthButton>
        ) : (
          <>
            <AuthButton
              icon="lock-open-outline"
              mode="contained"
              onPress={() => navigation.navigate("Login")}
            >
              Login
            </AuthButton>
            <Spacer size="large">
              <AuthButton
                icon="email"
                mode="contained"
                onPress={() => navigation.navigate("Register")}
              >
                Register
              </AuthButton>
            </Spacer>
          </>
        )}
      </AccountContainer>
    </AccountBackground>
  );
};
