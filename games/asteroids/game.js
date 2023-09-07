const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    angle: 0,
    speed: 0,
    rotateSpeed: 0.1,
    acceleration: 0.2
};

const bullets = [];

function drawShip() {
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -ship.radius);
    ctx.lineTo(ship.radius, ship.radius);
    ctx.lineTo(0, ship.radius / 2);
    ctx.lineTo(-ship.radius, ship.radius);
    ctx.closePath();
    ctx.strokeStyle = '#000';
    ctx.stroke();
    ctx.restore();
}

function drawBullets() {
    for (let i = 0; i < bullets.length; i++) {
        ctx.beginPath();
        ctx.arc(bullets[i].x, bullets[i].y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
    }
}

// Schiet een kogel
function shoot() {
    bullets.push({
        x: ship.x,
        y: ship.y,
        angle: ship.angle
    });
}

// Event listeners voor bediening
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        ship.speed += ship.acceleration;
    } else if (e.key === 'ArrowLeft') {
        ship.angle -= ship.rotateSpeed;
    } else if (e.key === 'ArrowRight') {
        ship.angle += ship.rotateSpeed;
    } else if (e.key === ' ') {
        shoot();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') {
        ship.speed = 0;
    }
});

const asteroids = [];

// Functie om een nieuw asteroïde te maken
function createAsteroid(x, y, radius, speed) {
    const angle = Math.random() * Math.PI * 2; // Willekeurige hoek
    asteroids.push({
        x,
        y,
        radius,
        angle,
        speed
    });
}

// Functie om asteroïden te tekenen
function drawAsteroids() {
    ctx.fillStyle = '#000'; // Zet de vulkleur op zwart
    for (let i = 0; i < asteroids.length; i++) {
        const asteroid = asteroids[i];
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
        ctx.fill(); // Vul het asteroïde met zwart
    }
}

// Functie om asteroïden te updaten
function updateAsteroids() {
    for (let i = 0; i < asteroids.length; i++) {
        const asteroid = asteroids[i];
        asteroid.x += Math.cos(asteroid.angle) * asteroid.speed;
        asteroid.y += Math.sin(asteroid.angle) * asteroid.speed;

        // Controleer of het asteroïde het canvas verlaat en verplaats het naar de andere kant
        if (asteroid.x < 0) {
            asteroid.x = canvas.width;
        } else if (asteroid.x > canvas.width) {
            asteroid.x = 0;
        }
        if (asteroid.y < 0) {
            asteroid.y = canvas.height;
        } else if (asteroid.y > canvas.height) {
            asteroid.y = 0;
        }

        // Controleer of het schip wordt geraakt door deze asteroïde
        if (shipHitByAsteroid(ship, asteroid)) {
            // Hier kun je de acties uitvoeren die moeten plaatsvinden wanneer het schip wordt geraakt
            console.log("Het schip is geraakt!");
            shipExplosion(ship);
        }
    }
}


function splitAsteroid(asteroid) {
    if (asteroid.radius > 20) {
        // Als de asteroïde groot genoeg is, splits deze in twee kleinere
        const angle1 = asteroid.angle + Math.random() * Math.PI / 4;
        const angle2 = asteroid.angle - Math.random() * Math.PI / 4;
        const speed = asteroid.speed + 1;
        
        createAsteroid(asteroid.x, asteroid.y, asteroid.radius / 2, angle1, speed);
        createAsteroid(asteroid.x, asteroid.y, asteroid.radius / 2, angle2, speed);
    }

    // Verwijder de oorspronkelijke asteroïde
    const index = asteroids.indexOf(asteroid);
    if (index !== -1) {
        asteroids.splice(index, 1);
    }
}


function updateBullets() {
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        bullet.x += Math.cos(bullet.angle) * 5;
        bullet.y += Math.sin(bullet.angle) * 5;
 
        // Controleer of een kogel een asteroïde raakt
        for (let j = 0; j < asteroids.length; j++) {
            const asteroid = asteroids[j];
            const dx = bullet.x - asteroid.x;
            const dy = bullet.y - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < asteroid.radius) {
                // Een kogel heeft een asteroïde geraakt
                splitAsteroid(asteroid);

                // Verwijder de kogel
                bullets.splice(i, 1);
                i--;
                break; // Ga naar de volgende kogel
            }
        }

        // Controleer of een kogel buiten het canvas gaat en verwijder deze
        if (
            bullet.x < 0 ||
            bullet.x > canvas.width ||
            bullet.y < 0 ||
            bullet.y > canvas.height
        ) {
            bullets.splice(i, 1);
            i--;
        }
    }
}


function shipHitByAsteroid(ship, asteroid) {
    const dx = asteroid.x - ship.x;
    const dy = asteroid.y - ship.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ship.radius + asteroid.radius) {
        // Het schip is geraakt door een asteroïde
        return true;
    }

    return false;
}


function shipExplosion(ship) {
    // Stop de beweging van het schip
    ship.speed = 0;
    ship.angle = 0;

    const explosionColors = ['#FFFF00', '#000000', '#FFA500', '#000000', '#FF0000'];
    let colorIndex = 0;

    // Stop de beweging van de asteroïden
    for (let i = 0; i < asteroids.length; i++) {
        asteroids[i].speed = 0;
    }

    const explosionInterval = setInterval(() => {
        // Verander de achtergrondkleur van het canvas
        canvas.style.backgroundColor = explosionColors[colorIndex];

        colorIndex++;

    if (colorIndex >= explosionColors.length) {
            // Stop de explosie-animatie en toon het "Game Over" -scherm
            clearInterval(explosionInterval);
            canvas.style.backgroundColor = 'white';

            const gameOverScreen = document.getElementById('gameOverScreen');
            gameOverScreen.style.display = 'block';

            // Voeg een eventlistener toe aan de "Play" -knop om een nieuw spel te starten
            const playButton = document.getElementById('playButton');
            playButton.addEventListener('click', () => {
                // Hier kun je de logica toevoegen om een nieuw spel te starten
                // Bijvoorbeeld: reset het spel, herstel levenspunten, verberg het "Game Over" -scherm, etc.
                gameOverScreen.style.display = 'none';
                startNewGame(); // Stel een functie in om een nieuw spel te starten
            });
        }
    }, 1000); // Verander de intervaltijd naar wens voor kleurveranderingen
}




// Functie om asteroïden te genereren op willekeurige posities
function generateAsteroids(numAsteroids) {
    for (let i = 0; i < numAsteroids; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 20 + Math.random() * 30; // Willekeurige grootte
        const speed = 1 + Math.random() * 3; // Willekeurige snelheid
        createAsteroid(x, y, radius, speed);
    }
}

// Roep de functie generateAsteroids op om asteroïden te genereren
generateAsteroids(5);

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Beweging van het schip
    ship.x += Math.cos(ship.angle) * ship.speed;
    ship.y += Math.sin(ship.angle) * ship.speed;

    // Controleer schipgrenzen
    if (ship.x > canvas.width) {
        ship.x = 0;
    } else if (ship.x < 0) {
        ship.x = canvas.width;
    }
    if (ship.y > canvas.height) {
        ship.y = 0;
    } else if (ship.y < 0) {
        ship.y = canvas.height;
    }

    // Beweging van kogels
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].x += Math.cos(bullets[i].angle) * 5;
        bullets[i].y += Math.sin(bullets[i].angle) * 5;

        // Verwijder kogels buiten het canvas
        if (
            bullets[i].x < 0 ||
            bullets[i].x > canvas.width ||
            bullets[i].y < 0 ||
            bullets[i].y > canvas.height
        ) {
            bullets.splice(i, 1);
        }
    }

    drawShip();
    drawBullets();
    drawAsteroids();
    updateAsteroids();
    updateBullets();

    requestAnimationFrame(update);
}


update();
