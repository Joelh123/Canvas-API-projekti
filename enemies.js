export let enemies = [];
export let enemySpeed = 2; 
export let enemyDirection = 1; 
export const enemyRows = 3; 
export const enemyCols = 6; 

export function createEnemies(rows, cols) {
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

export function respawnEnemies() {
    createEnemies(enemyRows, enemyCols); 
    enemySpeed += 0.5; 
    enemyDirection = 1; 
}

export function drawEnemies(ctx, enemyImage) {
    for (const enemy of enemies) {
        if (enemy.health > 0) {
            ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.w, enemy.h);
        }
    }
}

export function updateEnemies(canvas, player, gameOverCallback) {
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

export function allEnemiesDefeated() {
    return enemies.every(enemy => enemy.health <= 0);
}

export function detectEnemies(bullet, dropPowerup, resetBullet) {
    for (const enemy of enemies) {
        if (enemy.health <= 0) {
            let randomNumber = Math.floor(Math.random() * 30)

            if (randomNumber == 1) {
                dropPowerup(enemy.x, enemy.y);
            }
            enemies.splice(enemies.indexOf(enemy), 1);
            continue;
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
