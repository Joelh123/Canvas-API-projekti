const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const image = document.getElementById('playerImage');
const bulletImage = document.getElementById('bulletImage');
const bulletPierceImage = document.getElementById("bulletPierceImage")
const bulletSizeImage = document.getElementById("bulletSizeImage")
const bulletSpeedImage = document.getElementById("bulletSpeedImage")

let gameOver = false;


let bulletFired = false;
let paused = false;
const powerups = []

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
const enemies = [];
let enemySpeed = 2; 
let enemyDirection = 1; 
const enemyRows = 3; 
const enemyCols = 6; 

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
    }

    if (player.x + player.w > canvas.width) {
        player.x = canvas.width - player.w;
    }

    if (bullet.y < 0) {
        bulletFired = false;
    }
}

function drawObstacles() {
    ctx.fillStyle = "white";
    
    for (const box of obstacles) {
        if (box.health <= 0) {
            obstacles.splice(obstacles.indexOf(box), 1)
            continue;
        }
        ctx.fillRect(box.x, box.y, box.w, box.h)
    }
}

function detectObstacles() {
    for (const box of obstacles) {
        if (bullet.y < box.y + box.h && bullet.x + bullet.w > box.x && bullet.x < box.x + box.w && !box.hit) {
            box.hit = true;
            box.health -= 1;
            bullet.pierceCount -= 1;
            
            if (box.health <= 0) {
                box.y += 1000;
                box.x += 1000;
            }

            if (bullet.pierceCount <= 0) {
                bulletFired = false;
                bullet.x = player.x + player.w / 2;
                bullet.y = player.y;
                return;
            }
        }
    }
}

function update(){
    if (gameOver) return; 

    clear();
    if (!paused) {
        drawPlayer();
        newPos();
        if (bulletFired) {
            drawBullet();
            bulletNewPos();
        }
        drawPowerups();
        pickUpPowerups();
        drawObstacles();
        detectObstacles();

        updateEnemies();
        drawEnemies();
        detectEnemies();

    if (allEnemiesDefeated()) {
        respawnEnemies();
    }
    } else {
        drawPauseScreen()
    }
    requestAnimationFrame(update);
}

function bulletNewPos(){
    bullet.y -= bullet.speed
}

function drawBullet(){
    ctx.drawImage(bulletImage, bullet.x, bullet.y, bullet.w, bullet.h)
}

function shoot() {
    bullet.x = player.x + player.w / 2;
    bullet.y = player.y;
    bullet.pierceCount = bullet.pierceLvl;

    obstacles.forEach(box => {
        box.hit = false;
    });
}

function keyDown(e){
    if (e.key === 'Escape'){
    paused = !paused;
    }
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        moveRight();
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        moveLeft();   
    } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Up') {
        if (! bulletFired){
            //console.log("Toimii!")
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

dropPowerup(10, 10)
dropPowerup(70, 10)

function drawPauseScreen() {
    ctx.font = "48px Arial";
    ctx.fillText("Paused", 323, 200);
}

dropPowerup(130, 10)
dropPowerup(600, 10)

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

createEnemies(enemyRows, enemyCols);

const enemyImage = document.getElementById('enemyImage');

function drawEnemies() {
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

        if (enemy.y + enemy.h >= canvas.height) {
            gameOver = true;
            alert("HÃ¤visit vittu"); 
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
    if (!bulletFired) return;

    for (const enemy of enemies) {
        if (enemy.health <= 0) continue;

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


function resetBullet(){
    bulletFired = false;
    bullet.x = player.x + player.w / 2 - bullet.w / 2;
    bullet.y = player.y;
    bullet.pierceCount = bullet.pierceLvl; 
}


update(); 

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);  