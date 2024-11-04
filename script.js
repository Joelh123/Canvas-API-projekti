const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const image = document.getElementById('playerImage');
const bulletImage = document.getElementById('bulletImage');
const bulletPierceImage = document.getElementById("bulletPierceImage")
const bulletSizeImage = document.getElementById("bulletSizeImage")
const bulletSpeedImage = document.getElementById("bulletSpeedImage")

let bulletFired = false;
let paused = false;
const powerups = []

const player = {
    w: 50,
    h: 70,
    x: 400,
    y: 560,
    speed: 5,
    dx: 0,
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
            box.y += 1000
            box.x += 1000
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
    clear();
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
    console.log(e.key);
    if (paused){
        return
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
    bullet.speed += 100
}

function bulletSizeUp() {
    bullet.w += 2
}

function bulletPierceUp() {
    bullet.pierceLvl += 1
}

function dropPowerup(x, y) {
    randomNumber = Math.floor(Math.random() * 3)

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

update();

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);