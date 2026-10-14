import { View } from "react-native";

const SIZE = 300;
const CELL = 30;

export default function PointexBoardBackground() {
  return (
    <View
      pointerEvents="none"
      className="absolute"
      style={{
        width: SIZE,
        height: SIZE,
        right: -100,
        top: 120,
        transform: [{ rotate: "-12deg" }],
        opacity: 0.18,
      }}
    >
      <View
        className="absolute inset-0 rounded-[24px]"
        style={{
          borderWidth: 1,
          borderColor: "#22D3EE",
          backgroundColor: "rgba(15, 23, 42, 0.35)",
        }}
      />

      {Array.from({ length: 9 }).map((_, index) => (
        <View
          key={`h-${index}`}
          className="absolute left-4 right-4 h-px"
          style={{
            top: 15 + index * CELL,
            backgroundColor: "#22D3EE",
          }}
        />
      ))}

      {Array.from({ length: 9 }).map((_, index) => (
        <View
          key={`v-${index}`}
          className="absolute top-4 bottom-4 w-px"
          style={{
            left: 15 + index * CELL,
            backgroundColor: "#3B82F6",
          }}
        />
      ))}
    </View>
  );
}
