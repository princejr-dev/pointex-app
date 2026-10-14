import { useFonts } from "expo-font";

export function usePointexFonts() {
  return useFonts({
    RussoOne: require("../assets/fonts/RussoOne-Regular.ttf"),
  });
}
