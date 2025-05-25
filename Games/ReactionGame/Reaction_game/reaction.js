const box = document.getElementById('box');
const startBtn = document.getElementById('start-btn');
const result = document.getElementById('result');
const continueBtn = document.getElementById('continue-btn');
const backBtn = document.getElementById('back-btn');
const explanation = document.getElementById('explanation');
const pointsDisplay = document.getElementById('points-value');

let waiting = false;
let startTime = 0;
let timeoutId = null;
let points = 0;
let isFirstRound = true;

function resetBox() {
  box.className = '';
  box.textContent = 'Wait for green...';
  result.textContent = '';
  box.classList.remove('box-disabled');
}

function getPoints(reaction) {
  if (reaction < 200) return 100;
  if (reaction < 300) return 80;
  if (reaction < 400) return 60;
  if (reaction < 500) return 40;
  return 20;
}

function showContinueAndBack() {
  continueBtn.style.display = 'inline-block';
  backBtn.style.display = 'inline-block';
}
function hideContinueAndBack() {
  continueBtn.style.display = 'none';
  backBtn.style.display = 'none';
}

function startGame() {
  resetBox();
  startBtn.disabled = true;
  waiting = true;
  box.style.cursor = 'pointer';
  box.className = 'ready';
  box.textContent = 'Wait for green...';
  explanation.style.display = 'none';

  if (isFirstRound) {
    hideContinueAndBack();
  }

  const delay = Math.floor(Math.random() * 2500) + 1500;
  timeoutId = setTimeout(() => {
    box.className = 'go';
    box.textContent = 'CLICK!';
    startTime = Date.now();
    waiting = false;
  }, delay);
}

box.addEventListener('click', () => {
  if (box.classList.contains('box-disabled')) return;

  // If waiting for green, clicked too soon
  if (box.classList.contains('ready')) {
    clearTimeout(timeoutId);
    box.className = 'too-soon';
    box.textContent = 'Too Soon!';
    result.textContent = 'Wait for green before clicking.';
    startBtn.disabled = false;
    box.style.cursor = 'not-allowed';
    waiting = false;
    box.classList.add('box-disabled');
    showContinueAndBack();
  }
  // If green, measure reaction time and award points
  else if (box.classList.contains('go')) {
    const reaction = Date.now() - startTime;
    const earned = getPoints(reaction);
    points += earned;
    pointsDisplay.textContent = points;
    box.className = '';
    box.textContent = 'Well done!';
    result.innerHTML = `Your reaction time: <b>${reaction} ms</b>`;
    startBtn.disabled = false;
    box.style.cursor = 'default';
    box.classList.add('box-disabled');
    showContinueAndBack();
    if (isFirstRound) {
      isFirstRound = false;
    }
  }
});

startBtn.addEventListener('click', () => {
  startGame();
});

continueBtn.addEventListener('click', () => {
  explanation.innerHTML = `
    <b>What is Reaction Time?</b><br>
    Reaction time is how quickly you respond to a stimulus (like the box turning green).<br>
    Practicing improves your brain's processing speed and your ability to focus.<br>
    <br>
    <i>Fast reactions are important in sports, driving, gaming, and many real-life situations!</i>
  `;
  explanation.style.display = 'block';
  hideContinueAndBack();
});

backBtn.addEventListener('click', () => {
  history.back();
});

