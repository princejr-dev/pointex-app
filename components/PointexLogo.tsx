import { Text, useWindowDimensions } from "react-native";

export default function PointexLogo() {
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  return (
    <Text
      style={{
        fontFamily: "RussoOne",
        fontSize: isCompact ? 21 : 24,
        letterSpacing: isCompact ? 2 : 3,
        color: "#0ea5e9",
        textShadowColor: "rgba(14, 165, 233, 0.45)",
        textShadowOffset: {
          width: 0,
          height: 0,
        },
        textShadowRadius: 8,
      }}
    >
      POINTEX
    </Text>
  );
}
