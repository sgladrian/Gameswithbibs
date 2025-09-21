const rows = 6;
const cols = 7;
let currentPlayer = "red";
let board = [];
const game = document.getElementById("game");
const status = document.getElementById("status");
const restartBtn = document.getElementById("restart");

function initBoard() {
  board = Array.from({ length: rows }, () => Array(cols).fill(null));
  game.innerHTML = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => handleMove(c));
      game.appendChild(cell);
    }
  }
  currentPlayer = "red";
  status.textContent = "Spieler Rot ist am Zug";
}

function handleMove(col) {
  for (let r = rows - 1; r >= 0; r--) {
    if (!board[r][col]) {
      board[r][col] = currentPlayer;
      const cell = document.querySelector(
        `.cell[data-row="${r}"][data-col="${col}"]`
      );
      cell.classList.add(currentPlayer);
      if (checkWin(r, col)) {
        status.textContent = `Spieler ${currentPlayer === "red" ? "Rot" : "Gelb"} hat gewonnen!`;
        document.querySelectorAll(".cell").forEach(c => c.style.pointerEvents = "none");
      } else {
        currentPlayer = currentPlayer === "red" ? "yellow" : "red";
        status.textContent = `Spieler ${currentPlayer === "red" ? "Rot" : "Gelb"} ist am Zug`;
      }
      break;
    }
  }
}

function checkWin(row, col) {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];
  for (let [dr, dc] of directions) {
    let count = 1;
    count += countDirection(row, col, dr, dc);
    count += countDirection(row, col, -dr, -dc);
    if (count >= 4) return true;
  }
  return false;
}

function countDirection(row, col, dr, dc) {
  let r = row + dr, c = col + dc, count = 0;
  while (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === currentPlayer) {
    count++;
    r += dr;
    c += dc;
  }
  return count;
}

function resetGame() {
  initBoard();
}

restartBtn.addEventListener("click", resetGame);

// Spiel starten
initBoard();
