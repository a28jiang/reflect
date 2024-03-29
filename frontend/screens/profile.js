import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import commonStyles from "../styles";

// Define Profile screen component
export const ProfileScreen = () => (
  <LinearGradient colors={["white", "#F6FAE5"]} style={{ flex: 1 }}>
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={commonStyles.subtitle1Text}>
        Profile Screen under construction 👷👷‍♀️🛠️
      </Text>
      <Image
        source={require("../assets/mascot1.png")}
        style={{ width: 200, height: 200, marginTop: 75 }}
      />
    </View>
  </LinearGradient>
);
