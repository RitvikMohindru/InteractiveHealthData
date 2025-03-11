document.addEventListener("DOMContentLoaded", function () {
  const colors = ["red", "green", "blue", "yellow"];
  const colorKeys = { r: "red", g: "green", b: "blue", y: "yellow" };
  const textColors = {
    red: "#D22B2B",
    green: "#008000",
    blue: "#4169E1",
    yellow: "#ffd333",
  };

  let currentColor = "";
  let currentWord = "";
  let score = 0;
  let timeLeft = 20;
  let timerInterval = null;

  const wordDisplay = document.getElementById("stroop-word-display");
  const feedback = document.getElementById("stroop-feedback");
  const scoreDisplay = document.getElementById("stroop-score");
  const timerDisplay = document.getElementById("stroop-timer");
  const startButton = document.getElementById("stroop-start-button");
  const resetButton = document.getElementById("stroop-reset-button");

  function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function getRandomWord() {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function displayNewWord() {
    currentColor = getRandomColor();
    currentWord = getRandomWord();

    while (currentWord === currentColor) {
      currentWord = getRandomWord();
    }

    wordDisplay.textContent = currentWord.toUpperCase();
    wordDisplay.style.color = textColors[currentColor];
  }

  function showFeedback(message) {
    wordDisplay.textContent = message;
    wordDisplay.style.color = "#36454F";

    setTimeout(() => {
      displayNewWord();
    }, 600);
  }

  function handleKeyPress(event) {
    const key = event.key.toLowerCase();
    if (Object.keys(colorKeys).includes(key)) {
      const selectedColor = colorKeys[key];

      if (selectedColor === currentColor) {
        showFeedback("Correct!");
        score += 1;
      } else {
        showFeedback(`Incorrect!`);
      }

      scoreDisplay.textContent = score;
    }
  }

  function startGame() {
    score = 0;
    timeLeft = 20;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;

    startButton.style.display = "none";
    resetButton.style.display = "block";

    wordDisplay.style.display = "block";
    feedback.style.display = "block";

    if (timerInterval) {
      clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
      timeLeft -= 1;
      timerDisplay.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endGame();
      }
    }, 1000);

    displayNewWord();

    document.addEventListener("keydown", handleKeyPress);
  }

  function endGame() {
    document.removeEventListener("keydown", handleKeyPress);
    showFeedback(`Game Over! Your final score is ${score}.`);

    startButton.style.display = "block";
    resetButton.style.display = "none";

    startButton.textContent = "Restart Game";

    wordDisplay.style.display = "none";
    feedback.style.display = "none";
  }

  resetButton.addEventListener("click", function () {
    startGame();
  });

  startButton.addEventListener("click", startGame);
});
