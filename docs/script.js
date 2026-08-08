const boardContainer = document.getElementById("boardContainer");
const startButton = document.getElementById("start");
const resetButton = document.getElementById("reset");
const rowsInput = document.getElementById("rows");
const colsInput = document.getElementById("cols");
const minesInput = document.getElementById("mines");
const flagsLeft = document.getElementById("flagsLeft");
const gameStatus = document.getElementById("gameStatus");

let board = [];
let revealed = [];
let flagged = [];
let rows = 10;
let cols = 10;
let mines = 15;
let gameOver = false;
let flagsUsed = 0;

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", startGame);
boardContainer.addEventListener("contextmenu", (event) => event.preventDefault());

function startGame() {
  rows = clampValue(rowsInput.value, 5, 20);
  cols = clampValue(colsInput.value, 5, 20);
  mines = clampValue(minesInput.value, 1, Math.floor(rows * cols * 0.8));
  rowsInput.value = rows;
  colsInput.value = cols;
  minesInput.value = mines;

  board = createBoard(rows, cols);
  revealed = Array.from({ length: rows }, () => Array(cols).fill(false));
  flagged = Array.from({ length: rows }, () => Array(cols).fill(false));
  flagsUsed = 0;
  gameOver = false;

  placeMines(board, mines);
  fillNumbers(board);
  renderBoard(rows, cols);
  updateStatus("遊戲進行中");
  updateFlagsLeft();
}

function clampValue(value, min, max) {
  const number = parseInt(value, 10);
  return Number.isNaN(number) ? min : Math.min(max, Math.max(min, number));
}

function createBoard(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function placeMines(board, count) {
  let placed = 0;
  while (placed < count) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (board[r][c] !== "M") {
      board[r][c] = "M";
      placed += 1;
    }
  }
}

function fillNumbers(board) {
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (board[r][c] === "M") continue;
      board[r][c] = countNearbyMines(board, r, c);
    }
  }
}

function countNearbyMines(board, row, col) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (board[nr][nc] === "M") count += 1;
      }
    }
  }
  return count;
}

function renderBoard(rows, cols) {
  boardContainer.innerHTML = "";
  boardContainer.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  boardContainer.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => openCell(r, c));
      cell.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        toggleFlag(r, c);
      });
      boardContainer.appendChild(cell);
    }
  }
}

function updateFlagsLeft() {
  flagsLeft.textContent = mines - flagsUsed;
}

function updateStatus(text) {
  gameStatus.textContent = text;
}

function openCell(r, c) {
  if (gameOver || flagged[r][c] || revealed[r][c]) return;

  revealed[r][c] = true;
  const cellValue = board[r][c];

  if (cellValue === "M") {
    revealAllMines();
    updateStatus("爆炸了！遊戲結束");
    gameOver = true;
    return;
  }

  renderCell(r, c);

  if (cellValue === 0) {
    revealZeros(r, c);
  }

  if (checkWin()) {
    updateStatus("你贏了！恭喜通關");
    gameOver = true;
  }
}

function revealZeros(row, col) {
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (!revealed[nr][nc] && !flagged[nr][nc]) {
          revealed[nr][nc] = true;
          renderCell(nr, nc);
          if (board[nr][nc] === 0) revealZeros(nr, nc);
        }
      }
    }
  }
}

function revealAllMines() {
  gameOver = true;
  document.querySelectorAll(".cell").forEach((button) => {
    const r = Number(button.dataset.row);
    const c = Number(button.dataset.col);
    if (board[r][c] === "M") {
      button.classList.add("open", "mine");
      button.textContent = "💣";
    }
  });
}

function renderCell(r, c) {
  const index = r * cols + c;
  const cellButton = boardContainer.children[index];
  cellButton.classList.add("open");
  const value = board[r][c];

  if (value === 0) {
    cellButton.textContent = "";
    cellButton.style.color = "#2b3e52";
  } else {
    cellButton.textContent = value;
    cellButton.style.color = getNumberColor(value);
  }
}

function toggleFlag(r, c) {
  if (gameOver || revealed[r][c]) return;
  flagged[r][c] = !flagged[r][c];

  const index = r * cols + c;
  const cellButton = boardContainer.children[index];

  if (flagged[r][c]) {
    cellButton.classList.add("flag");
    cellButton.textContent = "🚩";
    flagsUsed += 1;
  } else {
    cellButton.classList.remove("flag");
    cellButton.textContent = "";
    flagsUsed -= 1;
  }

  updateFlagsLeft();
  if (checkWin()) {
    updateStatus("你贏了！恭喜通關");
    gameOver = true;
  }
}

function getNumberColor(value) {
  const colors = {
    1: "#16547a",
    2: "#157f33",
    3: "#b32e1a",
    4: "#2d2f91",
    5: "#913a15",
    6: "#13727e",
    7: "#3f3737",
    8: "#5a5a5a",
  };
  return colors[value] || "#1b2f47";
}

function checkWin() {
  let openedCells = 0;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (revealed[r][c]) openedCells += 1;
    }
  }

  return openedCells === rows * cols - mines;
}

startGame();
