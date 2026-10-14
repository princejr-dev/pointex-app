import { View, Text } from "react-native";
import { memo, useMemo, useRef, useEffect, useState } from "react";
import Point from "./Point";
import type { GameState } from "../../lib/engine";

type BoardProps = {
  state: GameState;
  disabled?: boolean;
  highlightedPoint?: { row: number; col: number } | null;
  onMove: (row: number, col: number) => void;
  onBoardReady?: () => void;
};

type GridLinesProps = {
  gridSize: number;
  cellSize: number;
  boardSize: number;
};

const GridLines = memo(function GridLines({
  gridSize,
  cellSize,
  boardSize,
}: GridLinesProps) {
  const lines = useMemo(
    () => Array.from({ length: gridSize }, (_, index) => index),
    [gridSize],
  );

  return (
    <>
      {lines.map((index) => {
        const position = index * cellSize;

        return (
          <View
            key={`vertical-${index}`}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: position,
              top: 0,
              width: 1,
              height: boardSize,
              backgroundColor: "rgba(100, 116, 139, 0.8)",
            }}
          />
        );
      })}

      {lines.map((index) => {
        const position = index * cellSize;

        return (
          <View
            key={`horizontal-${index}`}
            pointerEvents="none"
            style={{
              position: "absolute",
              top: position,
              left: 0,
              height: 1,
              width: boardSize,
              backgroundColor: "rgba(100, 116, 139, 0.8)",
            }}
          />
        );
      })}
    </>
  );
});

export default function Board({
  state,
  disabled = false,
  highlightedPoint = null,
  onMove,
  onBoardReady,
}: BoardProps) {
  const gridSize = state.grid.length;
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });

  const availableWidth = Math.max(0, containerSize.width - 32);
  const availableHeight = Math.max(0, containerSize.height - 16);

  const boardSize = Math.min(availableWidth, availableHeight);
  const cellSize = boardSize / (gridSize - 1);
  const hasReportedReady = useRef(false);

  const pointPositions = useMemo(
    () =>
      Array.from({ length: gridSize * gridSize }, (_, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;

        return {
          row,
          col,
          style: {
            left: col * cellSize - 6,
            top: row * cellSize - 6,
          },
        };
      }),
    [gridSize, cellSize],
  );

  // Notify parent when the board is ready (i.e., has a valid size)
  useEffect(() => {
    if (boardSize <= 0 || hasReportedReady.current) return;

    hasReportedReady.current = true;
    onBoardReady?.();
  }, [boardSize, onBoardReady]);

  return (
    <View
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;

        setContainerSize((current) => {
          if (current.width === width && current.height === height) {
            return current;
          }

          return { width, height };
        });
      }}
      style={{
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
      }}
    >
      <View
        pointerEvents={disabled ? "none" : "auto"}
        style={{
          width: boardSize,
          height: boardSize,
          position: "relative",
        }}
      >
        <GridLines
          gridSize={gridSize}
          cellSize={cellSize}
          boardSize={boardSize}
        />

        {/* COMPLETED SQUARES */}
        {state.squares.map((square) => (
          <View
            key={`square-${square.row}-${square.col}`}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: square.col * cellSize,
              top: square.row * cellSize,
              width: cellSize,
              height: cellSize,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: square.color === "blue" ? "#3b82f6" : "#ef4444",
              opacity: 0.45,
              zIndex: 1,
            }}
          >
            <Text
              style={{
                fontFamily: "RussoOne",
                fontSize: 14,
                color: "#ffffff",
              }}
            >
              {square.number}
            </Text>
          </View>
        ))}

        {/* POINTS */}
        {pointPositions.map(({ row, col, style }) => {
          const value = state.grid[row][col];

          return (
            <Point
              key={`point-${row}-${col}`}
              row={row}
              col={col}
              value={value}
              disabled={state.gameOver || value !== null}
              highlighted={
                highlightedPoint?.row === row && highlightedPoint?.col === col
              }
              style={style}
              onPress={onMove}
            />
          );
        })}
      </View>
    </View>
  );
}
