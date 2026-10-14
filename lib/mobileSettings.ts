import AsyncStorage from "@react-native-async-storage/async-storage";

export type GridSize = 7 | 11 | 15;

export type AiDifficulty = "easy" | "medium" | "hard";

export type GameSettings = {
  gridSize: GridSize;
  aiDifficulty: AiDifficulty;
  soundEnabled: boolean;
};

export const DEFAULT_GRID_SIZE: GridSize = 11;

export const GRID_SIZE_OPTIONS: GridSize[] = [7, 11, 15];

export const DEFAULT_SETTINGS: GameSettings = {
  gridSize: DEFAULT_GRID_SIZE,
  aiDifficulty: "medium",
  soundEnabled: true,
};

const STORAGE_KEY = "pointex-settings";

function isGridSize(value: unknown): value is GridSize {
  return value === 7 || value === 11 || value === 15;
}

function isAiDifficulty(value: unknown): value is AiDifficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

export async function loadSettings(): Promise<GameSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    const parsed: Partial<GameSettings> = JSON.parse(raw);

    const gridSize = isGridSize(parsed.gridSize)
      ? parsed.gridSize
      : DEFAULT_SETTINGS.gridSize;

    const aiDifficulty = isAiDifficulty(parsed.aiDifficulty)
      ? parsed.aiDifficulty
      : DEFAULT_SETTINGS.aiDifficulty;

    const soundEnabled =
      typeof parsed.soundEnabled === "boolean"
        ? parsed.soundEnabled
        : DEFAULT_SETTINGS.soundEnabled;

    return {
      gridSize,
      aiDifficulty,
      soundEnabled,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(
  settings: GameSettings
): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(settings)
  );
}
