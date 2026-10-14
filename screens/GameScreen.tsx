import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useLocation, useNavigate } from "react-router-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Trophy, Scales } from "phosphor-react-native";

import GameModal from "../components/GameModal";
import ConfirmModal from "../components/ConfirmModal";
import GameButton from "../components/GameButton";
import PointexGrid from "../components/PointexGrid";

import Board from "../components/game/Board";
import GameFooter from "../components/game/GameFooter";
import ScoreBoard from "../components/game/ScoreBoard";

import {
  applyMove,
  getInitialState,
  withCurrentPlayer,
  type GameState,
} from "../lib/engine";

import { calculateAiMove } from "../lib/aiWorker";
import { usePointexAudio } from "../lib/PointexAudio";
import LoadingAnimation from "../components/game/LoadingAnimation";

import {
  DEFAULT_SETTINGS,
  loadSettings,
  type GameSettings,
} from "../lib/mobileSettings";

type GameMode = "human" | "ai";

const TUTORIAL_GRID_SIZE = 7;

export default function GameScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const insets = useSafeAreaInsets();

  const { width, height } = useWindowDimensions();
  const isCompact = width < 360;
  const isShortScreen = height < 700;

  const mode = location.state?.mode as GameMode | undefined;

  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const { soundEnabled, setSoundEnabled, playGameEnd } = usePointexAudio();

  const [boardReady, setBoardReady] = useState(false);

  const [state, setState] = useState<GameState>(() =>
    getInitialState(DEFAULT_SETTINGS.gridSize),
  );
  const stateRef = useRef(state);

  const [showGameOver, setShowGameOver] = useState(false);
  const [replayVisible, setReplayVisible] = useState(false);

  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialFeedback, setTutorialFeedback] = useState("");

  const [tutorialState, setTutorialState] = useState<GameState>(() =>
    getInitialState(TUTORIAL_GRID_SIZE),
  );

  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialPointIndex, setTutorialPointIndex] = useState(0);

  const tutorialPoints = [
    { row: 4, col: 4 },
    { row: 4, col: 5 },
    { row: 5, col: 4 },
    { row: 5, col: 5 },
  ];

  const tutorialTarget = tutorialPoints[tutorialPointIndex] ?? null;

  const openTutorial = () => {
    setTutorialState(getInitialState(TUTORIAL_GRID_SIZE));
    setTutorialPointIndex(0);
    setTutorialStep(0);
    setShowTutorial(true);
    setTutorialFeedback("");
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    setTutorialFeedback("");
  };

  const handleTutorialMove = (row: number, col: number) => {
    if (tutorialStep === 0 || tutorialStep === 3) return;

    const target = tutorialPoints[tutorialPointIndex];

    if (!target || target.row !== row || target.col !== col) {
      return;
    }

    const nextState = applyMove(tutorialState, row, col);

    if (nextState === tutorialState) return;

    // Le tutoriel place tous les points en bleu.
    // Cela n'affecte pas le moteur ni la partie réelle.
    const tutorialNextState = withCurrentPlayer(nextState, "blue");

    setTutorialState(tutorialNextState);

    const nextIndex = tutorialPointIndex + 1;
    setTutorialPointIndex(nextIndex);

    setTutorialFeedback(
      nextIndex === tutorialPoints.length
        ? "Square completed! +1 point"
        : "Good move! Follow the next highlight.",
    );

    if (nextIndex === 1) {
      setTutorialStep(1);
    } else if (nextIndex === tutorialPoints.length) {
      setTutorialStep(3);
    } else {
      setTutorialStep(2);
    }
  };

  const replayOpacity = useRef(new Animated.Value(0)).current;
  const replayTranslateY = useRef(new Animated.Value(20)).current;
  const replayAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const replayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [replayAnimating, setReplayAnimating] = useState(false);
  const [replayColor, setReplayColor] = useState<"blue" | "red">("blue");

  // GAME OVER ANIMATIONS
  const gameOverOpacity = useRef(new Animated.Value(0)).current;
  const gameOverScale = useRef(new Animated.Value(0.82)).current;
  const trophyScale = useRef(new Animated.Value(0.4)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;
  const actionsTranslateY = useRef(new Animated.Value(12)).current;

  const gameOverAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeGame = async () => {
      try {
        const savedSettings = await loadSettings();

        if (!mounted) return;

        const initialState = getInitialState(savedSettings.gridSize);

        setSettings(savedSettings);
        stateRef.current = initialState;
        setState(initialState);
      } catch (error) {
        console.error("Failed to initialize game:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void initializeGame();

    return () => {
      mounted = false;
    };
  }, []);

  // ANIMATE REPLAY
  const animateReplay = useCallback(
    (player: "blue" | "red") => {
      setReplayColor(player);
      replayAnimationRef.current?.stop();
      setReplayAnimating(true);

      if (replayTimeoutRef.current) {
        clearTimeout(replayTimeoutRef.current);
      }

      replayOpacity.setValue(0);
      replayTranslateY.setValue(20);
      setReplayVisible(true);

      replayAnimationRef.current = Animated.parallel([
        Animated.sequence([
          Animated.timing(replayOpacity, {
            toValue: 1,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(replayOpacity, {
            toValue: 0,
            duration: 800,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(replayTranslateY, {
          toValue: -200,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]);

      replayAnimationRef.current.start(({ finished }) => {
        if (finished) {
          setReplayVisible(false);
          setReplayAnimating(false);
        }
      });
    },
    [replayOpacity, replayTranslateY],
  );

  /* ANIMATION CLEANUP */
  useEffect(() => {
    return () => {
      replayAnimationRef.current?.stop();

      if (replayTimeoutRef.current) {
        clearTimeout(replayTimeoutRef.current);
      }
    };
  }, []);

  /*
   * AI TURN
   */
  // AI TURN
  useEffect(() => {
    if (mode !== "ai") return;
    if (state.gameOver) return;
    if (state.isBlueTurn) return;
    if (replayAnimating) return;
    if (isLoading) return;

    let cancelled = false;

    const idleCallback = requestIdleCallback(() => {
      if (cancelled) return;

      calculateAiMove(state, settings.aiDifficulty).then((move) => {
        if (cancelled || !move) return;

        const currentState = stateRef.current;

        if (currentState.gameOver || currentState.isBlueTurn) {
          return;
        }

        const nextState = applyMove(currentState, move.row, move.col);

        const createdSquare =
          nextState.score.blue + nextState.score.red >
          currentState.score.blue + currentState.score.red;

        stateRef.current = nextState;
        setState(nextState);

        if (createdSquare && !nextState.gameOver) {
          animateReplay(nextState.isBlueTurn ? "blue" : "red");
          setReplayAnimating(true);
        }
      });
    });

    return () => {
      cancelled = true;
      cancelIdleCallback(idleCallback);
    };
  }, [mode, state, settings.aiDifficulty, animateReplay, replayAnimating]);

  /*
   * GAME OVER
   */
  useEffect(() => {
    if (!state.gameOver) return;

    setShowGameOver(true);
  }, [state.gameOver]);

  useEffect(() => {
    if (!showGameOver) {
      gameOverAnimationRef.current?.stop();
      return;
    }

    gameOverAnimationRef.current?.stop();

    gameOverOpacity.setValue(0);
    gameOverScale.setValue(0.82);
    trophyScale.setValue(0.4);
    actionsOpacity.setValue(0);
    actionsTranslateY.setValue(12);

    gameOverAnimationRef.current = Animated.sequence([
      Animated.parallel([
        Animated.timing(gameOverOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(gameOverScale, {
          toValue: 1,
          friction: 7,
          tension: 65,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.sequence([
          Animated.spring(trophyScale, {
            toValue: 1.15,
            friction: 4,
            tension: 120,
            useNativeDriver: true,
          }),
          Animated.spring(trophyScale, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(actionsOpacity, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(actionsTranslateY, {
            toValue: 0,
            duration: 350,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    gameOverAnimationRef.current.start();

    return () => {
      gameOverAnimationRef.current?.stop();
    };
  }, [
    showGameOver,
    gameOverOpacity,
    gameOverScale,
    trophyScale,
    actionsOpacity,
    actionsTranslateY,
  ]);

  /*
   * REPLAY MESSAGE
   */
  useEffect(() => {
    if (!state.gameOver) {
      return;
    }

    setReplayVisible(false);
  }, [state.gameOver]);

  const handleMove = useCallback(
    (row: number, col: number) => {
      const previousState = stateRef.current;

      if (previousState.gameOver) return;

      if (mode === "ai" && !previousState.isBlueTurn) {
        return;
      }

      const nextState = applyMove(previousState, row, col);

      if (nextState === previousState) {
        return;
      }

      const createdSquare =
        nextState.score.blue + nextState.score.red >
        previousState.score.blue + previousState.score.red;

      stateRef.current = nextState;
      setState(nextState);

      if (createdSquare && nextState.isBlueTurn === previousState.isBlueTurn) {
        animateReplay(nextState.isBlueTurn ? "blue" : "red");
      }
    },
    [mode, animateReplay, replayAnimating],
  );

  const handleRetry = () => {
    setShowGameOver(false);
    setReplayVisible(false);

    gameOverAnimationRef.current?.stop();

    gameOverOpacity.setValue(0);
    gameOverScale.setValue(0.82);
    trophyScale.setValue(0.4);
    actionsOpacity.setValue(0);
    actionsTranslateY.setValue(12);

    setState(getInitialState(settings.gridSize));
  };

  const handleBack = () => {
    // Une partie terminée n'a pas besoin de confirmation.
    if (showGameOver) {
      leaveGame();
      return;
    }

    setShowExitConfirmation(true);
  };

  const leaveGame = () => {
    setShowExitConfirmation(false);
    setShowGameOver(false);
    setReplayVisible(false);

    gameOverAnimationRef.current?.stop();

    gameOverOpacity.setValue(0);
    gameOverScale.setValue(0.82);
    trophyScale.setValue(0.4);
    actionsOpacity.setValue(0);
    actionsTranslateY.setValue(12);

    navigate("/");
  };

  const blueScore = state.score.blue;
  const redScore = state.score.red;

  const winner =
    blueScore > redScore
      ? "BLUE WINS"
      : redScore > blueScore
        ? "RED WINS"
        : "DRAW";

  const winnerColor =
    winner === "BLUE WINS"
      ? "#3b82f6"
      : winner === "RED WINS"
        ? "#ef4444"
        : "#facc15";

  const winningScore =
    blueScore > redScore ? blueScore : redScore > blueScore ? redScore : null;

  const handleToggleSound = () => {
    void setSoundEnabled(!soundEnabled);
  };

  const gameEndSoundPlayed = useRef(false);

  useEffect(() => {
    if (!state.gameOver) {
      gameEndSoundPlayed.current = false;
      return;
    }

    setShowGameOver(true);

    if (gameEndSoundPlayed.current) return;
    gameEndSoundPlayed.current = true;

    const result = state.score.blue > state.score.red ? "victory" : "defeat";

    playGameEnd(result);
  }, [state.gameOver, state.score.blue, state.score.red, playGameEnd]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0b0f1a",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* Background */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: "#0e1633",
        }}
      >
        <PointexGrid />
      </View>

      {/* HEADER */}
      <View
        style={{
          width: "100%",
          paddingHorizontal: isCompact ? 12 : 20,
          paddingTop: isShortScreen ? 4 : 10,
          paddingBottom: isShortScreen ? 4 : 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "RussoOne",
              fontSize: isCompact ? 18 : 21,
              color: "#0ea5e9",
            }}
          >
            {mode === "ai" ? "AI MODE" : "HUMAN MODE"}
          </Text>
        </View>
      </View>

      {/* SCORE */}
      <ScoreBoard
        blueScore={blueScore}
        redScore={redScore}
        isBlueTurn={state.isBlueTurn}
        aiDifficulty={settings.aiDifficulty}
        showAiThinking={mode === "ai" && !state.isBlueTurn && !state.gameOver}
      />

      <ConfirmModal
        visible={showExitConfirmation}
        title="QUIT GAME?"
        message="YOUR CURRENT GAME IS STILL IN PROGRESS."
        confirmLabel="QUIT"
        cancelLabel="CONTINUE"
        onConfirm={leaveGame}
        onCancel={() => setShowExitConfirmation(false)}
      />

      {isLoading && (
        <View
          pointerEvents="auto"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 9999,
            elevation: 9999,
            backgroundColor: "#0b0f1a",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "RussoOne",
              fontSize: 18,
              color: "#22d3ee",
              letterSpacing: 2,
            }}
          >
            <LoadingAnimation />
          </Text>
        </View>
      )}

      {/* REPLAY MESSAGE */}
      {replayVisible && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: "65%",
            left: 0,
            right: 0,
            zIndex: 20,
            alignItems: "center",
            opacity: replayOpacity,
            transform: [{ translateY: replayTranslateY }],
          }}
        >
          <Text
            style={{
              fontFamily: "RussoOne",
              fontSize: 34,
              color: replayColor === "blue" ? "#3b82f6" : "#ef4444",
              textShadowColor:
                replayColor === "blue"
                  ? "rgba(59, 130, 246, 0.65)"
                  : "rgba(239, 68, 68, 0.65)",
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 12,
            }}
          >
            REPLAY!
          </Text>
        </Animated.View>
      )}

      {/* BOARD */}
      <Board
        state={state}
        disabled={mode === "ai" && !state.isBlueTurn}
        onMove={handleMove}
      />

      {/* FOOTER */}
      <GameFooter
        onBack={handleBack}
        onHelp={openTutorial}
        onToggleSound={handleToggleSound}
        soundEnabled={soundEnabled}
      />

      {/* INTERACTIVE TUTORIAL */}
      {showTutorial && (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 100,
            elevation: 100,
            backgroundColor: "#0b0f1a",
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 8,
          }}
        >
          <View
            style={{
              paddingHorizontal: 22,
              paddingBottom: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontFamily: "RussoOne",
                fontSize: 20,
                color: "#22d3ee",
              }}
            >
              TUTORIAL
            </Text>

            <Pressable
              onPress={closeTutorial}
              hitSlop={12}
              style={{ padding: 8 }}
            >
              <Text style={{ color: "#e5e7eb", fontSize: 16 }}>CLOSE ×</Text>
            </Pressable>
          </View>

          <View
            style={{
              marginHorizontal: 20,
              marginTop: 8,
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(34, 211, 238, 0.35)",
              backgroundColor: "#111a2e",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: "RussoOne",
                  fontSize: 16,
                  color: "#f1f5f9",
                }}
              >
                {tutorialStep === 0
                  ? "GETTING STARTED"
                  : tutorialStep === 1
                    ? "PLACE YOUR POINT"
                    : tutorialStep === 2
                      ? "COMPLETE THE SQUARE"
                      : "TUTORIAL COMPLETE"}
              </Text>

              <Text
                style={{
                  color: "#22d3ee",
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                {tutorialStep === 0 ? "READY" : `STEP ${tutorialStep} OF 3`}
              </Text>
            </View>

            <View
              style={{
                height: 4,
                width: "100%",
                borderRadius: 4,
                overflow: "hidden",
                backgroundColor: "#263349",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  height: "100%",
                  width:
                    tutorialStep === 0
                      ? "0%"
                      : tutorialStep === 1
                        ? "33.33%"
                        : tutorialStep === 2
                          ? "66.66%"
                          : "100%",
                  borderRadius: 4,
                  backgroundColor: "#22d3ee",
                }}
              />
            </View>

            <Text
              style={{
                color: "#cbd5e1",
                fontSize: 14,
                lineHeight: 21,
              }}
            >
              {tutorialStep === 0
                ? "Learn the basics of Pointex before starting a real game."
                : tutorialStep === 1
                  ? "Tap the glowing intersection to place your first point."
                  : tutorialStep === 2
                    ? `Keep following the highlighted intersections. ${tutorialPointIndex} of 4 points placed.`
                    : "You completed a square and earned one point. In a real game, completing a square also gives you another turn."}
            </Text>
          </View>

          {tutorialFeedback !== "" && (
            <Text
              style={{
                marginHorizontal: 24,
                marginTop: 8,
                textAlign: "center",
                color: "#22d3ee",
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              {tutorialFeedback}
            </Text>
          )}

          <View style={{ flex: 1 }}>
            <Board
              state={tutorialState}
              disabled={tutorialStep === 0 || tutorialStep === 3}
              highlightedPoint={
                tutorialStep === 1 || tutorialStep === 2 ? tutorialTarget : null
              }
              onMove={handleTutorialMove}
            />
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
            <GameButton
              nameId={
                tutorialStep === 0
                  ? "START"
                  : tutorialStep === 3
                    ? "FINISH"
                    : "FOLLOW THE HIGHLIGHT"
              }
              colors={["#0891b2", "#0e7490"]}
              borderColor="rgba(34, 211, 238, 0.6)"
              onPress={() => {
                if (tutorialStep === 0) {
                  setTutorialStep(1);
                } else if (tutorialStep === 3) {
                  closeTutorial();
                }
              }}
            />
          </View>
        </View>
      )}

      {/* GAME OVER */}
      <GameModal visible={showGameOver} onClose={handleRetry} animated>
        <Animated.View
          style={{
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "RussoOne",
              fontSize: 30,
              color: "#e5e7eb",
              letterSpacing: 2,
            }}
          >
            GAME OVER!
          </Text>

          <Text
            style={{
              marginTop: 20,
              fontFamily: "RussoOne",
              fontSize: 28,
              color: winnerColor,
            }}
          >
            {winner}
          </Text>

          <Animated.View
            style={{
              transform: [{ scale: trophyScale }],
            }}
          >
            {winner === "BLUE WINS" && (
              <>
                <Trophy size={24} weight="fill" color="#3b82f6" />

                <Text
                  style={{
                    fontFamily: "RussoOne",
                    fontSize: 18,
                    color: "#ffffff",
                  }}
                >
                  Score: {winningScore}
                </Text>
              </>
            )}

            {winner === "RED WINS" && (
              <>
                <Trophy size={24} weight="fill" color="#ef4444" />

                <Text
                  style={{
                    fontFamily: "RussoOne",
                    fontSize: 18,
                    color: "#ffffff",
                  }}
                >
                  Score: {winningScore}
                </Text>
              </>
            )}

            {winner === "DRAW" && (
              <>
                <Scales size={24} weight="bold" color="#facc15" />

                <Text
                  style={{
                    fontFamily: "RussoOne",
                    fontSize: 18,
                    color: "#facc15",
                  }}
                >
                  DRAW
                </Text>
              </>
            )}
          </Animated.View>

          <Animated.View
            style={{
              width: "100%",
              flexDirection: "row",
              gap: 12,
              marginTop: 28,
              opacity: actionsOpacity,
              transform: [{ translateY: actionsTranslateY }],
            }}
          >
            <GameButton
              nameId="MAIN MENU"
              colors={["#475569", "#1e293b"]}
              borderColor="rgba(100, 116, 139, 0.5)"
              onPress={handleBack}
            />

            <GameButton
              nameId="TRY AGAIN"
              colors={["#ef4444", "#0b1220"]}
              borderColor="rgba(239, 68, 68, 0.40)"
              onPress={handleRetry}
            />
          </Animated.View>
        </Animated.View>
      </GameModal>
    </View>
  );
}
