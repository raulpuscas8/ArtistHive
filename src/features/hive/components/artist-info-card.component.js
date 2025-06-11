// src/features/hive/components/artist-info-card.component.js

import React, { useContext, useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { Spacer } from "../../../components/spacer/spacer.component";
import { Text } from "../../../components/typography/text.component";
import { FavouritesContext } from "../../../services/favourites/favourites.context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import Carousel from "react-native-reanimated-carousel";
import star from "../../../../assets/star";
import { AuthenticationContext } from "../../../services/authentication/authentication.context";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
  getDoc,
} from "firebase/firestore";

import {
  ArtistCard,
  ArtistCardCover,
  Info,
  Section,
  SectionEnd,
  Rating,
  Address,
} from "./artist-info-card.styles.js";

function getShortAddress(address = "") {
  const parts = address.split(",").map((p) => p.trim());

  if (parts.length === 0) return "";

  const street = parts[0];

  let city = null;
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (
      part &&
      isNaN(part) &&
      part.length > 2 &&
      part.toLowerCase() !== street.toLowerCase() &&
      part.toLowerCase() !== "romania"
    ) {
      city = part;
      break;
    }
  }
  return city ? `${street}, ${city}` : street;
}

const categoryIcons = {
  Pictură: "color-palette-outline",
  Muzică: "musical-notes-outline",
  Sculptură: "construct-outline",
  Fotografie: "camera-outline",
  "Artă digitală": "desktop-outline",
  "Gravură și print": "print-outline",
  Ceramică: "rose-outline",
  "Textile & Fibre": "shirt-outline",
  "Bijuterii & Accesorii": "diamond-outline",
  "Design grafic & Ilustrație": "brush-outline",
  "Artă performativă": "walk-outline",
  "Video & Animație": "videocam-outline",
  "Lucrate manual": "hand-left-outline",
  Altele: "help-circle-outline",
};

const englishToRomanian = {
  Painting: "Pictură",
  Music: "Muzică",
  Sculpture: "Sculptură",
  Photography: "Fotografie",
  "Digital Art": "Artă digitală",
  PrintMaking: "Gravură și print",
  Ceramics: "Ceramică",
  "Textile & Fiber": "Textile & Fibre",
  "Jewelry & Wearables": "Bijuterii & Accesorii",
  "Graphic Design & Illustration": "Design grafic & Ilustrație",
  "Performance Art": "Artă performativă",
  "Video & Animation": "Video & Animație",
  "Crafts & Handmade": "Lucrate manual",
  Other: "Altele",
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_PADDING = 32;
const IMAGE_WIDTH = SCREEN_WIDTH - CARD_PADDING;
const IMAGE_HEIGHT = 220;

export const ArtistInfoCard = ({ artist = {} }) => {
  const theme = useTheme();
  const { user } = useContext(AuthenticationContext);

  const {
    id,
    name = "Some Artist",
    icon = "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/lodging-71.png",
    photos = [],
    address = "100 some random street",
    category = "Other",
    avgRating = 0,
    ratingsCount = 0,
    placeId,
  } = artist;

  const validPhotos = photos.filter((p) => {
    if (typeof p !== "string") return false;
    if (!/^https?:\/\//i.test(p)) return false;
    try {
      const url = new URL(p);
      return url.hostname.includes(".");
    } catch {
      return false;
    }
  });
  const displayPhotos = validPhotos.length
    ? validPhotos
    : ["https://via.placeholder.com/400"];

  const categoryRo = englishToRomanian[category] || category;
  const catIconName = categoryIcons[categoryRo] || categoryIcons.Altele;

  // --- New for ratings ---
  const [userRating, setUserRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [average, setAverage] = useState(avgRating || 0);
  const [votes, setVotes] = useState(ratingsCount || 0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const db = getFirestore();

  // Fetch user's rating and update local state
  useEffect(() => {
    let isMounted = true;
    async function fetchUserRatingAndAverage() {
      setLoading(true);
      // fetch user's rating
      if (user && id) {
        const myRatingRef = doc(db, "artists", id, "ratings", user.uid);
        const myRatingSnap = await getDoc(myRatingRef);
        if (isMounted && myRatingSnap.exists()) {
          setUserRating(myRatingSnap.data().stars);
        } else if (isMounted) {
          setUserRating(null);
        }
      }
      // Always update average in case artist prop isn't fresh
      if (id) {
        const artistDoc = await getDoc(doc(db, "artists", id));
        if (isMounted && artistDoc.exists()) {
          setAverage(artistDoc.data().avgRating || 0);
          setVotes(artistDoc.data().ratingsCount || 0);
        }
      }
      setLoading(false);
    }
    fetchUserRatingAndAverage();
    return () => {
      isMounted = false;
    };
  }, [user, id]);

  // Submit or update user's rating
  const handleRate = async (stars) => {
    if (!user) return;
    setLoading(true);
    // 1. Upsert user rating
    await setDoc(doc(db, "artists", id, "ratings", user.uid), {
      stars,
      userId: user.uid,
    });
    setUserRating(stars);

    // 2. Recalculate average and count
    const ratingsSnap = await getDocs(collection(db, "artists", id, "ratings"));
    let total = 0,
      count = 0;
    ratingsSnap.forEach((doc) => {
      total += doc.data().stars;
      count += 1;
    });
    const newAvg = count > 0 ? total / count : 0;
    setAverage(newAvg);
    setVotes(count);

    // 3. Save new average and count in artist doc
    await updateDoc(doc(db, "artists", id), {
      avgRating: newAvg,
      ratingsCount: count,
    });
    setLoading(false);
  };

  // Renders interactive or static yellow stars, always 5, matching the detail screen style
  const renderStars = () => {
    // Show the average (not your own vote here), always 5 yellow stars
    const rounded = Math.round(average * 2) / 2; // nearest 0.5 if you want half-stars
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons
            key={i}
            name={
              rounded >= i
                ? "star"
                : rounded >= i - 0.5
                ? "star-half-outline"
                : "star-outline"
            }
            size={22}
            color="#FFD700"
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  //Favourite
  const { favourites, addToFavourites, removeFromFavourites } =
    useContext(FavouritesContext);

  const isFavourite = favourites.includes(id);

  return (
    <ArtistCard elevation={5}>
      <View style={{ position: "relative", alignItems: "center" }}>
        <TouchableOpacity
          onPress={() =>
            isFavourite ? removeFromFavourites(id) : addToFavourites(id)
          }
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: 16,
            padding: 4,
          }}
        >
          <Ionicons
            name={isFavourite ? "heart" : "heart-outline"}
            size={28}
            color={isFavourite ? "red" : "grey"}
          />
        </TouchableOpacity>
        {displayPhotos.length > 1 ? (
          <>
            <Carousel
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              data={displayPhotos}
              style={{ borderRadius: 16, overflow: "hidden" }}
              panGestureHandlerProps={{
                activeOffsetX: [-10, 10],
              }}
              renderItem={({ item }) => (
                <ArtistCardCover
                  source={{ uri: item }}
                  style={{
                    width: IMAGE_WIDTH,
                    height: IMAGE_HEIGHT,
                  }}
                  resizeMode="cover"
                />
              )}
              pagingEnabled
              loop={false}
              snapEnabled
              onSnapToItem={setCarouselIndex}
            />
            {/* Pagination Dots */}
            <View
              style={{
                position: "absolute",
                bottom: 14,
                left: 0,
                right: 0,
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              {displayPhotos.map((_, idx) => (
                <View
                  key={idx}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#fff",
                    margin: 3,
                    opacity: idx === carouselIndex ? 0.9 : 0.4,
                  }}
                />
              ))}
            </View>
          </>
        ) : (
          <ArtistCardCover
            source={{ uri: displayPhotos[0] }}
            style={{
              width: IMAGE_WIDTH,
              height: IMAGE_HEIGHT,
              borderRadius: 16,
              marginBottom: 2,
            }}
            resizeMode="cover"
          />
        )}
      </View>

      <Info>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text variant="label" style={{ fontWeight: "bold", fontSize: 17 }}>
            {name}
          </Text>

          <Spacer position="left" size="medium" />
          <Ionicons
            name={catIconName}
            size={20}
            color={theme.colors.ui.primary}
          />
        </View>

        <Section>
          <Rating>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.ui.primary} />
            ) : (
              renderStars()
            )}
            {/* Price badge */}
            {artist.price && artist.currency && (
              <View
                style={{
                  backgroundColor: "#fce7d9",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 2,
                  alignSelf: "wight",
                  marginLeft: 10,
                }}
              >
                <Text
                  variant="caption"
                  style={{
                    color: "#733B73",
                    fontWeight: "bold",
                    fontSize: 15,
                  }}
                >
                  {artist.price} {artist.currency}
                </Text>
              </View>
            )}
          </Rating>
          <SectionEnd />
        </Section>

        <Address style={{ fontSize: 14 }}>{getShortAddress(address)}</Address>
      </Info>
    </ArtistCard>
  );
};
