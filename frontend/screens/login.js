import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import commonStyles from "../styles";
import { Feather } from "@expo/vector-icons"; // Importing Feather icons
import { APP_URL, DEMO_ID } from "../constants";
import Toast from "react-native-root-toast";

export const LoginScreen = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const fetchDemoUser = async () => {
    Toast.show(`🥋 Logging into demo account...`, {
      position: Toast.positions.CENTER,
      backgroundColor: "#314F57",
    });
    try {
      const response = await fetch(`${APP_URL}/users/${DEMO_ID}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      Toast.show(`🥋 Logging into demo account...`, {
        position: Toast.positions.CENTER,
        backgroundColor: "#314F57",
      });
      Toast.show(`❌ Error fetching demo user`, {
        position: Toast.positions.CENTER,
        backgroundColor: "#BF4D45",
      });
    }
  };

  const handleAuthentication = async () => {
    const formData = new FormData();
    formData.append("user_email", email);
    formData.append("user_password", password);
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);

    const endpoint = isSignUp ? `${APP_URL}/users` : `${APP_URL}/login`;
    if (
      !email |
      !password |
      (isSignUp && !email | !password | !firstName | !lastName)
    ) {
      Toast.show(`❌ Please fill out all fields`, {
        position: Toast.positions.CENTER,
        backgroundColor: "#BF4D45",
      });
      return;
    }

    fetch(endpoint, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.detail) {
          Toast.show(`❌ Error signing in`, {
            position: Toast.positions.CENTER,
            backgroundColor: "#BF4D45",
          });
        } else {
          setUser(data);
        }
      })
      .catch((error) => {
        Toast.show(`❌ Error signing in`, {
          position: Toast.positions.CENTER,
          backgroundColor: "#BF4D45",
        });
      });
  };

  return (
    <LinearGradient colors={["white", "#F6FAE5"]} style={{ flex: 1 }}>
      <ScrollView>
        <View style={styles.container}>
          <Image
            source={require("../assets/logo.png")}
            style={{ width: 75, height: 75, resizeMode: "contain" }}
          />
          <Image
            source={require("../assets/mascot4.png")}
            style={{
              width: 225,
              height: 200,
              marginTop: 100,
              marginBottom: 50,
            }}
          />

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.textInput}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.textInput}
          />
          {isSignUp && (
            <>
              <TextInput
                placeholder="First Name"
                value={firstName}
                onChangeText={(text) => setFirstName(text)}
                style={styles.textInput}
              />
              <TextInput
                placeholder="Last Name"
                value={lastName}
                onChangeText={(text) => setLastName(text)}
                style={styles.textInput}
              />
            </>
          )}

          <TouchableOpacity
            onPress={() => handleAuthentication()}
            style={{
              ...commonStyles.solidButton,
              marginTop: 4,
              width: "90%",
            }}
          >
            <Feather name="log-in" size={16} color="white" />
            <Text style={commonStyles.solidButtonText}>
              {isSignUp ? "Sign Up" : "Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsSignUp(!isSignUp)}
            style={{ ...commonStyles.outlineButton, width: "90%" }}
          >
            <Text style={commonStyles.outlineButtonText}>
              {isSignUp ? "Login to existing account" : "Create an account"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={fetchDemoUser}>
            <Text
              style={{
                ...commonStyles.outlineButtonText,
                textDecorationLine: "underline",
                paddingTop: 16,
                paddingBottom: 48,
              }}
            >
              {"Use Demo Account"}
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              ...commonStyles.captionText,
              fontWeight: 400,
              padding: 16,
              paddingBottom: 160,
            }}
          >
            Reflect utilizes the camera to capture images of your outfits. Only
            pictures of your clothing will be required. User data and personally
            identifying features (non-clothing) will not be captured nor stored.
            You can request deletion of your data at any time.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#D9D9D9",
    paddingHorizontal: 16,
    marginBottom: 16,
    width: "88%",
    backgroundColor: "white",
  },
});
