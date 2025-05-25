const canvas = document.getElementById('maze');
const ctx = canvas.getContext('2d');
const levelSpan = document.getElementById('level');
const messageDiv = document.getElementById('message');

const CELL_SIZE = 30;
const PLAYER_COLOR = '#08fdd8';
const WALL_COLOR = '#08fdd8';
const PATH_COLOR = '#22223b';
const GOAL_COLOR = '#fca311';

let level = 1;
let rows = 12, cols = 12;
let maze, player, goal;
let gameOver = false;

// Point system variables
let levelStartTime = 0;
let totalPoints = 0;
let pointsPerLevel = [];

function generateMazePrim(rows, cols) {
  let maze = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({
    walls: [true, true, true, true],
    visited: false
  })));

  let wallList = [];
  let startY = Math.floor(Math.random() * rows);
  let startX = Math.floor(Math.random() * cols);
  maze[startY][startX].visited = true;

  function addWalls(y, x) {
    [[y-1,x,0],[y,x+1,1],[y+1,x,2],[y,x-1,3]].forEach(([ny, nx, dir]) => {
      if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && !maze[ny][nx].visited) {
        wallList.push([y, x, dir]);
      }
    });
  }

  addWalls(startY, startX);

  while (wallList.length) {
    let idx = Math.floor(Math.random() * wallList.length);
    let [y, x, dir] = wallList.splice(idx, 1)[0];
    let [ny, nx] = [[y-1,x],[y,x+1],[y+1,x],[y,x-1]][dir];
    if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && !maze[ny][nx].visited) {
      maze[y][x].walls[dir] = false;
      maze[ny][nx].walls[(dir+2)%4] = false;
      maze[ny][nx].visited = true;
      addWalls(ny, nx);
    }
  }
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) maze[y][x].visited = false;
  return maze;
}

function resizeCanvas() {
  canvas.width = cols * CELL_SIZE;
  canvas.height = rows * CELL_SIZE;
}

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw maze
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = maze[y][x];
      const px = x * CELL_SIZE, py = y * CELL_SIZE;
      ctx.fillStyle = PATH_COLOR;
      ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
      ctx.strokeStyle = WALL_COLOR;
      ctx.lineWidth = 4;
      // Top
      if (cell.walls[0]) {
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + CELL_SIZE, py);
        ctx.stroke();
      }
      // Right
      if (cell.walls[1]) {
        ctx.beginPath();
        ctx.moveTo(px + CELL_SIZE, py);
        ctx.lineTo(px + CELL_SIZE, py + CELL_SIZE);
        ctx.stroke();
      }
      // Bottom
      if (cell.walls[2]) {
        ctx.beginPath();
        ctx.moveTo(px, py + CELL_SIZE);
        ctx.lineTo(px + CELL_SIZE, py + CELL_SIZE);
        ctx.stroke();
      }
      // Left
      if (cell.walls[3]) {
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py + CELL_SIZE);
        ctx.stroke();
      }
    }
  }

  // Draw goal as a circle
  ctx.beginPath();
  const goalCenterX = goal.x * CELL_SIZE + CELL_SIZE / 2;
  const goalCenterY = goal.y * CELL_SIZE + CELL_SIZE / 2;
  ctx.arc(goalCenterX, goalCenterY, (CELL_SIZE - 12) / 2, 0, 2 * Math.PI);
  ctx.fillStyle = GOAL_COLOR;
  ctx.fill();
  ctx.closePath();

  // Draw player as a circle
  ctx.beginPath();
  const playerCenterX = player.x * CELL_SIZE + CELL_SIZE / 2;
  const playerCenterY = player.y * CELL_SIZE + CELL_SIZE / 2;
  ctx.arc(playerCenterX, playerCenterY, (CELL_SIZE - 12) / 2, 0, 2 * Math.PI);
  ctx.fillStyle = PLAYER_COLOR;
  ctx.shadowColor = PLAYER_COLOR;
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.closePath();
}

function resetMaze() {
  maze = generateMazePrim(rows, cols);
  player = { x: 0, y: 0 };
  goal = { x: cols - 1, y: rows - 1 };
  resizeCanvas();
  drawMaze();
  messageDiv.textContent = '';
  levelStartTime = Date.now();
}

function calcPoints(timeTakenMs) {
  // Award more points for faster completion
  // <10s: 100, <20s: 80, <30s: 60, <45s: 40, else: 20
  if (timeTakenMs < 10000) return 100;
  if (timeTakenMs < 20000) return 80;
  if (timeTakenMs < 30000) return 60;
  if (timeTakenMs < 45000) return 40;
  return 20;
}

function nextLevel() {
  level++;
  levelSpan.textContent = level;
  if (level > 10) {
    gameOver = true;
    let pointsList = pointsPerLevel.map((p, idx) => `Level ${idx+1}: ${p} points`).join('<br>');
    messageDiv.innerHTML = `
      <span style="color:#08fdd8;font-size:1.4em;">🎉 Congratulations! You completed all 10 levels!</span><br><br>
      <span style="color:#fff;">
        <b>Your Total Score:</b> <span style="color:#08fdd8;">${totalPoints}</span><br>
        <span style="font-size:0.9em; color:#fca311;"><b>Points per level:</b><br>${pointsList}</span><br><br>
        <b>What did you learn?</b><br>
        By solving these mazes, you practiced spatial reasoning, logical problem-solving, and perseverance.<br>
        Each maze was generated using algorithms, which are also used in robotics, computer science, and AI.<br>
        <br>
        <i>Every challenge you solved here is a step towards sharper thinking and better problem-solving skills!</i>
      </span>
    `;
    canvas.style.opacity = 0.3;
    return;
  }
  // Make the maze harder: increase size more rapidly
  if (rows < 30) {
    rows += 2 + Math.floor(level/2);
    cols += 2 + Math.floor(level/2);
  }
  resetMaze();
}

document.addEventListener('keydown', (e) => {
  if (gameOver) return;
  let dx = 0, dy = 0;
  if (e.key === 'ArrowUp' || e.key === 'w') dy = -1;
  else if (e.key === 'ArrowDown' || e.key === 's') dy = 1;
  else if (e.key === 'ArrowLeft' || e.key === 'a') dx = -1;
  else if (e.key === 'ArrowRight' || e.key === 'd') dx = 1;
  else return;

  const nx = player.x + dx, ny = player.y + dy;
  if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) return;
  let wall = -1;
  if (dx === 1) wall = 1;
  else if (dx === -1) wall = 3;
  else if (dy === 1) wall = 2;
  else if (dy === -1) wall = 0;
  if (maze[player.y][player.x].walls[wall]) return;

  player.x = nx;
  player.y = ny;
  drawMaze();

  if (player.x === goal.x && player.y === goal.y) {
    // Calculate points for this level
    const timeTaken = Date.now() - levelStartTime;
    const points = calcPoints(timeTaken);
    totalPoints += points;
    pointsPerLevel.push(points);

    if (level < 10) {
      messageDiv.innerHTML = `🎉 Level Complete! You scored <b>${points}</b> points.<br>Next maze loading...`;
      setTimeout(nextLevel, 1400);
    } else {
      messageDiv.innerHTML = `🎉 Level Complete! You scored <b>${points}</b> points.<br>`;
      setTimeout(nextLevel, 1200);
    }
  }
});

resetMaze();

