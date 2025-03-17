const canvas = document.getElementById("animationCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let neuralPaths = [];
let brainImage = new Image();

brainImage.src = "assets/brain.png";
console.log(brainImage.src);

const brainCenterX = canvas.width / 2;
const brainCenterY = canvas.height / 2;

function generateNeuralPaths() {
  for (let i = 0; i < 100; i++) {
    neuralPaths.push({
      x: brainCenterX,
      y: brainCenterY,
      radius: Math.random() * 2 + 1,
      glow: Math.random() * 2 + 1,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 50 + 0.5,
    });
  }
}

function drawNeuralPaths() {
  for (let path of neuralPaths) {
    ctx.beginPath();
    ctx.arc(path.x, path.y, path.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${path.glow})`;
    ctx.fill();
    path.x += Math.cos(path.angle) * path.speed;
    path.y += Math.sin(path.angle) * path.speed;
  }
}
let titleDisplayed = false;
let brainFaded = false;

let brainImageVisible = true;

function animateBrain() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (brainImageVisible) {
    drawBrainImage();
  }
  drawNeuralPaths();

  if (
    !titleDisplayed &&
    neuralPaths.every(
      (path) => Math.hypot(path.x - brainCenterX, path.y - brainCenterY) > 80
    )
  ) {
    document.getElementById("title").style.display = "block";
    document.getElementById("title").style.opacity = 1;
    titleDisplayed = true;
  }

  if (titleDisplayed && !brainFaded) {
    brainFaded = true;
    neuralPaths = [];
    brainImageVisible = false;
  }

  requestAnimationFrame(animateBrain);
}

function drawBrainImage() {
  ctx.drawImage(
    brainImage,
    canvas.width / 2 - brainImage.width / 2,
    canvas.height / 2 - brainImage.height / 2
  );
}

brainImage.onload = function () {
  generateNeuralPaths();
  animateBrain();
};
