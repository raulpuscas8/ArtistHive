import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, View, Alert, Button } from "react-native";
import { WebView } from "react-native-webview";
import { Text } from "../../../components/typography/text.component";
import { StyleSheet } from "react-native";

export const PaymentWebViewScreen = ({ navigation, route }) => {
  const { amount, currency, name } = route.params || {};

  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true); // <-- NEW!
  const handledPayment = useRef(false);

  const createCheckoutSession = async () => {
    if (!amount || !currency) {
      Alert.alert("Lipsesc informații despre plată.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4242/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            currency,
            name: name || "Plată ArtistHive",
          }),
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

  // This handler only runs once for success/cancel
  const handleWebViewNav = (event) => {
    if (handledPayment.current) return;

    if (event.url.startsWith("https://artist-hive-success")) {
      handledPayment.current = true;
      setVisible(false); // HIDE WEBVIEW!
      Alert.alert("Plată efectuată cu succes!", "", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    }
    if (event.url.startsWith("https://artist-hive-cancel")) {
      handledPayment.current = true;
      setVisible(false);
      Alert.alert("Plata a fost anulată.", "", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  };

  if (!amount || !currency) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text variant="body">Nu au fost trimise datele pentru plată.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text variant="body">Se încarcă sesiunea de plată...</Text>
      </View>
    );
  }

  if (!checkoutUrl) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text variant="body">Nu s-a putut genera sesiunea de plată.</Text>
        <Button title="Încearcă din nou" onPress={createCheckoutSession} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {visible && (
        <WebView
          source={{ uri: checkoutUrl }}
          style={{ flex: 1 }}
          onNavigationStateChange={handleWebViewNav}
        />
      )}
      {!visible && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "#fff",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      )}
    </View>
  );
};
