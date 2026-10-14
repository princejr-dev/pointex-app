import type { ReactNode } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";

type GameIconButtonProps = {
  icon: ReactNode;
  onPress: () => void;
};

export default function GameIconButton({ icon, onPress }: GameIconButtonProps) {
  const { width } = useWindowDimensions();
  const buttonSize = width < 360 ? 44 : 48;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [{ translateY: pressed ? 6 : 0 }],
      })}
    >
      <View
        style={{
          width: buttonSize,
          height: buttonSize,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "rgba(34, 211, 238, 0.45)",
          backgroundColor: "#1f2937",
          shadowColor: "#0f172a",
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 0,
          overflow: "visible",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 1,
            right: 1,
            height: 1,
          }}
        />

        {icon}
      </View>
    </Pressable>
  );
}
