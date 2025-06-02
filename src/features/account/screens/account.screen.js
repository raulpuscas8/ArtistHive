import React, { useContext } from "react";
import { Dimensions } from "react-native";
import { Spacer } from "../../../components/spacer/spacer.component";
import {
  AccountBackground,
  TopSection,
  BottomCard,
  Title,
  AnimationWrapper,
  Subtitle,
  AuthButton,
} from "../components/account.styles";
import { AuthenticationContext } from "../../../services/authentication/authentication.context";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

export const AccountScreen = ({ navigation }) => {
  const { isAuthenticated, onLogout } = useContext(AuthenticationContext);

  return (
    <AccountBackground>
      <TopSection>
        <AnimationWrapper style={{ width, height: height * 0.23 }}>
          <LottieView
            autoPlay
            loop
            style={{ width: "107%", height: "120%" }}
            resizeMode="cover"
            source={require("../../../../assets/Honey.json")}
          />
        </AnimationWrapper>
        <Title style={{ marginTop: 30 }}>ArtistHive</Title>
        <Subtitle>Your art, your hive!</Subtitle>
      </TopSection>
      <BottomCard>
        {isAuthenticated ? (
          <AuthButton
            icon="logout"
            mode="contained"
            onPress={onLogout}
            style={{
              backgroundColor: "#f99551",
            }}
            labelStyle={{
              fontWeight: "bold",
              fontSize: 18,
              color: "#fff",
            }}
          >
            Logout
          </AuthButton>
        ) : (
          <>
            <AuthButton
              icon="lock-open-outline"
              mode="contained"
              onPress={() => navigation.navigate("Login")}
              style={{
                backgroundColor: "#733b73",
                minHeight: 58,
                marginBottom: 16,
                width: "92%",
                alignSelf: "center",
              }}
              labelStyle={{
                fontWeight: "bold",
                fontSize: 20,
                color: "#fff",
                letterSpacing: 1,
              }}
            >
              Login
            </AuthButton>
            <AuthButton
              icon="email"
              mode="contained"
              onPress={() => navigation.navigate("Register")}
              style={{
                backgroundColor: "#f55654",
                minHeight: 58,
                width: "92%",
                alignSelf: "center",
              }}
              labelStyle={{
                fontWeight: "bold",
                fontSize: 20,
                color: "#fff",
                letterSpacing: 1,
              }}
            >
              Register
            </AuthButton>
          </>
        )}
      </BottomCard>
    </AccountBackground>
  );
};
