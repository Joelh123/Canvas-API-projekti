const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const image = document.getElementById('playerImage');
const bulletImage = document.getElementById('bulletImage');
const bulletPierceImage = document.getElementById("bulletPierceImage")
const bulletSizeImage = document.getElementById("bulletSizeImage")
const bulletSpeedImage = document.getElementById("bulletSpeedImage")

let gameOver = false;
let score = 0;
let bulletFired = false;
let paused = false;
const powerups = []

let enemies = [];
let enemySpeed = 2; 
let enemyDirection = 1; 
const enemyRows = 3; 
const enemyCols = 6; 
const enemyBullets = []

const player = {
    w: 50,
    h: 70,
    x: 400,
    y: 560,
    speed: 5,
    dx: 0
}

const bullet = {
    w: 15,
    h: 25,
    speed: 10,
    pierceLvl: 1
}

const obstacles = [
    {
        w: 50,
        h: 50,
        x: 55,
        y: 430,
        health: 3
    },
    {
        w: 50,
        h: 50,
        x: 180,
        y: 430,
        health: 3
    },
    {
        w: 50,
        h: 50,
        x: 305,
        y: 430,
        health: 3
    },
    {
        w: 50,
        h: 50,
        x: 430,
        y: 430,
        health: 3
    },
    {
        w: 50,
        h: 50,
        x: 555,
        y: 430,
        health: 3
    },
    {
        w: 50,
        h: 50,
        x: 680,
        y: 430,
        health: 3
    }
]

function drawPlayer(){
    ctx.drawImage(image, player.x, player.y, player.w, player.h)
}

function createEnemies(rows, cols) {
    enemies.length = 0; 
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            enemies.push({
                w: 50, 
                h: 50, 
                x: 80 + col * 60,
                y: 50 + row * 50,
                health: 1,
            });
        }
    }
}


function respawnEnemies() {
    createEnemies(enemyRows, enemyCols); 
    enemySpeed += 0.5; 
    enemyDirection = 1; 
}

function drawEnemies(enemyImage) {
    for (const enemy of enemies) {
        if (enemy.health > 0) {
            ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.w, enemy.h);
        }
    }
}

function updateEnemies() {
    let shouldReverse = false;

    for (const enemy of enemies) {
        enemy.x += enemySpeed * enemyDirection;

        if (enemy.x <= 0 || enemy.x + enemy.w >= canvas.width) {
            shouldReverse = true;
        }

        if (enemy.y + enemy.h >= player.y) {
            gameOverCallback(); 
            return; 
        }
    }

    if (shouldReverse) {
        enemyDirection *= -1; 
        for (const enemy of enemies) {
            enemy.y += 20; 
        }
    }
}

function allEnemiesDefeated() {
    return enemies.every(enemy => enemy.health <= 0);
}

function detectEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (enemy.health <= 0) {
            if (Math.floor(Math.random() * 30) === 1) {
                dropPowerup(enemy.x, enemy.y);
            }

            increaseScore();

            enemies.splice(i, 1);
            continue;
        }

        if (Math.floor(Math.random() * 2500) === 1) {
            enemyFireBullet(enemy.x + enemy.w / 2, enemy.y + enemy.h)
        }

        if (
            bullet.y < enemy.y + enemy.h &&
            bullet.y + bullet.h > enemy.y &&
            bullet.x + bullet.w > enemy.x &&
            bullet.x < enemy.x + enemy.w
        ) {
            enemy.health -= 1;
            bullet.pierceCount -= 1;

            if (bullet.pierceCount <= 0) {
                resetBullet();
                break;
            }
        }
    }
}

function enemyFireBullet(x, y) {
    enemyBullets.push({
        image: bulletImage,
        x: x,
        y: y,
        w: 15,
        h: 25
    })
}

function drawEnemyBullet() {
    for (const enemyBullet of enemyBullets) {
        ctx.drawImage(enemyBullet.image, enemyBullet.x, enemyBullet.y, enemyBullet.w, enemyBullet.h)
    }
}

function enemyBulletNewPos() {
    for (const enemyBullet of enemyBullets) {
        enemyBullet.y += 2
    }
}

function detectEnemyBullet() {
    for (const enemyBullet of enemyBullets) {
        if (player.x + player.w > enemyBullet.x && player.x < enemyBullet.x + enemyBullet.w && player.y + player.h > enemyBullet.y && player.y < enemyBullet.y + enemyBullet.h) {
            gameOverCallback()
        }
    }
}

function clear(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function newPos(){
    player.x += player.dx;
    detectWalls();
}

function detectWalls(){
    if (player.x < 0) {
        player.x = 0;
    }   if (player.x + player.w > canvas.width) {
        player.x = canvas.width - player.w;
    }   if (bullet.y < 0) {
        bulletFired = false;
    }
}

function drawObstacles() {
    for (const box of obstacles) {
        if (box.health <= 0) {
            obstacles.splice(obstacles.indexOf(box), 1)
            continue;
        }   if (box.flashTime > 0) {
            ctx.fillStyle = "Red";
            box.flashTime -= 1;
        }   else {
            ctx.fillStyle = "White";
        }   
        ctx.fillRect(box.x, box.y, box.w, box.h)
    }
}

function detectObstacles() {
    for (const box of obstacles) {
        if (bullet.y < box.y + box.h && 
            bullet.x + bullet.w > box.x && 
            bullet.x < box.x + box.w && 
            !box.hit) 
            {   box.hit = true;
                box.health -= 1;
                bullet.pierceCount -= 1;
                box.flashTime = 10;
                if (box.health <= 0) {
                    box.y += 1000;
                    box.x += 1000;
                }   if (bullet.pierceCount <= 0) {
                    bulletFired = false;
                    bullet.x = player.x + player.w / 2;
                    bullet.y = player.y;
                    return;
            }
        }
    }
}

function gameOverCallback() {
    displayedButtons = [restartbutton, exitbutton]
    gameOver = true;
}

function update() {
    clear();
    if (!gameOver) {
        if (!paused) {
            drawPlayer();
            newPos();
            
            if (bulletFired) {
                drawBullet();
                bulletNewPos();
            }

            drawEnemyBullet()
            enemyBulletNewPos()
            detectEnemyBullet()

            drawPowerups();
            pickUpPowerups();
            drawObstacles();
            detectObstacles();

            updateEnemies(player, gameOverCallback);
            drawEnemies(enemyImage);

            detectEnemies();

            if (allEnemiesDefeated()) {
                respawnEnemies();
            }

            drawScore(); 
        } else {
            drawPauseScreen();
        }
    } else {
        drawEndScreen();
    }

    requestAnimationFrame(update);
}

function drawScore() {
    ctx.font = "24px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 10, 30);
}
function increaseScore() {
    score += 10;
}

function bulletNewPos(){
    bullet.y -= bullet.speed
}

function drawBullet(){
    ctx.drawImage(bulletImage, bullet.x, bullet.y, bullet.w, bullet.h)
}

function shoot() {
    bullet.x = (player.x + player.w / 2) - bullet.w / 2;
    bullet.y = player.y;
    bullet.pierceCount = bullet.pierceLvl;

    obstacles.forEach(box => {
        box.hit = false;
    });
}

function keyDown(e){
    if (e.key === 'Escape'){
        paused = !paused;
        if (paused) {
            displayedButtons = [continuebutton, exitbutton]
        } else {
            displayedButtons = []
        }
    }
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        moveRight();
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        moveLeft();   
    } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Up') {
        if (! bulletFired){
            shoot()
            bulletFired = true;
        }
    }
}

function bulletSpeedUp() {
    bullet.speed += 2
}

function bulletSizeUp() {
    bullet.w += 2
    bullet.h += 1
}

function bulletPierceUp() {
    bullet.pierceLvl += 1
}

function dropPowerup(x, y) {
    let randomNumber = Math.floor(Math.random() * 3)

    if (randomNumber == 0) {
        powerups.push({
            image: bulletPierceImage,
            w: 50,
            h: 50,
            x: x,
            y: y,
            ability: bulletPierceUp
        })
    }

    if (randomNumber == 1) {
        powerups.push({
            image: bulletSizeImage,
            w: 50,
            h: 50,
            x: x,
            y: y,
            ability: bulletSizeUp
        })
    }

    if (randomNumber == 2) {
        powerups.push({
            image: bulletSpeedImage,
            w: 50,
            h: 50,
            x: x,
            y: y,
            ability: bulletSpeedUp
        })
    }
}

function getMousePos(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
  
function isInside(pos, rect) {
    return pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y
}

let displayedButtons = []

let continuebutton = {
    text: "Jatka",
    x: 5,
    y: 250,
    width: 200,
    height: 100,
    action: continueGame
};

let exitbutton = {
    text: "Poistu",
    x: 5,
    y: 365,
    width: 200,
    height: 100,
    action: exitGame
};

let restartbutton = {
    text: "Aloita alusta",
    x: 5,
    y: 250,
    width: 300,
    height: 100,
    action: restartGame
}

function continueGame() {
    paused = false
}

function exitGame() {
    window.location.pathname = `/index.html`
}

function restartGame() {
    location.reload()
}

canvas.addEventListener('click', function(evt) {
    let mousePos = getMousePos(canvas, evt);
  
    for (const currentButton of displayedButtons) {
        if (isInside(mousePos, currentButton)) {
            currentButton.action()
        }
    }

}, false);
  
function createButtons() {
    for (const currentButton of displayedButtons) {
        ctx.fillText(currentButton.text, currentButton.x, currentButton.y + 64);
    }
}

function drawPauseScreen() {
    ctx.font = "48px Arial";
    ctx.fillText("Tauko", 5, 200);
    createButtons()
}

function drawEndScreen() {
    ctx.font = "48px Arial";
    ctx.fillText("Häivisit pelin", 5, 200);
    createButtons()
}

function drawPowerups() {
    for (const powerup of powerups) {
        ctx.drawImage(powerup.image, powerup.x, powerup.y, 50, 50)
        powerupNewPos(powerup)
    }
}

function powerupNewPos(powerup) {
    powerup.y += 2
    if (powerup.y + powerup.h >= 650) {
        powerups.splice(powerups.indexOf(powerup), 1)
    }
}

function pickUpPowerups() {
    for (const powerup of powerups) {
        if (player.x + player.w > powerup.x && player.x < powerup.x + powerup.w && player.y + player.h > powerup.y && player.y < powerup.y + powerup.h) {
            powerup.ability()
            powerups.splice(powerups.indexOf(powerup), 1)
        }
    }
}

function moveLeft(){
    player.dx = -player.speed;
}

function moveRight(){
    player.dx = player.speed;
}

function keyUp(e){
    if (
        e.key == 'Right' ||
        e.key == 'ArrowRight' ||
        e.key == 'Left' ||
        e.key == 'ArrowLeft'
    ) {
        player.dx = 0;

    }
}

createEnemies(enemyRows, enemyCols);

function resetBullet(){
    bulletFired = false;
    bullet.x = player.x + player.w / 2 - bullet.w / 2;
    bullet.y = player.y;
    bullet.pierceCount = bullet.pierceLvl; 
}


document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
createEnemies(enemyRows, enemyCols);
update();