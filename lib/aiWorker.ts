
import {
  createWorkletRuntime,
  runOnRuntimeAsync,
} from "react-native-worklets";

import type { GameState, Player, Cell, Square } from "./engine";
import type { AiDifficulty } from "./mobileSettings";

const aiRuntime = createWorkletRuntime({
  name: "pointex-ai",
});

export function calculateAiMove(
  state: GameState,
  difficulty: AiDifficulty,
) {
  return runOnRuntimeAsync(
    aiRuntime,
    (initialState: GameState, level: AiDifficulty) => {
      "worklet";

      type Move = { row: number; col: number };

      const weights = {
        easy: { complete: 10_000, block: 2_000, setup: 5, leaveThreat: 50 },
        medium: { complete: 10_000, block: 5_000, setup: 10, leaveThreat: 100 },
        hard: { complete: 10_000, block: 8_000, setup: 20, leaveThreat: 250 },
      };

      const randomMoveChance = {
        easy: 0.4,
        medium: 0,
        hard: 0,
      };

      function getLegalMoves(state: GameState): Move[] {
        const moves: Move[] = [];
        for (let row = 0; row < state.grid.length; row++) {
          for (let col = 0; col < state.grid.length; col++) {
            if (state.grid[row][col] === null) {
              moves.push({ row, col });
            }
          }
        }
        return moves;
      }

      function completesSquare(
        grid: Cell[][],
        row: number,
        col: number,
        player: Player,
      ): boolean {
        const size = grid.length;

        for (let r = Math.max(0, row - 1); r <= row; r++) {
          for (let c = Math.max(0, col - 1); c <= col; c++) {
            if (r >= size - 1 || c >= size - 1) continue;

            const tl = grid[r][c] === player || (r === row && c === col);
            const tr = grid[r][c + 1] === player || (r === row && c + 1 === col);
            const bl = grid[r + 1][c] === player || (r + 1 === row && c === col);
            const br = grid[r + 1][c + 1] === player || (r + 1 === row && c + 1 === col);

            if (tl && tr && bl && br) return true;
          }
        }

        return false;
      }

      function countCompletingMoves(
        state: GameState,
        player: Player,
      ): number {
        let count = 0;

        for (let row = 0; row < state.grid.length; row++) {
          for (let col = 0; col < state.grid.length; col++) {
            if (
              state.grid[row][col] === null &&
              completesSquare(state.grid, row, col, player)
            ) {
              count++;
            }
          }
        }

        return count;
      }

      function countSetupPotential(
        grid: Cell[][],
        player: Player,
      ): number {
        let count = 0;

        for (let row = 0; row < grid.length - 1; row++) {
          for (let col = 0; col < grid.length - 1; col++) {
            let owned = 0;
            let empty = 0;

            const corners = [
              grid[row][col],
              grid[row][col + 1],
              grid[row + 1][col],
              grid[row + 1][col + 1],
            ];

            for (const cell of corners) {
              if (cell === player) owned++;
              else if (cell === null) empty++;
            }

            if (owned === 3 && empty === 1) count++;
          }
        }

        return count;
      }

      function simulateMove(
        state: GameState,
        row: number,
        col: number,
      ): GameState {
        if (state.grid[row]?.[col] !== null) return state;

        const player: Player = state.isBlueTurn ? "blue" : "red";
        const grid = state.grid.map((line, r) =>
          line.map((cell, c) => (r === row && c === col ? player : cell)),
        );

        const existing = state.squares;
        const found: Square[] = [];
        const size = grid.length;

        for (let r = Math.max(0, row - 1); r <= row; r++) {
          for (let c = Math.max(0, col - 1); c <= col; c++) {
            if (r >= size - 1 || c >= size - 1) continue;

            let alreadyFound = false;
            for (const square of existing) {
              if (square.row === r && square.col === c) {
                alreadyFound = true;
                break;
              }
            }
            if (alreadyFound) continue;

            const color = grid[r][c];
            if (
              color !== null &&
              grid[r][c + 1] === color &&
              grid[r + 1][c] === color &&
              grid[r + 1][c + 1] === color
            ) {
              found.push({ row: r, col: c, color, number: 0 });
            }
          }
        }

        const merged = [...existing, ...found];
        let blueCount = 0;
        let redCount = 0;

        const squares = merged.map((square) => {
          if (square.color === "blue") blueCount++;
          else redCount++;

          return {
            ...square,
            number: square.color === "blue" ? blueCount : redCount,
          };
        });

        let blue = 0;
        let red = 0;
        for (const square of squares) {
          if (square.color === "blue") blue++;
          else red++;
        }

        let hasEmpty = false;
        for (const line of grid) {
          for (const cell of line) {
            if (cell === null) {
              hasEmpty = true;
              break;
            }
          }
          if (hasEmpty) break;
        }

        return {
          grid,
          squares,
          score: { blue, red },
          isBlueTurn: found.length > 0 ? state.isBlueTurn : !state.isBlueTurn,
          gameOver: !hasEmpty,
        };
      }

      const moves = getLegalMoves(initialState);
      if (moves.length === 0) return null;

      if (Math.random() < randomMoveChance[level]) {
        return moves[Math.floor(Math.random() * moves.length)] ?? null;
      }

      const player: Player = initialState.isBlueTurn ? "blue" : "red";
      const opponent: Player = player === "blue" ? "red" : "blue";
      const opponentThreats: Move[] = [];

      for (const move of moves) {
        if (completesSquare(initialState.grid, move.row, move.col, opponent)) {
          opponentThreats.push(move);
        }
      }

      const threatKeys = new Set(
        opponentThreats.map((move) => `${move.row}:${move.col}`),
      );

      let bestScore = -Infinity;
      let bestMoves: Move[] = [];

      for (const move of moves) {
        const next = simulateMove(initialState, move.row, move.col);
        const squaresScored =
          next.score[player] - initialState.score[player];

        let score = 0;

        if (squaresScored > 0) {
          score += weights[level].complete * squaresScored;
        }

        if (threatKeys.has(`${move.row}:${move.col}`)) {
          score += weights[level].block;
        }

        score += countSetupPotential(next.grid, player) * weights[level].setup;

        if (squaresScored === 0) {
          score -=
            countCompletingMoves(next, opponent) *
            weights[level].leaveThreat;
        }

        if (score > bestScore) {
          bestScore = score;
          bestMoves = [move];
        } else if (score === bestScore) {
          bestMoves.push(move);
        }
      }

      return bestMoves[Math.floor(Math.random() * bestMoves.length)] ?? null;
    },
    state,
    difficulty,
  );
}
