const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Constants
const GRID_SIZE = 30;  // Each block size
const COLUMNS = canvas.width / GRID_SIZE;
const ROWS = canvas.height / GRID_SIZE;
const WHITE = "#FFFFFF";
const BLACK = "#000000";
const FPS = 10;

// Shape definitions (same as in the Python version)
const SHAPES = {
    'T': [[1, 1, 1], [0, 1, 0]],
    'L': [[1, 0], [1, 0], [1, 1]],
    'J': [[0, 1], [0, 1], [1, 1]],
    'I': [[1, 1, 1, 1]],
    'O': [[1, 1], [1, 1]],
    'S': [[0, 1, 1], [1, 1, 0]],
    'Z': [[1, 1, 0], [0, 1, 1]],
};

// Piece class
class Piece {
    constructor(x, y, shape) {
        this.x = x;
        this.y = y;
        this.shape = shape;
        this.color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
    }

    draw() {
        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                if (this.shape[row][col] === 1) {
                    ctx.fillStyle = this.color;
                    ctx.fillRect(this.x + col * GRID_SIZE, this.y + row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                }
            }
        }
    }

    rotate() {
        this.shape = this.shape[0].map((_, index) => this.shape.map(row => row[index])).reverse();
    }

    move(dx, dy) {
        this.x += dx * GRID_SIZE;
        this.y += dy * GRID_SIZE;
    }
}

// Game class
class TetrisGame {
    constructor() {
        this.grid = this.createGrid();
        this.currentPiece = this.randomPiece();
        this.gameOver = false;
        this.interval = setInterval(this.update.bind(this), 1000 / FPS);
    }

    createGrid() {
        let grid = [];
        for (let row = 0; row < ROWS; row++) {
            grid[row] = [];
            for (let col = 0; col < COLUMNS; col++) {
                grid[row][col] = BLACK;
            }
        }
        return grid;
    }

    randomPiece() {
        const shapeKeys = Object.keys(SHAPES);
        const randomShape = SHAPES[shapeKeys[Math.floor(Math.random() * shapeKeys.length)]];
        return new Piece(COLUMNS / 2 * GRID_SIZE - randomShape[0].length * GRID_SIZE / 2, 0, randomShape);
    }

    clearRows() {
        for (let row = ROWS - 1; row >= 0; row--) {
            if (this.grid[row].every(cell => cell !== BLACK)) {
                this.grid.splice(row, 1);
                this.grid.unshift(Array(COLUMNS).fill(BLACK));
            }
        }
    }

    draw() {
        // Draw grid
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLUMNS; col++) {
                ctx.fillStyle = this.grid[row][col];
                ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            }
        }

        // Draw current piece
        this.currentPiece.draw();
    }

    update() {
        if (this.gameOver) {
            clearInterval(this.interval);
            alert("Game Over!");
            return;
        }

        // Move piece down
        if (!this.checkCollision(0, 1)) {
            this.currentPiece.move(0, 1);
        } else {
            // Place piece on grid
            this.placePiece();
            // Check for full rows
            this.clearRows();
            // Generate new piece
            this.currentPiece = this.randomPiece();
            // Check for game over
            if (this.checkCollision(0, 0)) {
                this.gameOver = true;
            }
        }

        // Redraw the game
        this.draw();
    }

    checkCollision(dx, dy) {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col] === 1) {
                    let newX = (this.currentPiece.x + col * GRID_SIZE + dx * GRID_SIZE) / GRID_SIZE;
                    let newY = (this.currentPiece.y + row * GRID_SIZE + dy * GRID_SIZE) / GRID_SIZE;
                    if (newX < 0 || newX >= COLUMNS || newY >= ROWS) return true;
                    if (newY >= 0 && this.grid[newY][newX] !== BLACK) return true;
                }
            }
        }
        return false;
    }

    placePiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col] === 1) {
                    let gridX = (this.currentPiece.x + col * GRID_SIZE) / GRID_SIZE;
                    let gridY = (this.currentPiece.y + row * GRID_SIZE) / GRID_SIZE;
                    this.grid[gridY][gridX] = this.currentPiece.color;
                }
            }
        }
    }
}

// Handle key press events
document.addEventListener('keydown', (event) => {
    if (game.gameOver) return;
    if (event.key === 'ArrowLeft') {
        if (!game.checkCollision(-1, 0)) game.currentPiece.move(-1, 0);
    } else if (event.key === 'ArrowRight') {
        if (!game.checkCollision(1, 0)) game.currentPiece.move(1, 0);
    } else if (event.key === 'ArrowDown') {
        if (!game.checkCollision(0, 1)) game.currentPiece.move(0, 1);
    } else if (event.key === 'ArrowUp') {
        game.currentPiece.rotate();
    }
});

// Initialize game
const game = new TetrisGame();