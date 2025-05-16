// src/features/hive/screens/artist-detail.screen.js

import React, { useState } from "react";
import { ScrollView, Linking, Alert } from "react-native";
import { List, Divider } from "react-native-paper";

import { ArtistInfoCard } from "../components/artist-info-card.component";
import { SafeArea } from "../../../components/utility/safe-area.component";

export const ArtistDetailScreen = ({ route }) => {
  const { artist } = route.params;
  const [descExpanded, setDescExpanded] = useState(true);
  const [contactExpanded, setContactExpanded] = useState(false);
  const [pricingExpanded, setPricingExpanded] = useState(false);

  const handlePress = async (type, value) => {
    let url = value;
    if (type === "email") {
      url = `mailto:${value}`;
    } else if (type === "phone") {
      url = `tel:${value}`;
    } else {
      // ensure website has a protocol
      url = value.startsWith("http") ? value : `https://${value}`;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Can't handle this URL:", url);
        return;
      }
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert("An error occurred:", err.message);
    }
  };

  return (
    <SafeArea>
      <ScrollView>
        <ArtistInfoCard artist={artist} />

        <List.Section>
          {/* Description */}
          <List.Accordion
            title="Description"
            left={(props) => (
              <List.Icon {...props} icon="information-outline" />
            )}
            expanded={descExpanded}
            onPress={() => setDescExpanded(!descExpanded)}
          >
            <List.Item
              title={artist.description || "No description provided."}
            />
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
            <List.Item title={artist.priceRange || "Not specified."} />
          </List.Accordion>
        </List.Section>
      </ScrollView>
    </SafeArea>
  );
};
