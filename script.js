const config = {
    initialLives: 5,
    fruitFallSpeed: 2,
    spawnInterval: 1500,
    itemTypes: [
        { type: 'apple', points: 10 },
        { type: 'banana', points: 15 },
        { type: 'grape', points: 20 },
        { type: 'special', points: 50 },
        { type: 'bomb', damage: 1 }
    ]
};
const skyColors = [
    { bg: "linear-gradient(to top, #87CEEB, #E0F7FA)", cloud: "white" },
    { bg: "linear-gradient(to top, #FFD700, #FFA500)", cloud: "#F0E68C" },
    { bg: "linear-gradient(to top, #FF4500, #FF8C00)", cloud: "#F4A460" },
    { bg: "linear-gradient(to top, #191970, #000000)", cloud: "#A9A9A9" }
];
function animateFruits() {
    const fruits = document.querySelectorAll('#homeScreen .fruit');
    fruits.forEach(fruit => {
        fruit.style.transform = `translateY(${Math.sin(Date.now() * 0.001) * 10}px)`;
    });
    requestAnimationFrame(animateFruits);
}
animateFruits();
function startGame() {
    const homeScreen = document.getElementById('homeScreen');
    const homeScreenContent = document.getElementById('homeScreenContent');
    homeScreenContent.style.transform = 'rotateX(45deg) scale(0.8)';
    homeScreenContent.style.opacity = '0';
    setTimeout(() => {
        homeScreen.style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        initGame();
    }, 500);
}
const gameState = {
    score: 0,
    lives: config.initialLives,
    gameArea: null,
    basket: null,
    scoreDisplay: null,
    livesDisplay: null,
    gameOverModal: null,
    fallingItems: [],
    gameWidth: 0,
    gameHeight: 0,
    basketX: 0,
    currentSky: 0,
    isDragging: false,
    startX: 0
};
function initGame() {
    gameState.gameArea = document.getElementById('gameScreen');
    gameState.basket = document.getElementById('basket');
    gameState.scoreDisplay = document.getElementById('score');
    gameState.livesDisplay = document.getElementById('lives');
    gameState.gameOverModal = document.getElementById('gameOverModal');
    gameState.gameWidth = window.innerWidth;
    gameState.gameHeight = window.innerHeight;
    gameState.basketX = gameState.gameWidth / 2 - gameState.basket.offsetWidth / 2;
    gameState.basket.style.left = gameState.basketX + 'px';
    setupInputHandlers();
    setupSkyChanges();
    setupGameLoop();
}
function getCurrentSkyIndex() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 0;
    if (hour >= 12 && hour < 16) return 1;
    if (hour >= 16 && hour < 19) return 2;
    return 3;
}
function changeSky() {
    gameState.currentSky = (gameState.currentSky + 1) % skyColors.length;
    gameState.gameArea.style.background = skyColors[gameState.currentSky].bg;
    const clouds = document.querySelectorAll('.cloud');
    clouds.forEach(cloud => cloud.style.background = skyColors[gameState.currentSky].cloud);
}
/*versi Pake Sc Error? Join Saja Disini banyak template we https://whatsapp.com/channel/0029VanrndJICVfcrjFr3x2R */ 
function setupSkyChanges() {
    gameState.currentSky = getCurrentSkyIndex();
    gameState.gameArea.style.background = skyColors[gameState.currentSky].bg;
    const clouds = document.querySelectorAll('.cloud');
    clouds.forEach(cloud => cloud.style.background = skyColors[gameState.currentSky].cloud);
    setInterval(changeSky, 30000);
}
function setupInputHandlers() {
    gameState.basket.addEventListener("mousedown", startDragging);
    document.addEventListener("mousemove", dragBasket);
    document.addEventListener("mouseup", stopDragging);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.getElementById('restartButton').addEventListener('click', restartGame);
}
function startDragging(e) {
    gameState.isDragging = true;
    gameState.startX = e.clientX;
}
function dragBasket(e) {
    if (!gameState.isDragging) return;
    const moveX = e.clientX - gameState.startX;
    gameState.basketX += moveX;
    gameState.basketX = Math.max(
        0, 
        Math.min(gameState.gameWidth - gameState.basket.offsetWidth, gameState.basketX)
    );
    gameState.basket.style.left = gameState.basketX + "px";
    gameState.startX = e.clientX;
}
function stopDragging() {
    gameState.isDragging = false;
}
function handleTouchStart(e) {
    gameState.startX = e.touches[0].clientX;
}
function handleTouchMove(e) {
    const touchMoveX = e.touches[0].clientX;
    const moveDistance = touchMoveX - gameState.startX;
    gameState.basketX += moveDistance;
    gameState.basketX = Math.max(
        0, 
        Math.min(gameState.gameWidth - gameState.basket.offsetWidth, gameState.basketX)
    );
    gameState.basket.style.left = gameState.basketX + 'px';
    gameState.startX = touchMoveX;
}
function spawnItem() {
    if (gameState.lives <= 0) return;
    let itemType;
    const random = Math.random();
    if (random < 0.1) {
        itemType = config.itemTypes[3];
    } else if (random < 0.3) {
        itemType = config.itemTypes[4];
    } else {
        itemType = config.itemTypes[Math.floor(Math.random() * 3)];
    }
    const itemElem = document.createElement('div');
    itemElem.classList.add('falling', itemType.type);
    const posX = Math.random() * (gameState.gameWidth - 40);
    itemElem.style.left = posX + 'px';
    itemElem.style.top = '-40px';
    gameState.gameArea.appendChild(itemElem);
    gameState.fallingItems.push({
        element: itemElem,
        x: posX,
        y: -40,
        item: itemType
    });
}
/*versi Pake Sc Error? Join Saja Disini banyak template we https://whatsapp.com/channel/0029VanrndJICVfcrjFr3x2R */ 
function updateGame() {
    for (let i = gameState.fallingItems.length - 1; i >= 0; i--) {
        const obj = gameState.fallingItems[i];
        obj.y += config.fruitFallSpeed;
        obj.element.style.top = obj.y + 'px';
        if (obj.y > gameState.gameHeight) {
            gameState.gameArea.removeChild(obj.element);
            gameState.fallingItems.splice(i, 1);
            if (obj.item.type !== "bomb") {
                gameState.lives--;
                updateScoreboard();
            }
            continue;
        }
        const basketRect = gameState.basket.getBoundingClientRect();
        const objRect = obj.element.getBoundingClientRect();
        if (
            objRect.bottom >= basketRect.top &&
            objRect.right >= basketRect.left &&
            objRect.left <= basketRect.right
        ) {
            if (obj.item.type === "bomb") {
                gameState.lives--;
            } else {
                gameState.score += obj.item.points;
            }
            updateScoreboard();
            gameState.gameArea.removeChild(obj.element);
            gameState.fallingItems.splice(i, 1);
        }
    }
    if (gameState.lives <= 0) {
        endGame();
        return;
    }
    requestAnimationFrame(updateGame);
}
function updateScoreboard() {
    gameState.scoreDisplay.innerText = gameState.score;
    gameState.livesDisplay.innerText = gameState.lives;
}
/*versi Pake Sc Error? Join Saja Disini banyak template we https://whatsapp.com/channel/0029VanrndJICVfcrjFr3x2R */ 
function setupGameLoop() {
    gameState.spawnInterval = setInterval(spawnItem, config.spawnInterval);
    requestAnimationFrame(updateGame);
}
function endGame() {
    clearInterval(gameState.spawnInterval);
    gameState.gameOverModal.style.display = 'flex';
    document.getElementById('finalScoreDisplay').innerText = `Skor Anda: ${gameState.score}`;
}
function restartGame() {
    gameState.score = 0;
    gameState.lives = config.initialLives;
    gameState.fallingItems.forEach(item => {
        gameState.gameArea.removeChild(item.element);
    });
    gameState.fallingItems = [];
    updateScoreboard();
    gameState.gameOverModal.style.display = 'none';
    setupGameLoop();
}