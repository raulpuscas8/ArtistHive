import React, { useState, useEffect, useContext } from "react";
import {
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import styled from "styled-components/native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { GeoPoint, doc, updateDoc, serverTimestamp } from "firebase/firestore";
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
  background-color: rgba(255, 255, 255, 0.93);
  border-radius: 28px;
  padding: 24px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 18px;
  elevation: 8;
  margin-bottom: 24px;
  margin-top: 6px;
  backdrop-filter: blur(12px);
`;

const StyledButton = styled.TouchableOpacity`
  background-color: #91b87c;
  border-radius: 14px;
  padding: 15px;
  align-items: center;
  margin-bottom: 1px;
`;

const DangerButton = styled.TouchableOpacity`
  background-color: #e53935;
  border-radius: 14px;
  padding: 13px;
  align-items: center;
  margin-top: 14px;
  margin-bottom: 2px;
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

const styles = StyleSheet.create({
  menuButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 52 : 26,
    left: 28,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 8,
    zIndex: 10,
    shadowColor: "#ffffff",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});

export const EditArtistScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { artist } = route.params;
  const { user } = useContext(AuthenticationContext);

  // Pre-fill state from artist prop
  const [name, setName] = useState(artist.name || "");
  const [address, setAddress] = useState(artist.address || "");
  const [isOpenNow, setIsOpenNow] = useState(artist.isOpenNow || false);
  const [category, setCategory] = useState(artist.category || "Pictură");
  const [description, setDescription] = useState(artist.description || "");
  const [email, setEmail] = useState(artist.email || "");
  const [phone, setPhone] = useState(artist.phone || "");
  const [website, setWebsite] = useState(artist.website || "");
  const [fieldFocused, setFieldFocused] = useState(false);
  const [price, setPrice] = useState(
    artist.price ? artist.price.toString() : ""
  );
  const [currency, setCurrency] = useState(artist.currency || "RON");
  const [coords, setCoords] = useState(
    artist.location
      ? {
          lat: artist.location[0] || artist.location.latitude,
          lng: artist.location[1] || artist.location.longitude,
        }
      : null
  );
  const [remotePhotos, setRemotePhotos] = useState(artist.photos || []);
  const [localPhotos, setLocalPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleRemoveRemotePhoto = (i) => {
    setRemotePhotos((prev) => prev.filter((_, idx) => idx !== i));
  };
  const handleRemoveLocalPhoto = (i) => {
    setLocalPhotos((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (
      !name.trim() ||
      !address.trim() ||
      !description.trim() ||
      !email.trim() ||
      !price.trim() ||
      !currency.trim()
    ) {
      return Alert.alert("Toate câmpurile obligatorii trebuie completate.");
    }
    if (isNaN(price) || Number(price) <= 0) {
      return Alert.alert("Prețul trebuie să fie un număr pozitiv");
    }
    setLoading(true);
    try {
      // Upload new local photos, keep existing remote
      const uploads = await Promise.all(localPhotos.map(uploadPhoto));
      const photos = [...remotePhotos, ...uploads];

      // Build payload
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
        updatedAt: serverTimestamp(),
      };
      if (coords) {
        data.location = new GeoPoint(coords.lat, coords.lng);
      }

      // Update Firestore doc
      await updateDoc(doc(db, "artists", artist.id), data);

      Alert.alert("Succes", "Anunțul a fost actualizat!");
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Eroare", e.message);
    }
    setLoading(false);
  };

  return (
    <SafeArea style={{ flex: 1, backgroundColor: "#91B87C" }}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.menuButton}
        activeOpacity={0.72}
      >
        <Ionicons name="arrow-back" size={32} color="#808080" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{
          padding: 18,
          backgroundColor: "#91B87C",
          minHeight: "100%",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={["#91B87C", "#fff"]}
          style={{
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 38,
            borderBottomRightRadius: 38,
            height: 95,
            width: "110%",
            marginLeft: "0%",
            marginTop: -22,
            alignSelf: "center",
            justifyContent: "flex-end",
            paddingBottom: 12,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 18,
            elevation: 3,
          }}
        >
          <Text
            style={{
              color: "#321b47",
              fontSize: 29,
              fontWeight: "bold",
              alignSelf: "center",
              marginBottom: 2,
              letterSpacing: 1,
            }}
          >
            🖌️ Editează anunțul
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
          />
          <Label>Adresă</Label>
          <Row>
            <Field
              placeholder="Adresă"
              value={address}
              onChangeText={setAddress}
              style={[{ flex: 1, marginBottom: 0, marginRight: 10 }]}
            />
            <StyledButton
              onPress={() =>
                navigation.navigate("MapPicker", { returnTo: "EditArtist" })
              }
            >
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
          />
          <Label>Email</Label>
          <Field
            placeholder="artist@exemplu.ro"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Label>Telefon</Label>
          <Field
            placeholder="+40 123 456 789"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Label>Site Web</Label>
          <Field
            placeholder="https://…"
            value={website}
            onChangeText={setWebsite}
            keyboardType="url"
          />
          <Label>Preț</Label>
          <Row>
            <Field
              placeholder="Preț"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={[{ flex: 1, marginBottom: 0, marginRight: 10 }]}
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
          <Label>Imagini actuale</Label>
          <ScrollView horizontal style={{ marginBottom: 6 }}>
            {remotePhotos.map((uri, i) => (
              <View key={i} style={{ position: "relative" }}>
                <ImagePreview source={{ uri }} />
                <TouchableOpacity
                  onPress={() => handleRemoveRemotePhoto(i)}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: -1,
                    backgroundColor: "#e53935",
                    borderRadius: 10,
                    padding: 3,
                  }}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <Label>Adaugă imagini noi</Label>
          <StyledButton onPress={pickImages}>
            <ButtonText>Alege imaginile</ButtonText>
          </StyledButton>
          {localPhotos.length > 0 && (
            <ScrollView horizontal>
              {localPhotos.map((a, i) => (
                <View key={i} style={{ position: "relative" }}>
                  <ImagePreview source={{ uri: a.uri }} />
                  <TouchableOpacity
                    onPress={() => handleRemoveLocalPhoto(i)}
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      backgroundColor: "#e53935",
                      borderRadius: 10,
                      padding: 2,
                    }}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          {loading ? (
            <ActivityIndicator style={{ marginTop: 18 }} />
          ) : (
            <StyledButton onPress={handleSubmit}>
              <ButtonText>Salvează modificările</ButtonText>
            </StyledButton>
          )}
        </Card>
      </ScrollView>
    </SafeArea>
  );
};
