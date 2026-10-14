import { View, Text, useWindowDimensions } from "react-native";
import { CaretLeft, SpeakerHigh, SpeakerSlash } from "phosphor-react-native";

import GameIconButton from "../GameIconButton";

type GameFooterProps = {
  onBack: () => void;
  onHelp: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
};

export default function GameFooter({
  onBack,
  onHelp,
  onToggleSound,
  soundEnabled,
}: GameFooterProps) {
  const { width, height } = useWindowDimensions();
  const isCompact = width < 360;
  const isShortScreen = height < 700;

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: isCompact ? 12 : 20,
        paddingTop: isShortScreen ? 8 : 16,
        paddingBottom: isShortScreen ? 4 : 8,
      }}
    >
      {/* BACK — LEFT */}
      <GameIconButton
        icon={<CaretLeft size={26} color="#e5e7eb" weight="bold" />}
        onPress={onBack}
      />

      {/* HELP + SOUND — RIGHT */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: isCompact ? 6 : 10,
        }}
      >
        <GameIconButton
          icon={
            <Text
              style={{
                fontFamily: "RussoOne",
                fontSize: 22,
                color: "#60a5fa",
              }}
            >
              ?
            </Text>
          }
          onPress={onHelp}
        />

        <GameIconButton
          icon={
            soundEnabled ? (
              <SpeakerHigh size={22} color="#60a5fa" weight="bold" />
            ) : (
              <SpeakerSlash size={22} color="#94a3b8" weight="bold" />
            )
          }
          onPress={onToggleSound}
        />
      </View>
    </View>
  );
}
