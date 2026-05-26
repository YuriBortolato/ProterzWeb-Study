// --- SISTEMA DE UI GLOBAL (Idioma, Tema, Som, Menu) ---

// IDIOMA
let currentLang = localStorage.getItem('arcadeLang') || 'PT';
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
langBtn.innerText = currentLang;

langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'PT' ? 'EN' : currentLang === 'EN' ? 'ES' : 'PT';
    langBtn.innerText = currentLang;
    localStorage.setItem('arcadeLang', currentLang); // Salva globalmente
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

// TEMA
const themeBtn = document.getElementById('themeBtn');
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
    localStorage.setItem('arcadeTheme', isDark ? 'dark' : 'light'); // Salva globalmente
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

// SOM E PLAYLISTS
const soundBtn = document.getElementById('soundBtn');
const savedVol = localStorage.getItem('arcadeVolume');
let volumeState = savedVol !== null ? parseInt(savedVol) : 2;

const bgMusic = new Audio();
let currentTrackIndex = 1;

const playlists = {
    'easy': { total: 5, path: '../audio/chess/easy/musica' },
    'medium': { total: 3, path: '../audio/chess/medium/musica' },
    'hard': { total: 2, path: '../audio/chess/hard/musica' }
};

function updateSoundIcon() {
    const icon = soundBtn.querySelector('i');
    if (volumeState === 2) icon.className = 'fas fa-volume-up';
    else if (volumeState === 1) icon.className = 'fas fa-volume-down';
    else icon.className = 'fas fa-volume-mute';
}

function applyVolumeSettings() {
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
    localStorage.setItem('arcadeVolume', volumeState); // Salva globalmente
    applyVolumeSettings();
});

function playNextTrack(forceRestart = false) {
    const playlist = playlists[currentDifficulty];
    if (forceRestart) currentTrackIndex = 1;

    bgMusic.src = `${playlist.path}${currentTrackIndex}.mp3`;
    applyVolumeSettings();

    bgMusic.onended = () => {
        currentTrackIndex = currentTrackIndex >= playlist.total ? 1 : currentTrackIndex + 1;
        playNextTrack(false);
    };
}


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
    timerEl.className = 'timer-box'; 
    timerEl.style.backgroundColor = '';
    timerEl.style.color = '';

    if (currentDifficulty === 'easy') {
        timeSeconds = 0;
        timerEl.innerText = '00:00';
    } else if (currentDifficulty === 'medium') {
        timeSeconds = 5 * 60; 
        timerEl.innerText = '05:00';
    } else {
        timeSeconds = 3 * 60; 
        timerEl.innerText = '03:00';
    }
}

function startTimer() {
    if (timerStarted) return;
    timerStarted = true;
    
    timerInterval = setInterval(() => {
        if (!gameActive || game.turn() === 'b') return;

        if (currentDifficulty === 'easy') {
            timeSeconds++;
            if (timeSeconds >= 59 * 60 + 59) { 
                timeOutLoss('59:59');
                return;
            }
            if (timeSeconds === 40 * 60) {
                timerEl.classList.add('blink-yellow');
                setTimeout(() => timerEl.classList.remove('blink-yellow'), 6000);
            }
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
            if (timeSeconds === 60) {
                timerEl.classList.add('blink-yellow');
                setTimeout(() => timerEl.classList.remove('blink-yellow'), 6000);
            }
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
    
    timerEl.className = 'timer-box rapid-blink'; 
    
    setTimeout(() => {
        timerEl.className = 'timer-box'; 
        timerEl.style.backgroundColor = '#9B111E'; 
        timerEl.style.color = 'white';
    }, 1000);

    statusEl.innerText = texts[currentLang].timeout; 
    statusEl.className = "status-red";
}

// IA MINIMAX
function getPieceValue(piece) {
    if (!piece) return 0;
    const vals = { 'p': 10, 'n': 30, 'b': 30, 'r': 50, 'q': 90, 'k': 900 };
    return piece.color === 'w' ? vals[piece.type] : -vals[piece.type];
}

function evaluateBoard(gameInst) {
    let totalEvaluation = 0;
    const b = gameInst.board();
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (b[r][c]) {
                totalEvaluation += getPieceValue(b[r][c]);
            }
        }
    }
    return totalEvaluation;
}

function minimax(depth, gameInst, alpha, beta, isMaximizingPlayer) {
    const moves = gameInst.moves();
    
    if (moves.length === 0) {
        if (gameInst.in_checkmate()) return isMaximizingPlayer ? -9999 : 9999;
        return 0; 
    }

    if (depth === 0) return evaluateBoard(gameInst);

    if (isMaximizingPlayer) {
        let bestVal = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            gameInst.move(moves[i]);
            let value = minimax(depth - 1, gameInst, alpha, beta, !isMaximizingPlayer);
            gameInst.undo();
            bestVal = Math.max(bestVal, value);
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) break; 
        }
        return bestVal;
    } else {
        let bestVal = Infinity;
        for (let i = 0; i < moves.length; i++) {
            gameInst.move(moves[i]);
            let value = minimax(depth - 1, gameInst, alpha, beta, !isMaximizingPlayer);
            gameInst.undo();
            bestVal = Math.min(bestVal, value);
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) break; 
        }
        return bestVal;
    }
}

function getBestMove(gameInst, depth) {
    const moves = gameInst.moves();
    let bestValue = Infinity; 
    let bestMove = null;

    moves.sort(() => Math.random() - 0.5);

    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        gameInst.move(move);
        let boardValue = minimax(depth - 1, gameInst, -Infinity, Infinity, true);
        gameInst.undo();
        
        if (boardValue < bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }
    return bestMove || moves[0];
}

// MÓDULO VISUAL DO JOGO
const boardEl = document.getElementById('chessboard');
const statusEl = document.getElementById('status');
const diffButtons = document.querySelectorAll('.diff-btn');

let game = new Chess();
let gameActive = true;
let currentDifficulty = 'hard';
let selectedSquare = null;

const pieceUnicode = {
    'w': { 'p': '♙\uFE0E', 'n': '♘\uFE0E', 'b': '♗\uFE0E', 'r': '♖\uFE0E', 'q': '♕\uFE0E', 'k': '♔\uFE0E' },
    'b': { 'p': '♟\uFE0E', 'n': '♞\uFE0E', 'b': '♝\uFE0E', 'r': '♜\uFE0E', 'q': '♛\uFE0E', 'k': '♚\uFE0E' }
};

function renderBoard() {
    boardEl.innerHTML = ''; 
    const board = game.board(); 
    const inCheck = game.in_check(); 

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
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
            if (piece) {
                squareEl.innerText = pieceUnicode[piece.color][piece.type];
                
                if (inCheck && piece.color === 'w' && piece.type === 'k') {
                    squareEl.classList.add('king-pulse');
                }
            }

            squareEl.addEventListener('click', () => handleSquareClick(squareId));
            boardEl.appendChild(squareEl);
        }
    }
    updateStatus();
}

function handleSquareClick(squareId) {
    if (!gameActive || game.turn() === 'b') return; 

    const piece = game.get(squareId);
    if (!timerStarted && piece && piece.color === 'w') {
        startTimer();
    }

    if (selectedSquare) {
        const move = game.move({ from: selectedSquare, to: squareId, promotion: 'q' });

        if (move) {
            selectedSquare = null;
            renderBoard();
            
            if (!checkGameOver()) setTimeout(makeAiMove, 50); 
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

    let selectedMove;
    if (currentDifficulty === 'easy') {
        selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    } else if (currentDifficulty === 'medium') {
        selectedMove = getBestMove(game, 1); 
    } else {
        selectedMove = getBestMove(game, 2); 
    }

    game.move(selectedMove);
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
    if (!gameActive || statusEl.innerText === texts[currentLang].timeout) return;
    
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
    statusEl.innerText = texts[currentLang].turnW; 
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
        playNextTrack(true); 
        renderBoard();
    });
});

// Inicializações no Load
updateLanguage();
updateSoundIcon();
playNextTrack(true);
resetTimer();
renderBoard();