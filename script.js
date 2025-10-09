// =======================
// GAME STATE VARIABLES
// =======================
let board = [];          // Current puzzle (0 = empty)
let solution = [];       // Correct solution
let mistakes = 0;
let remaining = 81;
let timerInterval = null;
let elapsedSeconds = 0;

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

// clear all highlight/conflict classes from all cells
function clearHighlights() {
  document.querySelectorAll(".cell").forEach(c => {
    c.classList.remove("highlight", "conflict-number", "same-number", "conflict");
  });
}

// mark conflicts and matching numbers based on the DOM values
function markConflictAndMatches(row, col, val, origCell) {
  // clear previous visuals
  clearHighlights();

  if (!val || Number.isNaN(val)) return;

  // iterate all cells using DOM (data-row/data-col and textContent)
  document.querySelectorAll('.cell').forEach(c => {
    const r = parseInt(c.dataset.row, 10);
    const cc = parseInt(c.dataset.col, 10);

    // highlight row/col/box
    const inSameRow = r === row;
    const inSameCol = cc === col;
    const inSameBox =
      Math.floor(r / 3) === Math.floor(row / 3) &&
      Math.floor(cc / 3) === Math.floor(col / 3);

    if (inSameRow || inSameCol || inSameBox) {
      c.classList.add('highlight');
    }

    // find DOM value (works for given cells and user entries)
    const cVal = parseInt(c.textContent, 10);
    if (!Number.isNaN(cVal) && cVal === val) {
      // mark any cell that has the same number as conflicting
      // give it both the border (same-number) and red text (conflict-number)
      c.classList.add('same-number');
    }

    // if this cell is the same number as the conflict value, is not the original cell and is in the same row/col/box
    if (cVal === val && c !== origCell && (inSameRow || inSameCol || inSameBox)) {
      c.classList.add('conflict-number'); // red background and red text
    }
  });

  // mark the original (typed) cell as the main conflict too
  if (origCell) {
    origCell.classList.add('conflict');           // dark red background (you already use this)
    //origCell.classList.add('conflict-number');    // red text
  }
}

function highlightRelatedCells(row, col) {
  // clear any old highlights
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('highlight');
  });

  document.querySelectorAll('.cell').forEach(c => {
    const r = parseInt(c.dataset.row, 10);
    const cc = parseInt(c.dataset.col, 10);

    const inSameRow = r === row;
    const inSameCol = cc === col;
    const inSameBox =
      Math.floor(r / 3) === Math.floor(row / 3) &&
      Math.floor(cc / 3) === Math.floor(col / 3);

    if (inSameRow || inSameCol || inSameBox) {
      c.classList.add('highlight');
    }
  });
}

function validateCellInput(cell) {
  const row = parseInt(cell.dataset.row, 10);
  const col = parseInt(cell.dataset.col, 10);
  const val = parseInt(cell.textContent, 10);
  if (Number.isNaN(val)) return;

  if (val === solution[row][col]) {
    // ✅ Correct
    board[row][col] = val;
    clearHighlights();
    remaining = board.flat().filter(v => v === 0).length;
    document.getElementById("remaining").textContent = remaining;
    if (remaining === 0) {
      setTimeout(() => alert("🎉 Congratulations! You solved the puzzle!"), 50);
    }
  } else {
    // ❌ Wrong — use SAME logic as keyboard
    mistakes++;
    document.getElementById("mistakes").textContent = mistakes;
    markConflictAndMatches(row, col, val, cell);
    if (mistakes >= 3) {
      setTimeout(() => { alert("❌ Game Over! Too many mistakes."); newGame(); }, 50);
    }
  }
}

function startTimer() {
  // Clear any previous timer
  clearInterval(timerInterval);
  elapsedSeconds = 0;
  updateTimerDisplay();

  // Start new interval
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    updateTimerDisplay();
  }, 1000);
}

// Format and update DOM
function updateTimerDisplay() {
  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");
  document.getElementById("timer").textContent = `${minutes}:${seconds}`;
}

// // mark conflict for a wrong entry at (row,col) in the given cell element
// function markConflict(row, col, val, origCell) {
//   // clear first
//   clearHighlights();

//   // add highlight to row/col/box and border to same numbers
//   document.querySelectorAll(".cell").forEach(c => {
//     const r = parseInt(c.dataset.row, 10);
//     const cc = parseInt(c.dataset.col, 10);

//     const inSameRow = r === row;
//     const inSameCol = cc === col;
//     const inSameBox =
//       Math.floor(r / 3) === Math.floor(row / 3) &&
//       Math.floor(cc / 3) === Math.floor(col / 3);

//     if (inSameRow || inSameCol || inSameBox) {
//       c.classList.add("highlight");
//     }

//     const cVal = parseInt(c.textContent, 10);
//     if (!Number.isNaN(cVal) && cVal === val && c !== origCell) {
//       c.classList.add("same-number");
//     }
//   });

//   // style the original (wrong) cell's number
//   origCell.classList.add("conflict", "conflict-number");
// }

// function highlightConflicts(row, col, value) {
//   // First, remove all previous conflict highlighting
//   document.querySelectorAll('.conflict-cell').forEach(cell => {
//     cell.classList.remove('conflict-cell');
//   });

//   if (value === 0) return; // If the cell is empty, skip

//   // Check row and column conflicts
//   for (let i = 0; i < 9; i++) {
//     // Row check
//     if (i !== col && game.board[row][i] === value) {
//       document.getElementById(`cell-${row}-${i}`).classList.add('conflict-cell');
//     }
//     // Column check
//     if (i !== row && game.board[i][col] === value) {
//       document.getElementById(`cell-${i}-${col}`).classList.add('conflict-cell');
//     }
//   }

//   // Check 3x3 box conflicts
//   const boxRow = Math.floor(row / 3) * 3;
//   const boxCol = Math.floor(col / 3) * 3;

//   for (let r = boxRow; r < boxRow + 3; r++) {
//     for (let c = boxCol; c < boxCol + 3; c++) {
//       if (!(r === row && c === col) && game.board[r][c] === value) {
//         document.getElementById(`cell-${r}-${c}`).classList.add('conflict-cell');
//       }
//     }
//   }
// }

// =======================
// RENDER BOARD IN DOM
// =======================
function renderBoard() {
  clearHighlights();
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
  startTimer();
}

// =======================
// HANDLE CELL INPUT
// =======================
// function onCellInput(e) {
//   const cell = e.target;
//   if (!cell.classList.contains("cell") || cell.classList.contains("given")) return;

//   const row = parseInt(cell.dataset.row);
//   const col = parseInt(cell.dataset.col);
//   const val = parseInt(cell.textContent);

//   // First: clear all previous highlights
//   document.querySelectorAll(".highlight, .conflict-number, .same-number").forEach(c => {
//     c.classList.remove("highlight", "conflict-number", "same-number");
//   });

//   if (Number.isNaN(val) || val < 1 || val > 9) {
//     cell.textContent = "";
//     return;
//   }

//   if (val === solution[row][col]) {
//     board[row][col] = val;
//     cell.classList.remove("conflict");
//     remaining = board.flat().filter(v => v === 0).length;
//     document.getElementById("remaining").textContent = remaining;

//     if (remaining === 0) {
//       alert("🎉 Congratulations! You solved the puzzle!");
//     }
//   } else {
//     cell.classList.add("conflict");

//     // Highlight row, column, and 3x3 box
//     document.querySelectorAll(".cell").forEach(cell => {
//       const r = parseInt(cell.dataset.row);
//       const cc = parseInt(cell.dataset.col);

//       const inSameRow = r === row;
//       const inSameCol = cc === col;
//       const inSameBox = Math.floor(r / 3) === Math.floor(row / 3) && Math.floor(cc / 3) === Math.floor(col / 3);

//       if (inSameRow || inSameCol || inSameBox) {
//         cell.classList.add("highlight");
//       }

//       // Highlight same numbers with border
//       if (parseInt(c.textContent) === val && c !== cell) {
//         cell.classList.add("same-number");
//       }
//     });

//     mistakes++;
//     document.getElementById("mistakes").textContent = mistakes;

//     if (mistakes >= 3) {
//       alert("❌ Game Over! Too many mistakes.");
//       newGame();
//     }
//   }
// }

function onCellInput(e) {
  const cell = e.target;
  if (!cell.classList.contains("cell") || cell.classList.contains("given")) return;

  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  const val = parseInt(cell.textContent);

  // 🔄 Clear old highlights
  document.querySelectorAll(".highlight, .conflict-number, .same-number").forEach(c => {
    c.classList.remove("highlight", "conflict-number", "same-number");
  });

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
    // ❌ Wrong input logic
    cell.classList.add("conflict", "conflict-number");

    // 🔦 Highlight row, column, and 3x3 box
    document.querySelectorAll(".cell").forEach(c => {
      const r = parseInt(c.dataset.row);
      const cc = parseInt(c.dataset.col);

      const inSameRow = r === row;
      const inSameCol = cc === col;
      const inSameBox =
        Math.floor(r / 3) === Math.floor(row / 3) &&
        Math.floor(cc / 3) === Math.floor(col / 3);

      if (inSameRow || inSameCol || inSameBox) {
        c.classList.add("highlight");  // ✅ highlight even given cells
      }

      // 🔁 Highlight same numbers with border (include given cells)
      const cVal = parseInt(c.textContent);
      if (cVal === val && c.textContent.trim() !== "") {
        c.classList.add("same-number");
      }
    });

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
// document.querySelectorAll('.cell').forEach(cell => {
//   cell.addEventListener('click', e => {
//     const row = parseInt(cell.dataset.row);
//     const col = parseInt(cell.dataset.col);
//     highlightRelatedCells(row, col);
//   });
// });

let activeCell = null;

document.getElementById("sudoku-board").addEventListener("focusin", (e) => {
  const cell = e.target.closest(".cell:not(.given)");
  activeCell = cell || null;
});

document.querySelector(".numpad").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn || !activeCell) return;

  const row = parseInt(activeCell.dataset.row);
  const col = parseInt(activeCell.dataset.col);
  const currentVal = parseInt(activeCell.textContent);

  // ERASE → clear cell content
  if (btn.dataset.action === "erase") {
    activeCell.textContent = "";
    activeCell.classList.remove("conflict", "same-number", "conflict-number", "good");
    activeCell.dispatchEvent(new Event("input"));
    return;
  }

  // ✅ CHECK → verify guess
  if (btn.dataset.action === "check") {
    if (!activeCell) return;
    validateCellInput(activeCell); // ✅ Reuse same logic as Enter key
    return;
  }

  // NUMBER INPUT
  const num = btn.dataset.num;
  if (num) {
    activeCell.textContent = num;
    activeCell.dispatchEvent(new Event("input"));
    activeCell.focus();
  }
});

document.getElementById("sudoku-board").addEventListener("focusin", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const row = parseInt(cell.dataset.row, 10);
  const col = parseInt(cell.dataset.col, 10);
  highlightRelatedCells(row, col);
});

document.getElementById("sudoku-board").addEventListener("keydown", (e) => {
  const cell = e.target;
  if (!cell || !cell.classList || !cell.classList.contains("cell") || cell.classList.contains("given")) return;

  const row = parseInt(cell.dataset.row, 10);
  const col = parseInt(cell.dataset.col, 10);

  // If typing a digit: show it but don't validate yet
  if (e.key >= "1" && e.key <= "9") {
    e.preventDefault(); // stop default editing (avoid double-entry)
    cell.textContent = e.key; // show typed number
    // remove any previous conflict visuals for this cell while editing
    cell.classList.remove("conflict", "conflict-number");
    document.querySelectorAll(".same-number").forEach(x => x.classList.remove("same-number"));
    return;
  }

  // Enter => validate the current cell value
  if (e.key === "Enter") {
    e.preventDefault();
    validateCellInput(cell); // ✅ Same logic as numpad
    return;
  }

  // Backspace clears the cell and clears highlights
  if (e.key === "Backspace" || e.key === "Delete") {
    e.preventDefault();
    cell.textContent = "";
    clearHighlights();
    return;
  }

  // allow arrow keys or other navigation to pass through (do nothing)
});

document.getElementById("btn-check").addEventListener("click", () => {
  let incorrectCells = 0;
  let emptyCells = 0;

  // Loop through the board to count incorrect & empty cells
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const currentVal = board[r][c];
      if (currentVal === 0) {
        emptyCells++;
      } else if (currentVal !== solution[r][c]) {
        incorrectCells++;
      }
    }
  }

  const timeText = document.getElementById("timer").textContent; // ⏳ Time taken

  if (emptyCells === 0 && incorrectCells === 0) {
    alert(`🎉 Puzzle Solved!
    ⏳ Time: ${timeText}
    🎯 Mistakes: ${mistakes}
    🧩 All cells are correct!`);
      } else {
        alert(`❌ Not yet solved
    ⏳ Time: ${timeText}
    🔴 Mistakes: ${mistakes}
    ⬜ Empty cells: ${emptyCells}`);;
  }
});

document.getElementById("btn-solve").addEventListener("click", () => {
  // Stop timer
  clearInterval(timerInterval);

  // Fill only empty (non-given) cells and apply special class
  document.querySelectorAll(".cell").forEach(cell => {
    const row = parseInt(cell.dataset.row, 10);
    const col = parseInt(cell.dataset.col, 10);

    if (!cell.classList.contains("given")) {
      board[row][col] = solution[row][col]; // Update board logic
      cell.textContent = solution[row][col]; // Render number
      cell.classList.add("user-solved"); // Apply color styling
    }

    // Disable interactions
    cell.contentEditable = "false";
    cell.classList.remove("conflict", "highlight");
  });

  // After 5 seconds, show summary and restart
  setTimeout(() => {
    const timeText = document.getElementById("timer").textContent;
    alert(`🧩 Full Solution Revealed
    ⏳ Time: ${timeText}
    🎯 Mistakes: ${mistakes}
    🎮 Starting a new game...`);
    newGame();
  }, 5000);
});


// =======================
// INIT
// =======================
newGame();

