const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const image = document.getElementById('playerImage');
const bulletImage = document.getElementById('bulletImage');
let bulletFired = false;
let paused = false;

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
    speed: 5,
    dy: 10,
}


// ctx.fillRect(55, obstacle.y, obstacle.w, obstacle.h),
// ctx.fillRect(180, obstacle.y, obstacle.w, obstacle.h),
// ctx.fillRect(305, obstacle.y, obstacle.w, obstacle.h),
// ctx.fillRect(430, obstacle.y, obstacle.w, obstacle.h),
// ctx.fillRect(555, obstacle.y, obstacle.w, obstacle.h),
// ctx.fillRect(680, obstacle.y, obstacle.w, obstacle.h)

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
            box.w = 0
            box.h = 0
            continue;
        }
        ctx.fillRect(box.x, box.y, box.w, box.h)
    }
}

function detectObstacles() {
    for (const box of obstacles) {
        if (bullet.y < box.y + box.h && bullet.x + bullet.w > box.x && bullet.x < box.x + box.w) {
            bulletFired = false
            box.health -= 1
            bullet.x = player.x + player.w / 2
            bullet.y = player.y
            console.log(box.health)
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
    drawObstacles();
    detectObstacles();
    requestAnimationFrame(update);
}

function bulletNewPos(){
    bullet.y -= bullet.dy
}

function drawBullet(){
    ctx.drawImage(bulletImage, bullet.x, bullet.y, bullet.w, bullet.h)
}

function shoot(){
    bullet.x = player.x + player.w / 2
    bullet.y = player.y
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