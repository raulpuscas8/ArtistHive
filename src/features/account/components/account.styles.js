import styled from "styled-components/native";
import { Button, TextInput } from "react-native-paper";
import { colors } from "../../../infrastructure/theme/colors";
import { Text } from "../../../components/typography/text.component";

// Background for AccountScreen
export const AccountBackground = styled.ImageBackground.attrs({
  source: require("../../../../assets/artisthive2.jpg"),
})`
  flex: 1;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: flex-start;
`;

// Used on Login/Register (if needed)
export const AccountCover = styled.View`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.3);
`;

export const TopSection = styled.View`
  width: 100%;
  align-items: center;
  margin-top: 210px;
`;

export const Title = styled(Text)`
  font-size: 42px;
  color: #733b73;
  font-weight: bold;
  text-align: center;
  margin-top: 90px;
`;

export const Subtitle = styled(Text)`
  font-size: 18px;
  color: #f99551;
  margin-top: 4px;
  margin-bottom: 10px;
  text-align: center;
  font-weight: 500;
`;

export const AnimationWrapper = styled.View`
  width: 100px;
  height: 100px;
  align-self: center;
`;

export const LoginCard = styled.View`
  width: 94%;
  padding: 24px 16px 28px 16px;
  background-color: rgba(255, 255, 255, 0.94);
  border-radius: 28px;
  align-items: center;
  margin-top: 70px;
  border-width: 2px;
  border-color: #91b87c;
  shadow-color: #91b87c;
  shadow-opacity: 0.09;
  shadow-radius: 12px;
  elevation: 3;
`;

export const BottomCard = styled.View`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 28%;
  padding: 38px 20px 40px 20px;
  background-color: rgba(255, 255, 255, 0.93);
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  align-items: center;
  box-shadow: 0px -4px 20px rgba(115, 59, 115, 0.07);
  elevation: 9;
`;

// For Login/Register screens
export const AccountContainer = styled.View`
  background-color: rgba(255, 255, 255, 0.94);
  padding: 28px;
  margin-top: 16px;
  border-radius: 22px;
  align-items: center;
  width: 86%;
  align-self: center;
  border-width: 2.5px;
  border-color: ${colors.brand.green || "#91b87c"};
  shadow-color: ${colors.brand.primary};
  shadow-opacity: 0.08;
  shadow-radius: 12px;
  elevation: 5;
`;

// Full-width button for AccountScreen/BottomCard
export const AuthButton = styled(Button)`
  padding: 10px;
  width: 92%;
  align-self: center;
  border-radius: 18px;
  min-height: 56px;
  margin-bottom: 26px;
  elevation: 3;
  shadow-color: #733b73;
  shadow-opacity: 0.09;
  shadow-radius: 12px;
`;

export const AuthInput = styled(TextInput)`
  width: 100%;
  align-self: center;
  margin-bottom: 12px;
`;

export const ErrorContainer = styled.View`
  max-width: 300px;
  align-items: center;
  align-self: center;
  margin-top: ${(props) => props.theme.space[2]};
  margin-bottom: ${(props) => props.theme.space[2]};
`;
