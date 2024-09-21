const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const previewCanvas = document.getElementById('previewBoard');
const previewCtx = previewCanvas.getContext('2d');

const BLOCK_SIZE = 20;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const COLORS = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#800080'];

let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let currentPiece;
let nextPiece;

const SHAPES = [
    [],
    [[1,1,1,1]],
    [[1,1],[1,1]],
    [[1,1,1],[0,1,0]],
    [[1,1,1],[1,0,0]],
    [[1,1,1],[0,0,1]],
    [[1,1,0],[0,1,1]],
    [[0,1,1],[1,1,0]]
];

function createPiece() {
    const shapeIndex = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    return {
        shape: SHAPES[shapeIndex],
        color: shapeIndex,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(SHAPES[shapeIndex][0].length / 2),
        y: 0
    };
}

function drawBoard() {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            drawCell(ctx, x, y, board[y][x]);
        }
    }
}

function drawCell(context, x, y, colorIndex) {
    context.fillStyle = COLORS[colorIndex] || '#CCCCCC';
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = '#888888';
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawPiece(piece, context, offsetX = 0, offsetY = 0) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawCell(context, piece.x + x + offsetX, piece.y + y + offsetY, piece.color);
            }
        });
    });
}

function moveDown() {
    currentPiece.y++;
    if (collision()) {
        currentPiece.y--;
        merge();
        currentPiece = nextPiece;
        nextPiece = createPiece();
        if (collision()) {
            // Game Over
            alert("Game Over");
            init();
        }
    }
}

function moveLeft() {
    currentPiece.x--;
    if (collision()) {
        currentPiece.x++;
    }
}

function moveRight() {
    currentPiece.x++;
    if (collision()) {
        currentPiece.x--;
    }
}

function rotate() {
    const rotated = currentPiece.shape[0].map((_, index) =>
        currentPiece.shape.map(row => row[index]).reverse()
    );
    const previousShape = currentPiece.shape;
    currentPiece.shape = rotated;
    if (collision()) {
        currentPiece.shape = previousShape;
    }
}

function collision() {
    return currentPiece.shape.some((row, dy) =>
        row.some((value, dx) =>
            value && (
                currentPiece.y + dy >= BOARD_HEIGHT ||
                currentPiece.x + dx < 0 ||
                currentPiece.x + dx >= BOARD_WIDTH ||
                board[currentPiece.y + dy][currentPiece.x + dx]
            )
        )
    );
}

function merge() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            }
        });
    });
}

function clearLines() {
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(value => value)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            updateScore(10);
        }
    }
}

let score = 0;
function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = score;
}

function drawPreview() {
    previewCtx.fillStyle = '#FFFFFF';
    previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    
    const offsetX = Math.floor((4 - nextPiece.shape[0].length) / 2);
    const offsetY = Math.floor((4 - nextPiece.shape.length) / 2);
    
    nextPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawCell(previewCtx, x + offsetX, y + offsetY, nextPiece.color);
            }
        });
    });
}

let gameLoop;
function update() {
    drawBoard();
    drawPiece(currentPiece, ctx);
    drawPreview();
}

function gameStep() {
    moveDown();
    clearLines();
    update();
}

function init() {
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    currentPiece = createPiece();
    nextPiece = createPiece();
    score = 0;
    updateScore(0);
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, 1000);
    update();
}

document.addEventListener('keydown', event => {
    switch(event.keyCode) {
        case 37: moveLeft(); break;
        case 38: rotate(); break;
        case 39: moveRight(); break;
        case 40: moveDown(); break;
    }
    update();
});

document.getElementById('leftBtn').addEventListener('click', () => { moveLeft(); update(); });
document.getElementById('rightBtn').addEventListener('click', () => { moveRight(); update(); });
document.getElementById('rotateBtn').addEventListener('click', () => { rotate(); update(); });
document.getElementById('downBtn').addEventListener('click', () => { moveDown(); update(); });
document.getElementById('startBtn').addEventListener('click', init);
document.getElementById('pauseBtn').addEventListener('click', () => {
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    } else {
        gameLoop = setInterval(gameStep, 1000);
    }
});
document.getElementById('restartBtn').addEventListener('click', init);

init();