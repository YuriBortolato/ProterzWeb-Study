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
let isAiThinking = false;
let currentDifficulty = 'hard';
const HUMAN = 'X';
const AI = 'O';

// --- SISTEMA DE IDIOMA GLOBAL ---
let currentLang = localStorage.getItem('arcadeLang') || 'PT';
const texts = {
    'PT': {
        title: 'Jogo da Velha', easy: 'Fácil', medium: 'Médio', hard: 'Difícil',
        restart: 'Reiniciar Partida', turn: 'Sua vez! (X)',
        win: '🎉 Você venceu!', lose: '💀 A IA venceu!', tie: '🤝 Deu Empate!', thinking: 'IA pensando...',
        menuTitle: 'Proterz', menuTicTac: 'Jogo da Velha', menuChess: 'Xadrez', menuCheckers: 'Damas', menuBarricade: 'Barricade'
    },
    'EN': {
        title: 'Tic Tac Toe', easy: 'Easy', medium: 'Medium', hard: 'Hard',
        restart: 'Restart Match', turn: 'Your turn! (X)',
        win: '🎉 You win!', lose: '💀 AI wins!', tie: '🤝 It\'s a Tie!', thinking: 'AI thinking...',
        menuTitle: 'Proterz', menuTicTac: 'Tic Tac Toe', menuChess: 'Chess', menuCheckers: 'Checkers', menuBarricade: 'Barricade'
    },
    'ES': {
        title: 'Tres en Raya', easy: 'Fácil', medium: 'Medio', hard: 'Difícil',
        restart: 'Reiniciar Partida', turn: '¡Tu turno! (X)',
        win: '🎉 ¡Tú ganas!', lose: '💀 ¡La IA gana!', tie: '🤝 ¡Empate!', thinking: 'IA pensando...',
        menuTitle: 'Proterz', menuTicTac: 'Tres en Raya', menuChess: 'Ajedrez', menuCheckers: 'Damas', menuBarricade: 'Barricade'
    }
};

langBtn.innerText = currentLang;

langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'PT' ? 'EN' : currentLang === 'EN' ? 'ES' : 'PT';
    langBtn.innerText = currentLang;
    localStorage.setItem('arcadeLang', currentLang); 
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
    document.getElementById('menuBarricade').innerText = t.menuBarricade;
    
    if (gameActive && statusText.innerText.includes('(X)')) {
        statusText.innerText = t.turn;
    }
}

// --- SISTEMA DE TEMA GLOBAL ---
const savedTheme = localStorage.getItem('arcadeTheme') || 'light';
if (savedTheme === 'dark') {
    themeBtn.querySelector('i').className = 'fas fa-moon';
} else {
    themeBtn.querySelector('i').className = 'fas fa-sun';
}

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeBtn.querySelector('i').className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('arcadeTheme', isDark ? 'dark' : 'light');
});

// --- SISTEMA DE ÁUDIO GLOBAL ---
const savedVol = localStorage.getItem('arcadeVolume');
let volumeState = savedVol !== null ? parseInt(savedVol) : 2;

const bgMusic = new Audio();
bgMusic.loop = true;

function updateSoundIcon() {
    const icon = soundBtn.querySelector('i');
    if (volumeState === 2) icon.className = 'fas fa-volume-up';
    else if (volumeState === 1) icon.className = 'fas fa-volume-down';
    else icon.className = 'fas fa-volume-mute';
}

function changeTrackByDifficulty() {
    if (currentDifficulty === 'easy') {
        bgMusic.src = 'audio/tic-tac-toe/facil.mp3';
    } else if (currentDifficulty === 'medium') {
        bgMusic.src = 'audio/tic-tac-toe/medio.mp3';
    } else {
        bgMusic.src = 'audio/tic-tac-toe/dificil.mp3';
    }
    applyVolume();
}

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
    if (volumeState === 2) volumeState = 1;
    else if (volumeState === 1) volumeState = 0;
    else volumeState = 2;
    
    updateSoundIcon();
    localStorage.setItem('arcadeVolume', volumeState); 
    applyVolume();
});

// --- MENU LATERAL ---
menuBtn.addEventListener('click', () => {
    sideMenu.classList.add('open');
    menuOverlay.classList.add('open');
});

menuOverlay.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
});

// --- SISTEMA DE DIFICULDADE ---
diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.getAttribute('data-diff');
        changeTrackByDifficulty();
        restartGame();
    });
});

// --- LÓGICA DO JOGO ---
cells.forEach(cell => cell.addEventListener('click', () => {
    // BLOQUEIA CLIQUES SE O JOGO NÃO ESTIVER ATIVO, SE A CÉLULA ESTIVER PREENCHIDA OU SE A IA ESTIVER PENSANDO
    if (!gameActive || cell.textContent !== '' || isAiThinking) return;
    
    if (volumeState > 0 && bgMusic.paused) bgMusic.play().catch(()=>{});

    const index = cell.getAttribute('data-index');
    makeMove(index, HUMAN);

    if (gameActive) {
        isAiThinking = true; // BLOQUEIA CLIQUES ENQUANTO A IA ESTÁ PENSANDO
        statusText.innerText = texts[currentLang].thinking;
        setTimeout(() => {
            makeAiMove();
            isAiThinking = false; // DESBLOQUEIA CLIQUES APÓS A IA JOGAR
        }, 400);
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

// Inicializações no Load
updateLanguage();
updateSoundIcon();
changeTrackByDifficulty();