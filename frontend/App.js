import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons"; // Importing Feather icons

import {
  AddScreen,
  ClosetScreen,
  ProfileScreen,
  HomeScreen,
  FriendsScreen,
} from "./screens";
import { View, Image } from "react-native";
import { RootSiblingParent } from "react-native-root-siblings";
import { APP_URL } from "./constants";
import { ServerStatusBanner } from "./components/serverStatus";

const USER_ID = 1;
// Create a bottom tab navigator
const Tab = createBottomTabNavigator();

// Main App component
export const App = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const [user, setUser] = useState({});

  const fetchOutfits = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(
        `${APP_URL}/outfits/?user_id=${USER_ID}&limit=100`
      );
      const data = await response.json();
      setOutfits(data);
    } catch (error) {
      console.error("Error fetching outfits:", error);
      setOutfits([]);
    }
    setRefreshing(false);
  };

  const fetchUser = async () => {
    try {
      const response = await fetch(`${APP_URL}/users/${USER_ID}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching outfits:", error);
    }
  };

  useEffect(() => {
    fetchOutfits();
    fetchUser();
  }, []);

  return (
    <RootSiblingParent>
      <ServerStatusBanner refreshing={refreshing} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;

              // Set the icon based on the route name
              if (route.name === "Home") {
                iconName = "home";
              } else if (route.name === "Friends") {
                iconName = "users";
              } else if (route.name === "Add") {
                iconName = "plus-circle";
              } else if (route.name === "Closet") {
                iconName = "folder";
              } else if (route.name === "Profile") {
                iconName = "user";
              }

              // Return the Feather icon component
              return <Feather name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "darkgreen",
            tabBarInactiveTintColor: "gray",
            tabBarStyle: [
              {
                height: 85,
                paddingTop: 15,
                shadowColor: "rgba(49,79,87, 0.75)",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 5, // For Android shadow
              },
              null,
            ],
            headerTitle: () => (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("./assets/logo.png")}
                  style={{ width: 50, height: 50, resizeMode: "contain" }}
                />
              </View>
            ),
            headerStyle: {
              borderBottomWidth: 0,
              shadowOffset: 0,
              height: 50,
            },
            headerTitleAlign: "center",
          })}
        >
          {/* Define the screens for each tab */}
          <Tab.Screen
            name="Home"
            children={() => (
              <HomeScreen
                refreshing={refreshing}
                fetchOutfits={fetchOutfits}
                outfits={outfits}
                user={user}
              />
            )}
          />
          <Tab.Screen name="Friends" component={FriendsScreen} />
          <Tab.Screen
            name="Add"
            children={() => <AddScreen fetchOutfits={fetchOutfits} />}
          />
          <Tab.Screen
            name="Closet"
            children={() => (
              <ClosetScreen
                refreshing={refreshing}
                fetchOutfits={fetchOutfits}
                outfits={outfits}
              />
            )}
          />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </RootSiblingParent>
  );
};

// Export the main App component
export default App;
