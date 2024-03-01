import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  TextInput,
  Button,
} from "react-native";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons"; // Importing Feather icons
import { APP_URL, WS_URL } from "../constants";
import commonStyles from "../styles";
import { LinearGradient } from "expo-linear-gradient";
import Swiper from "react-native-swiper";
import moment from "moment";
import Toast from "react-native-root-toast";
import WS from "react-native-websocket";

export const AddScreen = ({ fetchOutfits, user }) => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [response, setResponse] = useState(null);
  const [stage, setStage] = useState(1);
  const [ws, setWs] = useState();

  useEffect(() => {
    // Request camera permissions when the component mounts
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === "granted");
    })();

    // Request image library permissions when the component mounts
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Toast.show(`❌ Camera roll permissions are required`, {
          position: Toast.positions.CENTER,
          backgroundColor: "#BF4D45",
        });
      }
    })();
  }, []);

  const processImageData = (dataUrl) => {
    if (dataUrl.startsWith("data:image/")) {
      // Find the position of ;base64,
      const base64Index = dataUrl.indexOf(";base64,");

      if (base64Index !== -1) {
        // Extract the substring after ;base64,
        const base64String = dataUrl.slice(base64Index + ";base64,".length);
        console.log(base64String);
        handleUpload(base64String, user.id);
      } else {
        console.log("Invalid data URL: Missing ;base64,");
      }
    } else {
      console.log("Invalid data URL: Does not start with data:image/");
    }
    // Return null or handle the case when the data URL is not valid
    return null;
  };

  const handleUserUpload = (input, user_id) => {
    if (!input.assets.length | !input.assets[0]) {
      return;
    }
    result = input.assets[0];
    handleUpload(result.base64, user_id);
  };

  const handleUpload = (input, user_id) => {
    setStage(2);

    const formData = new FormData();
    formData.append("image", input);
    fetch(`${APP_URL}/upload/?user_id=${user_id}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data | (data && !data.length)) {
          Toast.show(`🔎 No clothing items identified`, {
            position: Toast.positions.CENTER,
            backgroundColor: "#BF8E45",
          });
          resetStage();
          return;
        }

        setResponse(data);
      })
      .catch((error) => {
        Toast.show(`❌ An error occurred while identifying your image`, {
          position: Toast.positions.CENTER,
          backgroundColor: "#BF4D45",
        });
        setStage(1);
      });
  };

  const resetStage = () => {
    setStage(1);
    setResponse(null);
  };

  const handleOpenCamera = async () => {
    if (hasCameraPermission) {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        handleUserUpload(result, user.id);
      }
    } else {
      Toast.show(`❌ Camera permissions are required`, {
        position: Toast.positions.CENTER,
        backgroundColor: "#BF4D45",
      });
    }
  };

  const handleOpenImageLibrary = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      handleUserUpload(result, user.id);
    }
  };

  const handleMatch = async (item, user_id, match = null) => {
    const formData = new FormData();
    formData.append("entry_id", item.id);
    formData.append("name", item.name);
    formData.append("description", `Notes: ${item.name}`);
    if (match) {
      formData.append("outfit_id", match.id);
    }

    fetch(`${APP_URL}/match/?user_id=${user_id}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        const newResponse = response.filter((obj) => obj.id !== item.id);

        if (match) {
          Toast.show(`🔍 Successfully matched ${item.name} to ${match.name}`, {
            position: Toast.positions.TOP,
            backgroundColor: "#314F57",
          });
        } else {
          Toast.show(`➕ Successfully created new outfit ${item.name}`, {
            position: Toast.positions.TOP,
            backgroundColor: "#314F57",
          });
        }
        if (newResponse.length == 0) {
          Toast.show(`✅ Outfit matching complete!`, {
            position: -100,
            backgroundColor: "#828282",
          });
          resetStage();
          fetchOutfits();
        }
        setResponse(newResponse);
      })
      .catch((error) => {
        Toast.show(`❌ An error occured during outfit matching`, {
          position: Toast.positions.CENTER,
          backgroundColor: "#BF4D45",
        });
      });
  };

  const renderContent = () => {
    switch (stage) {
      case 1:
        return (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            {/* Stage 1: Upload photo */}
            {/* Display mascot photo in the middle */}
            <Image
              source={require("../assets/mirror.png")}
              style={{ width: 300, height: 300, marginBottom: 20 }}
            />

            {/* Dark green rectangle buttons */}
            <TouchableOpacity
              onPress={handleOpenCamera}
              style={commonStyles.solidButton}
            >
              <Feather name="camera" size={16} color="white" />
              <Text style={commonStyles.solidButtonText}>Open Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleOpenImageLibrary}
              style={commonStyles.outlineButton}
            >
              <Feather name="image" size={16} color="#314F57" />
              <Text style={commonStyles.outlineButtonText}>
                Upload from Library
              </Text>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            {/* Stage 2: Loading */}
            {response && response.length ? (
              <Swiper
                style={styles.wrapper}
                showsButtons={false}
                loop={false}
                paginationStyle={{ bottom: -10 }}
                dotStyle={{ backgroundColor: "#D9D9D9" }}
                activeDotStyle={{ backgroundColor: "#314F57" }}
              >
                {response.map((item) => (
                  <ScrollView key={item.id} style={{ paddingTop: 24 }}>
                    <View style={styles.slide}>
                      {/* Carousel Item Image */}
                      <Image
                        source={{
                          uri: `data:image/png;base64,${item.features.image}`,
                        }}
                        style={styles.carouselImage}
                      />

                      <Text
                        style={{
                          ...commonStyles.subtitleText,
                          paddingTop: 18,
                          paddingBottom: 6,
                        }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          ...commonStyles.subtitle2Text,
                          paddingBottom: 12,
                        }}
                      >
                        {`T O P  O U T F I T  M A T C H E S`}
                      </Text>
                      {/* Matching Images Grid */}
                      <View style={styles.gridContainer}>
                        {item.matches.map(({ outfit, score }) => (
                          <View style={styles.imageContainer} key={outfit.id}>
                            <TouchableOpacity
                              onPress={() => handleMatch(item, user.id, outfit)}
                            >
                              <Image
                                source={{
                                  uri: `data:image/png;base64,${outfit.thumbnail}`,
                                }}
                                style={styles.gridImage}
                              />
                              <Text style={commonStyles.captionText}>
                                {outfit.name}
                              </Text>
                              <Text
                                style={{
                                  ...commonStyles.captionText,
                                  fontWeight: "400",
                                  paddingBottom: 10,
                                }}
                              >
                                {moment(outfit.last_worn).fromNow()}{" "}
                              </Text>
                              <View
                                style={{
                                  position: "absolute",
                                  top: 5,
                                  right: 5,
                                }}
                              >
                                <Text
                                  style={{
                                    fontWeight: "600",
                                    color: "white",
                                    textShadowColor: "rgba(49,79,87, 0.75)", // Shadow color
                                    textShadowOffset: { width: 2, height: 2 }, // Shadow offset
                                    textShadowRadius: 5, // Shadow radius
                                  }}
                                >
                                  {(score * 100).toFixed(0)}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        ))}

                        <TouchableOpacity
                          onPress={() => handleMatch(item, user.id)}
                          style={{
                            ...commonStyles.solidButton,
                            marginTop: 4,
                            width: "90%",
                          }}
                        >
                          <Feather name="plus" size={16} color="white" />
                          <Text style={commonStyles.solidButtonText}>
                            This is a new Item
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            ...commonStyles.outlineButton,
                            width: "90%",
                          }}
                        >
                          <Feather name="grid" size={16} color="#314F57" />
                          <Text style={commonStyles.outlineButtonText}>
                            Show more Options
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </ScrollView>
                ))}
              </Swiper>
            ) : (
              <View>
                <ActivityIndicator size="large" color="#314F57" />
                <Text style={{ ...commonStyles.subtitle2Text, paddingTop: 24 }}>
                  Processing image upload...
                </Text>
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={["white", "#F6FAE5"]} style={{ flex: 1 }}>
      {stage != 1 && (
        <TouchableOpacity onPress={resetStage} style={styles.backButton}>
          <Feather name="arrow-left" size={30} color="#314F57" />
        </TouchableOpacity>
      )}
      <WS
        ref={(ref) => setWs(ref)}
        url={WS_URL}
        onOpen={() => {
          ws.send(`Initiating connection from ${user.id}`);
        }}
        onMessage={(e) => {
          if (e.data && e.data) {
            processImageData(e.data);
          }
          console.log(e);
        }}
        onError={(e) => {
          console.log(e);
        }}
        onClose={(e) => {
          console.log(e);
        }}
        reconnect // Will try to reconnect onClose
      />
      {renderContent()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    color: "#314F57",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselImage: {
    width: 200,
    height: 200,
    resizeMode: "cover",
    borderRadius: 6,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    marginTop: 10,
  },
  imageContainer: {
    width: Dimensions.get("window").width / 3 - 40, // Adjust the width as needed
  },
  gridImage: {
    width: Dimensions.get("window").width / 3 - 40, // Adjust the width as needed
    height: 100, // Adjust the height as needed
    marginBottom: 4,
    resizeMode: "cover",
    borderRadius: 6,
  },
  gridButton: {
    width: Dimensions.get("window").width / 2 - 40, // Adjust the width as needed
  },
  backButton: {
    position: "absolute",
    zIndex: 999,
    top: 0,
    left: 30,
    padding: 10,
  },
});
