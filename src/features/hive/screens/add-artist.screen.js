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
  TouchableOpacity,
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
import { LinearGradient } from "expo-linear-gradient";

import { SafeArea } from "../../../components/utility/safe-area.component";
import { Text } from "../../../components/typography/text.component";
import { db, storage } from "../../../utils/firebase.config";
import { Ionicons } from "@expo/vector-icons";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { AuthenticationContext } from "../../../services/authentication/authentication.context";

const Card = styled.View`
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 28px;
  padding: 24px;
  shadow-color: #000;
  shadow-opacity: 0.14;
  shadow-radius: 16px;
  elevation: 8;
  margin-bottom: 20px;
  margin-top: 5px;
  backdrop-filter: blur(12px);
`;

const StyledButton = styled.TouchableOpacity`
  background-color: #f55654;
  border-radius: 12px;
  padding: 14px;
  align-items: center;
  margin-bottom: 1px;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-weight: 600;
  font-size: 17px;
`;

const Label = styled(Text)`
  margin-bottom: 7px;
  font-size: 17px;
  color: #321b47;
  text-align: left;
`;

const Field = styled(TextInput)`
  border: 1.5px solid #e5d7ee;
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 16px;
  background: #f8f4fc;
  color: #321b47;
  text-align: center;
`;

const PickerContainer = styled.View`
  border: 1.5px solid #91b87c;
  border-radius: 12px;
  margin-bottom: 16px;
  background: #f8f4fc;
  overflow: hidden;
  height: 60px;
  justify-content: center;
`;

const ImagePreview = styled.Image`
  width: 70px;
  height: 70px;
  border-radius: 10px;
  margin-right: 8px;
  margin-top: 8px;
  border-width: 1px;
  border-color: #91b87c;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const Spacer = styled.View`
  height: 10px;
`;

const Divider = styled.View`
  height: 1px;
  background: #e5d7ee;
  margin-vertical: 20px;
  border-radius: 8px;
  opacity: 0.6;
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
  const [fieldFocused, setFieldFocused] = useState(false);

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
    "Pictură",
    "Muzică",
    "Sculptură",
    "Fotografie",
    "Artă digitală",
    "Gravură și print",
    "Ceramică",
    "Textile & Fibre",
    "Bijuterii & Accesorii",
    "Design grafic & Ilustrație",
    "Artă performativă",
    "Video & Animație",
    "Lucrate manual",
    "Altele",
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
    // require the essential fields ONLY (website and photos NOT required)
    if (
      !name.trim() ||
      !address.trim() ||
      !description.trim() ||
      !email.trim() ||
      !price.trim() ||
      !currency.trim()
    ) {
      return Alert.alert("All required fields must be filled");
    }

    if (isNaN(price) || Number(price) <= 0) {
      return Alert.alert("Price must be a positive number");
    }
    setLoading(true);
    try {
      // remote URLs (optional)
      const remote = photoUrl
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);
      // upload locals (optional)
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
        phone, // optional
        website, // optional
        price: parseFloat(price),
        currency,
        photos, // can be empty
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
    <SafeArea style={{ flex: 1, backgroundColor: "#91B87C" }}>
      <ScrollView
        contentContainerStyle={{
          padding: 18,
          backgroundColor: "#91B87C",
          minHeight: "100%",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={{
            position: "absolute",
            top: 1,
            left: 22,
            zIndex: 10,
            backgroundColor: "#fff",
            borderRadius: 18,
            padding: 7,
            elevation: 6,
            shadowColor: "#000",
            shadowOpacity: 0.14,
            shadowRadius: 5,
          }}
        >
          <Ionicons name="menu" size={28} color="#321b47" />
        </TouchableOpacity>

        <LinearGradient
          colors={["#91B87C", "#91B87C"]}
          style={{
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 38,
            borderBottomRightRadius: 38,
            height: 110,
            width: "110%",
            marginLeft: "-5%",
            marginTop: -22,
            alignSelf: "center",
            justifyContent: "flex-end",
            paddingBottom: 18,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 18,
            elevation: 4,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text
            style={{
              color: "#321b47",
              fontSize: 36,
              fontWeight: "bold",
              alignSelf: "center",
              marginBottom: 5,
              letterSpacing: 1,
            }}
          >
            🎨 Artă nouă? Vinde!
          </Text>
        </LinearGradient>

        <Card>
          <Label>Titlu anunț</Label>
          <Field
            placeholder="Titlu"
            value={name}
            onChangeText={setName}
            onFocus={() => setFieldFocused(true)}
            onBlur={() => setFieldFocused(false)}
            style={
              fieldFocused
                ? {
                    shadowColor: "#91B87C",
                    shadowOpacity: 0.18,
                    shadowRadius: 8,
                    elevation: 3,
                  }
                : {}
            }
          />
          <Label>Adresă</Label>
          <Row>
            <Field
              placeholder="Adresă"
              value={address}
              onChangeText={setAddress}
              style={[
                { flex: 1, marginBottom: 0, marginRight: 10 },
                fieldFocused
                  ? {
                      shadowColor: "#91B87C",
                      shadowOpacity: 0.18,
                      shadowRadius: 8,
                      elevation: 3,
                    }
                  : {},
              ]}
            />
            <StyledButton onPress={() => navigation.navigate("MapPicker")}>
              <ButtonText>{coords ? "✔️" : "📍"}</ButtonText>
            </StyledButton>
          </Row>

          <Spacer />
          <Label>Categorie</Label>
          <PickerContainer>
            <Picker selectedValue={category} onValueChange={setCategory}>
              {categories.map((cat) => (
                <Picker.Item label={cat} value={cat} key={cat} />
              ))}
            </Picker>
          </PickerContainer>
          <Label>Descriere</Label>
          <Field
            placeholder="Spune ceva despre arta ta…"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            onFocus={() => setFieldFocused(true)}
            onBlur={() => setFieldFocused(false)}
            style={
              fieldFocused
                ? {
                    shadowColor: "#91B87C",
                    shadowOpacity: 0.18,
                    shadowRadius: 8,
                    elevation: 3,
                  }
                : {}
            }
          />
          <Label>Email</Label>
          <Field
            placeholder="artist@exemplu.ro"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setFieldFocused(true)}
            onBlur={() => setFieldFocused(false)}
            style={
              fieldFocused
                ? {
                    shadowColor: "#91B87C",
                    shadowOpacity: 0.18,
                    shadowRadius: 8,
                    elevation: 3,
                  }
                : {}
            }
          />

          <Label>Telefon</Label>
          <Field
            placeholder="+40 123 456 789"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            onFocus={() => setFieldFocused(true)}
            onBlur={() => setFieldFocused(false)}
            style={
              fieldFocused
                ? {
                    shadowColor: "#91B87C",
                    shadowOpacity: 0.18,
                    shadowRadius: 8,
                    elevation: 3,
                  }
                : {}
            }
          />
          <Label>Site Web</Label>
          <Field
            placeholder="https://…"
            value={website}
            onChangeText={setWebsite}
            keyboardType="url"
            onFocus={() => setFieldFocused(true)}
            onBlur={() => setFieldFocused(false)}
            style={
              fieldFocused
                ? {
                    shadowColor: "#91B87C",
                    shadowOpacity: 0.18,
                    shadowRadius: 8,
                    elevation: 3,
                  }
                : {}
            }
          />
          <Label>Preț</Label>
          <Row>
            <Field
              placeholder="Preț"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={[
                { flex: 1, marginBottom: 0, marginRight: 10 },
                fieldFocused
                  ? {
                      shadowColor: "#91B87C",
                      shadowOpacity: 0.18,
                      shadowRadius: 8,
                      elevation: 3,
                    }
                  : {},
              ]}
            />
            <PickerContainer style={{ flex: 0.9, marginBottom: 0 }}>
              <Picker
                selectedValue={currency}
                onValueChange={setCurrency}
                itemStyle={{ fontSize: 16 }}
              >
                <Picker.Item label="Lei (RON)" value="RON" />
                <Picker.Item label="Euro (EUR)" value="EUR" />
                <Picker.Item label="USD" value="USD" />
              </Picker>
            </PickerContainer>
          </Row>

          <Spacer />
          <Label>URL Poză (opțional)</Label>
          <Field
            placeholder="https://…jpg"
            value={photoUrl}
            onChangeText={setPhotoUrl}
            onFocus={() => setFieldFocused(true)}
            onBlur={() => setFieldFocused(false)}
            style={
              fieldFocused
                ? {
                    shadowColor: "#91B87C",
                    shadowOpacity: 0.18,
                    shadowRadius: 8,
                    elevation: 3,
                  }
                : {}
            }
          />
          <Label>Sau deschide din galeria foto</Label>
          <StyledButton onPress={pickImages}>
            <ButtonText>Alege imaginile</ButtonText>
          </StyledButton>
          {localPhotos.length > 0 && (
            <ScrollView horizontal>
              {localPhotos.map((a, i) => (
                <ImagePreview key={i} source={{ uri: a.uri }} />
              ))}
            </ScrollView>
          )}
          {loading ? (
            <ActivityIndicator style={{ marginTop: 18 }} />
          ) : (
            <StyledButton onPress={handleSubmit}>
              <ButtonText>Adaugă anunț</ButtonText>
            </StyledButton>
          )}
        </Card>
      </ScrollView>
    </SafeArea>
  );
};
