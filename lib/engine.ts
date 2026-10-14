// engine.ts
// Pure game logic — no React, no UI

// ─────────────────────────────────────────────────────────────
// Types (strict mirror of your current Board.tsx logic)
// ─────────────────────────────────────────────────────────────

export type Cell = "blue" | "red" | null;

export type Player = "blue" | "red";

export type Square = {
  row: number;
  col: number;
  color: Player;
  number: number;
};

export type GameState = {
  grid: Cell[][];
  squares: Square[];
  score: { blue: number; red: number };
  isBlueTurn: boolean;
  gameOver: boolean;
};

// ─────────────────────────────────────────────────────────────
// Constants (same as Board.tsx)
// ─────────────────────────────────────────────────────────────

export const DEFAULT_GRID_SIZE = 11;
/** @deprecated Use DEFAULT_GRID_SIZE or settings.gridSize */
export const POINTS_SIZE = DEFAULT_GRID_SIZE;

function gridSizeOf(grid: Cell[][]): number {
  return grid.length;
}

export const createEmptyGrid = (size = DEFAULT_GRID_SIZE): Cell[][] =>
  Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );

export const getInitialState = (gridSize = DEFAULT_GRID_SIZE): GameState => ({
  grid: createEmptyGrid(gridSize),
  squares: [],
  score: { blue: 0, red: 0 },
  isBlueTurn: true,
  gameOver: false,
});

// ─────────────────────────────────────────────────────────────
// Core public API
// ─────────────────────────────────────────────────────────────

export function applyMove(
  state: GameState,
  row: number,
  col: number,
): GameState {
  if (state.grid[row]?.[col]) return state;

  const currentPlayer: Player = state.isBlueTurn ? "blue" : "red";

  const newGrid = placePoint(
    state.grid,
    row,
    col,
    currentPlayer,
  );

  const hasEmpty = newGrid.some((r) =>
    r.some((c) => c === null),
  );

  const foundSquares = detectSquaresAroundMove(
    newGrid,
    state.squares,
    row,
    col,
  );

  const mergedSquares = mergeSquares(
    state.squares,
    foundSquares,
  );

  const score = calculateScore(mergedSquares);

  const shouldReplay = foundSquares.length > 0;

  return {
    grid: newGrid,
    squares: mergedSquares,
    score,
    isBlueTurn: shouldReplay
      ? state.isBlueTurn
      : !state.isBlueTurn,
    gameOver: !hasEmpty,
  };
}

// ─────────────────────────────────────────────────────────────
// Pure helpers (EXACT logic from your Board.tsx)
// ─────────────────────────────────────────────────────────────

function placePoint(
  grid: Cell[][],
  row: number,
  col: number,
  color: Player
): Cell[][] {
  return grid.map((r, i) =>
    r.map((cell, j) => (i === row && j === col ? color : cell)),
  );
}

function detectSquaresAroundMove(
  grid: Cell[][],
  existingSquares: Square[],
  row: number,
  col: number,
): Square[] {
  const size = gridSizeOf(grid);
  const found: Square[] = [];

  const existing = new Set(
    existingSquares.map(
      (square) => `${square.row}:${square.col}`,
    ),
  );

  // A new point can only complete squares for which
  // it is one of the four corners.
  for (let r = Math.max(0, row - 1); r <= row; r++) {
    for (let c = Math.max(0, col - 1); c <= col; c++) {
      if (r >= size - 1 || c >= size - 1) {
        continue;
      }

      if (existing.has(`${r}:${c}`)) {
        continue;
      }

      const color = grid[r][c];

      if (
        color &&
        grid[r][c + 1] === color &&
        grid[r + 1][c] === color &&
        grid[r + 1][c + 1] === color
      ) {
        found.push({
          row: r,
          col: c,
          color,
          number: 0,
        });
      }
    }
  }

  return found;
}

// IMPORTANT: logic identical to your current detection
export function detectSquares(
  grid: Cell[][],
  existingSquares: Square[]
): Square[] {
  const found: Square[] = [];
  const size = gridSizeOf(grid);

  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const color = grid[r][c];

      const alreadyFound = existingSquares.some(
        (s) => s.row === r && s.col === c,
      );

      if (
        !alreadyFound &&
        color &&
        grid[r][c + 1] === color &&
        grid[r + 1][c] === color &&
        grid[r + 1][c + 1] === color
      ) {
        found.push({
          row: r,
          col: c,
          color,
          number: 0,
        });
      }
    }
  }

  return found;
}

function mergeSquares(
  prev: Square[],
  newSquares: Square[]
): Square[] {
  const merged = [...prev, ...newSquares];

  let blueCount = 0;
  let redCount = 0;

  return merged.map((s) => {
    if (s.color === "blue") blueCount++;
    else redCount++;

    return {
      ...s,
      number: s.color === "blue" ? blueCount : redCount,
    };
  });
}

function calculateScore(squares: Square[]) {
  let blue = 0;
  let red = 0;

  for (const s of squares) {
    if (s.color === "blue") blue++;
    else red++;
  }

  return { blue, red };
}

// ─────────────────────────────────────────────────────────────
// Optional helpers (future-proofing)
// ─────────────────────────────────────────────────────────────

export function resetState(gridSize = DEFAULT_GRID_SIZE): GameState {
  return getInitialState(gridSize);
}

export function getCurrentPlayer(state: GameState): Player {
  return state.isBlueTurn ? "blue" : "red";
}

export function getLegalMoves(
  state: GameState,
): { row: number; col: number }[] {
  const moves: { row: number; col: number }[] = [];
  const size = gridSizeOf(state.grid);

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!state.grid[row][col]) {
        moves.push({ row, col });
      }
    }
  }

  return moves;
}

export function withCurrentPlayer(
  state: GameState,
  player: Player,
): GameState {
  return { ...state, isBlueTurn: player === "blue" };
}