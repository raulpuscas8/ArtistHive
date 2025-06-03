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
} from "react-native";
import { List, Divider } from "react-native-paper";
import { ArtistInfoCard } from "../components/artist-info-card.component";
import { SafeArea } from "../../../components/utility/safe-area.component";
import { Button } from "react-native";
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

  // Optional: fallback for missing artist
  if (!artist) {
    return (
      <SafeArea>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text variant="error">Artist details not available.</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
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
      Alert.alert("Thank you for voting!");
    } catch (err) {
      setIsSubmitting(false);
      Alert.alert("Error submitting vote", err.message);
    }
  };

  // ---- Delete logic (admin only) ----
  const handleDelete = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this announcement?",
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
          marginTop: 12,
          marginBottom: 8,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons
            key={i}
            name={displayRating >= i ? "star" : "star-outline"}
            size={32}
            color="#FFD700"
            style={{ marginHorizontal: 3 }}
            onPress={() => !isSubmitting && handleVote(i)}
            disabled={isSubmitting}
          />
        ))}
        <Text variant="body" style={{ marginLeft: 10, fontWeight: "bold" }}>
          {isLoadingRating ? "..." : avgRating ? avgRating.toFixed(2) : "0.00"}
          <Text variant="caption" style={{ fontWeight: "normal" }}>
            {" "}
            ({ratingsCount || 0} votes)
          </Text>
        </Text>
        {myRating ? (
          <Text variant="caption" style={{ marginLeft: 8, color: "green" }}>
            You voted {myRating}★
          </Text>
        ) : null}
      </View>
    );
  };

  // --- Show banner to extend expiry if owner and near expiry ---
  useEffect(() => {
    // Only show if user is owner, daysLeft <= 1, and not already expired
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
      "Delete comment?",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
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

  // --- Format date/time for comments ---
  const formatTime = (firestoreDate) => {
    if (!firestoreDate?.toDate) return "";
    const date = firestoreDate.toDate();
    return `${date.toLocaleDateString()} ${date
      .toLocaleTimeString()
      .slice(0, 5)}`;
  };

  // --- Helper to render avatar (photoURL or initial in circle) ---
  const renderAvatar = (userAvatar, userName) => {
    if (userAvatar) {
      return (
        <Image
          source={{ uri: userAvatar }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#eee",
            marginRight: 8,
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
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: bgColor,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 8,
        }}
      >
        <Text
          variant="label"
          style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}
        >
          {initial}
        </Text>
      </View>
    );
  };

  // --- UI for comments section ---
  const renderComment = ({ item }) => {
    const isMyComment = user?.uid === item.userId;

    return (
      <View
        key={item.id}
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          paddingVertical: 6,
          borderBottomWidth: 0.5,
          borderColor: "#e0e0e0",
          marginBottom: 2,
        }}
      >
        {renderAvatar(item.userAvatar, item.userName)}
        <View style={{ flex: 1 }}>
          <Text variant="caption" style={{ fontWeight: "bold" }}>
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
            <>
              <Text variant="body">{item.text}</Text>
              <Text
                variant="caption"
                style={{ color: "#757575", fontSize: 10 }}
              >
                {formatTime(item.timestamp)}
              </Text>
            </>
          )}
        </View>
        {isMyComment && editingCommentId !== item.id && (
          <View style={{ flexDirection: "row", marginLeft: 4 }}>
            <TouchableOpacity
              onPress={() => handleEditComment(item)}
              style={{ marginRight: 4 }}
            >
              <MaterialIcons name="edit" size={20} color="#1565C0" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
              <MaterialIcons name="delete" size={20} color="#B71C1C" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // --- In-app banner for extending expiry (if owner, about to expire) ---
  const ExtendBanner = () =>
    showExtendBanner ? (
      <View
        style={{
          backgroundColor: "#FFF8E1",
          borderColor: "#FFD54F",
          borderWidth: 1,
          borderRadius: 10,
          marginHorizontal: 20,
          marginVertical: 6,
          padding: 16,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
        }}
      >
        <Ionicons name="alert-circle" size={28} color="#FFA000" />
        <View style={{ flex: 1 }}>
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
        <Button title="Extend" color="#FFA000" onPress={handleExtendExpiry} />
      </View>
    ) : null;

  // --- All header content (everything above comments) ---
  const ListHeaderComponent = (
    <>
      <View style={{ position: "relative" }}>
        <ArtistInfoCard artist={artist} />
        <TouchableOpacity
          onPress={() =>
            favourites.includes(artist.id)
              ? removeFromFavourites(artist.id)
              : addToFavourites(artist.id)
          }
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: 20,
            padding: 6,
            zIndex: 10,
          }}
        >
          <Ionicons
            name={favourites.includes(artist.id) ? "heart" : "heart-outline"}
            size={28}
            color={favourites.includes(artist.id) ? "red" : "grey"}
          />
        </TouchableOpacity>
      </View>

      <ExtendBanner />
      {/* Expiry status */}
      <View style={{ paddingHorizontal: 20, marginTop: 10, marginBottom: 2 }}>
        {daysLeft === 0 ? (
          <Text
            variant="label"
            style={{
              color: "red",
              fontWeight: "bold",
              backgroundColor: "#ffd6d6",
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 2,
              alignSelf: "flex-start",
            }}
          >
            Expirat
          </Text>
        ) : daysLeft ? (
          <Text
            variant="label"
            style={{
              color: "#B97309",
              backgroundColor: "#fff3cd",
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 2,
              alignSelf: "flex-start",
              fontWeight: "bold",
            }}
          >
            Expiră în {daysLeft} {daysLeft === 1 ? "zi" : "zile"}
          </Text>
        ) : null}
      </View>
      {/* STAR VOTING */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 10,
          alignItems: "flex-start",
        }}
      >
        <Text
          variant="label"
          style={{ fontWeight: "bold", fontSize: 16, marginBottom: 4 }}
        >
          Rate this artist:
        </Text>
        {renderStars()}
        {isSubmitting && <ActivityIndicator size="small" color="#FFD700" />}
      </View>
      {/* COMMENTS TITLE & INPUT */}
      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <Text
          variant="label"
          style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}
        >
          Comments
        </Text>
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
              borderColor: "#d0d0d0",
              borderRadius: 8,
              flex: 1,
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginRight: 8,
              backgroundColor: "#fafafa",
            }}
            placeholder="Add a comment…"
            value={commentInput}
            onChangeText={setCommentInput}
            editable={!isPostingComment}
            returnKeyType="send"
            onSubmitEditing={handleAddComment}
          />
          <Button
            title={isPostingComment ? "Posting..." : "Send"}
            onPress={handleAddComment}
            disabled={isPostingComment}
            color="#007AFF"
          />
        </View>
      </View>
    </>
  );
  // --- All footer content (accordions, admin button) ---
  const ListFooterComponent = (
    <View style={{ paddingBottom: 24 }}>
      <List.Section>
        {/* Description */}
        <List.Accordion
          title="Description"
          left={(props) => <List.Icon {...props} icon="information-outline" />}
          expanded={descExpanded}
          onPress={() => setDescExpanded(!descExpanded)}
        >
          <List.Item title={artist.description || "No description provided."} />
        </List.Accordion>
        <Divider />

        {/* Contact */}
        <List.Accordion
          title="Contact"
          left={(props) => <List.Icon {...props} icon="phone-outline" />}
          expanded={contactExpanded}
          onPress={() => setContactExpanded(!contactExpanded)}
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
              description="Phone"
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
        <Divider />

        {/* Pricing */}
        <List.Accordion
          title="Pricing"
          left={(props) => <List.Icon {...props} icon="cash" />}
          expanded={pricingExpanded}
          onPress={() => setPricingExpanded(!pricingExpanded)}
        >
          <List.Item title={getPriceLabel()} />
          {artist.price && artist.currency && (
            <Button title="Cumpără" onPress={handleBuy} color="#8BC34A" />
          )}
        </List.Accordion>
      </List.Section>
      {/* Delete button for admin */}
      {userRole === "admin" && (
        <Button
          title="Delete Announcement"
          onPress={handleDelete}
          color="#f44336"
        />
      )}
    </View>
  );

  // --- Actually render FlatList as root, not ScrollView!
  return (
    <SafeArea>
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
          contentContainerStyle={{ paddingBottom: 40, backgroundColor: "#fff" }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text
              variant="caption"
              style={{
                color: "#888",
                paddingLeft: 24,
                marginBottom: 12,
                marginTop: 4,
              }}
            >
              No comments yet.
            </Text>
          }
        />
      </KeyboardAvoidingView>
    </SafeArea>
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
