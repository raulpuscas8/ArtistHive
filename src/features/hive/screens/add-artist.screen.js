// src/features/hive/screens/add-artist.screen.js

import React, { useState, useEffect, useContext } from "react";
import {
  ScrollView,
  TextInput,
  Button,
  View,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import styled from "styled-components/native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  GeoPoint,
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { SafeArea } from "../../../components/utility/safe-area.component";
import { Text } from "../../../components/typography/text.component";
import { db, storage } from "../../../utils/firebase.config";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { AuthenticationContext } from "../../../services/authentication/authentication.context";

const Field = styled(TextInput)`
  border: 1px solid ${(p) => p.theme.colors.ui.primary};
  margin-bottom: ${(p) => p.theme.space[3]};
  padding: ${(p) => p.theme.space[2]};
  border-radius: 4px;
`;

export const AddArtistScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // **<< HERE!**
  const { user } = useContext(AuthenticationContext);

  // basic info
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [category, setCategory] = useState("Painting");

  // new fields
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  // price & currency
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("RON");

  // 📍 coords picked on the map
  const [coords, setCoords] = useState(null);

  // photos
  const [photoUrl, setPhotoUrl] = useState("");
  const [localPhotos, setLocalPhotos] = useState([]);

  const [loading, setLoading] = useState(false);

  // listen for the MapPicker callback
  useEffect(() => {
    if (route.params?.pickedLoc && route.params?.pickedAddress) {
      setCoords(route.params.pickedLoc);
      setAddress(route.params.pickedAddress);
    }
  }, [route.params]);

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
      !price ||
      !currency ||
      (!photoUrl.trim() && localPhotos.length === 0)
    ) {
      return Alert.alert("All required fields must be filled");
    }
    if (isNaN(price) || Number(price) <= 0) {
      return Alert.alert("Price must be a positive number");
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

      // build payload
      const data = {
        name,
        address,
        isOpenNow,
        category,
        description,
        email,
        phone,
        website,
        price: parseFloat(price),
        currency,
        photos,
        avgRating: 0,
        ratingsCount: 0,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ), // +30 days
        userId: user?.uid || null,
      };
      if (coords) {
        data.location = new GeoPoint(coords.lat, coords.lng);
      }

      // write to Firestore
      await addDoc(collection(db, "artists"), data);

      Alert.alert("Success", "Artist added!");
      // reset form
      setName("");
      setAddress("");
      setIsOpenNow(false);
      setCategory("Painting");
      setDescription("");
      setEmail("");
      setPhone("");
      setWebsite("");
      setPrice("");
      setCurrency("RON");
      setPhotoUrl("");
      setLocalPhotos([]);
      setCoords(null);
      navigation.goBack();
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

        {/* Address & Map Picker */}
        <Text variant="label">Address</Text>
        <Field
          placeholder="e.g. 123 Art St"
          value={address}
          onChangeText={setAddress}
        />
        <Button
          title={coords ? "✔️ Location Set" : "Pick on Map"}
          onPress={() =>
            navigation.navigate("MapPicker", {
              // no payload needed; we read back via route.params
            })
          }
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
        <Text variant="label">Pricing</Text>
        <Field
          placeholder="e.g. 100"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <Text variant="label" style={{ marginTop: 0 }}>
          Currency
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 4,
            marginBottom: 16,
            marginTop: 0,
            overflow: "hidden",
            height: 120, // Make picker tall, just like category
            justifyContent: "center",
          }}
        >
          <Picker
            selectedValue={currency}
            onValueChange={setCurrency}
            style={{
              height: 120, // Make picker tall for iOS spinner style
              width: "100%",
            }}
            itemStyle={{ fontSize: 24, height: 120, textAlign: "center" }} // makes the items more visible/centered
          >
            <Picker.Item label="Lei (RON)" value="RON" />
            <Picker.Item label="Euro (EUR)" value="EUR" />
            <Picker.Item label="USD" value="USD" />
          </Picker>
        </View>

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
