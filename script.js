const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const image = document.getElementById('source');
let bulletFired = false;

const player = {
    w: 50,
    h: 70,
    x: 400,
    y: 415,
    speed: 5,
    dx: 0,
}

const bullet = {
    w: 5,
    h: 5,
    speed: 5,
    dy: 10,
}

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

    if (player.y < 0) {
        player.y = 0;
    }

    if (player.y + player.h > canvas.height) {
        player.y = canvas.height - player.h;
    }

    if (bullet.y < 0) {
        bulletFired = false;
    }
}

function update(){
    clear();
    drawPlayer();
    newPos();
    drawBullet();
    bulletNewPos();
    requestAnimationFrame(update);
}

function bulletNewPos(){
    bullet.y -= bullet.dy
}

function drawBullet(){
    ctx.fillStyle = 'white'
    ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h); 
}

function shoot(){
    bullet.x = player.x + player.w / 2
    bullet.y = player.y
}

function keyDown(e){
    //console.log(e.key);

    if (e.key === 'ArrowRight' || e.key === 'Right') {
        moveRight();
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        moveLeft();   
    } else if (e.key === ' ') {
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