const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameOverPopup = document.getElementById("gameOverPopup");
const finalScore = document.getElementById("finalScore");
const replayButton = document.getElementById("replayButton");
const outButton = document.getElementById("outButton");
const pauseText = document.getElementById("pauseText");

let isPaused = false;

class Player {
  constructor() {
    this.width = 40;
    this.height = 40;
    this.x = 50;
    this.y = canvas.height / 2;
    this.speed = 3;
  }
  draw() {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.width, this.y - this.height / 2);
    ctx.lineTo(this.x - this.width, this.y + this.height / 2);
    ctx.closePath();
    ctx.fill();
  }
  moveUp() {
    if (this.y > 0) this.y -= this.speed;
  }
  moveDown() {
    if (this.y + this.height < canvas.height) this.y += this.speed;
  }
  moveLeft() {
    if (this.x > 0) this.x -= this.speed;
  }
  moveRight() {
    if (this.x + this.width < canvas.width) this.x += this.speed;
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 5;
    this.speed = 7;
  }
  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  update() {
    this.x += this.speed;
  }
}

class Musuh {
  constructor() {
    this.size = 35;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.size);
    this.speed = 2;
  }
  draw() {
    ctx.fillStyle = "purple";
    ctx.beginPath();
    const angle = (2 * Math.PI) / 5;
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(
        this.x + this.size * Math.cos(i * angle),
        this.y + this.size * Math.sin(i * angle)
      );
    }
    ctx.closePath();
    ctx.fill();
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

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.key === " ") {
    if (!isPaused) {
      bullets.push(new Bullet(player.x + player.width / 2, player.y));
    }
  }

  if (e.key.toLowerCase() === "p") {
    isPaused = !isPaused;
    pauseText.style.display = isPaused ? "block" : "none";
    if (!isPaused) updateGame();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function updateGame() {
  if (isPaused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.draw();

  if (keys["ArrowUp"]) player.moveUp();
  if (keys["ArrowDown"]) player.moveDown();
  if (keys["ArrowLeft"]) player.moveLeft();
  if (keys["ArrowRight"]) player.moveRight();

  bullets.forEach((bullet, index) => {
    bullet.update();
    bullet.draw();
    if (bullet.x > canvas.width) bullets.splice(index, 1);
  });

  musuhh.forEach((musuh, eIndex) => {
    musuh.update();
    musuh.draw();

    if (musuh.x + musuh.size < 0) {
      musuhh.splice(eIndex, 1);
      lives--;
    }

    bullets.forEach((bullet, bIndex) => {
      if (
        bullet.x < musuh.x + musuh.size &&
        bullet.x + bullet.width > musuh.x &&
        bullet.y < musuh.y + musuh.size &&
        bullet.y + bullet.height > musuh.y
      ) {
        bullets.splice(bIndex, 1);
        musuhh.splice(eIndex, 1);
        score += 1;
      }
    });
  });

  ctx.fillStyle = "white";
  ctx.font = "16px 'Press Start 2P'";
  ctx.fillText("Score: " + score, 20, 40);
  ctx.fillText("Hearts: " + lives, 20, 70);

  if (lives <= 0) {
    gameOverPopup.style.display = "block";
    finalScore.innerHTML = "Score: " + score;
    return;
  }

  requestAnimationFrame(updateGame);
}

function spawnMusuh() {
  if (!isPaused) {
    musuhh.push(new Musuh());
  }
}

replayButton.addEventListener("click", () => {
  document.location.reload();
});

outButton.addEventListener("click", () => {
  window.close();
});

setInterval(spawnMusuh, 1500);
updateGame();
