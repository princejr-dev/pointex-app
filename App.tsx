import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NativeRouter, Routes, Route } from "react-router-native";

import HomeScreen from "./screens/HomeScreen";
import GameScreen from "./screens/GameScreen";

import { usePointexFonts } from "./lib/fonts";
import { PointexAudioProvider } from "./lib/PointexAudio";

export default function App() {
  const [fontsLoaded] = usePointexFonts();
  if (!fontsLoaded) {
    return <View className="flex-1 bg-[#0B0F1A]" />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />

      <NativeRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <PointexAudioProvider>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/game" element={<GameScreen />} />
          </Routes>
        </PointexAudioProvider>
      </NativeRouter>
    </SafeAreaProvider>
  );
}
