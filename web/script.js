const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const diffButtons = document.querySelectorAll('.diff-btn');

const themeBtn = document.getElementById('themeBtn');
const soundBtn = document.getElementById('soundBtn');
const langBtn = document.getElementById('langBtn');
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const menuOverlay = document.getElementById('menuOverlay');

let board = Array(9).fill('');
let gameActive = true;
let currentDifficulty = 'hard';
const HUMAN = 'X';
const AI = 'O';

// SISTEMA DE IDIOMA
let currentLang = 'PT';
const texts = {
    'PT': {
        title: 'Jogo da Velha',
        easy: 'Fácil', medium: 'Médio', hard: 'Difícil',
        restart: 'Reiniciar Partida',
        turn: 'Sua vez! (X)',
        win: '🎉 Você venceu!', lose: '💀 A IA venceu!', tie: '🤝 Deu Empate!',
        thinking: 'IA pensando...',
        menuTitle: 'Arcade Games', menuTicTac: 'Jogo da Velha', menuChess: 'Xadrez (Em breve)', menuCheckers: 'Damas (Em breve)'
    },
    'EN': {
        title: 'Tic Tac Toe',
        easy: 'Easy', medium: 'Medium', hard: 'Hard',
        restart: 'Restart Match',
        turn: 'Your turn! (X)',
        win: '🎉 You win!', lose: '💀 AI wins!', tie: '🤝 It\'s a Tie!',
        thinking: 'AI thinking...',
        menuTitle: 'Arcade Games', menuTicTac: 'Tic Tac Toe', menuChess: 'Chess (Soon)', menuCheckers: 'Checkers (Soon)'
    },
    'ES': {
        title: 'Tres en Raya',
        easy: 'Fácil', medium: 'Medio', hard: 'Difícil',
        restart: 'Reiniciar Partida',
        turn: '¡Tu turno! (X)',
        win: '🎉 ¡Tú ganas!', lose: '💀 ¡La IA gana!', tie: '🤝 ¡Empate!',
        thinking: 'IA pensando...',
        menuTitle: 'Juegos Arcade', menuTicTac: 'Tres en Raya', menuChess: 'Ajedrez (Pronto)', menuCheckers: 'Damas (Pronto)'
    }
};

langBtn.addEventListener('click', () => {
    if (currentLang === 'PT') currentLang = 'EN';
    else if (currentLang === 'EN') currentLang = 'ES';
    else currentLang = 'PT';
    
    langBtn.innerText = currentLang;
    updateLanguage();
});

function updateLanguage() {
    const t = texts[currentLang];
    document.getElementById('gameTitle').innerHTML = t.title;
    document.getElementById('txtEasy').innerText = t.easy;
    document.getElementById('txtMedium').innerText = t.medium;
    document.getElementById('txtHard').innerText = t.hard;
    restartBtn.innerText = t.restart;
    document.getElementById('menuTitle').innerText = t.menuTitle;
    document.getElementById('menuTicTac').innerText = t.menuTicTac;
    document.getElementById('menuChess').innerText = t.menuChess;
    document.getElementById('menuCheckers').innerText = t.menuCheckers;
    
    if (gameActive && statusText.innerText.includes('(X)')) {
        statusText.innerText = t.turn;
    }
}

// SISTEMA DE ÁUDIO
let volumeState = 2; // 2 = Máximo, 1 = Médio, 0 = Mutado
const bgMusic = new Audio();
bgMusic.loop = true;

// Altera a música de fundo com base na dificuldade
function changeTrackByDifficulty() {
    if (currentDifficulty === 'easy') bgMusic.src = 'facil.mp3';
    else if (currentDifficulty === 'medium') bgMusic.src = 'medio.mp3';
    else bgMusic.src = 'dificil.mp3';
    
    applyVolume();
}

// Aplica o volume atual
function applyVolume() {
    if (volumeState === 2) {
        bgMusic.volume = 1.0;
        bgMusic.play().catch(()=>{});
    } else if (volumeState === 1) {
        bgMusic.volume = 0.25; 
        bgMusic.play().catch(()=>{});
    } else {
        bgMusic.pause(); 
    }
}

soundBtn.addEventListener('click', () => {
    const icon = soundBtn.querySelector('i');
    
    if (volumeState === 2) {
        volumeState = 1;
        icon.className = 'fas fa-volume-down';
    } else if (volumeState === 1) {
        volumeState = 0;
        icon.className = 'fas fa-volume-mute';
    } else {
        volumeState = 2;
        icon.className = 'fas fa-volume-up';
    }
    
    // 
    applyVolume();
});

// 
changeTrackByDifficulty();

// SISTEMA DE TEMAS
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeBtn.querySelector('i');
    
    if (document.body.classList.contains('dark-mode')) {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
});

// SISTEMA DE DIFICULDADE
diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.getAttribute('data-diff');
        changeTrackByDifficulty();
        restartGame();
    });
});

// LÓGICA DO JOGO
cells.forEach(cell => cell.addEventListener('click', () => {
    if (!gameActive || cell.textContent !== '') return;
    
    if (volumeState > 0 && bgMusic.paused) bgMusic.play().catch(()=>{});

    const index = cell.getAttribute('data-index');
    makeMove(index, HUMAN);

    if (gameActive) {
        statusText.innerText = texts[currentLang].thinking;
        setTimeout(makeAiMove, 400);
    }
}));

restartBtn.addEventListener('click', restartGame);

function restartGame() {
    board = Array(9).fill('');
    gameActive = true;
    statusText.innerText = texts[currentLang].turn;
    statusText.className = "";
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = "cell";
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
    if (gameActive) statusText.innerText = texts[currentLang].turn;
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
            if (board[a] === HUMAN) {
                statusText.innerText = texts[currentLang].win;
                statusText.className = "status-green";
                cells[a].classList.add("win-green");
                cells[b].classList.add("win-green");
                cells[c].classList.add("win-green");
            } else {
                statusText.innerText = texts[currentLang].lose;
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
        statusText.innerText = texts[currentLang].tie;
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

menuBtn.addEventListener('click', () => {
    sideMenu.classList.add('open');
    menuOverlay.classList.add('open');
});

menuOverlay.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
});