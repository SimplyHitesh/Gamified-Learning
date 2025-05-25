const promptBox = document.getElementById('prompt-box');
const startBtn = document.getElementById('start-btn');
const typingInput = document.getElementById('typing-input');
const result = document.getElementById('result');
const continueBtn = document.getElementById('continue-btn');
const backBtn = document.getElementById('back-btn');
const explanation = document.getElementById('explanation');
const pointsDisplay = document.getElementById('points-value');
const difficultySelect = document.getElementById('difficulty');

const prompts = {
  easy: [
    "cat",
    "dog",
    "hello world",
    "javascript",
    "good morning",
    "fast typing",
    "easy sentence",
    "blue sky",
    "green grass",
    "sunny day"
  ],
  medium: [
    "The quick brown fox jumps over the lazy dog.",
    "Practice makes perfect.",
    "Typing fast and accurately is a valuable skill.",
    "Coding challenges can be fun and rewarding.",
    "Stay focused and keep improving.",
    "React quickly but type carefully.",
    "Every great achievement starts with a single step.",
    "Learning never exhausts the mind.",
    "JavaScript powers interactive web games.",
    "Consistency is the key to mastery."
  ],
  hard: [
    "Sphinx of black quartz, judge my vow.",
    "Pack my box with five dozen liquor jugs.",
    "Amazingly few discotheques provide jukeboxes.",
    "The five boxing wizards jump quickly.",
    "How vexingly quick daft zebras jump!",
    "Jinxed wizards pluck ivy from the big quilt.",
    "Crazy Frederick bought many very exquisite opal jewels.",
    "We promptly judged antique ivory buckles for the next prize.",
    "Sixty zippers were quickly picked from the woven jute bag.",
    "Grumpy wizards make toxic brew for the evil Queen and Jack."
  ]
};

let points = 0;
let isFirstRound = true;
let roundActive = false;
let startTime = 0;
let currentPrompt = "";
let currentDifficulty = "medium";

function getRandomPrompt(level) {
  const arr = prompts[level];
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPoints(timeTaken, accuracy, difficulty) {
  // Higher base for harder levels
  let base = difficulty === "hard" ? 200 : difficulty === "medium" ? 100 : 60;
  if (accuracy === 100 && timeTaken < 5000) return base;
  if (accuracy >= 95 && timeTaken < 7000) return Math.floor(base * 0.8);
  if (accuracy >= 90 && timeTaken < 9000) return Math.floor(base * 0.6);
  if (accuracy >= 80 && timeTaken < 12000) return Math.floor(base * 0.4);
  return Math.floor(base * 0.2);
}

function resetInput() {
  typingInput.value = "";
  typingInput.disabled = true;
  typingInput.blur();
  roundActive = false;
}

function showContinueAndBack() {
  continueBtn.style.display = "inline-block";
  backBtn.style.display = "inline-block";
}
function hideContinueAndBack() {
  continueBtn.style.display = "none";
  backBtn.style.display = "none";
}

function startRound() {
  currentPrompt = getRandomPrompt(currentDifficulty);
  promptBox.textContent = currentPrompt;
  typingInput.value = "";
  typingInput.disabled = false;
  typingInput.focus();
  result.textContent = "";
  explanation.style.display = "none";
  roundActive = true;
  startTime = Date.now();

  if (isFirstRound) {
    hideContinueAndBack();
  }
}

function checkTyping() {
  if (!roundActive) return;
  const userText = typingInput.value;
  if (userText.length < currentPrompt.length) return;

  // End round as soon as user finishes typing (even if extra chars)
  const endTime = Date.now();
  const timeTaken = endTime - startTime;
  typingInput.disabled = true;
  roundActive = false;

  // Calculate accuracy
  let correct = 0;
  for (let i = 0; i < currentPrompt.length; i++) {
    if (userText[i] === currentPrompt[i]) correct++;
  }
  const accuracy = Math.round((correct / currentPrompt.length) * 100);

  // Points calculation
  const earned = getPoints(timeTaken, accuracy, currentDifficulty);
  points += earned;
  pointsDisplay.textContent = points;

  result.innerHTML = `
    Time: <b>${(timeTaken / 1000).toFixed(2)}s</b><br>
    Accuracy: <b>${accuracy}%</b>
  `;

  startBtn.disabled = false;
  showContinueAndBack();
  if (isFirstRound) {
    isFirstRound = false;
  }
}

startBtn.addEventListener('click', () => {
  startBtn.disabled = true;
  resetInput();
  setTimeout(() => { // Small delay for UX
    startRound();
  }, 100);
});

typingInput.addEventListener('input', checkTyping);

continueBtn.addEventListener('click', () => {
  explanation.innerHTML = `
    <b>Why Typing Speed Matters</b><br>
    Typing quickly and accurately helps you work more efficiently, communicate faster, and reduces mistakes.<br>
    Practicing improves your muscle memory and focus.<br>
    <br>
    <i>Fast, accurate typing is a valuable skill for students, professionals, and anyone using a computer!</i>
  `;
  explanation.style.display = 'block';
  hideContinueAndBack();
});

backBtn.addEventListener('click', () => {
  history.back();
});

difficultySelect.addEventListener('change', (e) => {
  currentDifficulty = e.target.value;
  promptBox.textContent = `Click "Start" to begin`;
  resetInput();
  result.textContent = '';
  explanation.style.display = 'none';
  startBtn.disabled = false;
  // Reset points when difficulty changes
  points = 0;
  pointsDisplay.textContent = points;
  isFirstRound = true;
  hideContinueAndBack();
});


