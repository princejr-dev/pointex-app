import { Text, View, useWindowDimensions } from "react-native";

type ScoreBoardProps = {
  blueScore: number;
  redScore: number;
  isBlueTurn: boolean;
  aiDifficulty?: string;
  showAiThinking?: boolean;
};

function ScorePoint({ color, size }: { color: string; size: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        backgroundColor: color,
      }}
    />
  );
}

export default function ScoreBoard({
  blueScore,
  redScore,
  isBlueTurn,
  aiDifficulty,
  showAiThinking = false,
}: ScoreBoardProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  return (
    <View style={{ alignItems: "center", marginTop: isCompact ? 6 : 12 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: isCompact ? 8 : 14,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ScorePoint color="#3b82f6" size={isCompact ? 16 : 20} />

          <Text
            style={{
              fontFamily: "RussoOne",
              fontSize: isCompact ? 28 : 34,
              color: "#ffffff",
            }}
          >
            {blueScore}
          </Text>
        </View>

        <Text
          style={{
            fontFamily: "RussoOne",
            fontSize: isCompact ? 18 : 22,
            color: "#ffffff",
          }}
        >
          -
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Text
            style={{
              fontFamily: "RussoOne",
              fontSize: isCompact ? 28 : 34,
              color: "#ffffff",
            }}
          >
            {redScore}
          </Text>

          <ScorePoint color="#ef4444" size={isCompact ? 16 : 20} />
        </View>
      </View>

      <View
        style={{
          marginTop: isCompact ? 5 : 8,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: isBlueTurn
            ? "rgba(59, 130, 246, 0.40)"
            : "rgba(239, 68, 68, 0.40)",
          backgroundColor: isBlueTurn
            ? "rgba(59, 130, 246, 0.10)"
            : "rgba(239, 68, 68, 0.10)",
          paddingHorizontal: isCompact ? 12 : 18,
          paddingVertical: isCompact ? 5 : 7,
        }}
      >
        <Text
          style={{
            fontFamily: "RussoOne",
            fontSize: 12,
            letterSpacing: 1,
            color: isBlueTurn ? "#60a5fa" : "#f87171",
          }}
        >
          {showAiThinking
            ? "AI'S TURN"
            : isBlueTurn
              ? "BLUE'S TURN"
              : "RED'S TURN"}
        </Text>
      </View>
    </View>
  );
}
