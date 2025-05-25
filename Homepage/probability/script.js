const startBtn = document.getElementById('start-game-btn');
const cupCountSelect = document.getElementById('cup-count');
const gameArea = document.getElementById('game-area');
const cupsContainer = document.getElementById('cups-container');
const resultArea = document.getElementById('result-area');
const resultMessage = document.getElementById('result-message');
const probabilityMessage = document.getElementById('probability-message');
const playAgainBtn = document.getElementById('play-again-btn');
const feedbackMessage = document.getElementById('feedback-message');

let cupCount = 3;
let ballPosition = 0;
let tries = 0;
let clickable = false;
let points = 100;
const pointsDeduction = 20;

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function createCups(count) {
  cupsContainer.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const cup = document.createElement('div');
    cup.classList.add('cup');
    cup.dataset.index = i;
    cupsContainer.appendChild(cup);
  }
}

function placeBallRandomly() {
  ballPosition = Math.floor(Math.random() * cupCount);
}

function revealBall(cupIndex) {
  const cups = cupsContainer.querySelectorAll('.cup');
  cups.forEach(cup => cup.innerHTML = '');
  if (cupIndex >= 0 && cupIndex < cups.length) {
    const ball = document.createElement('div');
    ball.classList.add('ball');
    cups[cupIndex].appendChild(ball);
  }
}

function shuffleCups(times = 8, delay = 350, callback) {
  let positions = [...Array(cupCount).keys()];
  let shuffleCount = 0;

  clickable = false;

  const shuffleInterval = setInterval(() => {
    shuffleCount++;
    shuffleArray(positions);

    // Animate cups by changing order in container
    positions.forEach((pos, i) => {
      const cup = cupsContainer.children[pos];
      cup.style.order = i;
      // Add shuffle animation
      cup.style.animation = 'shuffleMove 0.3s ease';
      setTimeout(() => {
        cup.style.animation = '';
      }, 300);
    });

    if (shuffleCount >= times) {
      clearInterval(shuffleInterval);
      clickable = true;
      revealBall(-1); // hide ball after shuffle
      if (callback) callback();
    }
  }, delay);
}

function startGame() {
  cupCount = parseInt(cupCountSelect.value);
  tries = 0;
  points = 100;
  feedbackMessage.textContent = '';
  resultArea.style.display = 'none';
  gameArea.style.display = 'block';
  createCups(cupCount);
  placeBallRandomly();
  revealBall(ballPosition); // Show ball at start

  // Show ball for 2 seconds before shuffle
  setTimeout(() => {
    revealBall(-1); // hide ball before shuffle
    shuffleCups();
  }, 2000);
}

cupsContainer.addEventListener('click', (e) => {
  if (!clickable) return;
  const cup = e.target.closest('.cup');
  if (!cup) return;

  const chosenIndex = parseInt(cup.dataset.index);

  if (chosenIndex === ballPosition) {
  clickable = false;
  revealBall(ballPosition);
  feedbackMessage.textContent = ''; // Clear any feedback

  let earnedPoints = points - (pointsDeduction * tries);
  if (earnedPoints < 20) earnedPoints = 20;

  resultMessage.textContent = `🎉 Congratulations! You found the ball! You earned ${earnedPoints} points.`;
  probabilityMessage.textContent = "This game illustrates the fundamentals of probability: the chance of correctly guessing the ball's location is 1 divided by the number of cups. As the number of cups increases, the probability of a correct guess decreases.";

  gameArea.style.display = 'none';
  resultArea.style.display = 'block';
  } else {
    tries++;
    feedbackMessage.textContent = '❌ Wrong cup! Try again.';
    clickable = false;
    revealBall(ballPosition); // Reveal the ball

    // Shuffle again after short delay to let user see ball
    setTimeout(() => {
      revealBall(-1); // hide ball
      shuffleCups();
      feedbackMessage.textContent = ''; // clear message
    }, 1500);
  }
});

startBtn.addEventListener('click', startGame);

playAgainBtn.addEventListener('click', () => {
  resultArea.style.display = 'none';
  gameArea.style.display = 'block';
  tries = 0;
  startGame();
});



