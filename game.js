const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gameOverPopup = document.getElementById("gameOverPopup");
const finalScore = document.getElementById("finalScore");
const replayButton = document.getElementById("replayButton");
const outButton = document.getElementById("outButton");

const youWinPopup = document.getElementById("youWinPopup");
const winScore = document.getElementById("winScore");
const replayWinButton = document.getElementById("replayWinButton");
const quitWinButton = document.getElementById("quitWinButton");

const pauseText = document.getElementById("pauseText");

let isPaused = false;
let gameEnded = false;

const playerImage = new Image();
playerImage.src = 'player_biru.png'; 

const musuhImages = [];
for (let i = 1; i <= 3; i++) {
  const img = new Image();
  img.src = `musuh${i}.png`; 
  musuhImages.push(img);
}

const jumlahJenisMusuh = musuhImages.length;

class Player {
  constructor() {
    this.width = 80;
    this.height = 80;
    this.x = 50;
    this.y = canvas.height / 2;
    this.speed = 3;
  }

  draw() {
    ctx.drawImage(playerImage, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }

  moveUp() {
    this.y -= this.speed;
    if (this.y < this.height / 2) this.y = this.height / 2;
  }

  moveDown() {
    this.y += this.speed;
    if (this.y > canvas.height - this.height / 2) this.y = canvas.height - this.height / 2;
  }

  moveLeft() {
    this.x -= this.speed;
    if (this.x < this.width / 2) this.x = this.width / 2;
  }

  moveRight() {
    this.x += this.speed;
    if (this.x > canvas.width - this.width / 2) this.x = canvas.width - this.width / 2;
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 4;
    this.speed = 5;
  }

  draw() {
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
    gradient.addColorStop(0, "#00ffff");
    gradient.addColorStop(1, "#1affff");

    ctx.fillStyle = gradient;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10;

    ctx.fillRect(this.x, this.y - this.height / 2, this.width, this.height);
    ctx.shadowBlur = 0;
  }

  update() {
    this.x += this.speed;
  }
}

class Musuh {
  constructor(imageIndex) {
    this.size = 80;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.size);
    this.speed = 2 + (score / 20);
    this.image = musuhImages[imageIndex];
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
  }

  update() {
    this.x -= this.speed;
  }
}

let player = new Player();
let bullets = [];
let musuhh = [];
let score = 0;
let lives = 5;
let keys = {};
let lastShotTime = 0;
const bulletCooldown = 300;
const hitboxPadding = 20;
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  const currentTime = Date.now();
  if (e.key === " " && currentTime - lastShotTime > bulletCooldown && !isPaused && !gameEnded) {
    bullets.push(new Bullet(player.x + player.width / 2, player.y));
    lastShotTime = currentTime;
  }

  if (e.key.toLowerCase() === "q" && !gameEnded) {
    isPaused = !isPaused;
    pauseText.style.display = isPaused ? "block" : "none";
    if (!isPaused) updateGame();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function updateGame() {
  if (isPaused || gameEnded) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.draw();

  if (keys["ArrowUp"]) player.moveUp();
  if (keys["ArrowDown"]) player.moveDown();
  if (keys["ArrowLeft"]) player.moveLeft();
  if (keys["ArrowRight"]) player.moveRight();

  if (player.x + player.width / 2 >= canvas.width) {
    winGame();
    return;
  }

  bullets.forEach((bullet, index) => {
    bullet.update();
    bullet.draw();
    if (bullet.x > canvas.width) bullets.splice(index, 1);
  });

  musuhh.forEach((musuh, eIndex) => {
    musuh.update();
    musuh.draw();

    const playerLeft = player.x - player.width / 2 + hitboxPadding;
    const playerRight = player.x + player.width / 2 - hitboxPadding;
    const playerTop = player.y - player.height / 2 + hitboxPadding;
    const playerBottom = player.y + player.height / 2 - hitboxPadding;

    const musuhLeft = musuh.x + hitboxPadding;
    const musuhRight = musuh.x + musuh.size - hitboxPadding;
    const musuhTop = musuh.y + hitboxPadding;
    const musuhBottom = musuh.y + musuh.size - hitboxPadding;

    if (playerLeft < musuhRight && playerRight > musuhLeft && playerTop < musuhBottom && playerBottom > musuhTop) {
      gameOver();
      return;
    }

    if (musuh.x + musuh.size < 0) {
      musuhh.splice(eIndex, 1);
      lives--;
    }

    bullets.forEach((bullet, bIndex) => {
      if (bullet.x < musuh.x + musuh.size && bullet.x + bullet.width > musuh.x &&
          bullet.y < musuh.y + musuh.size && bullet.y + bullet.height > musuh.y) {
        bullets.splice(bIndex, 1);
        musuhh.splice(eIndex, 1);
        score++;
      }
    });
  });

  ctx.fillStyle = "white";
  ctx.font = "16px 'Press Start 2P'";
  ctx.fillText("Score: " + score, 20, 40);
  ctx.fillText("Hearts: " + lives, 20, 70);

  if (lives <= 0) {
    gameOver();
    return;
  }

  requestAnimationFrame(updateGame);
}

function winGame() {
  gameEnded = true;
  youWinPopup.style.display = "block";
  winScore.innerText = "Score: " + score;
  clearInterval(musuhSpawner);
}

function gameOver() {
  gameEnded = true;
  gameOverPopup.style.display = "block";
  finalScore.innerText = "Score: " + score;
  clearInterval(musuhSpawner);
}

function spawnMusuh() {
  if (!isPaused && !gameEnded) {
    const musuhIndex = Math.floor(score / 5) % jumlahJenisMusuh;
    musuhh.push(new Musuh(musuhIndex));
  }
}

replayButton.addEventListener("click", () => location.reload());
outButton.addEventListener("click", () => window.close());

replayWinButton.addEventListener("click", () => location.reload());
quitWinButton.addEventListener("click", () => window.close());

const musuhSpawner = setInterval(spawnMusuh, 1500);
updateGame();
