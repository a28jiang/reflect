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
import { View, Image, TouchableOpacity } from "react-native";
import { RootSiblingParent } from "react-native-root-siblings";
import { APP_URL } from "./constants";
import { ServerStatusBanner } from "./components/serverStatus";
import { LoginScreen } from "./screens/login";

// Create a bottom tab navigator
const Tab = createBottomTabNavigator();

// Main App component
export const App = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const [user, setUser] = useState(null);

  const fetchOutfits = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(
        `${APP_URL}/outfits/?user_id=${user.id}&limit=100`
      );
      const data = await response.json();

      if (data.length) {
        setOutfits(data);
      } else {
        setOutfits([]);
      }
    } catch (error) {
      Toast.show(`❌ Error fetching outfits`, {
        position: Toast.positions.CENTER,
        backgroundColor: "#BF4D45",
      });
      setOutfits([]);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      fetchOutfits();
    }
    // fetchUser();
  }, [user]);

  return (
    <RootSiblingParent>
      <ServerStatusBanner refreshing={refreshing} />
      {!user ? (
        <LoginScreen setUser={setUser} />
      ) : (
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
              headerRight: () => (
                <TouchableOpacity onPress={() => setUser(null)}>
                  <Feather
                    name="log-out"
                    size={20}
                    color="#314F57"
                    style={{ position: "absolute", right: 30 }}
                  />
                </TouchableOpacity>
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
              children={() => (
                <AddScreen user={user} fetchOutfits={fetchOutfits} />
              )}
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
      )}
    </RootSiblingParent>
  );
};

// Export the main App component
export default App;
