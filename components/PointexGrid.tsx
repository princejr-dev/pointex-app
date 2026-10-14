import { useEffect, useRef } from "react";
import { Animated, Easing, View, useWindowDimensions } from "react-native";

const CELL_SIZE = 48;

export default function PointexGrid() {
  const { width, height } = useWindowDimensions();

  const columns = Math.ceil(width / CELL_SIZE) + 2;
  const rows = Math.ceil(height / CELL_SIZE) + 2;

  const scanOne = useRef(new Animated.Value(-160)).current;
  const scanTwo = useRef(new Animated.Value(-240)).current;

  useEffect(() => {
    const animationOne = Animated.loop(
      Animated.timing(scanOne, {
        toValue: height + 160,
        duration: 8500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const animationTwo = Animated.loop(
      Animated.timing(scanTwo, {
        toValue: height + 240,
        duration: 11500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animationOne.start();
    animationTwo.start();

    return () => {
      animationOne.stop();
      animationTwo.stop();
    };
  }, [height, scanOne, scanTwo]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: -CELL_SIZE,
        left: -CELL_SIZE,
        width: columns * CELL_SIZE,
        height: rows * CELL_SIZE,
        opacity: 0.85,
        overflow: "hidden",
      }}
    >
      {/* Grille horizontale */}
      {Array.from({ length: rows + 1 }, (_, index) => (
        <View
          key={`horizontal-${index}`}
          style={{
            position: "absolute",
            top: index * CELL_SIZE,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: "rgba(34, 211, 238, 0.08)",
          }}
        />
      ))}

      {/* Grille verticale */}
      {Array.from({ length: columns + 1 }, (_, index) => (
        <View
          key={`vertical-${index}`}
          style={{
            position: "absolute",
            left: index * CELL_SIZE,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: "rgba(59, 130, 246, 0.07)",
          }}
        />
      ))}

      {/* Faisceau cyan */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 100,
          transform: [{ translateY: scanOne }],
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 48,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: "rgba(34, 211, 238, 0.65)",
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 35,
            left: 0,
            right: 0,
            height: 28,
            backgroundColor: "rgba(34, 211, 238, 0.12)",
          }}
        />
      </Animated.View>

      {/* Faisceau bleu */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 100,
          transform: [{ translateY: scanTwo }],
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 48,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: "rgba(59, 130, 246, 0.55)",
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 35,
            left: 0,
            right: 0,
            height: 28,
            backgroundColor: "rgba(59, 130, 246, 0.10)",
          }}
        />
      </Animated.View>
    </View>
  );
}
