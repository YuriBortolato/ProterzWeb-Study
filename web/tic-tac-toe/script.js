const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const difficultySelect = document.getElementById('difficulty');

let board = Array(9).fill('');
let gameActive = true;
const HUMAN = 'X';
const AI = 'O';

cells.forEach(cell => cell.addEventListener('click', () => {
    if (!gameActive || cell.textContent !== '') return;
    
    // Jogada Humana
    const index = cell.getAttribute('data-index');
    makeMove(index, HUMAN);

    // Jogada IA
    if (gameActive) {
        statusText.innerText = "IA pensando...";
        setTimeout(makeAiMove, 500);
    }
}));

restartBtn.addEventListener('click', () => {
    board = Array(9).fill('');
    gameActive = true;
    statusText.innerText = "Sua vez! (X)";
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
});

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());
    checkWinner();
}

function makeAiMove() {
    let move;
    const diff = difficultySelect.value;
    
    if (diff === 'easy') {
        move = getRandomMove();
    } else if (diff === 'medium') {
        move = Math.random() < 0.5 ? getBestMove() : getRandomMove();
    } else {
        move = getBestMove();
    }
    
    if (move !== undefined) makeMove(move, AI);
}

function getRandomMove() {
    let available = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
    return available[Math.floor(Math.random() * available.length)];
}

function getBestMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = AI;
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(newBoard, depth, isMaximizing) {
    let winner = checkWinnerForMinimax();
    if (winner === AI) return 10 - depth;
    if (winner === HUMAN) return depth - 10;
    if (!newBoard.includes('')) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === '') {
                newBoard[i] = AI;
                bestScore = Math.max(bestScore, minimax(newBoard, depth + 1, false));
                newBoard[i] = '';
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === '') {
                newBoard[i] = HUMAN;
                bestScore = Math.min(bestScore, minimax(newBoard, depth + 1, true));
                newBoard[i] = '';
            }
        }
        return bestScore;
    }
}

function checkWinner() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let [a,b,c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            statusText.innerText = board[a] === HUMAN ? "Você venceu!" : "A IA venceu!";
            gameActive = false;
            return;
        }
    }
    if (!board.includes('')) {
        statusText.innerText = "Empate!";
        gameActive = false;
    }
}

function checkWinnerForMinimax() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let [a,b,c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return null;
}