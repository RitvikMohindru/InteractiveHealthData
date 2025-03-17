document.addEventListener("DOMContentLoaded", function () {
  const colors = ["red", "green", "blue", "yellow"];
  const colorKeys = { r: "red", g: "green", b: "blue", y: "yellow" };
  const textColors = {
    red: "#D22B2B",
    green: "#008000",
    blue: "#4169E1",
    yellow: "#ffd333",
  };

  let participantData = [];
  let dataLoaded = false;

  let currentColor = "";
  let currentWord = "";
  let score = 0;
  let questionCount = 0;
  const totalQuestions = 5;
  let startTime = null;
  let responseTimes = [];
  let averageResponseTime = 0;
  let feedbackTimeout = null;

  const wordDisplay = document.getElementById("stroop-word-display");
  const similarityDisplay = document.getElementById("similarity-display");
  const feedback = document.getElementById("stroop-feedback");
  const scoreDisplay = document.getElementById("stroop-score");
  const responseTimeDisplay = document.getElementById("stroop-response-time");
  const startButton = document.getElementById("stroop-start-button");
  const resetButton = document.getElementById("stroop-reset-button");

  loadCSVData();

  function loadCSVData() {
    fetch("data/survey_stats.csv")
      .then((response) => response.text())
      .then((csvText) => {
        participantData = parseCSV(csvText);
        dataLoaded = true;
        console.log("Participant data loaded:", participantData);
      })
      .catch((error) => {
        console.error("Error loading CSV data:", error);
        dataLoaded = false;
      });
  }

  function parseCSV(csvText) {
    const lines = csvText.split("\n");
    const headers = lines[0].split(",");
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "") continue;

      const values = lines[i].split(",");
      const entry = {};

      for (let j = 0; j < headers.length; j++) {
        const header = headers[j].trim();
        const value = values[j]?.trim();

        if (header === "subject") {
          entry[header] = parseInt(value);
        } else if (header === "session") {
          entry[header] = value;
        } else if (
          header === "accuracy" ||
          header === "avg_response_time" ||
          header === "avg_bvp" ||
          header === "avg_temp" ||
          header === "avg_eda"
        ) {
          entry[header] = parseFloat(value);
        } else {
          entry[header] = value;
        }
      }

      result.push(entry);
    }

    return result;
  }

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
    startTime = new Date();
  }

  function showFeedback(message) {
    wordDisplay.textContent = message;
    wordDisplay.style.color = "#36454F";

    if (feedbackTimeout) {
      clearTimeout(feedbackTimeout);
    }

    feedbackTimeout = setTimeout(() => {
      if (questionCount < totalQuestions) {
        displayNewWord();
      } else {
        endGame();
      }
    }, 1000);
  }

  let isWaitingForNext = false;

  function handleKeyPress(event) {
    if (isWaitingForNext) return;

    const key = event.key.toLowerCase();
    if (Object.keys(colorKeys).includes(key)) {
      isWaitingForNext = true;

      const selectedColor = colorKeys[key];
      const endTime = new Date();
      const responseTime = (endTime - startTime) / 1000;
      responseTimes.push(responseTime);

      if (selectedColor === currentColor) {
        showFeedback(`Correct!`);
        score += 1;
      } else {
        showFeedback(`Incorrect!`);
      }

      questionCount += 1;
      scoreDisplay.textContent = score;
      responseTimeDisplay.textContent = responseTime.toFixed(2);
    }
  }

  function showFeedback(message) {
    wordDisplay.textContent = message;
    wordDisplay.style.color = "#36454F";

    if (feedbackTimeout) clearTimeout(feedbackTimeout);

    feedbackTimeout = setTimeout(() => {
      if (questionCount < totalQuestions) {
        isWaitingForNext = false;
        displayNewWord();
      } else {
        endGame();
      }
    }, 1000);
  }

  function calculateAverageResponseTime() {
    const totalTime = responseTimes.reduce((acc, time) => acc + time, 0);
    averageResponseTime = (totalTime / responseTimes.length).toFixed(2);
    console.log(`Average Response Time: ${averageResponseTime}s`);
    return averageResponseTime;
  }

  function findSimilarParticipant(userAccuracy, userResponseTime) {
    if (!dataLoaded || participantData.length === 0) {
      return null;
    }

    userResponseTime = userResponseTime * 1000;

    let minDistance = Infinity;
    let similarParticipant = null;

    for (const participant of participantData) {
      const accuracyDiff = Math.abs(participant.accuracy - userAccuracy);
      const timeDiff =
        Math.abs(participant.avg_response_time - userResponseTime) / 1000;

      const distance = accuracyDiff * 3 + timeDiff * 0.5;

      if (distance < minDistance) {
        minDistance = distance;
        similarParticipant = participant;
      }
    }

    return similarParticipant;
  }

  function resetGame() {
    score = 0;
    questionCount = 0;
    currentColor = "";
    currentWord = "";
    responseTimes = [];
    averageResponseTime = 0;
    isWaitingForNext = false;

    scoreDisplay.textContent = score;
    responseTimeDisplay.textContent = "0.00";
    wordDisplay.textContent = "";
    feedback.textContent = "";

    wordDisplay.style.display = "block";
    feedback.style.display = "block";

    // Hide similarityDisplay
    similarityDisplay.style.display = "none";

    if (feedbackTimeout) {
      clearTimeout(feedbackTimeout);
      feedbackTimeout = null;
    }

    startButton.style.display = "block";
    startButton.textContent = "Start Game";
    resetButton.style.display = "none";

    document.removeEventListener("keydown", handleKeyPress);
  }

  function startGame() {
    score = 0;
    questionCount = 0;
    responseTimes = [];
    averageResponseTime = 0;
    isWaitingForNext = false;

    scoreDisplay.textContent = score;
    responseTimeDisplay.textContent = "0.00";
    wordDisplay.style.fontSize = "";

    startButton.style.display = "none";
    resetButton.style.display = "block";

    similarityDisplay.style.display = "none";
    wordDisplay.style.display = "block";
    feedback.style.display = "block";

    displayNewWord();

    document.addEventListener("keydown", handleKeyPress);
  }

  function endGame() {
    document.removeEventListener("keydown", handleKeyPress);
    const avgResponseTime = calculateAverageResponseTime();

    let accuracy = (score / totalQuestions) * 100;
    accuracy = accuracy.toFixed(1);

    const similarParticipant = findSimilarParticipant(
      accuracy / 100,
      parseFloat(avgResponseTime)
    );

    let resultMessage = `Game Over!<br>You achieved ${accuracy}% accuracy!`;
    let similarityMessage = "";

    if (accuracy < 65) {
      similarityMessage = `Try again to improve your accuracy!`;
    } else if (similarParticipant) {
      similarityMessage = `
      <h3>You have a similar accuracy to Participant #${
        similarParticipant.subject
      }!</h3>
      <p><strong>Accuracy:</strong> ${(
        similarParticipant.accuracy * 100
      ).toFixed(1)}%</p>
      <p><strong>Average Response Time:</strong> ${(
        similarParticipant.avg_response_time / 1000
      ).toFixed(2)}s</p>
      <p><strong>Mean Blood Volume Pulse (BVP):</strong> ${similarParticipant.avg_bvp.toFixed(
        2
      )}</p>
      <p><strong>Mean Temperature:</strong> ${similarParticipant.avg_temp.toFixed(
        2
      )}</p>
      <p><strong>Mean Electrodermal Activity (EDA):</strong> ${similarParticipant.avg_eda.toFixed(
        2
      )}</p>
    `;
    }

    wordDisplay.innerHTML = resultMessage;
    similarityDisplay.innerHTML = similarityMessage;
    wordDisplay.style.color = "#36454F";
    wordDisplay.style.fontSize = "1.5rem";

    similarityDisplay.style.display = "block";

    startButton.style.display = "block";
    resetButton.style.display = "none";
    startButton.textContent = "Restart Game";
  }

  resetButton.addEventListener("click", resetGame);
  startButton.addEventListener("click", startGame);
});
