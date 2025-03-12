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
    this.y -= this.speed;
    if (this.y < 0) this.y = 0;
  }
  
  moveDown() {
    this.y += this.speed;
    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
    }
  }
  
  moveLeft() {
    this.x -= this.speed;
    if (this.x < 0) this.x = 0;
  }
  
  moveRight() {
    this.x += this.speed;
    if (this.x + this.width > canvas.width) {
      this.x = canvas.width - this.width;
    }
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
let lastShotTime = 0;
const bulletCooldown = 300; // dalam milidetik

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  const currentTime = Date.now();
  if (e.key === " " && currentTime - lastShotTime > bulletCooldown) {
    if (!isPaused) {
      bullets.push(new Bullet(player.x + player.width / 2, player.y));
      lastShotTime = currentTime;
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

    // jika player kena tabrak musuh
    if (
      player.x < musuh.x + musuh.size &&
      player.x + player.width > musuh.x &&
      player.y < musuh.y + musuh.size &&
      player.y + player.height > musuh.y
    ) {
      // jika ketabrak langsung game over y
      lives = 0;
      gameOverPopup.style.display = "block";
      finalScore.innerHTML = "Score: " + score;
      return; // stop loop musuh dan gameover
    }

    // musuh sampe kiri = hearts berkurang
    if (musuh.x + musuh.size < 0) {
      musuhh.splice(eIndex, 1);
      lives--;
    }

    // validasi peluru kena musuh
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
  
    clearInterval(musuhSpawner);
  
    musuhh = [];
  
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

  setTimeout(() => {
    if (!window.closed) {
      alert("Silakan tutup tab ini secara manual. Browser tidak mengizinkan halaman ini untuk menutup tab secara otomatis.");
    }
  }, 100); 
});


setInterval(spawnMusuh, 1500);
updateGame();
