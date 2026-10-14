import {
  applyMove,
  getCurrentPlayer,
  getLegalMoves,
  type GameState,
  type Player,
} from "./engine";

import type { AiDifficulty } from "./mobileSettings";

type ScoreWeights = {
  complete: number;
  block: number;
  setup: number;
  leaveThreat: number;
};

const WEIGHTS: Record<AiDifficulty, ScoreWeights> = {
  easy: { complete: 10_000, block: 2_000, setup: 5, leaveThreat: 50 },
  medium: { complete: 10_000, block: 5_000, setup: 10, leaveThreat: 100 },
  hard: { complete: 10_000, block: 8_000, setup: 20, leaveThreat: 250 },
};

const RANDOM_MOVE_CHANCE: Record<AiDifficulty, number> = {
  easy: 0.4,
  medium: 0,
  hard: 0,
};

/**
 * Vérifie directement si jouer sur cette case complète
 * au moins un carré 2x2 de la couleur indiquée.
 *
 * Même logique que detectSquaresAroundMove() dans engine.ts,
 * mais sans créer une nouvelle GameState.
 */
function moveCompletesSquare(
  state: GameState,
  row: number,
  col: number,
  player: Player,
): boolean {
  if (state.grid[row]?.[col] !== null) {
    return false;
  }

  const grid = state.grid;
  const size = grid.length;

  for (let r = Math.max(0, row - 1); r <= row; r++) {
    for (let c = Math.max(0, col - 1); c <= col; c++) {
      if (r >= size - 1 || c >= size - 1) {
        continue;
      }

      const topLeft =
        grid[r][c] === player ||
        (r === row && c === col);

      const topRight =
        grid[r][c + 1] === player ||
        (r === row && c + 1 === col);

      const bottomLeft =
        grid[r + 1][c] === player ||
        (r + 1 === row && c === col);

      const bottomRight =
        grid[r + 1][c + 1] === player ||
        (r + 1 === row && c + 1 === col);

      if (topLeft && topRight && bottomLeft && bottomRight) {
        return true;
      }
    }
  }

  return false;
}

export function getSquareCompletingMoves(
  state: GameState,
  player: Player,
): { row: number; col: number }[] {
  return getLegalMoves(state).filter(({ row, col }) =>
    moveCompletesSquare(state, row, col, player),
  );
}

function countSquareCompletingMoves(
  state: GameState,
  player: Player,
): number {
  let count = 0;

  const size = state.grid.length;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (
        state.grid[row][col] === null &&
        moveCompletesSquare(state, row, col, player)
      ) {
        count++;
      }
    }
  }

  return count;
}

function countSetupPotential(
  grid: GameState["grid"],
  player: Player,
): number {
  const size = grid.length;
  let count = 0;

  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 1; col++) {
      const corners = [
        grid[row][col],
        grid[row][col + 1],
        grid[row + 1][col],
        grid[row + 1][col + 1],
      ];

      let owned = 0;
      let empty = 0;

      for (const cell of corners) {
        if (cell === player) {
          owned++;
        } else if (cell === null) {
          empty++;
        }
      }

      if (owned === 3 && empty === 1) {
        count++;
      }
    }
  }

  return count;
}

function scoreMoveWithThreats(
  state: GameState,
  row: number,
  col: number,
  difficulty: AiDifficulty,
  opponentThreats: { row: number; col: number }[],
): number {
  const weights = WEIGHTS[difficulty];

  const player = getCurrentPlayer(state);
  const opponent: Player = player === "blue" ? "red" : "blue";

  // On conserve applyMove ici afin de conserver exactement
  // les règles actuelles de score et de replay.
  const next = applyMove(state, row, col);

  if (next === state) {
    return -Infinity;
  }

  let score = 0;

  const squaresScored =
    next.score[player] - state.score[player];

  if (squaresScored > 0) {
    score += weights.complete * squaresScored;
  }

  const blocksThreat = opponentThreats.some(
    (move) => move.row === row && move.col === col,
  );

  if (blocksThreat) {
    score += weights.block;
  }

  score +=
    countSetupPotential(next.grid, player) *
    weights.setup;

  if (squaresScored === 0) {
    const opponentReplies = countSquareCompletingMoves(
      next,
      opponent,
    );

    score -=
      opponentReplies *
      weights.leaveThreat;
  }

  return score;
}

export function scoreMove(
  state: GameState,
  row: number,
  col: number,
  difficulty: AiDifficulty = "medium",
): number {
  const player = getCurrentPlayer(state);
  const opponent: Player =
    player === "blue" ? "red" : "blue";

  const opponentThreats = getSquareCompletingMoves(
    state,
    opponent,
  );

  return scoreMoveWithThreats(
    state,
    row,
    col,
    difficulty,
    opponentThreats,
  );
}

export function pickBestMove(
  state: GameState,
  difficulty: AiDifficulty = "medium",
  random = Math.random,
): { row: number; col: number } | null {
  const moves = getLegalMoves(state);

  if (moves.length === 0) {
    return null;
  }

  if (random() < RANDOM_MOVE_CHANCE[difficulty]) {
    return (
      moves[Math.floor(random() * moves.length)] ??
      null
    );
  }

  const opponent: Player =
    getCurrentPlayer(state) === "blue"
      ? "red"
      : "blue";

  // Calculé une seule fois pour tous les coups candidats.
  const opponentThreats = getSquareCompletingMoves(
    state,
    opponent,
  );

  let bestScore = -Infinity;
  let bestMoves: { row: number; col: number }[] = [];

  for (const move of moves) {
    const moveScore = scoreMoveWithThreats(
      state,
      move.row,
      move.col,
      difficulty,
      opponentThreats,
    );

    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMoves = [move];
    } else if (moveScore === bestScore) {
      bestMoves.push(move);
    }
  }

  return (
    bestMoves[Math.floor(random() * bestMoves.length)] ??
    null
  );
}