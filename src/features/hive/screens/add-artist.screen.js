// src/features/hive/screens/add-artist.screen.js

import React, { useState } from "react";
import {
  ScrollView,
  TextInput,
  Button,
  View,
  Switch,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import styled from "styled-components/native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";

import { SafeArea } from "../../../components/utility/safe-area.component";
import { Text } from "../../../components/typography/text.component";
import { db, storage } from "../../../utils/firebase.config";
import { collection, addDoc } from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const Field = styled(TextInput)`
  border: 1px solid ${(p) => p.theme.colors.ui.primary};
  margin-bottom: ${(p) => p.theme.space[3]};
  padding: ${(p) => p.theme.space[2]};
  border-radius: 4px;
`;

export const AddArtistScreen = () => {
  // basic info
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [rating, setRating] = useState("");
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [category, setCategory] = useState("Painting");

  // new fields
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [priceRange, setPriceRange] = useState("");

  // photos
  const [photoUrl, setPhotoUrl] = useState("");
  const [localPhotos, setLocalPhotos] = useState([]);

  const [loading, setLoading] = useState(false);

  const categories = [
    "Painting",
    "Music",
    "Sculpture",
    "Photography",
    "Digital Art",
    "PrintMaking",
    "Ceramics",
    "Textile & Fiber",
    "Jewelry & Wearables",
    "Graphic Design & Illustration",
    "Performance Art",
    "Video & Animation",
    "Crafts & Handmade",
    "Other",
  ];

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert(
        "Permission required",
        "We need photo library access to pick images."
      );
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const assets = result.assets ?? [result];
      const formatted = assets.map((a) => ({
        uri: a.uri,
        fileName: a.fileName ?? a.uri.split("/").pop(),
      }));
      setLocalPhotos((prev) => [...prev, ...formatted]);
    }
  };

  const uploadPhoto = async ({ uri, fileName }) => {
    const resp = await fetch(uri);
    const blob = await resp.blob();
    const ref = storageRef(storage, `artists/${fileName}`);
    const task = uploadBytesResumable(ref, blob);
    return new Promise((res, rej) => {
      task.on("state_changed", null, rej, async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        res(url);
      });
    });
  };

  const handleSubmit = async () => {
    // require the essential fields
    if (
      !name ||
      !address ||
      !description ||
      !email ||
      !priceRange ||
      (!photoUrl.trim() && localPhotos.length === 0)
    ) {
      return Alert.alert("All required fields must be filled");
    }
    setLoading(true);
    try {
      // remote URLs
      const remote = photoUrl
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);
      // upload locals
      const uploads = await Promise.all(localPhotos.map(uploadPhoto));
      const photos = [...remote, ...uploads];

      // write to Firestore
      await addDoc(collection(db, "artists"), {
        name,
        address,
        rating: parseFloat(rating) || 0,
        isOpenNow,
        category,
        description,
        email,
        phone,
        website,
        priceRange,
        photos,
      });

      Alert.alert("Success", "Artist added!");
      // reset form
      setName("");
      setAddress("");
      setRating("");
      setIsOpenNow(false);
      setCategory("Painting");
      setDescription("");
      setEmail("");
      setPhone("");
      setWebsite("");
      setPriceRange("");
      setPhotoUrl("");
      setLocalPhotos([]);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e.message);
    }
    setLoading(false);
  };

  return (
    <SafeArea>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Name */}
        <Text variant="label">Name</Text>
        <Field
          placeholder="e.g. Jane Doe"
          value={name}
          onChangeText={setName}
        />

        {/* Address */}
        <Text variant="label">Address</Text>
        <Field
          placeholder="e.g. 123 Art St"
          value={address}
          onChangeText={setAddress}
        />

        {/* Rating (optional) */}
        <Text variant="label">Rating</Text>
        <Field
          placeholder="e.g. 4.5"
          value={rating}
          onChangeText={setRating}
          keyboardType="numeric"
        />

        {/* Category */}
        <Text variant="label">Category</Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 4,
            marginBottom: 16,
          }}
        >
          <Picker selectedValue={category} onValueChange={setCategory}>
            {categories.map((cat) => (
              <Picker.Item label={cat} value={cat} key={cat} />
            ))}
          </Picker>
        </View>

        {/* Description */}
        <Text variant="label">Description</Text>
        <Field
          placeholder="Tell us about your work…"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Contact */}
        <Text variant="label">Email</Text>
        <Field
          placeholder="artist@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text variant="label">Phone</Text>
        <Field
          placeholder="+40 123 456 789"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text variant="label">Website</Text>
        <Field
          placeholder="https://…"
          value={website}
          onChangeText={setWebsite}
          keyboardType="url"
        />

        {/* Pricing */}
        <Text variant="label">Price Range</Text>
        <Field
          placeholder="e.g. €100–€500"
          value={priceRange}
          onChangeText={setPriceRange}
        />

        {/* Photos */}
        <Text variant="label">Photos (comma-separated URLs)</Text>
        <Field
          placeholder="https://…jpg, https://…jpg"
          value={photoUrl}
          onChangeText={setPhotoUrl}
        />

        <Text variant="label">Or pick from library</Text>
        <Button title="Pick Images" onPress={pickImages} />

        {localPhotos.length > 0 && (
          <ScrollView horizontal style={{ marginVertical: 12 }}>
            {localPhotos.map((a, i) => (
              <Image
                key={i}
                source={{ uri: a.uri }}
                style={{
                  width: 80,
                  height: 80,
                  marginRight: 8,
                  borderRadius: 4,
                }}
              />
            ))}
          </ScrollView>
        )}

        {loading ? (
          <ActivityIndicator style={{ marginTop: 16 }} />
        ) : (
          <Button title="Add Artist" onPress={handleSubmit} />
        )}
      </ScrollView>
    </SafeArea>
  );
};
