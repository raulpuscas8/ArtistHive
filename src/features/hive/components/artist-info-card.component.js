// src/features/hive/components/artist-info-card.component.js

import React, { useContext, useEffect, useState } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { SvgXml } from "react-native-svg";
import { Spacer } from "../../../components/spacer/spacer.component";
import { Text } from "../../../components/typography/text.component";
import { Favourite } from "../../../components/favourites/favourite.component";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
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
  Icon,
  Address,
} from "./artist-info-card.styles.js";

// map each category string to an Ionicon name
const categoryIcons = {
  Painting: "color-palette-outline",
  Music: "musical-notes-outline",
  Sculpture: "construct-outline",
  Photography: "camera-outline",
  "Digital Art": "desktop-outline",
  PrintMaking: "print-outline",
  Ceramics: "mud-outline",
  "Textile & Fiber": "shirt-outline",
  "Jewelry & Wearables": "diamond-outline",
  "Graphic Design & Illustration": "brush-outline",
  "Performance Art": "walk-outline",
  "Video & Animation": "videocam-outline",
  "Crafts & Handmade": "hand-left-outline",
  Other: "help-circle-outline",
};

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

  // filter out invalid URLs for photos (your code unchanged)
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

  const catIconName = categoryIcons[category] || categoryIcons.Other;

  // --- New for ratings ---
  const [userRating, setUserRating] = useState(null); // user's own rating
  const [loading, setLoading] = useState(true);
  const [average, setAverage] = useState(avgRating || 0);
  const [votes, setVotes] = useState(ratingsCount || 0);
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

  // Renders stars: either user's own, or average
  const renderStars = () => {
    const ratingToShow = userRating || average;
    // Show filled stars, half, and outlines as you like (for now, round to nearest half-star)
    const rounded = Math.round(ratingToShow * 2) / 2;
    return Array.from({ length: 5 }).map((_, i) => {
      const starValue = i + 1;
      // Interactive for logged-in users
      return (
        <TouchableOpacity
          key={i}
          disabled={!user}
          onPress={() => handleRate(starValue)}
        >
          <SvgXml
            xml={star}
            width={20}
            height={20}
            style={{ opacity: starValue <= rounded ? 1 : 0.2 }}
          />
        </TouchableOpacity>
      );
    });
  };

  return (
    <ArtistCard elevation={5}>
      <View>
        <Favourite artist={artist} />
        <ArtistCardCover source={{ uri: displayPhotos[0] }} />
      </View>
      <Info>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text variant="label">{name}</Text>
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
            <Text variant="caption" style={{ marginLeft: 8 }}>
              {average.toFixed(2)} ({votes} {votes === 1 ? "vote" : "votes"})
            </Text>
          </Rating>
          <SectionEnd>
            <Spacer position="left" size="large">
              <Icon source={{ uri: icon }} />
            </Spacer>
          </SectionEnd>
        </Section>

        <Address>{address}</Address>
      </Info>
    </ArtistCard>
  );
};
