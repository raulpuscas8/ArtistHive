import React, { useState, useContext, useEffect, useRef } from "react";
import {
  View,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  StyleSheet,
} from "react-native";
import { List, Divider } from "react-native-paper";
import { ArtistInfoCard } from "../components/artist-info-card.component";
import { SafeArea } from "../../../components/utility/safe-area.component";
import { Text } from "../../../components/typography/text.component";
import { FavouritesContext } from "../../../services/favourites/favourites.context";
import { AuthenticationContext } from "../../../services/authentication/authentication.context";
import {
  getFirestore,
  doc,
  deleteDoc,
  collection,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { getStorage, ref as storageRef, deleteObject } from "firebase/storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native";

const BRAND_COLOR = "#000000";
const LIGHT_CARD = "#faf9fe";
const CARD_RADIUS = 20;
const SHADOW = {
  shadowColor: "#91B87C",
  shadowOffset: { width: 0, height: 7 },
  shadowOpacity: 0.4,
  shadowRadius: 15,
  elevation: 10,
};
const SECTION_TITLE = {
  color: BRAND_COLOR,
  fontWeight: "bold",
  fontSize: 18,
  marginBottom: 8,
};

// Helper: returns how many days left until expiresAt, or 0 if expired
const getDaysLeft = (expiresAt) => {
  if (!expiresAt?.toDate) return null;
  const now = new Date();
  const exp = expiresAt.toDate();
  const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 0;
  return diff;
};

// Helper: add N days to a JS Date object
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const ArtistDetailScreen = ({ route, navigation }) => {
  const { artist } = route.params || {};

  if (!artist) {
    return (
      <SafeArea>
        <View style={styles.centered}>
          <Text variant="error">Artist details not available.</Text>
          <TouchableOpacity
            style={styles.roundedBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeArea>
    );
  }

  const daysLeft = getDaysLeft(artist.expiresAt);
  const [descExpanded, setDescExpanded] = useState(true);
  const [contactExpanded, setContactExpanded] = useState(false);
  const [pricingExpanded, setPricingExpanded] = useState(false);

  // Rating
  const [avgRating, setAvgRating] = useState(null);
  const [ratingsCount, setRatingsCount] = useState(null);
  const [myRating, setMyRating] = useState(null);
  const [isLoadingRating, setIsLoadingRating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comments
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Edit comments
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [isEditingComment, setIsEditingComment] = useState(false);

  const { user, userRole } = useContext(AuthenticationContext);
  const commentInputRef = useRef(null);

  // Banner for expiry extension
  const [showExtendBanner, setShowExtendBanner] = useState(false);

  // Handle price label
  const getPriceLabel = () => {
    if (!artist.price || !artist.currency) return "Not specified.";
    let label = "";
    if (artist.currency === "RON") label = "lei";
    if (artist.currency === "EUR") label = "euro";
    if (artist.currency === "USD") label = "USD";
    return `${artist.price} ${label}`;
  };
  const handleBuy = () => {
    navigation.navigate("Stripe Web Payment", {
      amount: artist.price,
      currency: artist.currency,
      name: artist.name,
    });
  };

  // Favourite
  const { favourites, addToFavourites, removeFromFavourites } =
    useContext(FavouritesContext);

  // --- Load rating info (live) ---
  useEffect(() => {
    if (!artist?.id) return;

    const db = getFirestore();
    const artistRef = doc(db, "artists", artist.id);

    const unsub = onSnapshot(artistRef, (snap) => {
      const d = snap.data();
      setAvgRating(d?.avgRating ?? 0);
      setRatingsCount(d?.ratingsCount ?? 0);
    });

    // Also check if user already voted
    let unsubMy = null;
    if (user?.uid) {
      const myVoteRef = doc(db, "artists", artist.id, "ratings", user.uid);
      unsubMy = onSnapshot(myVoteRef, (snap) => {
        if (snap.exists()) {
          setMyRating(snap.data().rating);
        } else {
          setMyRating(null);
        }
        setIsLoadingRating(false);
      });
    } else {
      setIsLoadingRating(false);
    }

    return () => {
      unsub();
      if (unsubMy) unsubMy();
    };
  }, [artist.id, user?.uid]);

  // --- Handle voting ---
  const handleVote = async (value) => {
    if (!user?.uid) {
      Alert.alert("You must be logged in to rate.");
      return;
    }
    setIsSubmitting(true);

    try {
      const db = getFirestore();
      const voteRef = doc(db, "artists", artist.id, "ratings", user.uid);
      const artistRef = doc(db, "artists", artist.id);

      await setDoc(voteRef, { rating: value }, { merge: true });

      const ratingsSnap = await getDocs(
        collection(db, "artists", artist.id, "ratings")
      );
      let sum = 0;
      let count = 0;
      ratingsSnap.forEach((doc) => {
        sum += doc.data().rating;
        count++;
      });
      const avg = count ? sum / count : 0;

      await updateDoc(artistRef, {
        avgRating: avg,
        ratingsCount: count,
      });

      setIsSubmitting(false);
      Alert.alert("Mulțumim că ai votat!");
    } catch (err) {
      setIsSubmitting(false);
      Alert.alert("Error submitting vote", err.message);
    }
  };

  // ---- Delete logic (admin only) ----
  const handleDelete = async () => {
    Alert.alert(
      "Confirmă ștergerea",
      "Ești sigur că dorești să ștergi acest anunț?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const db = getFirestore();
              const storage = getStorage();

              if (artist.photos && Array.isArray(artist.photos)) {
                await Promise.all(
                  artist.photos.map(async (url) => {
                    try {
                      const base =
                        "https://firebasestorage.googleapis.com/v0/b/";
                      if (url.startsWith(base)) {
                        const pathMatch =
                          decodeURIComponent(url).match(/\/o\/(.+)\?alt/);
                        if (pathMatch && pathMatch[1]) {
                          const filePath = pathMatch[1];
                          const imgRef = storageRef(storage, filePath);
                          await deleteObject(imgRef);
                        }
                      }
                    } catch (imgErr) {
                      console.log("Failed to delete image:", imgErr);
                    }
                  })
                );
              }
              await deleteDoc(doc(db, "artists", artist.id));
              Alert.alert("Announcement and images deleted.");
              navigation.goBack();
            } catch (error) {
              Alert.alert("Failed to delete", error.message);
            }
          },
        },
      ]
    );
  };

  // --- UI for star voting ---
  const renderStars = () => {
    const displayRating = myRating ?? avgRating ?? 0;
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 8,
          marginBottom: 8,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity
            key={i}
            onPress={() => !isSubmitting && handleVote(i)}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Ionicons
              name={displayRating >= i ? "star" : "star-outline"}
              size={34}
              color="#FFD700"
              style={{ marginHorizontal: 3 }}
            />
          </TouchableOpacity>
        ))}
        <Text
          style={{
            marginLeft: 14,
            fontWeight: "bold",
            fontSize: 18,
            color: BRAND_COLOR,
          }}
        >
          {isLoadingRating ? "..." : avgRating ? avgRating.toFixed(2) : "0.00"}
          <Text style={{ fontWeight: "normal", fontSize: 15 }}>
            {" "}
            ({ratingsCount || 0} votes)
          </Text>
        </Text>
      </View>
    );
  };

  // --- Show banner to extend expiry if owner and near expiry ---
  useEffect(() => {
    if (
      user?.uid &&
      artist.userId === user.uid &&
      daysLeft !== null &&
      daysLeft <= 1 &&
      daysLeft > 0
    ) {
      setShowExtendBanner(true);
    } else {
      setShowExtendBanner(false);
    }
  }, [user?.uid, artist.userId, daysLeft]);

  // --- Handler for extending expiry ---
  const handleExtendExpiry = async () => {
    try {
      const db = getFirestore();
      const artistRef = doc(db, "artists", artist.id);

      // Get the latest expiresAt (refresh)
      const artistSnap = await getDoc(artistRef);
      const currentExpiresAt =
        artistSnap.data()?.expiresAt?.toDate?.() || new Date();

      const newExpiry = addDays(currentExpiresAt, 29);

      await updateDoc(artistRef, {
        expiresAt: newExpiry,
      });
      Alert.alert(
        "Extended!",
        "The announcement expiry date was extended by 30 days."
      );
      setShowExtendBanner(false);
    } catch (err) {
      Alert.alert("Could not extend expiry", err.message);
    }
  };

  // ----- COMMENTS: Read -----
  useEffect(() => {
    if (!artist?.id) return;

    const db = getFirestore();
    const commentsRef = collection(db, "artists", artist.id, "comments");
    const q = query(commentsRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setComments(list);
    });

    return () => unsubscribe();
  }, [artist.id]);

  // ----- COMMENTS: Add -----
  const handleAddComment = async () => {
    if (!user?.uid) {
      Alert.alert("You must be logged in to comment.");
      return;
    }
    if (!commentInput.trim()) {
      Alert.alert("Please enter a comment.");
      return;
    }
    setIsPostingComment(true);
    try {
      const db = getFirestore();
      await addDoc(collection(db, "artists", artist.id, "comments"), {
        text: commentInput.trim(),
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "Anon",
        userAvatar: user.photoURL || null,
        timestamp: serverTimestamp(),
      });
      setCommentInput("");
      commentInputRef.current?.clear();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
    setIsPostingComment(false);
  };

  // --- Edit and Delete (only for your own comments) ---
  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
    setIsEditingComment(false);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingCommentText.trim()) {
      Alert.alert("Comment can't be empty.");
      return;
    }
    setIsEditingComment(true);
    try {
      const db = getFirestore();
      const commentRef = doc(db, "artists", artist.id, "comments", commentId);
      await updateDoc(commentRef, {
        text: editingCommentText.trim(),
      });
      setEditingCommentId(null);
      setEditingCommentText("");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
    setIsEditingComment(false);
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert(
      "Stergi comentariul?",
      "Sunteți sigur că doriți să ștergeți acest comentariu?",
      [
        { text: "Anulează", style: "cancel" },
        {
          text: "Șterge",
          style: "destructive",
          onPress: async () => {
            try {
              const db = getFirestore();
              await deleteDoc(
                doc(db, "artists", artist.id, "comments", commentId)
              );
            } catch (err) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ]
    );
  };

  // --- Helper to render avatar (photoURL or initial in circle) ---
  const renderAvatar = (userAvatar, userName) => {
    if (userAvatar) {
      return (
        <Image
          source={{ uri: userAvatar }}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            borderWidth: 2,
            borderColor: "#fff",
            backgroundColor: "#eee",
            marginRight: 10,
          }}
        />
      );
    }
    // Fallback: colored circle with initial
    const initial = userName ? userName.charAt(0).toUpperCase() : "?";
    const bgColors = ["#F5B041", "#85C1E9", "#52BE80", "#BB8FCE", "#F4D03F"];
    const bgColor =
      bgColors[(initial.charCodeAt(0) + userName.length) % bgColors.length] ||
      "#bbb";
    return (
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          borderWidth: 2,
          borderColor: "#fff",
          backgroundColor: bgColor,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 10,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 22 }}>
          {initial}
        </Text>
      </View>
    );
  };

  // --- UI for comments section (card) ---
  const renderComment = ({ item }) => {
    const isMyComment = user?.uid === item.userId;

    return (
      <View
        key={item.id}
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          backgroundColor: LIGHT_CARD,
          borderRadius: 14,
          marginHorizontal: 16,
          marginBottom: 8,
          padding: 12,
          ...SHADOW,
        }}
      >
        {renderAvatar(item.userAvatar, item.userName)}
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "bold", color: BRAND_COLOR }}>
            {item.userName}
          </Text>
          {editingCommentId === item.id ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                value={editingCommentText}
                onChangeText={setEditingCommentText}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#d0d0d0",
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  marginRight: 4,
                  backgroundColor: "#fff",
                }}
                editable={!isEditingComment}
              />
              <TouchableOpacity onPress={() => handleSaveEdit(item.id)}>
                <Ionicons name="checkmark" size={24} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Ionicons name="close" size={24} color="#E53935" />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={{ fontSize: 15, marginTop: 2 }}>{item.text}</Text>
          )}
        </View>
        {isMyComment && editingCommentId !== item.id && (
          <View style={{ flexDirection: "row", marginLeft: 8 }}>
            <TouchableOpacity
              onPress={() => handleEditComment(item)}
              style={{ marginRight: 4, padding: 2 }}
            >
              <MaterialIcons name="edit" size={22} color="#1565C0" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteComment(item.id)}
              style={{ padding: 2 }}
            >
              <MaterialIcons name="delete" size={22} color="#B71C1C" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // --- Expiry
  // --- In-app banner for extending expiry (if owner, about to expire) ---
  const ExtendBanner = () =>
    showExtendBanner ? (
      <View
        style={{
          backgroundColor: "#FFF8E1",
          borderColor: "#FFD54F",
          borderWidth: 1,
          borderRadius: 14,
          marginHorizontal: 24,
          marginVertical: 12,
          padding: 18,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          ...SHADOW,
        }}
      >
        <Ionicons name="alert-circle" size={28} color="#FFA000" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text
            style={{
              color: "#FFA000",
              fontWeight: "bold",
              fontSize: 15,
              marginBottom: 4,
            }}
          >
            Announcement about to expire!
          </Text>
          <Text style={{ color: "#B97309" }}>
            Do you want to extend by 30 days?
          </Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: "#FFA000",
            borderRadius: 20,
            paddingHorizontal: 18,
            paddingVertical: 7,
            marginLeft: 10,
          }}
          onPress={handleExtendExpiry}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Extend</Text>
        </TouchableOpacity>
      </View>
    ) : null;

  // --- All header content (everything above comments) ---
  const ListHeaderComponent = (
    <>
      {/* 1. ARTIST CARD */}
      <View
        style={{
          marginTop: 16,
          marginHorizontal: 12,
          backgroundColor: "#fff",
          borderRadius: CARD_RADIUS,
          ...SHADOW,
          paddingBottom: 8,
        }}
      >
        <ArtistInfoCard artist={artist} />
        <TouchableOpacity
          onPress={() =>
            favourites.includes(artist.id)
              ? removeFromFavourites(artist.id)
              : addToFavourites(artist.id)
          }
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            backgroundColor: "#fff",
            borderRadius: 50,
            padding: 8,
            ...SHADOW,
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={favourites.includes(artist.id) ? "heart" : "heart-outline"}
            size={30}
            color={favourites.includes(artist.id) ? "#FF2667" : "#c2c2c2"}
          />
        </TouchableOpacity>
      </View>

      {/* 2. DESCRIPTION - always visible */}
      <View
        style={{
          marginTop: 18,
          marginHorizontal: 16,
          backgroundColor: LIGHT_CARD,
          borderRadius: 16,
          ...SHADOW,
          padding: 14,
          marginBottom: 2,
        }}
      >
        <Text style={SECTION_TITLE}>Descriere:</Text>
        <Text style={{ fontSize: 15, color: "#222", lineHeight: 20 }}>
          {artist.description || "No description provided."}
        </Text>
      </View>

      {/* 3. CONTACT (accordion) */}
      <View
        style={{
          marginTop: 10,
          marginHorizontal: 16,
          marginBottom: 2,
          borderRadius: 16,
          overflow: "hidden",
          ...SHADOW,
          backgroundColor: "#fff",
        }}
      >
        <List.Accordion
          title="Contact"
          left={(props) => (
            <List.Icon {...props} icon="phone-outline" color={BRAND_COLOR} />
          )}
          expanded={contactExpanded}
          onPress={() => setContactExpanded(!contactExpanded)}
          style={{
            backgroundColor: "#a3bf93",
            borderRadius: 16,
          }}
          titleStyle={{ color: BRAND_COLOR, fontWeight: "bold", fontSize: 16 }}
        >
          {artist.email ? (
            <List.Item
              title={artist.email}
              description="Email"
              left={(props) => <List.Icon {...props} icon="email-outline" />}
              onPress={() => handlePress("email", artist.email)}
            />
          ) : null}
          {artist.phone ? (
            <List.Item
              title={artist.phone}
              description="Telefon"
              left={(props) => <List.Icon {...props} icon="phone-outline" />}
              onPress={() => handlePress("phone", artist.phone)}
            />
          ) : null}
          {artist.website ? (
            <List.Item
              title={artist.website}
              description="Website"
              left={(props) => <List.Icon {...props} icon="web" />}
              onPress={() => handlePress("website", artist.website)}
            />
          ) : null}
          {!artist.email && !artist.phone && !artist.website && (
            <List.Item title="No contact info provided." />
          )}
        </List.Accordion>
      </View>

      {/* 4. EXPIRY */}
      <View style={{ paddingHorizontal: 26, marginTop: 18, marginBottom: 2 }}>
        {daysLeft === 0 ? (
          <Text
            style={{
              color: "#e03c3c",
              fontWeight: "bold",
              backgroundColor: "#ffd6d6",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 3,
              alignSelf: "flex-start",
              ...SHADOW,
            }}
          >
            Expirat
          </Text>
        ) : daysLeft ? (
          <Text
            style={{
              color: "#B97309",
              backgroundColor: "#fff3cd",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 3,
              alignSelf: "flex-start",
              fontWeight: "bold",
              ...SHADOW,
            }}
          >
            Anunțul expiră în {daysLeft} {daysLeft === 1 ? "zi" : "zile"}
          </Text>
        ) : null}
      </View>

      {/* 5. RATING */}
      <View
        style={{
          paddingHorizontal: 26,
          paddingTop: 18,
          alignItems: "flex-start",
        }}
      >
        {/* Cumpără Button */}
        {artist.price && artist.currency && (
          <TouchableOpacity
            style={{
              backgroundColor: "#b2cba2",
              borderRadius: 9,
              paddingVertical: 10,
              paddingHorizontal: 28,
              marginBottom: 18,
              alignSelf: "flex-start",
              shadowColor: "#b2cba2",
              shadowOpacity: 0.15,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 3,
            }}
            onPress={() =>
              navigation.navigate("Stripe Web Payment", {
                amount: artist.price,
                currency: artist.currency,
                name: artist.name,
              })
            }
            activeOpacity={0.85}
          >
            <Text
              style={{
                color: "#000000",
                fontWeight: "bold",
                fontSize: 17,
                letterSpacing: 1,
              }}
            >
              Cumpără
            </Text>
          </TouchableOpacity>
        )}
        <Text style={SECTION_TITLE}>Evaluează acest artist:</Text>
        {renderStars()}
        {isSubmitting && <ActivityIndicator size="small" color="#FFD700" />}
      </View>

      {/* 6. COMMENTS TITLE & INPUT */}
      <View style={{ paddingHorizontal: 26, marginTop: 18, marginBottom: 4 }}>
        <Text style={SECTION_TITLE}>Comentarii:</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
            marginBottom: 12,
          }}
        >
          <TextInput
            ref={commentInputRef}
            style={{
              borderWidth: 1,
              borderColor: "#e0d6ee",
              borderRadius: 12,
              flex: 1,
              paddingHorizontal: 14,
              paddingVertical: 8,
              marginRight: 8,
              backgroundColor: "#f9f8fd",
            }}
            placeholder="Scrie un comentariu..."
            value={commentInput}
            onChangeText={setCommentInput}
            editable={!isPostingComment}
            returnKeyType="send"
            onSubmitEditing={handleAddComment}
          />
          <TouchableOpacity
            style={{
              backgroundColor: "#a3bf93",
              borderRadius: 12,
              paddingHorizontal: 22,
              paddingVertical: 8,
              opacity: isPostingComment ? 0.7 : 1,
            }}
            onPress={handleAddComment}
            disabled={isPostingComment}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
              {isPostingComment ? "..." : "Trimite"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 7. EXTEND BANNER */}
      <ExtendBanner />
    </>
  );

  // --- All footer content (only admin delete button now) ---
  const ListFooterComponent = (
    <>
      {userRole === "admin" && (
        <TouchableOpacity
          onPress={handleDelete}
          style={{
            marginHorizontal: 16,
            marginBottom: 24,
            marginTop: 8,
            backgroundColor: "#f44336",
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: "center",
            ...SHADOW,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 17 }}>
            Delete Announcement
          </Text>
        </TouchableOpacity>
      )}
    </>
  );

  // --- Actually render FlatList as root, not ScrollView!
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f5ed" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          contentContainerStyle={{
            paddingBottom: 44,
            backgroundColor: "#fcfcfa",
          }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text
              style={{
                color: "#888",
                paddingLeft: 32,
                marginBottom: 12,
                marginTop: 4,
                fontStyle: "italic",
                fontSize: 15,
              }}
            >
              No comments yet.
            </Text>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Helper for contacts ---
function handlePress(type, value) {
  let url = value;
  if (type === "email") {
    url = `mailto:${value}`;
  } else if (type === "phone") {
    url = `tel:${value}`;
  } else {
    url = value.startsWith("http") ? value : `https://${value}`;
  }
  Linking.openURL(url).catch((err) =>
    Alert.alert("Can't handle this URL:", err?.message || url)
  );
}

// --- Extra styling for fallback screen ---
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#91B87C",
  },
  roundedBtn: {
    marginTop: 18,
    backgroundColor: BRAND_COLOR,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 22,
    ...SHADOW,
  },
});
