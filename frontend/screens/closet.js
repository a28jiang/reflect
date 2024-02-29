// closet.js

import React, { useState } from "react";

import { Feather } from "@expo/vector-icons"; // Importing Feather icons
import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import commonStyles from "../styles";
import { FocusOutfit } from "../components/focusOutfit";
import { useNavigation } from "@react-navigation/native";

export const ClosetScreen = ({ refreshing, fetchOutfits, outfits }) => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = useNavigation();
  const filteredOutfits = outfits.filter((item) => {
    if (selectedFilter === "All") {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  const isFocus = filteredOutfits.length == 1;

  const resetCloset = () => {
    setSearchQuery("");
    setSelectedFilter("All");
    fetchOutfits();
  };

  const filterButtons = [
    "All",
    "Top",
    "Outerwear",
    "Jacket",
    "Pants",
    "Shorts",
  ];
  return (
    <LinearGradient colors={["white", "#F6FAE5"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.header}>Closet</Text>
          <Text style={commonStyles.subtitle1Text}>{outfits.length} Items</Text>
        </View>
        <View style={styles.filterButtonsContainer}>
          {filterButtons.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.selectedFilterButton,
              ]}
              onPress={() => {
                setSearchQuery(filter === "All" ? "" : filter);
                setSelectedFilter(filter);
              }}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter && styles.selectedFilterButton,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search bar */}

        <View style={styles.searchBarContainer}>
          <TouchableOpacity>
            <Feather
              name={isFocus ? "arrow-left" : "search"}
              size={26}
              color="#1B2A29"
              style={styles.magnifyingGlass}
              onPress={resetCloset}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.searchBar}
            placeholder="Search by outfit name"
            onChangeText={(text) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>

        {isFocus ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <FocusOutfit
              resetCloset={resetCloset}
              outfit={filteredOutfits[0]}
            />
          </ScrollView>
        ) : filteredOutfits.length == 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <Image
              source={require("../assets/mascot2.png")}
              style={{ width: 200, height: 200, marginTop: -20 }}
            />
            <Text
              style={{
                ...commonStyles.subtitle2Text,
                fontSize: 18,
                fontWeight: "500",
                margin: 20,
                textAlign: "center",
              }}
            >
              No available outfits{"\n"} Click below to add outfits!
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Add")}
              style={{
                ...commonStyles.solidButton,
                marginTop: 4,
                width: "90%",
              }}
            >
              <Feather name="plus" size={16} color="white" />
              <Text style={commonStyles.solidButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredOutfits}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()} // Assuming outfits have unique IDs
            showsVerticalScrollIndicator={true}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchOutfits}
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.outfitImage}
                onPress={() => setSearchQuery(item.name)}
              >
                {/* Display outfit thumbnail and name */}
                <Image
                  source={{ uri: `data:image/png;base64,${item.thumbnail}` }}
                  style={styles.outfitCard}
                  resizeMode="cover" // This ensures the image takes up the entire space in the card
                />
                <Text style={styles.subtitle1Text}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    // backgroundColor: "#F6FAE5",
  },
  header: {
    ...commonStyles.titleText,
    marginBottom: -2,
    marginRight: 12,
  },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: "88%",
    borderColor: "#D9D9D9",
    backgroundColor: "white",
  },
  outfitCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 8,
    overflow: "hidden", // This will hide the card outline
  },
  outfitImage: {
    width: "50%",
    height: 225,
    borderRadius: 8,
    marginBottom: 8, // Adjust as needed
  },
  subtitle1Text: {
    ...commonStyles.subtitle1Text,
    textAlign: "center", // Center the text
  },
  textContainer: {
    flexDirection: "row", // Align children in a horizontal line
    justifyContent: "flex-start", // Adjust as needed to space the text elements
    alignItems: "flex-end", // Aligns items to the bottom
    paddingHorizontal: 8, // Adjust as needed for the padding between text elements
    marginBottom: 16, // Adjust as needed
  },
  filterButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  filterButton: {
    padding: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  selectedFilterButton: {
    ...commonStyles.subtitle1Text,
    color: "black",
    borderBottomColor: "black",
  },
  filterButtonText: {
    ...commonStyles.subtitle2Text,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  magnifyingGlass: {
    marginRight: 8,
    marginLeft: 8,
    marginTop: -15,
  },
});

export default ClosetScreen;
