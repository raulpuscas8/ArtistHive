import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { Text } from "../../../components/typography/text.component";
import { Button } from "react-native";

export const PaymentWebViewScreen = ({ navigation }) => {
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const createCheckoutSession = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4242/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      const data = await response.json();
      setCheckoutUrl(data.url);
    } catch (err) {
      Alert.alert("Error", "Could not start payment session.");
    }
    setLoading(false);
  };

  useEffect(() => {
    createCheckoutSession();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text variant="label">Se încarcă sesiunea de plată...</Text>
      </View>
    );
  }

  if (!checkoutUrl) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text variant="label">Nu s-a putut genera sesiunea de plată.</Text>
        <Button title="Încearcă din nou" onPress={createCheckoutSession} />
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: checkoutUrl }}
      style={{ flex: 1 }}
      onNavigationStateChange={(event) => {
        // If you want, handle success/cancel here
        if (event.url.includes("success=true")) {
          Alert.alert("Plată efectuată cu succes!");
          navigation.goBack();
        }
        if (event.url.includes("canceled=true")) {
          Alert.alert("Plata a fost anulată.");
          navigation.goBack();
        }
      }}
    />
  );
};
