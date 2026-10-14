import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PointexLogo from "../components/PointexLogo";

type SplashScreenProps = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const insets = useSafeAreaInsets();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(-16)).current;
  const boardOpacity = useRef(new Animated.Value(0)).current;
  const boardScale = useRef(new Animated.Value(0.88)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let mounted = true;

    const animation = Animated.sequence([
      // Apparition du logo
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

      // Apparition du plateau 3D
      Animated.parallel([
        Animated.timing(boardOpacity, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.spring(boardScale, {
          toValue: 1,
          speed: 1.2,
          bounciness: 3,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),

      // Courte pause pour laisser apprécier le visuel
      Animated.delay(900),

      // Fondu de sortie
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished && mounted) {
        onFinish();
      }
    });

    return () => {
      mounted = false;
      animation.stop();
    };
  }, [
    boardOpacity,
    boardScale,
    glowOpacity,
    logoOpacity,
    logoTranslateY,
    onFinish,
    screenOpacity,
  ]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
          opacity: screenOpacity,
        },
      ]}
    >
      <View style={styles.header}>
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslateY }],
          }}
        >
          <PointexLogo />
        </Animated.View>

        <Animated.View
          style={[styles.taglineContainer, { opacity: logoOpacity }]}
        >
          <Text style={styles.tagline}>CONNECT THE DOTS. OWN THE GAME.</Text>
        </Animated.View>
      </View>

      <View style={styles.boardContainer}>
        <Animated.Image
          source={require("../assets/images/game-board.png")}
          resizeMode="contain"
          style={[
            styles.board,
            {
              opacity: boardOpacity,
              transform: [{ scale: boardScale }],
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Animated.View style={[styles.loadingTrack, { opacity: boardOpacity }]}>
          <Animated.View
            style={[styles.loadingBar, { opacity: glowOpacity }]}
          />
        </Animated.View>

        <Text style={styles.footerText}>PREPARING YOUR GAME</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    gap: 12,
    zIndex: 1,
  },
  taglineContainer: {
    alignItems: "center",
  },
  tagline: {
    color: "#64748b",
    fontFamily: "RussoOne",
    fontSize: 9,
    letterSpacing: 2,
    textAlign: "center",
  },
  boardContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  board: {
    width: "100%",
    height: "100%",
    maxWidth: 440,
    maxHeight: 500,
    zIndex: 1,
  },
  glow: {
    position: "absolute",
    width: "75%",
    height: "55%",
    borderRadius: 999,
    backgroundColor: "#075985",
    shadowColor: "#22D3EE",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 70,
    elevation: 12,
  },
  footer: {
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  loadingTrack: {
    width: 110,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#1e293b",
    overflow: "hidden",
  },
  loadingBar: {
    flex: 1,
    backgroundColor: "#22D3EE",
  },
  footerText: {
    fontFamily: "RussoOne",
    fontSize: 9,
    letterSpacing: 2,
    color: "#64748b",
  },
});
