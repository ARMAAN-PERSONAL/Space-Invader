const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const player = {
    width: 50,
    height: 30,
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
    speed: 5,
    dx: 0,
    dy: 0
};

const bullet = {
    width: 5,
    height: 10,
    x: 0,
    y: canvas.height - 50,
    speed: 7,
    active: false
};

const aliens = [];
const alienRows = 3;
const alienCols = 8;
const alienWidth = 40;
const alienHeight = 30;
const alienPadding = 10;
const alienOffsetTop = 30;
const alienOffsetLeft = 30;
let alienDirection = 1; // 1: right, -1: left
let alienMoveDown = false;
const alienSpeed = 1;

for (let c = 0; c < alienCols; c++) {
    for (let r = 0; r < alienRows; r++) {
        aliens.push({
            x: c * (alienWidth + alienPadding) + alienOffsetLeft,
            y: r * (alienHeight + alienPadding) + alienOffsetTop,
            width: alienWidth,
            height: alienHeight,
            active: true
        });
    }
}

const alienBullets = [];
const alienBulletSpeed = 3;
const alienBulletInterval = 2000; // Interval between alien shots

let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;
let gameRunning = true;
let gamePaused = false;

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
document.getElementById('restartBtn').addEventListener('click', resetGame);
document.getElementById('pauseBtn').addEventListener('click', togglePauseGame);
document.getElementById('endBtn').addEventListener('click', endGame);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === 'Up' || e.key === 'ArrowUp') {
        upPressed = true;
    } else if (e.key === 'Down' || e.key === 'ArrowDown') {
        downPressed = true;
    } else if (e.key === ' ' && !bullet.active && gameRunning && !gamePaused) {
        bullet.x = player.x + player.width / 2 - bullet.width / 2;
        bullet.y = player.y;
        bullet.active = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (e.key === 'Up' || e.key === 'ArrowUp') {
        upPressed = false;
    } else if (e.key === 'Down' || e.key === 'ArrowDown') {
        downPressed = false;
    }
}

function movePlayer() {
    if (rightPressed && player.x < canvas.width - player.width) {
        player.x += player.speed;
    } else if (leftPressed && player.x > 0) {
        player.x -= player.speed;
    } else if (upPressed && player.y > 0) {
        player.y -= player.speed;
    } else if (downPressed && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
}

function moveBullet() {
    if (bullet.active) {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) {
            bullet.active = false;
        }
    }
}

function moveAliens() {
    alienMoveDown = false;

    for (let i = 0; i < aliens.length; i++) {
        if (aliens[i].active) {
            aliens[i].x += alienDirection * alienSpeed;
            if (aliens[i].x + aliens[i].width > canvas.width || aliens[i].x < 0) {
                alienDirection *= -1;
                alienMoveDown = true;
            }
        }
    }

    if (alienMoveDown) {
        for (let i = 0; i < aliens.length; i++) {
            if (aliens[i].active) {
                aliens[i].y += alienHeight;
            }
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y); // Top point
    ctx.lineTo(player.x, player.y + player.height); // Bottom left
    ctx.lineTo(player.x + player.width, player.y + player.height); // Bottom right
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawBullet() {
    if (bullet.active) {
        ctx.fillStyle = 'red';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

function drawAliens() {
    ctx.fillStyle = 'purple';
    ctx.strokeStyle = 'darkviolet';
    ctx.lineWidth = 2;

    for (let i = 0; i < aliens.length; i++) {
        if (aliens[i].active) {
            ctx.beginPath();
            ctx.moveTo(aliens[i].x + aliens[i].width / 2, aliens[i].y); // Top point
            ctx.lineTo(aliens[i].x, aliens[i].y + aliens[i].height); // Bottom left
            ctx.lineTo(aliens[i].x + aliens[i].width, aliens[i].y + aliens[i].height); // Bottom right
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
}

function collisionDetection() {
    for (let i = 0; i < aliens.length; i++) {
        if (aliens[i].active && bullet.active && bullet.x < aliens[i].x + aliens[i].width && bullet.x + bullet.width > aliens[i].x && bullet.y < aliens[i].y + aliens[i].height && bullet.y + bullet.height > aliens[i].y) {
            aliens[i].active = false;
            bullet.active = false;
        }
    }

    const activeAliens = aliens.filter(alien => alien.active);
    if (activeAliens.length === 0) {
        endGame();
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = '36px Arial';
        ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
    }
}

function alienShoot() {
    if (!gameRunning || gamePaused) return;

    const activeAliens = aliens.filter(alien => alien.active);
    if (activeAliens.length > 0) {
        const shooter = activeAliens[Math.floor(Math.random() * activeAliens.length)];
        alienBullets.push({
            x: shooter.x + shooter.width / 2,
            y: shooter.y + shooter.height,
            width: 5,
            height: 10,
            speed: alienBulletSpeed
        });
    }
}

function moveAlienBullets() {
    for (let i = 0; i < alienBullets.length; i++) {
        alienBullets[i].y += alienBullets[i].speed;
        if (alienBullets[i].y > canvas.height) {
            alienBullets.splice(i, 1);
            i--;
        }
    }
}

function drawAlienBullets() {
    ctx.fillStyle = 'blue';
    for (let i = 0; i < alienBullets.length; i++) {
        ctx.fillRect(alienBullets[i].x, alienBullets[i].y, alienBullets[i].width, alienBullets[i].height);
    }
}

function playerCollisionDetection() {
    for (let i = 0; i < alienBullets.length; i++) {
        if (alienBullets[i].x < player.x + player.width && alienBullets[i].x + alienBullets[i].width > player.x && alienBullets[i].y < player.y + player.height && alienBullets[i].y + alienBullets[i].height > player.y) {
            gameRunning = false;
            alert('Game Over! Press "R" to restart.');
        }
    }
}

function resetGame() {
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 50;
    bullet.active = false;
    alienBullets.length = 0;
    gameRunning = true;
    gamePaused = false;

    for (let c = 0; c < alienCols; c++) {
        for (let r = 0; r < alienRows; r++) {
            aliens[c * alienRows + r].active = true;
            aliens[c * alienRows + r].x = c * (alienWidth + alienPadding) + alienOffsetLeft;
            aliens[c * alienRows + r].y = r * (alienHeight + alienPadding) + alienOffsetTop;
        }
    }

    draw();
}

function endGame() {
    gameRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '36px Arial';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
}

function togglePauseGame() {
    gamePaused = !gamePaused;
    if (!gamePaused) {
        draw();
    }
}

function draw() {
    if (gamePaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameRunning) {
        drawPlayer();
        drawBullet();
        drawAliens();
        drawAlienBullets();
        movePlayer();
        moveBullet();
        moveAliens();
        moveAlienBullets();
        collisionDetection();
        playerCollisionDetection();
        requestAnimationFrame(draw);
    }
}

setInterval(alienShoot, alienBulletInterval);

draw();


// Add touch controls
canvas.addEventListener('touchstart', touchStartHandler);
canvas.addEventListener('touchmove', touchMoveHandler);

let touchStartX, touchStartY;

function touchStartHandler(e) {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function touchMoveHandler(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    if (Math.abs(touchEndX - touchStartX) > Math.abs(touchEndY - touchStartY)) {
        // Horizontal swipe
        if (touchEndX < touchStartX) {
            leftPressed = true;
            rightPressed = false;
        } else {
            rightPressed = true;
            leftPressed = false;
        }
    } else {
        // Vertical swipe
        if (touchEndY < touchStartY) {
            upPressed = true;
            downPressed = false;
        } else {
            downPressed = true;
            upPressed = false;
        }
    }
}
