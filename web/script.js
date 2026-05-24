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
let currentDifficulty = 'hard';
let soundEnabled = true;
const HUMAN = 'X';
const AI = 'O';

// --- SISTEMA DE ÁUDIO ---
const bgMusic = new Audio();
bgMusic.loop = true;

function updateMusic() {
    if (currentDifficulty === 'easy') bgMusic.src = 'facil.mp3';
    else if (currentDifficulty === 'medium') bgMusic.src = 'medio.mp3';
    else bgMusic.src = 'dificil.mp3';

    if (soundEnabled) {
        // Tenta tocar a música, mas se o navegador bloquear, apenas loga a mensagem e espera a próxima interação do usuário para tentar novamente.
        bgMusic.play().catch(() => console.log("Aguardando clique do usuário para iniciar música."));
    } else {
        bgMusic.pause();
    }
}

// Inicia a música ao carregar a página, mas só tocará após a primeira interação do usuário devido às políticas de autoplay dos navegadores.
updateMusic();

// --- SISTEMA DE DIFICULDADE ---
diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.getAttribute('data-diff');
        updateMusic();
        restartGame();
    });
});

// --- LÓGICA DO JOGO ---
cells.forEach(cell => cell.addEventListener('click', () => {
    if (!gameActive || cell.textContent !== '') return;
    
    if (soundEnabled && bgMusic.paused) updateMusic();

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
    statusText.className = ""; // Reseta a classe para remover cores de vitória/empate
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = "cell"; // Reseta as classes para remover cores de vitória/empate
    });
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());
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

// Função de verificação de vencedor para o jogo normal 
function checkWinner() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    
    for (let [a,b,c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            if (board[a] === HUMAN) {
                statusText.innerText = "🎉 Você venceu!";
                statusText.className = "status-green";
                cells[a].classList.add("win-green");
                cells[b].classList.add("win-green");
                cells[c].classList.add("win-green");
            } else {
                statusText.innerText = "💀 A IA venceu!";
                statusText.className = "status-red";
                cells[a].classList.add("win-red");
                cells[b].classList.add("win-red");
                cells[c].classList.add("win-red");
            }
            gameActive = false;
            return;
        }
    }
    
    if (!board.includes('')) {
        statusText.innerText = "🤝 Deu Empate!";
        statusText.className = "status-gray";
        cells.forEach(cell => cell.classList.add("tie-gray"));
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
        updateMusic();
    } else {
        icon.classList.replace('fa-volume-up', 'fa-volume-mute');
        bgMusic.pause();
    }
});

menuBtn.addEventListener('click', () => {
    sideMenu.classList.add('open');
    menuOverlay.classList.add('open');
});

menuOverlay.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
});