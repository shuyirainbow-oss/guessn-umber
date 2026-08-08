const minValueInput = document.getElementById("minValue");
const maxValueInput = document.getElementById("maxValue");
const newGameButton = document.getElementById("newGame");
const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const resultText = document.getElementById("resultText");
const attemptsText = document.getElementById("attempts");
const guessHistory = document.getElementById("guessHistory");

let targetNumber = 0;
let minValue = 1;
let maxValue = 100;
let attempts = 0;
let finished = false;

newGameButton.addEventListener("click", startGame);
guessBtn.addEventListener("click", submitGuess);
guessInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitGuess();
  }
});

function startGame() {
  minValue = clamp(parseInt(minValueInput.value, 10), 1, 999999);
  maxValue = clamp(parseInt(maxValueInput.value, 10), minValue + 1, 1000000);
  minValueInput.value = minValue;
  maxValueInput.value = maxValue;
  targetNumber = getRandomNumber(minValue, maxValue);
  attempts = 0;
  finished = false;
  guessInput.disabled = false;
  guessBtn.disabled = false;
  guessInput.value = "";
  guessInput.focus();
  resultText.textContent = `遊戲開始！猜一個 ${minValue} 到 ${maxValue} 的數字。`;
  attemptsText.textContent = "0";
  guessHistory.innerHTML = "";
}

function clamp(value, min, max) {
  return Number.isNaN(value) ? min : Math.min(max, Math.max(min, value));
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function submitGuess() {
  if (finished) return;

  const guess = parseInt(guessInput.value, 10);
  if (Number.isNaN(guess)) {
    updateResult("請輸入有效的數字。", "#ffd966");
    return;
  }

  if (guess < minValue || guess > maxValue) {
    updateResult(`請輸入 ${minValue} 到 ${maxValue} 的數字。`, "#ffd966");
    return;
  }

  attempts += 1;
  attemptsText.textContent = attempts.toString();
  addHistory(guess);

  if (guess === targetNumber) {
    finished = true;
    updateResult(`答對了！你猜了 ${attempts} 次。`, "#80ff96");
    guessInput.disabled = true;
    guessBtn.disabled = true;
    return;
  }

  const hint = guess < targetNumber ? "太小了" : "太大了";
  updateResult(`${hint}，再試一次。`, "#ffb3b3");
  guessInput.select();
}

function updateResult(message, color) {
  resultText.textContent = message;
  resultText.style.color = color;
}

function addHistory(guess) {
  const item = document.createElement("li");
  item.textContent = `第 ${attempts} 次：${guess}`;
  guessHistory.prepend(item);
}

startGame();
