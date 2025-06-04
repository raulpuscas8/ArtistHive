import React, { useContext } from "react";
import { SafeArea } from "../../../components/utility/safe-area.component";
import { FavouritesContext } from "../../../services/favourites/favourites.context";
import { ArtistsContext } from "../../../services/hive/artists.context";
import { ArtistInfoCard } from "../../hive/components/artist-info-card.component";
import {
  FlatList,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import { Text } from "../../../components/typography/text.component";
import { Spacer } from "../../../components/spacer/spacer.component";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export const FavouritesScreen = ({ navigation }) => {
  const { favourites } = useContext(FavouritesContext);
  const { artists } = useContext(ArtistsContext);

  // Only show favourited artists
  const favouriteArtists = artists.filter((artist) =>
    favourites.includes(artist.id)
  );

  return (
    <LinearGradient
      colors={["#f99551", "#ffd58c"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeArea style={{ flex: 1, backgroundColor: "transparent" }}>
        {/* ONE Menu Button (top left, above header) */}
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={32} color="#f55654" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Ionicons
            name="heart"
            size={30}
            color="#f55654"
            style={{ marginLeft: 8, marginRight: 8 }}
          />
          <Text style={styles.headerText}>Arta ta preferată!</Text>
        </View>

        {favouriteArtists.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 40,
            }}
          >
            <Text
              variant="caption"
              style={{
                margin: 28,
                textAlign: "center",
                fontSize: 20,
                color: "#733B73",
                textShadowColor: "#ffd58c",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 6,
              }}
            >
              <Ionicons name="sad-outline" size={48} color="#f99551" /> {"\n"}
              Nu ai artă favorită! Alege una!
            </Text>
          </View>
        ) : (
          <FlatList
            data={favouriteArtists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() =>
                  navigation.navigate("Home", {
                    screen: "Artists",
                    params: {
                      screen: "ArtistDetail",
                      params: { artist: item },
                    },
                  })
                }
              >
                <Spacer position="bottom" size="large">
                  <View style={styles.cardShadow}>
                    <ArtistInfoCard artist={item} />
                  </View>
                </Spacer>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}
            style={{ backgroundColor: "transparent" }}
          />
        )}
      </SafeArea>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  menuButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 52 : 24, // adjust for status bar
    left: 18,
    backgroundColor: "#fff5e6",
    borderRadius: 16,
    padding: 8,
    zIndex: 10,
    shadowColor: "#f99551",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // <-- center horizontally!
    marginTop: 32,
    marginBottom: 18,
    paddingVertical: 10,
    width: "100%",
    position: "relative", // so zIndex works if needed
  },

  headerText: {
    color: "#733B73",
    fontWeight: "bold",
    fontSize: 28,
    letterSpacing: 1,
  },
  cardShadow: {
    shadowColor: "#733B73",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
    borderRadius: 24,
    marginHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.93)",
  },
});
