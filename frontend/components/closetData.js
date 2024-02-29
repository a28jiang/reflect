import { Dimensions, View, Text, Image, TouchableOpacity } from "react-native";
import { PieChart } from "react-native-chart-kit";
import Svg, { Circle } from "react-native-svg";
import commonStyles from "../styles";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const chartConfig = {
  backgroundColor: "#000000",
  backgroundGradientFrom: "#1E2923",
  backgroundGradientTo: "#08130D",
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  style: {
    borderRadius: 16,
  },
};

const colors = {
  Pants: "#1B2A29",
  Top: "#729187",
  Hat: "#508E6B",
  Shoe: "#5D8F83",
  Shorts: "#BCA862",
  Jacket: "#5F9D96",
  Shirt: "#4E8E7D",
  Outerwear: "#D1D6AE",
  Skirt: "#4F78A3",
};

export const ClosetData = ({ outfits }) => {
  holeSize = Dimensions.get("window").width - 250;
  const navigation = useNavigation();

  const data = outfits.length
    ? outfits.reduce((acc, item) => {
        const typeName = item.features.type;

        // Check if the type already exists in the accumulator
        const existingType = acc.find((entry) => entry.name === typeName);

        if (existingType) {
          // If the type already exists, increment its value
          existingType.value += 1;
        } else {
          // If the type doesn't exist, add a new entry
          acc.push({ name: typeName, value: 1, color: colors[typeName] });
        }

        return acc;
      }, [])
    : [];

  return outfits.length > 0 ? (
    <View>
      <View style={{ zIndex: 1 }}>
        <PieChart
          data={data}
          width={Dimensions.get("window").width - 100}
          height={220}
          chartConfig={chartConfig}
          accessor={"value"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          style={{ zIndex: 1 }}
          center={[10, 10]}
          absolute
          hasLegend={false}
        />
      </View>

      <View
        style={{
          position: "absolute",
          top: 50,
          left: Dimensions.get("window").width / 2 + 15,
        }}
      >
        {data &&
          data.map((item) => (
            <View
              key={item.name}
              style={{ flexDirection: "row", paddingVertical: 4, gap: 6 }}
            >
              <View
                style={{ width: 16, height: 16, backgroundColor: item.color }}
              />
              <Text
                style={{
                  ...commonStyles.subtitle2Text,
                  fontWeight: 400,
                  fontSize: 12,
                }}
              >
                {`(${item.value}) ${item.name}`.slice(0, 13)}
              </Text>
            </View>
          ))}
      </View>
      <Svg
        zIndex="999"
        style={{
          zIndex: 9999,
          position: "absolute",
          left: Dimensions.get("window").width / 3 - 88,
          top: 65,
        }}
      >
        <Circle r="55" cx="55" cy="55" fill="white" />
      </Svg>
    </View>
  ) : (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Image
        source={require("../assets/mascot5.png")}
        style={{ width: 125, height: 125 }}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("Add")}
        style={{
          ...commonStyles.solidButton,
          marginTop: 16,
          width: "90%",
        }}
      >
        <Feather name="plus" size={16} color="white" />
        <Text style={commonStyles.solidButtonText}>Add Item</Text>
      </TouchableOpacity>
    </View>
  );
};
