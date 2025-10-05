// =======================
// GAME STATE VARIABLES
// =======================
let board = [];          // Current puzzle (0 = empty)
let solution = [];       // Correct solution
let mistakes = 0;
let remaining = 81;

// =======================
// HELPER: CREATE EMPTY GRID
// =======================
function emptyBoard() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

// =======================
// HELPER: CHECK VALID MOVE
// =======================
function isSafe(board, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num || board[x][col] === num) return false;
  }
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
}

// =======================
// GENERATE FULL SOLUTION (Backtracking)
// =======================
function generateSolution(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        let nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
        for (let num of nums) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (generateSolution(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// =======================
// REMOVE CELLS TO CREATE PUZZLE
// =======================
function makePuzzle(solution, removeCount = 50) {
  const puzzle = solution.map(row => [...row]);
  let removed = 0;
  while (removed < removeCount) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      removed++;
    }
  }
  return puzzle;
}

// =======================
// RENDER BOARD IN DOM
// =======================
function renderBoard() {
  const cells = document.querySelectorAll(".cell");
  remaining = 0;
  cells.forEach(cell => {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const val = board[row][col];

    cell.textContent = val === 0 ? "" : val;
    cell.classList.toggle("given", val !== 0);
    cell.classList.remove("conflict");
    cell.contentEditable = val === 0 ? "true" : "false";
    if (val === 0) remaining++;
  });
  document.getElementById("remaining").textContent = remaining;
  document.getElementById("mistakes").textContent = mistakes;
}

// =======================
// START NEW GAME
// =======================
function newGame() {
  mistakes = 0;
  board = emptyBoard();
  generateSolution(board);
  solution = board.map(row => [...row]); // Save solution
  board = makePuzzle(solution, 50);      // Remove ~50 cells
  renderBoard();
}

// =======================
// HANDLE CELL INPUT
// =======================
function onCellInput(e) {
  const cell = e.target;
  if (!cell.classList.contains("cell") || cell.classList.contains("given")) return;

  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  const val = parseInt(cell.textContent);

  if (Number.isNaN(val) || val < 1 || val > 9) {
    cell.textContent = "";
    return;
  }

  if (val === solution[row][col]) {
    board[row][col] = val;
    cell.classList.remove("conflict");
    remaining = board.flat().filter(v => v === 0).length;
    document.getElementById("remaining").textContent = remaining;

    if (remaining === 0) {
      alert("🎉 Congratulations! You solved the puzzle!");
    }
  } else {
    cell.classList.add("conflict");
    mistakes++;
    document.getElementById("mistakes").textContent = mistakes;
    if (mistakes >= 3) {
      alert("❌ Game Over! Too many mistakes.");
      newGame();
    }
  }
}

// =======================
// EVENT LISTENERS
// =======================
document.getElementById("btn-new").addEventListener("click", newGame);
// document.getElementById("sudoku-board").addEventListener("input", onCellInput);
document.getElementById("sudoku-board").addEventListener("keydown", (e) => {
  const cell = e.target;
  if (!cell.classList.contains("cell") || cell.classList.contains("given")) return;

  e.preventDefault(); // Stop browser from typing automatically

  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  // Only allow typing numbers 1–9
  if (e.key >= "1" && e.key <= "9") {
    cell.textContent = e.key; // ✅ Manually set the typed number
  }

  // ✅ Validate only when Enter is pressed
  if (e.key === "Enter") {
    const val = parseInt(cell.textContent);
    if (Number.isNaN(val)) return;

    if (val === solution[row][col]) {
      board[row][col] = val;
      cell.classList.remove("conflict");
      remaining = board.flat().filter(v => v === 0).length;
      document.getElementById("remaining").textContent = remaining;

      if (remaining === 0) {
        alert("🎉 Congratulations! You solved the puzzle!");
      }
    } else {
      cell.classList.add("conflict");
      mistakes++;
      document.getElementById("mistakes").textContent = mistakes;
      if (mistakes >= 3) {
        alert("❌ Game Over! Too many mistakes.");
        newGame();
      }
    }
  }

  // Allow deleting with Backspace
  if (e.key === "Backspace") {
    cell.textContent = "";
    cell.classList.remove("conflict");
  }
});

// =======================
// INIT
// =======================
newGame();

