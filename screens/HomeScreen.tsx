import { useEffect, useState } from "react";
import { Text, View, ScrollView, useWindowDimensions } from "react-native";
import { useNavigate } from "react-router-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gear } from "phosphor-react-native";

import AnimatedFabricBackground from "../components/AnimatedFabricBackground";
import PointexLogo from "../components/PointexLogo";
import ModeCard from "../components/ModeCard";
import ModeCharacter from "../components/ModeCharacter";
import GameIconButton from "../components/GameIconButton";
import SettingsModal from "../components/SettingsModal";
import GameButton from "../components/GameButton";
import GameModal from "../components/GameModal";
import { usePointexAudio } from "../lib/PointexAudio";

import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type GameSettings,
} from "../lib/mobileSettings";

export default function HomeScreen() {
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();

  const { height } = useWindowDimensions();
  const { setSoundEnabled } = usePointexAudio();

  const isCompactScreen = height < 750;
  const isVeryShortScreen = height < 650;

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [showOnlineUnavailable, setShowOnlineUnavailable] = useState(false);

  useEffect(() => {
    let mounted = true;

    loadSettings().then((savedSettings) => {
      if (mounted) {
        setSettings(savedSettings);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSettingsChange = (nextSettings: GameSettings) => {
    setSettings(nextSettings);

    void saveSettings(nextSettings);

    if (nextSettings.soundEnabled !== settings.soundEnabled) {
      void setSoundEnabled(nextSettings.soundEnabled);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0b0f1a",
      }}
    >
      <AnimatedFabricBackground />

      {/* CONTENT */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: insets.top + (isVeryShortScreen ? 4 : 12),
          paddingBottom: insets.bottom + (isVeryShortScreen ? 4 : 16),
        }}
      >
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <PointexLogo />

          <GameIconButton
            icon={<Gear size={30} weight="bold" color="#22d3ee" />}
            onPress={() => setSettingsVisible(true)}
          />
        </View>

        {/* GAME MODES */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingVertical: isVeryShortScreen ? 8 : 0,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              fontFamily: "RussoOne",
              color: "#f1f5f9",
              textAlign: "center",
              fontSize: isVeryShortScreen ? 21 : isCompactScreen ? 24 : 28,
              lineHeight: isVeryShortScreen ? 27 : isCompactScreen ? 30 : 34,
              marginBottom: isVeryShortScreen ? 10 : isCompactScreen ? 16 : 28,
            }}
          >
            CHOOSE GAME MODE
          </Text>

          <View
            style={{
              width: "100%",
              gap: isVeryShortScreen ? 8 : isCompactScreen ? 12 : 20,
            }}
          >
            <ModeCard
              title="AI MODE"
              description="Play against the computer."
              character={<ModeCharacter type="ai" />}
              onPress={() =>
                navigate("/game", {
                  state: {
                    mode: "ai",
                  },
                })
              }
            />

            <ModeCard
              title="HUMAN MODE"
              description="Two players on the same device."
              character={<ModeCharacter type="human" />}
              onPress={() =>
                navigate("/game", {
                  state: {
                    mode: "human",
                  },
                })
              }
            />

            <ModeCard
              title="ONLINE MODE"
              description="Play against other players online."
              character={<ModeCharacter type="online" />}
              onPress={() => setShowOnlineUnavailable(true)}
            />
          </View>
        </ScrollView>
      </View>

      {/* SETTINGS */}
      <SettingsModal
        visible={settingsVisible}
        settings={settings}
        onChange={handleSettingsChange}
        onClose={() => setSettingsVisible(false)}
      />

      {/* ONLINE UNAVAILABLE */}
      {showOnlineUnavailable && (
        <GameModal
          visible={showOnlineUnavailable}
          title="ONLINE MODE"
          onClose={() => setShowOnlineUnavailable(false)}
        >
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 22,
                color: "#cbd5e1",
                fontFamily: "RussoOne",
                textAlign: "center",
              }}
            >
              Online Mode is not available yet.
            </Text>

            <View style={{ width: "100%", marginTop: 24 }}>
              <GameButton
                nameId="OK"
                colors={["#1f2937", "#0b1220"]}
                borderColor="rgba(34, 211, 238, 0.40)"
                onPress={() => setShowOnlineUnavailable(false)}
              />
            </View>
          </View>
        </GameModal>
      )}
    </View>
  );
}
