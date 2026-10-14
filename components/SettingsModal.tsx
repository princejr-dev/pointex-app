import { ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { ArrowLeft, SpeakerHigh, SpeakerSlash } from "phosphor-react-native";

import {
  DEFAULT_SETTINGS,
  GRID_SIZE_OPTIONS,
  type AiDifficulty,
  type GameSettings,
  type GridSize,
} from "../lib/mobileSettings";

type SettingsModalProps = {
  visible: boolean;
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onClose: () => void;
};

const DIFFICULTY_OPTIONS: {
  value: AiDifficulty;
  label: string;
  description: string;
}[] = [
  {
    value: "easy",
    label: "Easy",
    description: "Makes occasional mistakes.",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Balanced heuristic opponent.",
  },
  {
    value: "hard",
    label: "Hard",
    description: "Prioritizes blocks and setups.",
  },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <View>
      <Text
        style={{
          marginBottom: 12,
          fontFamily: "RussoOne",
          fontSize: 18,
          color: "#ffffff",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          marginBottom: 16,
          fontSize: 14,
          lineHeight: 20,
          color: "#94a3b8",
        }}
      >
        {description}
      </Text>

      {children}
    </View>
  );
}

function GridSizeOption({
  size,
  active,
  onPress,
}: {
  size: GridSize;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: active ? "#0ea5e9" : "#334155",
        backgroundColor: active ? "rgba(14, 165, 233, 0.15)" : "#111827",
      }}
    >
      <Text
        style={{
          fontFamily: "RussoOne",
          fontSize: 14,
          color: active ? "#7dd3fc" : "#cbd5e1",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {size}×{size}
      </Text>
    </Pressable>
  );
}

export default function SettingsModal({
  visible,
  settings,
  onChange,
  onClose,
}: SettingsModalProps) {
  const update = (patch: Partial<GameSettings>) => {
    onChange({
      ...settings,
      ...patch,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(2, 6, 23, 0.82)",
          paddingHorizontal: 20,
          paddingVertical: 24,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            maxHeight: "90%",
            overflow: "hidden",
            borderRadius: 22,
            borderWidth: 1,
            borderColor: "rgba(34, 211, 238, 0.35)",
            backgroundColor: "#0b1220",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 10,
            },
            shadowOpacity: 0.45,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* HEADER */}
          <View
            style={{
              height: 68,
              paddingHorizontal: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomColor: "rgba(51, 65, 85, 0.7)",
            }}
          >
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                alignItems: "flex-start",
                justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <ArrowLeft size={25} weight="bold" color="#cbd5e1" />
            </Pressable>

            <Text
              style={{
                fontFamily: "RussoOne",
                fontSize: 22,
                color: "#0ea5e9",
              }}
            >
              SETTINGS
            </Text>

            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 28,
              paddingBottom: 24,
              gap: 28,
            }}
          >
            {/* GRID SIZE */}
            <Section
              title="Grid Size"
              description="Number of points per side. Larger boards last longer."
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                }}
              >
                {GRID_SIZE_OPTIONS.map((size) => (
                  <GridSizeOption
                    key={size}
                    size={size}
                    active={settings.gridSize === size}
                    onPress={() =>
                      update({
                        gridSize: size,
                      })
                    }
                  />
                ))}
              </View>
            </Section>

            {/* AI DIFFICULTY */}
            <Section
              title="AI Difficulty"
              description="Used in AI mode. Human mode is unaffected."
            >
              <View style={{ gap: 12 }}>
                {DIFFICULTY_OPTIONS.map((option) => {
                  const active = settings.aiDifficulty === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() =>
                        update({
                          aiDifficulty: option.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: 16,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: active ? "#06b6d4" : "#334155",
                        backgroundColor: active
                          ? "rgba(6, 182, 212, 0.10)"
                          : "#111827",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "RussoOne",
                          fontSize: 16,
                          color: "#ffffff",
                        }}
                      >
                        {option.label}
                      </Text>

                      <Text
                        style={{
                          marginTop: 4,
                          fontSize: 14,
                          lineHeight: 20,
                          color: "#94a3b8",
                        }}
                      >
                        {option.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Section>

            {/* SOUND EFFECTS */}
            <Section
              title="Sound Effects"
              description="Enable or disable game sound effects."
            >
              <Pressable
                onPress={() =>
                  update({
                    soundEnabled: !settings.soundEnabled,
                  })
                }
                style={{
                  width: "100%",
                  minHeight: 58,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: settings.soundEnabled
                    ? "rgba(16, 185, 129, 0.40)"
                    : "rgba(239, 68, 68, 0.40)",
                  backgroundColor: settings.soundEnabled
                    ? "rgba(16, 185, 129, 0.10)"
                    : "rgba(239, 68, 68, 0.10)",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#ffffff",
                    fontFamily: "RussoOne",
                  }}
                >
                  {settings.soundEnabled ? "Enabled" : "Disabled"}
                </Text>

                {settings.soundEnabled ? (
                  <SpeakerHigh size={22} weight="bold" color="#34d399" />
                ) : (
                  <SpeakerSlash size={22} weight="bold" color="#ef4444" />
                )}
              </Pressable>
            </Section>

            {/* RESET */}
            <Pressable
              onPress={() => onChange(DEFAULT_SETTINGS)}
              style={{
                minHeight: 50,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#334155",
                paddingHorizontal: 16,
              }}
            >
              <Text
                style={{
                  fontFamily: "RussoOne",
                  fontSize: 13,
                  color: "#94a3b8",
                }}
              >
                Reset to defaults
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
