const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let lives = 3;
let isGamePaused = false;
let player = { x: canvas.width / 2 - 25, y: canvas.height - 50, width: 50, height: 30, speed: 10 };
let aliens = [];
let bullets = [];
let alienBullets = [];
let powerUps = [];
let level = 1;
let alienSpeed = 0.5;  // Reduced difficulty
let bulletSpeed = 3;   // Reduced difficulty
let alienBulletSpeed = 2; // Reduced difficulty
let maxAliens = 5;
let keys = {};

document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('endBtn').addEventListener('click', endGame);

window.addEventListener('keydown', function (e) {
    keys[e.key] = true;
    if (e.key === ' ') {
        fireBullet();
    }
});
window.addEventListener('keyup', function (e) {
    keys[e.key] = false;
});

// Mobile touch controls
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);
canvas.addEventListener('touchend', () => { keys = {}; });

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    keys = {};
    if (touch.clientX < canvas.width / 2) {
        keys['ArrowLeft'] = true;
    } else {
        keys['ArrowRight'] = true;
    }
    if (touch.clientY < canvas.height / 2) {
        keys['ArrowUp'] = true;
    } else {
        keys['ArrowDown'] = true;
    }
}

function movePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x + player.width < canvas.width) {
        player.x += player.speed;
    }
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y + player.height < canvas.height) {
        player.y += player.speed;
    }
}

function drawPlayer() {
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function fireBullet() {
    bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 10 });
}

function drawBullets() {
    ctx.fillStyle = '#FF0000';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        bullet.y -= bulletSpeed;
    });
    bullets = bullets.filter(bullet => bullet.y > 0);
}

function createAliens() {
    for (let i = 0; i < maxAliens; i++) {
        aliens.push({ x: Math.random() * (canvas.width - 30), y: Math.random() * -100, width: 30, height: 20 });
    }
}

function drawAliens() {
    ctx.fillStyle = '#00FFFF';
    aliens.forEach(alien => {
        ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
        alien.y += alienSpeed;
    });
    aliens = aliens.filter(alien => alien.y < canvas.height);
}

function alienShoot() {
    aliens.forEach(alien => {
        if (Math.random() < 0.02) {
            alienBullets.push({ x: alien.x + alien.width / 2 - 2.5, y: alien.y + alien.height, speed: alienBulletSpeed });
        }
    });
}

function drawAlienBullets() {
    ctx.fillStyle = '#FFFF00';
    alienBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, 5, 10);
        bullet.y += bullet.speed;
    });
}

function drawPowerUps() {
    ctx.fillStyle = '#FF00FF';
    powerUps.forEach(powerUp => {
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        powerUp.y += 1;
    });
    powerUps = powerUps.filter(powerUp => powerUp.y < canvas.height);
}

function updateScoreboard() {
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('highScore').textContent = `High Score: ${highScore}`;
    document.getElementById('lives').textContent = `Lives: ${lives}`;
    document.getElementById('level').textContent = `Level: ${level}`;
}

function handleCollisions() {
    bullets.forEach(bullet => {
        aliens.forEach(alien => {
            if (bullet.x < alien.x + alien.width &&
                bullet.x + bullet.width > alien.x &&
                bullet.y < alien.y + alien.height &&
                bullet.y + bullet.height > alien.y) {
                score += 10;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('highScore', highScore);
                }
                aliens = aliens.filter(a => a !== alien);
                bullets = bullets.filter(b => b !== bullet);
                if (Math.random() < 0.1) {
                    powerUps.push({ x: alien.x, y: alien.y, width: 20, height: 20 });
                }
            }
        });
    });

    alienBullets.forEach(bullet => {
        if (bullet.x < player.x + player.width &&
            bullet.x + 5 > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + 10 > player.y) {
            lives--;
            alienBullets = alienBullets.filter(b => b !== bullet);
            if (lives <= 0) {
                endGame();
            } else {
                player.x = canvas.width / 2 - player.width / 2;
                player.y = canvas.height - 50;
            }
        }
    });

    powerUps.forEach(powerUp => {
        if (powerUp.x < player.x + player.width &&
            powerUp.x + powerUp.width > player.x &&
            powerUp.y < player.y + player.height &&
            powerUp.y + powerUp.height > player.y) {
            powerUps = powerUps.filter(p => p !== powerUp);
            lives++;
            if (lives > 3) lives = 3;
        }
    });
}

function levelUp() {
    level++;
    alienSpeed += 0.25;  // Adjusted difficulty increment
    bulletSpeed += 0.25; // Adjusted difficulty increment
    alienBulletSpeed += 0.25; // Adjusted difficulty increment
    maxAliens += 2;
    createAliens();
}

function gameLoop() {
    if (!isGamePaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        movePlayer();
        drawPlayer();
        drawBullets();
        drawAliens();
        drawAlienBullets();
        drawPowerUps();
        handleCollisions();
        updateScoreboard();
        alienShoot();
        if (aliens.length === 0) {
            createAliens();
        }
        if (score >= level * 1000) {
            levelUp();
        }
    }
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    score = 0;
    lives = 3;
    bullets = [];
    aliens = [];
    alienBullets = [];
    powerUps = [];
    isGamePaused = false;
    level = 1;
    alienSpeed = 0.5;
    bulletSpeed = 3;
    alienBulletSpeed = 2;
    maxAliens = 5;
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 50;
    createAliens();
    gameLoop();
}

function togglePause() {
    isGamePaused = !isGamePaused;
}

function endGame() {
    alert('Game Over');
    restartGame();
}

restartGame();
