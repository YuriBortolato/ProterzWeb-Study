// SISTEMA DE UI (Idioma, Tema, Som, Menu)
let currentLang = 'PT';
const texts = {
    'PT': {
        title: 'Xadrez', easy: 'Fácil', medium: 'Médio', hard: 'Difícil',
        restart: 'Nova Partida', turnW: 'Sua vez! (Brancas)', turnB: 'IA pensando...',
        win: '🎉 Você venceu!', lose: '💀 A IA venceu!', tie: '🤝 Deu Empate!',
        timeout: '⏰ Tempo Esgotado!',
        menuTitle: 'Arcade Games', menuTicTac: 'Jogo da Velha', menuChess: 'Xadrez', menuCheckers: 'Damas (Em breve)'
    },
    'EN': {
        title: 'Chess', easy: 'Easy', medium: 'Medium', hard: 'Hard',
        restart: 'New Game', turnW: 'Your turn! (White)', turnB: 'AI thinking...',
        win: '🎉 You win!', lose: '💀 AI wins!', tie: '🤝 It\'s a Tie!',
        timeout: '⏰ Time Out!',
        menuTitle: 'Arcade Games', menuTicTac: 'Tic Tac Toe', menuChess: 'Chess', menuCheckers: 'Checkers (Soon)'
    },
    'ES': {
        title: 'Ajedrez', easy: 'Fácil', medium: 'Medio', hard: 'Difícil',
        restart: 'Nueva Partida', turnW: '¡Tu turno! (Blancas)', turnB: 'IA pensando...',
        win: '🎉 ¡Tú ganas!', lose: '💀 ¡La IA gana!', tie: '🤝 ¡Empate!',
        timeout: '⏰ ¡Tiempo Agotado!',
        menuTitle: 'Juegos Arcade', menuTicTac: 'Tres en Raya', menuChess: 'Ajedrez', menuCheckers: 'Damas (Pronto)'
    }
};

const langBtn = document.getElementById('langBtn');
langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'PT' ? 'EN' : currentLang === 'EN' ? 'ES' : 'PT';
    langBtn.innerText = currentLang;
    updateLanguage();
});

function updateLanguage() {
    const t = texts[currentLang];
    document.getElementById('gameTitle').innerText = t.title;
    document.getElementById('txtEasy').innerText = t.easy;
    document.getElementById('txtMedium').innerText = t.medium;
    document.getElementById('txtHard').innerText = t.hard;
    document.getElementById('restart').innerText = t.restart;
    document.getElementById('menuTitle').innerText = t.menuTitle;
    document.getElementById('menuTicTac').innerText = t.menuTicTac;
    document.getElementById('menuChess').innerText = t.menuChess;
    document.getElementById('menuCheckers').innerText = t.menuCheckers;
    updateStatus();
}

const themeBtn = document.getElementById('themeBtn');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeBtn.querySelector('i').className = document.body.classList.contains('dark-mode') ? 'fas fa-moon' : 'fas fa-sun';
});

// Menu Lateral
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const menuOverlay = document.getElementById('menuOverlay');

menuBtn.addEventListener('click', () => {
    sideMenu.classList.add('open');
    menuOverlay.classList.add('open');
});

menuOverlay.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
});

// LÓGICA DO RELÓGIO (TIMER)
let timerInterval = null;
let timerStarted = false;
let timeSeconds = 0;
const timerEl = document.getElementById('playerTimer');

function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerStarted = false;
    timerEl.className = 'timer-box'; // Reseta classes de aviso
    timerEl.style.backgroundColor = '';
    timerEl.style.color = '';

    if (currentDifficulty === 'easy') {
        timeSeconds = 0;
        timerEl.innerText = '00:00';
    } else if (currentDifficulty === 'medium') {
        timeSeconds = 5 * 60; // 5 minutos
        timerEl.innerText = '05:00';
    } else {
        timeSeconds = 3 * 60; // 3 minutos
        timerEl.innerText = '03:00';
    }
}

function startTimer() {
    if (timerStarted) return;
    timerStarted = true;
    
    timerInterval = setInterval(() => {
        // Não atualiza o timer se o jogo acabou ou se for a vez da IA
        if (!gameActive || game.turn() === 'b') return;

        if (currentDifficulty === 'easy') {
            timeSeconds++;
            if (timeSeconds >= 59 * 60 + 59) { // 59:59
                timeOutLoss('59:59');
                return;
            }
            // Aviso 40:00
            if (timeSeconds === 40 * 60) {
                timerEl.classList.add('blink-yellow');
                setTimeout(() => timerEl.classList.remove('blink-yellow'), 6000);
            }
            // Aviso > 58:00
            if (timeSeconds > 58 * 60 && timeSeconds % 10 === 0) {
                timerEl.classList.add('flash-red-once');
                setTimeout(() => timerEl.classList.remove('flash-red-once'), 1000);
            }

        } else {
            timeSeconds--;
            if (timeSeconds <= 0) {
                timeOutLoss('00:00');
                return;
            }
            // Aviso 01:00 (Amarelo 3x)
            if (timeSeconds === 60) {
                timerEl.classList.add('blink-yellow');
                setTimeout(() => timerEl.classList.remove('blink-yellow'), 6000);
            }
            // Aviso <= 00:15 (Pisca vermelho contínuo)
            if (timeSeconds === 15) {
                timerEl.classList.add('blink-red-fast');
            }
        }
        
        timerEl.innerText = formatTime(timeSeconds);
    }, 1000);
}

function timeOutLoss(finalDisplay) {
    clearInterval(timerInterval);
    gameActive = false;
    timerEl.innerText = finalDisplay;
    timerEl.className = 'timer-box'; 
    timerEl.style.backgroundColor = '#9B111E'; 
    timerEl.style.color = 'white';

    statusEl.innerText = texts[currentLang].timeout + " " + texts[currentLang].lose;
    statusEl.className = "status-red";
}


// LÓGICA DO XADREZ (Motor e Tabuleiro)
const boardEl = document.getElementById('chessboard');
const statusEl = document.getElementById('status');
const diffButtons = document.querySelectorAll('.diff-btn');

let game = new Chess();
let gameActive = true;
let currentDifficulty = 'hard';
let selectedSquare = null;

const pieceUnicode = {
    'w': { 'p': '♙', 'n': '♘', 'b': '♗', 'r': '♖', 'q': '♕', 'k': '♔' },
    'b': { 'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚' }
};

function renderBoard() {
    boardEl.innerHTML = ''; 
    const board = game.board(); 

    for (let r = 0; r < 8; r++) {
        for (let c = 0; r < 8; c++) {
            if (c > 7) break;
            
            const file = String.fromCharCode(97 + c); 
            const rank = 8 - r; 
            const squareId = file + rank;
            
            const squareEl = document.createElement('div');
            const isLight = (r + c) % 2 === 0;
            squareEl.className = `square ${isLight ? 'light' : 'dark'}`;
            
            if (selectedSquare === squareId) squareEl.classList.add('selected');

            if (selectedSquare) {
                const moves = game.moves({ square: selectedSquare, verbose: true });
                if (moves.some(m => m.to === squareId)) {
                    squareEl.style.boxShadow = "inset 0 0 10px rgba(0,255,0,0.8)";
                }
            }

            const piece = board[r][c];
            if (piece) squareEl.innerText = pieceUnicode[piece.color][piece.type];

            squareEl.addEventListener('click', () => handleSquareClick(squareId));
            boardEl.appendChild(squareEl);
        }
    }
    updateStatus();
}

function handleSquareClick(squareId) {
    if (!gameActive || game.turn() === 'b') return; 

    // Inicia o timer no primeiro clique de peça branca
    const piece = game.get(squareId);
    if (!timerStarted && piece && piece.color === 'w') {
        startTimer();
    }

    if (selectedSquare) {
        const move = game.move({ from: selectedSquare, to: squareId, promotion: 'q' });

        if (move) {
            selectedSquare = null;
            renderBoard();
            
            if (!checkGameOver()) setTimeout(makeAiMove, 250); 
        } else {
            if (piece && piece.color === 'w') selectedSquare = squareId; 
            else selectedSquare = null; 
            renderBoard();
        }
    } else {
        if (piece && piece.color === 'w') {
            selectedSquare = squareId;
            renderBoard();
        }
    }
}

function makeAiMove() {
    if (!gameActive) return;
    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) return;

    const randomIdx = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIdx]);
    
    renderBoard();
    checkGameOver();
}

function checkGameOver() {
    if (game.in_checkmate()) {
        gameActive = false;
        clearInterval(timerInterval);
        statusEl.innerText = game.turn() === 'w' ? texts[currentLang].lose : texts[currentLang].win;
        statusEl.className = game.turn() === 'w' ? "status-red" : "status-green";
        return true;
    } else if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) {
        gameActive = false;
        clearInterval(timerInterval);
        statusEl.innerText = texts[currentLang].tie;
        statusEl.className = "status-gray";
        return true;
    }
    return false;
}

function updateStatus() {
    if (!gameActive || statusEl.innerText.includes(texts[currentLang].timeout)) return;
    
    if (game.turn() === 'w') {
        statusEl.innerText = texts[currentLang].turnW;
        statusEl.className = "";
    } else {
        statusEl.innerText = texts[currentLang].turnB;
        statusEl.className = "";
    }
}

document.getElementById('restart').addEventListener('click', () => {
    game.reset();
    gameActive = true;
    selectedSquare = null;
    statusEl.className = "";
    resetTimer();
    renderBoard();
});

diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.getAttribute('data-diff');
        game.reset();
        gameActive = true;
        selectedSquare = null;
        statusEl.className = "";
        resetTimer();
        renderBoard();
    });
});

resetTimer();
renderBoard();