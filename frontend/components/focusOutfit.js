// closet.js

import React, { useEffect, useState } from "react";

import { Feather } from "@expo/vector-icons"; // Importing Feather icons
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import moment from "moment";
import commonStyles from "../styles";
import Toast from "react-native-root-toast";
import { APP_URL } from "../constants";

export const FocusOutfit = ({ outfit, resetCloset }) => {
  const [name, setName] = useState(outfit.name);
  const [description, setDescription] = useState(outfit.description);

  const saveChanges = async () => {
    fetch(`${APP_URL}/outfits/${outfit.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        description: description,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        Toast.show(`✅ Outfit successfully updated`, {
          position: Toast.positions.CENTER,
          backgroundColor: "#314F57",
        });
      })
      .catch(() => {
        Toast.show(`❌ Error updating outfit`, {
          position: Toast.positions.CENTER,
          backgroundColor: "#BF4D45",
        });
      });
  };

  const deleteOutift = () => {
    fetch(`${APP_URL}/outfits/${outfit.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        resetCloset();
        Toast.show(`✅ Outfit successfully deleted`, {
          position: Toast.positions.CENTER,
          backgroundColor: "#314F57",
        });
      })
      .catch(() => {
        Toast.show(`❌ Error deleting outfit`, {
          position: Toast.positions.CENTER,
          backgroundColor: "#BF4D45",
        });
      });
  };

  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Image
        source={{
          uri: `data:image/png;base64,${outfit.thumbnail}`,
        }}
        style={{
          height: 175,
          width: 175,
          borderRadius: 8,
          marginBottom: 12,
        }}
        resizeMode="cover" // This ensures the image takes up the entire space in the card
      />
      <Feather
        style={{
          position: "absolute",
          top: Dimensions.get("window").height / 6,
          right: 75,
        }}
        name="edit"
        size={16}
        color="#314F57"
      />
      <TextInput
        value={name}
        onChangeText={(text) => setName(text)}
        placeholder="Outfit Name"
        style={{ ...commonStyles.subtitleText, ...styles.textInput }}
      />
      <TextInput
        value={description}
        onChangeText={(text) => setDescription(text)}
        placeholder="Outfit Description"
        style={{
          ...commonStyles.subtitle2Text,
          ...styles.textInput,
          paddingTop: 8,
          fontWeight: 400,
        }}
      />

      <Text
        style={{
          ...commonStyles.subtitle2Text,
          paddingVertical: 18,
          fontWeight: 400,
        }}
      >
        Type: {outfit.features.type} | Last worn:{" "}
        {moment(outfit.last_worn).fromNow()}
      </Text>
      <Text style={{ ...commonStyles.subtitle2Text }}>
        {`R E C E N T  M A T C H E S`}
      </Text>
      <View style={styles.gridContainer}>
        {outfit.entries.slice(0, 3).map((entry) => (
          <View style={styles.imageContainer} key={entry.id}>
            <Image
              source={{
                uri: `data:image/png;base64,${entry.features.image}`,
              }}
              style={styles.gridImage}
            />
            <Text style={commonStyles.captionText}>{entry.features.name}</Text>
            <Text
              style={{
                ...commonStyles.captionText,
                fontWeight: "400",
                paddingBottom: 10,
              }}
            >
              {moment(entry.last_worn).fromNow()}{" "}
            </Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={{ ...commonStyles.solidButton, marginTop: 8 }}
        onPress={saveChanges}
      >
        <Feather name="save" size={16} color="white" />
        <Text style={commonStyles.solidButtonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={commonStyles.outlineButton}
        onPress={deleteOutift}
      >
        <Feather name="trash" size={16} color="#314F57" />
        <Text style={commonStyles.outlineButtonText}>Delete Outfit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  textInput: {
    borderRadius: 8,
    borderColor: "#ECF2DD",
    borderWidth: 1,
    paddingHorizontal: 12,
  },

  imageContainer: {
    width: Dimensions.get("window").width / 3 - 20, // Adjust the width as needed
  },
  gridImage: {
    width: Dimensions.get("window").width / 3 - 20, // Adjust the width as needed
    height: 100, // Adjust the height as needed
    marginBottom: 4,
    resizeMode: "cover",
    borderRadius: 6,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    marginTop: 10,
  },
});
