const rows = 6;
const cols = 7;
let currentPlayer = "red";
let myColor = null;
let board = [];
let conn = null;

const game = document.getElementById("game");
const status = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const myIdEl = document.getElementById("myId");
const peerIdInput = document.getElementById("peerIdInput");
const connectBtn = document.getElementById("connectBtn");

// PeerJS init
const peer = new Peer();
peer.on("open", id => {
  myIdEl.textContent = id;
});

peer.on("connection", connection => {
  conn = connection;
  myColor = "red"; // Host ist Rot
  setupConnection();
});

connectBtn.addEventListener("click", () => {
  const peerId = peerIdInput.value.trim();
  if (!peerId) return;
  conn = peer.connect(peerId);
  myColor = "yellow"; // Client ist Gelb
  setupConnection();
});

function setupConnection() {
  conn.on("open", () => {
    status.textContent = "Verbunden! Du bist " + (myColor === "red" ? "Rot" : "Gelb");
    initBoard();
  });

  conn.on("data", data => {
    if (data.type === "move") {
      remoteMove(data.col, data.color);
    } else if (data.type === "reset") {
      resetGame(false);
    }
  });
}

// Board
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
  if (currentPlayer !== myColor) return; // nur dran wenn eigene Farbe
  makeMove(col, myColor);
  conn.send({ type: "move", col, color: myColor });
}

function remoteMove(col, color) {
  makeMove(col, color);
}

function makeMove(col, color) {
  for (let r = rows - 1; r >= 0; r--) {
    if (!board[r][col]) {
      board[r][col] = color;
      const cell = document.querySelector(
        `.cell[data-row="${r}"][data-col="${col}"]`
      );
      cell.classList.add(color);
      if (checkWin(r, col, color)) {
        status.textContent = `Spieler ${color === "red" ? "Rot" : "Gelb"} hat gewonnen!`;
        document.querySelectorAll(".cell").forEach(c => c.style.pointerEvents = "none");
      } else {
        currentPlayer = currentPlayer === "red" ? "yellow" : "red";
        status.textContent = `Spieler ${currentPlayer === "red" ? "Rot" : "Gelb"} ist am Zug`;
      }
      break;
    }
  }
}

function checkWin(row, col, color) {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];
  for (let [dr, dc] of directions) {
    let count = 1;
    count += countDirection(row, col, dr, dc, color);
    count += countDirection(row, col, -dr, -dc, color);
    if (count >= 4) return true;
  }
  return false;
}

function countDirection(row, col, dr, dc, color) {
  let r = row + dr, c = col + dc, count = 0;
  while (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === color) {
    count++;
    r += dr;
    c += dc;
  }
  return count;
}

// Restart
function resetGame(send = true) {
  initBoard();
  if (send && conn) conn.send({ type: "reset" });
}
restartBtn.addEventListener("click", () => resetGame(true));
