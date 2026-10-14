import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type GameButtonProps = {
  icon?: ReactNode;
  nameId: string;
  colors: readonly [string, string];
  borderColor: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function GameButton({
  icon,
  nameId,
  colors,
  borderColor,
  onPress,
  disabled = false,
}: GameButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        flex: 1,
        opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
        transform: [{ translateY: pressed && !disabled ? 2 : 0 }],
      })}
    >
      <View
        style={{
          overflow: "hidden",
          minHeight: 52,
          borderRadius: 12,
          borderWidth: 1,
          borderColor,
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
        }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            flex: 1,
            minHeight: 52,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {icon}

          <Text
            style={{
              fontFamily: "RussoOne",
              fontSize: 14,
              color: "#f1f5f9",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {nameId}
          </Text>
        </LinearGradient>
      </View>
    </Pressable>
  );
}
