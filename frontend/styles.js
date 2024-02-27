import { StyleSheet } from "react-native";

// Define styles
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export const commonStyles = {
  container: {
    borderRadius: 8,
  },
  titleText: {
    fontSize: 24,
    color: "#1B2A29",
    fontWeight: "700",
  },
  subtitleText: {
    fontSize: 24,
    color: "#1B2A29",
    fontWeight: "600",
  },
  subtitle1Text: {
    fontSize: 14,
    color: "#1B2A29",
    fontWeight: "600",
  },
  subtitle2Text: {
    fontSize: 14,
    color: "#828282",
    fontWeight: "600",
  },
  subtitle3Text: {
    fontSize: 18,
    color: "#1B2A29",
    fontWeight: "600",
  },
  captionText: {
    fontSize: 10,
    color: "#828282",
    fontWeight: "600",
  },
  solidButton: {
    backgroundColor: "#314F57",
    borderRadius: 6,
    padding: 20,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
    flexDirection: "row", // Align children in a horizontal line
    justifyContent: "center", // Adjust as needed to space the text elements
    alignItems: "center", // Aligns items to the bottom
    gap: 10,
  },
  solidButtonText: {
    color: "white",
    fontSize: 16,
  },
  outlineButton: {
    borderColor: "#314F57",
    borderWidth: 1,
    borderRadius: 6,
    padding: 20,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
    flexDirection: "row", // Align children in a horizontal line
    justifyContent: "center", // Adjust as needed to space the text elements
    alignItems: "center", // Aligns items to the bottom
    gap: 10,
  },
  outlineButtonText: {
    color: "#314F57",
    fontSize: 16,
  },
};

export default commonStyles;
