import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { useLocation } from "react-router-native";

import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "./mobileSettings";

const MUSIC = require("../assets/sounds/pointex-shuffle-sound.m4a");
const VICTORY = require("../assets/sounds/pointex-victory-sound.m4a");
const DEFEAT = require("../assets/sounds/pointex-defeat-sound.m4a");

type PointexAudioContextValue = {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  playGameEnd: (result: "victory" | "defeat") => void;
  playPointSound: () => void;
};

const PointexAudioContext = createContext<PointexAudioContextValue | null>(
  null,
);

export function PointexAudioProvider({ children }: { children: ReactNode }) {
  const musicPlayer = useAudioPlayer(MUSIC);
  const victoryPlayer = useAudioPlayer(VICTORY);
  const defeatPlayer = useAudioPlayer(DEFEAT);
  const { pathname } = useLocation();

  const [soundEnabled, setSoundEnabledState] = useState(
    DEFAULT_SETTINGS.soundEnabled,
  );

  const playPointSound = useCallback(() => {
    if (!soundEnabled) return;

    // Le lecteur du son de placement sera ajouté
    // lorsque le fichier audio sera disponible.
  }, [soundEnabled]);

  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initializeAudio() {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: "doNotMix",
        });

        const settings = await loadSettings();

        if (!mounted) return;

        setSoundEnabledState(settings.soundEnabled);
        setSettingsLoaded(true);
      } catch (error) {
        console.error("Failed to initialize audio:", error);
        if (mounted) setSettingsLoaded(true);
      }
    }

    void initializeAudio();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    musicPlayer.loop = true;
    musicPlayer.volume = 0.25;

    victoryPlayer.volume = 0.8;
    defeatPlayer.volume = 0.8;
  }, [musicPlayer, victoryPlayer, defeatPlayer]);

  useEffect(() => {
    if (!settingsLoaded) return;

    if (!soundEnabled || pathname === "/game") {
      musicPlayer.pause();
      return;
    }

    musicPlayer.play();
  }, [settingsLoaded, soundEnabled, pathname, musicPlayer]);

  const setSoundEnabled = useCallback(async (enabled: boolean) => {
    setSoundEnabledState(enabled);

    try {
      const currentSettings = await loadSettings();

      await saveSettings({
        ...currentSettings,
        soundEnabled: enabled,
      });
    } catch (error) {
      console.error("Failed to save sound setting:", error);
    }
  }, []);

  const playGameEnd = useCallback(
    (result: "victory" | "defeat") => {
      if (!soundEnabled) return;

      const effect = result === "victory" ? victoryPlayer : defeatPlayer;

      void effect
        .seekTo(0)
        .then(() => {
          if (soundEnabled) {
            effect.play();
          }
        })
        .catch((error) => {
          console.error("Failed to play game-end sound:", error);
        });
    },
    [soundEnabled, victoryPlayer, defeatPlayer],
  );

  return (
    <PointexAudioContext.Provider
      value={{ soundEnabled, setSoundEnabled, playGameEnd, playPointSound }}
    >
      {children}
    </PointexAudioContext.Provider>
  );
}

export function usePointexAudio() {
  const context = useContext(PointexAudioContext);

  if (!context) {
    throw new Error("usePointexAudio must be used inside PointexAudioProvider");
  }

  return context;
}
