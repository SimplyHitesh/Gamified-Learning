// Unicode chess pieces
const PIECES = {
  'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔',
  'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚'
};
// Board state: 8x8 array, uppercase = white, lowercase = black, . = empty
const START_FEN = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  ['.','.','.','.','.','.','.','.'],
  ['.','.','.','.','.','.','.','.'],
  ['.','.','.','.','.','.','.','.'],
  ['.','.','.','.','.','.','.','.'],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

let board = [];
let selected = null;
let possibleMoves = [];
let turn = 'w'; // 'w' or 'b'
let mode = '2p'; // '2p' or 'ai'
let gameOver = false;
let statusDiv, chessboardDiv, restartBtn, modeSelectDiv;

window.onload = function() {
  statusDiv = document.getElementById('status');
  chessboardDiv = document.getElementById('chessboard');
  restartBtn = document.getElementById('restart-btn');
  modeSelectDiv = document.getElementById('mode-select');
};

window.startGame = function(selectedMode) {
  mode = selectedMode;
  board = JSON.parse(JSON.stringify(START_FEN));
  selected = null;
  possibleMoves = [];
  turn = 'w';
  gameOver = false;
  modeSelectDiv.style.display = 'none';
  chessboardDiv.style.display = 'grid';
  restartBtn.style.display = 'block';
  statusDiv.textContent = mode === 'ai' ? "White's turn (You)" : "White's turn";
  renderBoard();
};

window.restartGame = function() {
  modeSelectDiv.style.display = 'flex';
  chessboardDiv.style.display = 'none';
  restartBtn.style.display = 'none';
  statusDiv.textContent = '';
};

function renderBoard() {
  chessboardDiv.innerHTML = '';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const sq = document.createElement('div');
      sq.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
      sq.dataset.row = row;
      sq.dataset.col = col;
      if (selected && selected[0] === row && selected[1] === col)
        sq.classList.add('selected');
      if (possibleMoves.some(([r, c]) => r === row && c === col))
        sq.classList.add('move-option');
      const piece = board[row][col];
      if (piece !== '.') {
        sq.textContent = PIECES[piece];
        if ('PNBRQK'.includes(piece)) {
          sq.classList.add('white-piece');
        } else {
          sq.classList.add('black-piece');
        }
      }
      sq.onclick = () => handleSquareClick(row, col);
      chessboardDiv.appendChild(sq);
    }
  }
}

function handleSquareClick(row, col) {
  if (gameOver) return;
  const piece = board[row][col];
  if (selected) {
    // If clicked a move option, move piece
    if (possibleMoves.some(([r, c]) => r === row && c === col)) {
      movePiece(selected, [row, col]);
      selected = null;
      possibleMoves = [];
      renderBoard();
      if (!gameOver && mode === 'ai' && turn === 'b') {
        setTimeout(aiMove, 500);
      }
      return;
    }
    // Deselect if clicking same piece
    if (selected[0] === row && selected[1] === col) {
      selected = null;
      possibleMoves = [];
      renderBoard();
      return;
    }
  }
  // Select if correct turn and own piece
  if ((turn === 'w' && 'PNBRQK'.includes(piece)) ||
      (turn === 'b' && 'pnbrqk'.includes(piece))) {
    selected = [row, col];
    possibleMoves = getLegalMoves(row, col, board, turn);
    renderBoard();
  }
}

function movePiece(from, to) {
  const [fr, fc] = from, [tr, tc] = to;
  board[tr][tc] = board[fr][fc];
  board[fr][fc] = '.';
  // Pawn promotion (to queen, for simplicity)
  if (board[tr][tc] === 'P' && tr === 0) board[tr][tc] = 'Q';
  if (board[tr][tc] === 'p' && tr === 7) board[tr][tc] = 'q';
  turn = turn === 'w' ? 'b' : 'w';

  // Check for checkmate/stalemate (very basic)
  if (isKingMissing('K')) {
    statusDiv.textContent = "Black wins! (King captured)";
    gameOver = true;
  } else if (isKingMissing('k')) {
    statusDiv.textContent = "White wins! (King captured)";
    gameOver = true;
  } else {
    // Check for check or checkmate after move
    let inCheck = isKingInCheck(board, turn);
    let hasMoves = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        let p = board[r][c];
        if ((turn === 'w' && 'PNBRQK'.includes(p)) || (turn === 'b' && 'pnbrqk'.includes(p))) {
          if (getLegalMoves(r, c, board, turn).length > 0) {
            hasMoves = true;
            break;
          }
        }
      }
      if (hasMoves) break;
    }
    if (!hasMoves) {
      if (inCheck) {
        statusDiv.textContent = (turn === 'w' ? "White" : "Black") + " is checkmated!";
      } else {
        statusDiv.textContent = "Stalemate!";
      }
      gameOver = true;
    } else {
      if (mode === 'ai' && turn === 'b') {
        statusDiv.textContent = "Black's turn (AI)" + (inCheck ? " - Check!" : "");
      } else if (mode === 'ai' && turn === 'w') {
        statusDiv.textContent = "White's turn (You)" + (inCheck ? " - Check!" : "");
      } else {
        statusDiv.textContent = (turn === 'w' ? "White's" : "Black's") + " turn" + (inCheck ? " - Check!" : "");
      }
    }
  }
}

function isKingMissing(king) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c] === king) return false;
  return true;
}

// Returns true if the king of the given color is in check
function isKingInCheck(boardState, color) {
  let king = color === 'w' ? 'K' : 'k';
  let kingPos = null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (boardState[r][c] === king) kingPos = [r, c];
    }
  }
  if (!kingPos) return true; // King missing = in check
  let enemy = color === 'w' ? 'pnbrqk' : 'PNBRQK';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (enemy.includes(boardState[r][c])) {
        let moves = getPseudoLegalMoves(boardState, r, c);
        for (let [mr, mc] of moves) {
          if (mr === kingPos[0] && mc === kingPos[1]) return true;
        }
      }
    }
  }
  return false;
}

// Generates all pseudo-legal moves for a piece (ignores checks)
function getPseudoLegalMoves(boardState, row, col) {
  const piece = boardState[row][col];
  const moves = [];
  const isWhite = piece === piece.toUpperCase();
  const directions = {
    'N': [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],
    'B': [[-1,-1],[-1,1],[1,-1],[1,1]],
    'R': [[-1,0],[1,0],[0,-1],[0,1]],
    'Q': [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]],
    'K': [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]
  };
  switch (piece.toUpperCase()) {
    case 'P':
      let dir = isWhite ? -1 : 1;
      let startRow = isWhite ? 6 : 1;
      // Forward move
      if (inBounds(row+dir, col) && boardState[row+dir][col] === '.')
        moves.push([row+dir, col]);
      // Double move from start
      if (row === startRow && boardState[row+dir][col] === '.' && boardState[row+2*dir][col] === '.')
        moves.push([row+2*dir, col]);
      // Captures
      for (let dc of [-1,1]) {
        if (inBounds(row+dir, col+dc) && boardState[row+dir][col+dc] !== '.' &&
            isWhite !== (boardState[row+dir][col+dc] === boardState[row+dir][col+dc].toUpperCase()))
          moves.push([row+dir, col+dc]);
      }
      break;
    case 'N':
      for (let [dr, dc] of directions['N']) {
        let r = row+dr, c = col+dc;
        if (inBounds(r,c) && (boardState[r][c] === '.' ||
            isWhite !== (boardState[r][c] === boardState[r][c].toUpperCase())))
          moves.push([r,c]);
      }
      break;
    case 'B':
    case 'R':
    case 'Q':
      let dirs = directions[piece.toUpperCase()];
      for (let [dr, dc] of dirs) {
        let r = row+dr, c = col+dc;
        while (inBounds(r,c)) {
          if (boardState[r][c] === '.') {
            moves.push([r,c]);
          } else {
            if (isWhite !== (boardState[r][c] === boardState[r][c].toUpperCase()))
              moves.push([r,c]);
            break;
          }
          r += dr; c += dc;
          if (piece.toUpperCase() === 'K' || piece.toUpperCase() === 'N') break;
        }
      }
      break;
    case 'K':
      for (let [dr, dc] of directions['K']) {
        let r = row+dr, c = col+dc;
        if (inBounds(r,c) && (boardState[r][c] === '.' ||
            isWhite !== (boardState[r][c] === boardState[r][c].toUpperCase())))
          moves.push([r,c]);
      }
      break;
  }
  return moves;
}

// Only returns moves that do not leave the king in check
function getLegalMoves(row, col, boardState, color) {
  const piece = boardState[row][col];
  let pseudoMoves = getPseudoLegalMoves(boardState, row, col);
  let legalMoves = [];
  for (let [r, c] of pseudoMoves) {
    let copy = JSON.parse(JSON.stringify(boardState));
    copy[r][c] = copy[row][col];
    copy[row][col] = '.';
    // Pawn promotion (to queen, for simplicity)
    if (copy[r][c] === 'P' && r === 0) copy[r][c] = 'Q';
    if (copy[r][c] === 'p' && r === 7) copy[r][c] = 'q';
    let thisColor = piece === piece.toUpperCase() ? 'w' : 'b';
    if (!isKingInCheck(copy, thisColor)) {
      legalMoves.push([r, c]);
    }
  }
  return legalMoves;
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

// Very basic AI: pick a random legal move for black
function aiMove() {
  if (gameOver) return;
  // Find all black pieces and their moves
  let allMoves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      let piece = board[r][c];
      if ('pnbrqk'.includes(piece)) {
        let moves = getLegalMoves(r, c, board, 'b');
        for (let move of moves) {
          allMoves.push({from: [r,c], to: move});
        }
      }
    }
  }
  if (allMoves.length === 0) {
    statusDiv.textContent = "Stalemate! (No moves for AI)";
    gameOver = true;
    return;
  }
  // Random move
  const move = allMoves[Math.floor(Math.random() * allMoves.length)];
  movePiece(move.from, move.to);
  selected = null;
  possibleMoves = [];
  renderBoard();
}
