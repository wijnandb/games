// Game constants
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 20;
const tileCount = canvas.width / gridSize;
const snakeColor = "#00FF00";
const appleColor = "#FF0000";

// Game variables
let snake = [{ x: 10, y: 10 }];
let dx = 0;
let dy = 0;
let appleX;
let appleY;
let score = 0;

// Game initialization
function init() {
  // Initialize snake position and direction
  snake = [{ x: 10, y: 10 }];
  dx = 0;
  dy = 0;

  // Generate initial apple position
  generateApple();

  // Set up keyboard event listeners
  document.addEventListener("keydown", changeDirection);

  // Start the game loop
  setInterval(gameLoop, 100);
}

// Generate a random apple position
function generateApple() {
  appleX = Math.floor(Math.random() * tileCount);
  appleY = Math.floor(Math.random() * tileCount);
}

// Handle keyboard input
function changeDirection(event) {
  const LEFT_KEY = 37;
  const UP_KEY = 38;
  const RIGHT_KEY = 39;
  const DOWN_KEY = 40;

  const keyPressed = event.keyCode;
  const goingUp = dy === -1;
  const goingDown = dy === 1;
  const goingLeft = dx === -1;
  const goingRight = dx === 1;

  if (keyPressed === LEFT_KEY && !goingRight) {
    dx = -1;
    dy = 0;
  }

  if (keyPressed === UP_KEY && !goingDown) {
    dx = 0;
    dy = -1;
  }

  if (keyPressed === RIGHT_KEY && !goingLeft) {
    dx = 1;
    dy = 0;
  }

  if (keyPressed === DOWN_KEY && !goingUp) {
    dx = 0;
    dy = 1;
  }
}

// Main game loop
function gameLoop() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move the snake
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  // Check if the snake ate the apple
  if (head.x === appleX && head.y === appleY) {
    score++;
    generateApple();
  } else {
    snake.pop();
  }

  // Draw the snake
  snake.forEach(drawSnake);

  // Draw the apple
  drawApple();

  // Check for game over conditions
  if (collision()) {
    gameOver();
  }
}

// Draw the snake
function drawSnake(snakePart) {
  ctx.fillStyle = snakeColor;
  ctx.fillRect(
    snakePart.x * gridSize,
    snakePart.y * gridSize,
    gridSize,
    gridSize
  );
}

// Draw the apple
function drawApple() {
  ctx.fillStyle = appleColor;
  ctx.fillRect(appleX * gridSize, appleY * gridSize, gridSize, gridSize);
}

// Check for collision with the walls or snake's body
function collision() {
  const head = snake[0];

  // Check for collision with the walls
  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= tileCount ||
    head.y >= tileCount
  ) {
    return true;
  }

  // Check for collision with the snake's body
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }

  return false;
}

// Handle game over
function gameOver() {
  clearInterval(gameLoop);
  alert("Game over! Your score: " + score);
  init();
}

// Start the game
init();
