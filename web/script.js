const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const diffButtons = document.querySelectorAll('.diff-btn');

// Botões da UI
const themeBtn = document.getElementById('themeBtn');
const soundBtn = document.getElementById('soundBtn');
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const menuOverlay = document.getElementById('menuOverlay');

let board = Array(9).fill('');
let gameActive = true;
let currentDifficulty = 'hard'; // Padrão para dificuldade máxima
let soundEnabled = true;
const HUMAN = 'X';
const AI = 'O';

// Configurações de dificuldade
diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove a classe active de todos os botões
        diffButtons.forEach(b => b.classList.remove('active'));
        // Adiciona a classe active ao botão clicado
        btn.classList.add('active');
        currentDifficulty = btn.getAttribute('data-diff');
        restartGame();
    });
});

// Lógica do jogo
cells.forEach(cell => cell.addEventListener('click', () => {
    if (!gameActive || cell.textContent !== '') return;
    
    // Jogada Humana
    const index = cell.getAttribute('data-index');
    makeMove(index, HUMAN);

    // Jogada IA
    if (gameActive) {
        statusText.innerText = "IA pensando...";
        setTimeout(makeAiMove, 400);
    }
}));

restartBtn.addEventListener('click', restartGame);

function restartGame() {
    board = Array(9).fill('');
    gameActive = true;
    statusText.innerText = "Sua vez! (X)";
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());
    playSound(); 
    checkWinner();
}

function makeAiMove() {
    let move;
    
    if (currentDifficulty === 'easy') {
        move = getRandomMove();
    } else if (currentDifficulty === 'medium') {
        move = Math.random() < 0.5 ? getBestMove() : getRandomMove();
    } else {
        move = getBestMove();
    }
    
    if (move !== undefined) makeMove(move, AI);
    if (gameActive) statusText.innerText = "Sua vez! (X)";
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
            statusText.innerText = board[a] === HUMAN ? "🎉 Você venceu!" : "💀 A IA venceu!";
            gameActive = false;
            return;
        }
    }
    if (!board.includes('')) {
        statusText.innerText = "🤝 Deu Velha! (Empate)";
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

// --- SISTEMA DE TEMAS E SOM ---

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeBtn.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }
});

soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    const icon = soundBtn.querySelector('i');
    if (soundEnabled) {
        icon.classList.replace('fa-volume-mute', 'fa-volume-up');
    } else {
        icon.classList.replace('fa-volume-up', 'fa-volume-mute');
    }
});

// Função para tocar som 
function playSound() {
    if (!soundEnabled) return;
}

menuBtn.addEventListener('click', () => {
    sideMenu.classList.add('open');
    menuOverlay.classList.add('open');
});

menuOverlay.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
});