import { 
    enemies, 
    enemySpeed, 
    enemyDirection, 
    enemyRows, 
    enemyCols, 
    createEnemies, 
    respawnEnemies, 
    drawEnemies, 
    updateEnemies, 
    allEnemiesDefeated, 
    detectEnemies 
} from './enemies.js';

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

function gameOverCallback() {
    gameOver = true;
    alert("Game Over");
}

function update() {
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

        updateEnemies(canvas, player, gameOverCallback); // Pass canvas, player, and gameOverCallback
        drawEnemies(ctx, enemyImage); // Pass ctx and enemyImage
        detectEnemies(bullet, dropPowerup, resetBullet); // Pass bullet, dropPowerup, and resetBullet

        if (allEnemiesDefeated()) {
            respawnEnemies();
        }
    } else {
        drawPauseScreen();
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
  
let continuebutton = {
    x: 5,
    y: 250,
    width: 200,
    height: 100,
};

let exitbutton = {
    x: 5,
    y: 365,
    width: 200,
    height: 100,
};

canvas.addEventListener('click', function(evt) {
    let mousePos = getMousePos(canvas, evt);
  
    if (isInside(mousePos, continuebutton)) {
        paused = false;
    } else if (isInside(mousePos, exitbutton)) {
        window.location.pathname = `/index.html`
    } else {
        return
    }
}, false);
  
function continueButton(continuebutton) {
    ctx.fillText('Jatka', continuebutton.x, continuebutton.y + 64);
}

function exitButton(exitbutton) {
    ctx.fillText('Poistu', exitbutton.x, exitbutton.y + 64);
}


function drawPauseScreen() {
    ctx.font = "48px Arial";
    ctx.fillText("Paused", 5, 200);
    continueButton(continuebutton);
    exitButton(exitbutton);
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