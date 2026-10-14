import { memo, useEffect, useRef } from "react";
import { Animated, Pressable, View, type ViewStyle } from "react-native";

type PointProps = {
  value: "blue" | "red" | null;
  disabled?: boolean;
  highlighted?: boolean;
  row: number;
  col: number;
  style?: ViewStyle;
  onPress: (row: number, col: number) => void;
};

function Point({
  value,
  disabled = false,
  highlighted = false,
  row,
  col,
  style,
  onPress,
}: PointProps) {
  const isDisabled = disabled || value !== null;
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!highlighted) {
      pulse.stopAnimation();
      pulse.setValue(0.6);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [highlighted, pulse]);

  return (
    <Pressable
      onPress={() => onPress(row, col)}
      disabled={isDisabled}
      hitSlop={6}
      style={[
        {
          position: "absolute",
          width: 12,
          height: 12,
          zIndex: highlighted ? 5 : 2,
        },
        style,
      ]}
    >
      {highlighted && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: -8,
            top: -8,
            width: 28,
            height: 28,
            borderRadius: 999,
            borderWidth: 2,
            borderColor: "#22d3ee",
            backgroundColor: "rgba(34, 211, 238, 0.12)",
            opacity: pulse,
            transform: [
              {
                scale: pulse.interpolate({
                  inputRange: [0.6, 1],
                  outputRange: [0.9, 1.15],
                }),
              },
            ],
          }}
        />
      )}

      <View
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          backgroundColor:
            value === "blue"
              ? "#3b82f6"
              : value === "red"
                ? "#ef4444"
                : highlighted
                  ? "#22d3ee"
                  : "#64748b",
        }}
      />
    </Pressable>
  );
}

export default memo(Point);
