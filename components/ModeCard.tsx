import { ReactNode } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CaretRight } from "phosphor-react-native";

type ModeCardProps = {
  title: string;
  description: string;
  character: ReactNode;
  onPress: () => void;
};

export default function ModeCard({
  title,
  description,
  character,
  onPress,
}: ModeCardProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: "100%",
        transform: [
          {
            translateY: pressed ? 5 : 0,
          },
        ],
      })}
    >
      <View
        style={{
          width: "100%",
          minHeight: 108,
          overflow: "hidden",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "rgba(34, 211, 238, 0.40)",

          shadowColor: "#0f172a",
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 5,
        }}
      >
        <LinearGradient
          colors={["#1f2937", "#0b1220"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            minHeight: 108,
            paddingHorizontal: isCompact ? 12 : 20,
            paddingVertical: isCompact ? 12 : 18,
          }}
        >
          {/* Top highlight */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: "rgba(255, 255, 255, 0.20)",
            }}
          />

          <View
            style={{
              flex: 1,
              minHeight: 70,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {/* Character */}
            <View
              style={{
                width: isCompact ? 40 : 48,
                marginRight: isCompact ? 12 : 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {character}
            </View>

            {/* Text */}
            <View
              style={{
                flex: 1,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "RussoOne",
                  fontSize: isCompact ? 18 : 20,
                  lineHeight: isCompact ? 23 : 25,
                  color: "#f1f5f9",
                }}
              >
                {title}
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  fontSize: isCompact ? 12 : 14,
                  lineHeight: isCompact ? 18 : 20,
                  color: "#94a3b8",
                }}
              >
                {description}
              </Text>
            </View>

            {/* Arrow */}
            <View
              style={{
                marginLeft: isCompact ? 6 : 12,
              }}
            >
              <CaretRight size={22} weight="bold" color="#22d3ee" />
            </View>
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
}
