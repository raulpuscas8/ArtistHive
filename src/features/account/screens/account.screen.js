import React, { useContext } from "react";
import { View, Dimensions } from "react-native";
import { Spacer } from "../../../components/spacer/spacer.component";
import {
  AccountBackground,
  AccountContainer,
  AccountCover,
  AuthButton,
  Title,
  AnimationWrapper,
} from "../components/account.styles";
import { AuthenticationContext } from "../../../services/authentication/authentication.context";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

export const AccountScreen = ({ navigation }) => {
  const { isAuthenticated, onLogout } = useContext(AuthenticationContext);

  return (
    <AccountBackground>
      <AccountCover />
      <AnimationWrapper style={{ width, height: height * 0.4 }}>
        <LottieView
          autoPlay
          loop
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          source={require("../../../../assets/Honey.json")}
        />
      </AnimationWrapper>
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
