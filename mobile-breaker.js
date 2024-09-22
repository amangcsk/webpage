const canvas = document.getElementById('mobileGameCanvas');
const ctx = canvas.getContext('2d');

let ball, paddle, bricks, score, lives, gameRunning, gameStarted;
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = canvas.height / 2 - ((brickRowCount * (brickHeight + brickPadding)) / 2);
const brickOffsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding))) / 2;

function initGame() {
    ball = {
        x: canvas.width / 2,
        y: canvas.height - 30,
        dx: 2,
        dy: -2,
        radius: 8
    };

    paddle = {
        width: 75,
        height: 10,
        x: (canvas.width - 75) / 2
    };

    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }

    score = 0;
    lives = 3;
    gameRunning = false;
    gameStarted = false;

    ball.x = paddle.x + paddle.width / 2;
    ball.y = canvas.height - paddle.height - ball.radius;
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    document.getElementById('mobileScore').innerHTML = "점수: " + score;
}

function drawLives() {
    document.getElementById('mobileLives').innerHTML = "생명: " + lives;
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status == 1) {
                if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score++;
                    if (score == brickRowCount * brickColumnCount) {
                        alert("축하합니다! 승리했습니다!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    if (!gameStarted) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = canvas.height - paddle.height - ball.radius;
    } else {
        if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
            ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy < ball.radius) {
            ball.dy = -ball.dy;
        } else if (ball.y + ball.dy > canvas.height - ball.radius) {
            if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
                ball.dy = -ball.dy;
            } else {
                lives--;
                if (!lives) {
                    alert("게임 오버");
                    document.location.reload();
                } else {
                    ball.x = canvas.width / 2;
                    ball.y = canvas.height - 30;
                    ball.dx = 2;
                    ball.dy = -2;
                    paddle.x = (canvas.width - paddle.width) / 2;
                    gameStarted = false;
                }
            }
        }

        ball.x += ball.dx;
        ball.y += ball.dy;
    }

    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += 7;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= 7;
    }

    if (gameRunning) {
        requestAnimationFrame(draw);
    }
}

let rightPressed = false;
let leftPressed = false;

function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
    
    if (e.key == " " && !gameStarted && gameRunning) {
        gameStarted = true;
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

document.getElementById('mobileStartButton').addEventListener('click', startGame);
document.getElementById('mobilePauseButton').addEventListener('click', pauseGame);
document.getElementById('mobileRestartButton').addEventListener('click', restartGame);
document.getElementById('mobileLeftBtn').addEventListener('mousedown', () => leftPressed = true);
document.getElementById('mobileLeftBtn').addEventListener('mouseup', () => leftPressed = false);
document.getElementById('mobileLeftBtn').addEventListener('touchstart', () => leftPressed = true);
document.getElementById('mobileLeftBtn').addEventListener('touchend', () => leftPressed = false);
document.getElementById('mobileRightBtn').addEventListener('mousedown', () => rightPressed = true);
document.getElementById('mobileRightBtn').addEventListener('mouseup', () => rightPressed = false);
document.getElementById('mobileRightBtn').addEventListener('touchstart', () => rightPressed = true);
document.getElementById('mobileRightBtn').addEventListener('touchend', () => rightPressed = false);

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gameStarted = false;
        initGame();
        draw();
    }
}

function pauseGame() {
    gameRunning = !gameRunning;
    if (gameRunning) {
        draw();
    }
}

function restartGame() {
    initGame();
    gameRunning = true;
    gameStarted = false;
    draw();
}

initGame();
draw();