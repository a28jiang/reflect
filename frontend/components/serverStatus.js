import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { APP_URL } from "../constants";

export const ServerStatusBanner = ({ refreshing }) => {
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(APP_URL);
        const data = await response.json();
        if (data.includes("server running")) {
          setServerStatus(true);
        } else {
          setServerStatus(false);
        }
      } catch (error) {
        setServerStatus("Error checking server status.");
        setServerStatus(false);
      }
    };

    // Check server status when the component mounts
    checkServerStatus();
  }, [refreshing]); // Empty dependency array means this effect runs once when the component mounts
  return (
    <View>
      {!serverStatus && (
        <View
          style={{
            backgroundColor: "red",
            padding: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", marginTop: 20 }}>
            ⚠️ Server at {APP_URL} is currently down.
          </Text>
        </View>
      )}
    </View>
  );
};
