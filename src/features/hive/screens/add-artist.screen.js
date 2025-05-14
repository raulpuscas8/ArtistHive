import React, { useState } from "react";
import {
  ScrollView,
  TextInput,
  Button,
  View,
  Switch,
  Alert,
} from "react-native";
import styled from "styled-components/native";
import { SafeArea } from "../../../components/utility/safe-area.component";
import { Text } from "../../../components/typography/text.component";
import { db } from "../../../utils/firebase.config";
import { collection, addDoc } from "firebase/firestore";

const Field = styled(TextInput)`
  border: 1px solid ${(p) => p.theme.colors.ui.primary};
  margin-bottom: ${(p) => p.theme.space[3]};
  padding: ${(p) => p.theme.space[2]};
  border-radius: 4px;
`;

export const AddArtistScreen = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [rating, setRating] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !address || !rating || !photoUrl) {
      return Alert.alert("All fields are required");
    }
    setLoading(true);
    try {
      const photos = photoUrl.split(",").map((u) => u.trim());
      await addDoc(collection(db, "artists"), {
        name,
        address,
        rating: parseFloat(rating),
        isOpenNow,
        photos,
      });
      Alert.alert("Success", "Artist added!");
      // reset
      setName("");
      setAddress("");
      setRating("");
      setPhotoUrl("");
      setIsOpenNow(false);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e.message);
    }
    setLoading(false);
  };

  return (
    <SafeArea>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text variant="label">Name</Text>
        <Field
          placeholder="e.g. Night Owl Jazz Club"
          value={name}
          onChangeText={setName}
        />

        <Text variant="label">Address</Text>
        <Field
          placeholder="e.g. 123 Main St, Cluj-Napoca"
          value={address}
          onChangeText={setAddress}
        />

        <Text variant="label">Rating</Text>
        <Field
          placeholder="e.g. 4.5"
          value={rating}
          onChangeText={setRating}
          keyboardType="numeric"
        />

        <Text variant="label">Photos (comma-separated URLs)</Text>
        <Field
          placeholder="https://…jpg, https://…jpg"
          value={photoUrl}
          onChangeText={setPhotoUrl}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text>Open Now?</Text>
          <Switch
            style={{ marginLeft: 8 }}
            value={isOpenNow}
            onValueChange={setIsOpenNow}
          />
        </View>

        <Button
          title={loading ? "Adding..." : "Add Artist"}
          onPress={handleSubmit}
          disabled={loading}
        />
      </ScrollView>
    </SafeArea>
  );
};
