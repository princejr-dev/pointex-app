import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const TILE_SIZE = 20;
const GAP = 9;
const STEP = TILE_SIZE + GAP;
const GRID_SIZE = TILE_SIZE * 3 + GAP * 2;
const RING_SIZE = 124;

const TILES = Array.from({ length: 9 }, (_, i) => ({
  x: i % 3,
  y: Math.floor(i / 3),
}));

function Tile({ x, y }: { x: number; y: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1400,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      true,
    );

    return () => cancelAnimation(progress);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const dx = (1 - x) * STEP * 0.65 * p;
    const dy = (1 - y) * STEP * 0.65 * p;

    return {
      opacity: 0.55 + p * 0.45,
      backgroundColor: p > 0.65 ? "#22D3EE" : "#12384A",
      borderColor: p > 0.65 ? "#67E8F9" : "#176078",
      transform: [
        { translateX: dx },
        { translateY: dy },
        { scale: 1 - p * 0.12 },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          left: x * STEP,
          top: y * STEP,
          zIndex: x === 1 && y === 1 ? 2 : 1,
        },
        animatedStyle,
      ]}
    />
  );
}

function RotatingRing() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1600,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    return () => cancelAnimation(rotation);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.ring}>
      <Animated.View style={[styles.rotatingArc, animatedStyle]}>
        <View style={styles.arcHead} />
      </Animated.View>
    </View>
  );
}

export default function LoadingAnimation() {
  return (
    <View style={styles.container}>
      <View style={styles.animation}>
        <RotatingRing />

        <View style={styles.grid}>
          {TILES.map((tile) => (
            <Tile key={`${tile.x}-${tile.y}`} {...tile} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f1a",
    alignItems: "center",
    justifyContent: "center",
  },
  animation: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    borderColor: "#164052",
    alignItems: "center",
  },
  rotatingArc: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 3,
    borderColor: "transparent",
    borderTopColor: "#22D3EE",
    borderRightColor: "#22D3EE",
    shadowColor: "#22D3EE",
    shadowOpacity: 0.9,
    shadowRadius: 7,
    elevation: 5,
  },
  arcHead: {
    position: "absolute",
    top: -5,
    right: RING_SIZE * 0.19,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#A5F3FC",
    shadowColor: "#22D3EE",
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  grid: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    position: "relative",
  },
  tile: {
    position: "absolute",
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 5,
    borderWidth: 1,
  },
});
