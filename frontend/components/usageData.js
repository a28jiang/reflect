import { View, Text, StyleSheet } from "react-native";
import commonStyles from "../styles";

export const UsageData = ({ tally, outfits }) => {
  return (
    <View>
      <View style={styles.base}>
        <View
          style={{
            ...styles.year,
            width: `${Math.max(0, tally.oneYear / outfits.length) * 100 - 1}%`,
          }}
        >
          <View
            style={{
              ...styles.sixMonths,
              width: `${
                Math.max(0, tally.sixMonths / outfits.length) * 100 - 2
              }%`,
            }}
          >
            <View
              style={{
                ...styles.thirtyDays,
                width: `${
                  Math.max(0, tally.thirtyDays / outfits.length) * 100 - 3
                }%`,
              }}
            >
              <View
                style={{
                  ...styles.oneWeek,
                  width: `${
                    Math.max(0, tally.oneWeek / outfits.length) * 100 - 4
                  }%`,
                }}
              ></View>
            </View>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", paddingVertical: 4, gap: 12 }}>
        <View style={{ width: 16, height: 16, backgroundColor: "#1B2A29" }} />
        <Text style={{ ...commonStyles.subtitle2Text, fontWeight: 400 }}>
          {" "}
          {tally.oneWeek} items worn in the past week
        </Text>
      </View>
      <View style={{ flexDirection: "row", paddingVertical: 4, gap: 12 }}>
        <View style={{ width: 16, height: 16, backgroundColor: "#729187" }} />
        <Text style={{ ...commonStyles.subtitle2Text, fontWeight: 400 }}>
          {" "}
          {tally.thirtyDays} items worn in the past 30 days
        </Text>
      </View>
      <View style={{ flexDirection: "row", paddingVertical: 4, gap: 12 }}>
        <View style={{ width: 16, height: 16, backgroundColor: "#BCA862" }} />
        <Text style={{ ...commonStyles.subtitle2Text, fontWeight: 400 }}>
          {" "}
          {tally.sixMonths} items worn in the past 6 months
        </Text>
      </View>
      <View style={{ flexDirection: "row", paddingVertical: 4, gap: 12 }}>
        <View style={{ width: 16, height: 16, backgroundColor: "#D1D6AE" }} />
        <Text style={{ ...commonStyles.subtitle2Text, fontWeight: 400 }}>
          {" "}
          {tally.oneYear} items worn in the past year
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#D9D9D9",
    height: 32,
    borderRadius: 4,
    marginBottom: 12,
  },
  year: {
    backgroundColor: "#D1D6AE",
    height: 32,
    borderRadius: 4,
  },
  sixMonths: {
    backgroundColor: "#BCA862",
    height: 32,
    borderRadius: 4,
  },
  thirtyDays: {
    backgroundColor: "#729187",
    height: 32,
    borderRadius: 4,
  },
  oneWeek: {
    backgroundColor: "#1B2A29",
    height: 32,
    borderRadius: 4,
  },
});
