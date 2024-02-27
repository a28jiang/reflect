import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import commonStyles from "../styles";
import { ClosetData } from "../components/closetData";
import { useNavigation } from "@react-navigation/native";
import { UsageData } from "../components/usageData";

const tallyItemsByTimeFrame = (items) => {
  const tally = {
    oneWeek: 0,
    thirtyDays: 0,
    sixMonths: 0,
    oneYear: 0,
    wornOnce: 0,
  };

  if (items.length) {
    const now = new Date();

    // Calculate the cutoff dates
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    items.forEach((item) => {
      const lastWornDate = new Date(item.last_worn);

      if (lastWornDate > oneWeekAgo) {
        tally.oneWeek++;
      }
      if (lastWornDate > thirtyDaysAgo) {
        tally.thirtyDays++;
      }
      if (lastWornDate > sixMonthsAgo) {
        tally.sixMonths++;
      }
      if (lastWornDate > oneYearAgo) {
        tally.oneYear++;
      }
      if (item.entries && item.entries.length == 1) {
        tally.wornOnce++;
      }
    });
  }
  return tally;
};

// Define Home screen component
export const HomeScreen = ({ outfits, user }) => {
  const navigation = useNavigation();
  tally = tallyItemsByTimeFrame(outfits);

  return (
    <LinearGradient
      colors={["white", "#F6FAE5"]}
      style={{ flex: 1, padding: 32, paddingBottom: 0 }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text
          style={{ ...commonStyles.subtitleText, fontSize: 28, padding: 16 }}
        >
          Welcome {user && user.first_name} 👋
        </Text>
        <Card
          title={`${outfits.length} items in your closet`}
          buttonText="See Closet"
          onPress={() => navigation.navigate("Closet")}
          content={<ClosetData outfits={outfits} />}
        />
        <Card
          title="Your closet usage"
          buttonText="See Trends"
          button={() => {}}
          content={
            <View>
              <UsageData tally={tally} outfits={outfits} />
            </View>
          }
        />
        <Card
          title="Where you stand"
          buttonText="See Leaderboard"
          button={() => {}}
          content={
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  gap: 2,
                  marginBottom: 12,
                }}
              >
                <Text style={commonStyles.subtitleText}>1st </Text>
                <Text
                  style={{
                    ...commonStyles.subtitle2Text,
                    fontSize: 16,
                    paddingBottom: 2,
                  }}
                >
                  place this month
                </Text>
              </View>
              <Text style={{ ...commonStyles.subtitle2Text, fontWeight: 400 }}>
                🏆 Least number of new adds
              </Text>
            </View>
          }
        />
        <Card
          title="Worn only once"
          buttonText="See Items"
          button={() => {}}
          content={
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 2,
                marginBottom: 12,
              }}
            >
              <Text style={commonStyles.subtitleText}>{tally.wornOnce} </Text>
              <Text
                style={{
                  ...commonStyles.subtitle2Text,
                  fontSize: 16,
                  paddingBottom: 2,
                }}
              >
                items
              </Text>
            </View>
          }
        />
        <Card
          title="Unworn in the past year"
          buttonText="See Items"
          button={() => {}}
          content={
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 2,
                marginBottom: 12,
              }}
            >
              <Text style={commonStyles.subtitleText}>
                {outfits.length - tally.oneYear}{" "}
              </Text>
              <Text
                style={{
                  ...commonStyles.subtitle2Text,
                  fontSize: 16,
                  paddingBottom: 2,
                }}
              >
                items
              </Text>
            </View>
          }
        />
      </ScrollView>
    </LinearGradient>
  );
};

const Card = ({ title, content, onPress, buttonText }) => {
  return (
    <View style={styles.card}>
      {/* First Row */}
      <View style={styles.rowContainer}>
        <Text style={commonStyles.subtitle3Text}>{title}</Text>
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.button}>{`${buttonText} ›`}</Text>
        </TouchableOpacity>
      </View>

      {/* Second Row */}
      <View style={styles.contentContainer}>{content}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    margin: 10,
    padding: 15,
    shadowColor: "rgba(0,0,0, 0.5)",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5, // For Android shadow
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    fontSize: 14,
    fontWeight: "500",
    color: "#828282", // Change the color as needed
  },
  contentContainer: {
    marginTop: 10,
  },
});
