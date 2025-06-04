import React, { useState } from "react";
import {
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Text } from "../../../components/typography/text.component";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

const CARD = {
  backgroundColor: "rgba(255,255,255,0.93)",
  borderRadius: 26,
  padding: 26,
  margin: 18,
  marginTop: 36,
  shadowColor: "#91B87C",
  shadowOpacity: 0.13,
  shadowRadius: 14,
  elevation: 6,
};

export const DonateScreen = ({ navigation }) => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("RON");
  const [loading, setLoading] = useState(false);

  const handleDonate = () => {
    if (!amount.trim() || isNaN(amount) || Number(amount) <= 0) {
      Alert.alert("Introdu o sumă validă pentru donație.");
      return;
    }
    navigation.navigate("Stripe Web Payment", {
      amount: Number(amount),
      currency,
      name: "Donație ArtistHive",
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#f0f5ed" }}
      keyboardVerticalOffset={90}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f5ed",
        }}
      >
        <View
          style={{
            ...CARD,
            width: "92%",
            maxWidth: 440,
          }}
        >
          {/* ...the rest of your donation UI here... */}
          <Text
            style={{
              color: "#321b47",
              fontWeight: "bold",
              fontSize: 26,
              marginBottom: 24,
              letterSpacing: 1,
              textAlign: "center",
            }}
          >
            Susține ArtistHive!
          </Text>
          <Text
            style={{
              color: "#000",
              marginBottom: 16,
              fontSize: 15,
              textAlign: "center",
            }}
          >
            Introdu suma pe care vrei să o donezi:
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <Ionicons
              name="cash-outline"
              size={26}
              color="#91B87C"
              style={{ marginRight: 10 }}
            />
            <TextInput
              placeholder="Sumă (ex: 10)"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#e5d7ee",
                borderRadius: 12,
                fontSize: 17,
                backgroundColor: "#f8f4fc",
                paddingHorizontal: 16,
                paddingVertical: 10,
                marginRight: 14,
                color: "#321b47",
              }}
            />
            <View style={{ flex: 0.75, minWidth: 80 }}>
              <Picker
                selectedValue={currency}
                onValueChange={setCurrency}
                style={{ fontSize: 16 }}
                itemStyle={{ fontSize: 16 }}
              >
                <Picker.Item label="Lei (RON)" value="RON" />
                <Picker.Item label="Euro (EUR)" value="EUR" />
                <Picker.Item label="USD" value="USD" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleDonate}
            style={{
              backgroundColor: "#91b87c",
              borderRadius: 10,
              paddingVertical: 13,
              alignItems: "center",
              marginTop: 16,
              shadowColor: "#91b87c",
              shadowOpacity: 0.14,
              shadowRadius: 8,
              elevation: 3,
            }}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 19 }}>
              {loading ? "Se procesează..." : "Donează"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
