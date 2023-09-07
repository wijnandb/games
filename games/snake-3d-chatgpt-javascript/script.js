



import * as THREE from '/home/wijnandb/sites/html/snake_games/3d-chatgpt-javascript/three.js';

// Game constants
const sceneWidth = window.innerWidth;
const sceneHeight = window.innerHeight;
const gridSize = 20;
const tileCount = sceneWidth / gridSize;
const snakeColor = 0x00FF00;
const appleColor = 0xFF0000;

// Game variables
let scene, camera, renderer;
let snake, apple;
let dx = 0;
let dy = 0;
let score = 0;

// Game initialization
function init() {
  // Create the scene
  scene = new THREE.Scene();

  // Create the camera
  camera = new THREE.PerspectiveCamera(
    75,
    sceneWidth / sceneHeight,
    0.1,
    1000
  );
  camera.position.z = 30;

  // Create the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(sceneWidth, sceneHeight);
  document.getElementById("gameCanvas").appendChild(renderer.domElement);

  // Initialize snake position and direction
  snake = [{ x: 10, y: 10 }];
  dx = 0;
  dy = 0;

  // Generate initial apple position
  generateApple();

  // Start the game loop
  gameLoop();
}

// Generate a random apple position
function generateApple() {
  const geometry = new THREE.BoxGeometry(gridSize, gridSize, gridSize);
  const material = new THREE.MeshBasicMaterial({ color: appleColor });
  apple = new THREE.Mesh(geometry, material);
  apple.position.x = Math.floor(Math.random() * tileCount) * gridSize;
  apple.position.y = Math.floor(Math.random() * tileCount) * gridSize;
  scene.add(apple);
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
  // Move the snake
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  // Check if the snake ate the apple
  if (
    head.x === apple.position.x &&
    head.y === apple.position.y
  ) {
    score++;
    scene.remove(apple);
    generateApple();
  } else {
    snake.pop();
  }

  // Render the scene
  renderer.render(scene, camera);

  // Check for game over conditions
  if (collision()) {
    gameOver();
  } else {
    requestAnimationFrame(gameLoop);
  }
}

// Check for collision with the walls or snake's body
function collision() {
  const head = snake[0];

  // Check for collision with the walls
  if (
    head.x < -sceneWidth / 2 ||
    head.y < -sceneHeight / 2 ||
    head.x >= sceneWidth / 2 ||
    head.y >= sceneHeight / 2
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
  alert("Game over! Your score: " + score);
  location.reload(); // Restart the game
}

// Set up keyboard event listener
document.addEventListener("keydown", changeDirection);

// Start the game
init();
