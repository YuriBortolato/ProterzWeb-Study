// --- SISTEMA DE UI GLOBAL (Idioma, Tema, Som, Menu) ---

// IDIOMA
let currentLang = localStorage.getItem('arcadeLang') || 'PT';
const texts = {
    'PT': {
        title: 'Damas', easy: 'Fácil', medium: 'Médio', hard: 'Difícil',
        restart: 'Nova Partida', turnW: 'Sua vez! (Vermelhas)', turnB: 'IA pensando...',
        win: '🎉 Você venceu!', lose: '💀 A IA venceu!', tie: '🤝 Deu Empate!',
        timeout: '⏰ Tempo Esgotado!',
        menuTitle: 'Arcade Games', menuTicTac: 'Jogo da Velha', menuChess: 'Xadrez', menuCheckers: 'Damas'
    },
    'EN': {
        title: 'Checkers', easy: 'Easy', medium: 'Medium', hard: 'Hard',
        restart: 'New Game', turnW: 'Your turn! (Red)', turnB: 'AI thinking...',
        win: '🎉 You win!', lose: '💀 AI wins!', tie: '🤝 It\'s a Tie!',
        timeout: '⏰ Time Out!',
        menuTitle: 'Arcade Games', menuTicTac: 'Tic Tac Toe', menuChess: 'Chess', menuCheckers: 'Checkers'
    },
    'ES': {
        title: 'Damas', easy: 'Fácil', medium: 'Medio', hard: 'Difícil',
        restart: 'Nueva Partida', turnW: '¡Tu turno! (Rojas)', turnB: 'IA pensando...',
        win: '🎉 ¡Tú ganas!', lose: '💀 ¡La IA gana!', tie: '🤝 ¡Empate!',
        timeout: '⏰ ¡Tiempo Agotado!',
        menuTitle: 'Juegos Arcade', menuTicTac: 'Tres en Raya', menuChess: 'Ajedrez', menuCheckers: 'Damas'
    }
};

const langBtn = document.getElementById('langBtn');
langBtn.innerText = currentLang;

langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'PT' ? 'EN' : currentLang === 'EN' ? 'ES' : 'PT';
    langBtn.innerText = currentLang;
    localStorage.setItem('arcadeLang', currentLang); 
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
    updateStatusText();
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
    localStorage.setItem('arcadeTheme', isDark ? 'dark' : 'light'); 
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

// --- SOM E PLAYLISTS ---
const soundBtn = document.getElementById('soundBtn');
const savedVol = localStorage.getItem('arcadeVolume');

let volumeState = savedVol !== null ? parseInt(savedVol) : 2;
let targetVolume = volumeState === 2 ? 1.0 : (volumeState === 1 ? 0.25 : 0.0);

const bgMusic = new Audio();
let currentTrackIndex = 1;

// Ajuste os diretórios de música conforme as pastas de áudio de damas
const playlists = {
    'easy': { total: 6, path: '../audio/checkers/easy/musica' },
    'medium': { total: 4, path: '../audio/checkers/medium/musica' },
    'hard': { total: 3, path: '../audio/checkers/hard/musica' }
};

function updateSoundIcon() {
    const icon = soundBtn.querySelector('i');
    if (volumeState === 2) icon.className = 'fas fa-volume-up';
    else if (volumeState === 1) icon.className = 'fas fa-volume-down';
    else icon.className = 'fas fa-volume-mute';
}

function calculateFade() {
    if (isNaN(bgMusic.duration)) {
        bgMusic.volume = targetVolume;
        return;
    }

    const currentTime = bgMusic.currentTime;
    const timeLeft = bgMusic.duration - currentTime;
    let currentVol = targetVolume;

    if (targetVolume > 0) {
        if (currentTime < 5) {
            currentVol = targetVolume * (currentTime / 5);
        } else if (timeLeft < 10) {
            currentVol = targetVolume * (timeLeft / 10);
        }
    }
    bgMusic.volume = Math.max(0, Math.min(currentVol, 1));
}

bgMusic.addEventListener('timeupdate', calculateFade);

function applyVolumeSettings() {
    if (volumeState === 2) targetVolume = 1.0;
    else if (volumeState === 1) targetVolume = 0.25;
    else targetVolume = 0.0;
    
    if (bgMusic.paused) {
        bgMusic.play().catch(()=>{});
    }
    calculateFade();
}

soundBtn.addEventListener('click', () => {
    if (volumeState === 2) volumeState = 1;
    else if (volumeState === 1) volumeState = 0;
    else volumeState = 2;
    
    updateSoundIcon();
    localStorage.setItem('arcadeVolume', volumeState); 
    applyVolumeSettings();
});

function playNextTrack(forceRestart = false) {
    const playlist = playlists[currentDifficulty];
    if (forceRestart) currentTrackIndex = 1;

    bgMusic.src = `${playlist.path}${currentTrackIndex}.mp3`;
    bgMusic.currentTime = 0; 
    applyVolumeSettings();
}

bgMusic.onended = () => {
    const playlist = playlists[currentDifficulty];
    currentTrackIndex = currentTrackIndex >= playlist.total ? 1 : currentTrackIndex + 1;
    playNextTrack(false);
};

// --- LÓGICA DO RELÓGIO (TIMER) ---
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
        if (!gameActive || currentTurn === 'b') return;

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


// --- ENGINE DE DAMAS (CHECKERS) ---
let gameActive = true;
let currentDifficulty = 'hard';
let currentTurn = 'w'; // 'w' = player (red), 'b' = AI (black)
let boardState = [];
let selectedSquare = null;
let validMovesForSelected = [];

const boardEl = document.getElementById('checkersboard');
const statusEl = document.getElementById('status');
const diffButtons = document.querySelectorAll('.diff-btn');

function initBoard() {
    boardState = [
        [0, 'b', 0, 'b', 0, 'b', 0, 'b'],
        ['b', 0, 'b', 0, 'b', 0, 'b', 0],
        [0, 'b', 0, 'b', 0, 'b', 0, 'b'],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        ['w', 0, 'w', 0, 'w', 0, 'w', 0],
        [0, 'w', 0, 'w', 0, 'w', 0, 'w'],
        ['w', 0, 'w', 0, 'w', 0, 'w', 0]
    ];
}

// Retorna todas as jogadas possíveis para uma cor. Retorna APENAS capturas se alguma existir (regra oficial).
function getPossibleMoves(board, playerColor) {
    let moves = [];
    let captures = [];
    let p = playerColor;
    let k = playerColor.toUpperCase();
    let opp = playerColor === 'w' ? 'b' : 'w';
    let oppK = opp.toUpperCase();

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === p || board[r][c] === k) {
                let isKing = board[r][c] === k;
                let dirs = [];
                if (p === 'w' || isKing) dirs.push([-1, -1], [-1, 1]); // Move pra cima
                if (p === 'b' || isKing) dirs.push([1, -1], [1, 1]);   // Move pra baixo

                for (let [dr, dc] of dirs) {
                    let nr = r + dr, nc = c + dc;
                    // Movimento simples
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === 0) {
                        moves.push({ from: { r, c }, to: { r: nr, c: nc } });
                    }
                    // Movimento de captura (comer)
                    let jr = r + dr * 2, jc = c + dc * 2;
                    if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && board[jr][jc] === 0) {
                        if (board[nr][nc] === opp || board[nr][nc] === oppK) {
                            captures.push({ from: { r, c }, to: { r: jr, c: jc }, jump: { r: nr, c: nc } });
                        }
                    }
                }
            }
        }
    }
    return captures.length > 0 ? captures : moves;
}

function applyMove(board, move, playerColor) {
    let newBoard = board.map(row => [...row]);
    let piece = newBoard[move.from.r][move.from.c];
    
    newBoard[move.from.r][move.from.c] = 0;
    newBoard[move.to.r][move.to.c] = piece;

    if (move.jump) {
        newBoard[move.jump.r][move.jump.c] = 0;
    }

    // Coroação (Vira Dama)
    if (playerColor === 'w' && move.to.r === 0) newBoard[move.to.r][move.to.c] = 'W';
    if (playerColor === 'b' && move.to.r === 7) newBoard[move.to.r][move.to.c] = 'B';

    return newBoard;
}

// --- RENDERIZAÇÃO ---
function renderBoard() {
    boardEl.innerHTML = '';
    
    let allPlayerMoves = getPossibleMoves(boardState, currentTurn);
    if (allPlayerMoves.length === 0) {
        handleGameOver(currentTurn === 'w' ? 'b' : 'w');
        return;
    }

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const squareEl = document.createElement('div');
            const isLight = (r + c) % 2 === 0;
            squareEl.className = `square ${isLight ? 'light' : 'dark'}`;
            
            if (!isLight) {
                // Highlights de seleção e possíveis jogadas
                if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
                    squareEl.classList.add('selected');
                }
                
                let isTarget = validMovesForSelected.find(m => m.to.r === r && m.to.c === c);
                if (isTarget) {
                    squareEl.style.boxShadow = "inset 0 0 10px rgba(0,255,0,0.8)";
                    squareEl.style.cursor = "pointer";
                }

                // Renderização das peças
                const piece = boardState[r][c];
                if (piece !== 0) {
                    const pieceEl = document.createElement('div');
                    pieceEl.className = `checker-piece ${piece.toLowerCase() === 'w' ? 'checker-w' : 'checker-b'}`;
                    if (piece === 'W' || piece === 'B') pieceEl.classList.add('checker-king');
                    squareEl.appendChild(pieceEl);
                }

                squareEl.addEventListener('click', () => handleSquareClick(r, c, allPlayerMoves));
            }
            boardEl.appendChild(squareEl);
        }
    }
    updateStatusText();
}

function handleSquareClick(r, c, allPlayerMoves) {
    if (!gameActive || currentTurn === 'b') return;
    if (!timerStarted) startTimer();

    const piece = boardState[r][c];
    
    // Se clicou num lugar válido pra andar
    let targetMove = validMovesForSelected.find(m => m.to.r === r && m.to.c === c);
    
    if (targetMove) {
        boardState = applyMove(boardState, targetMove, 'w');
        selectedSquare = null;
        validMovesForSelected = [];
        currentTurn = 'b';
        renderBoard();
        
        if (gameActive) setTimeout(makeAiMove, 100);
    } else {
        // Se clicou na própria peça para selecionar
        if (piece === 'w' || piece === 'W') {
            selectedSquare = { r, c };
            validMovesForSelected = allPlayerMoves.filter(m => m.from.r === r && m.from.c === c);
            renderBoard();
        } else {
            selectedSquare = null;
            validMovesForSelected = [];
            renderBoard();
        }
    }
}

// --- INTELIGÊNCIA ARTIFICIAL (MINIMAX) ---
function evaluateCheckersBoard(board) {
    let score = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === 'b') score += 10;
            else if (board[r][c] === 'B') score += 30;
            else if (board[r][c] === 'w') score -= 10;
            else if (board[r][c] === 'W') score -= 30;
        }
    }
    return score;
}

function minimaxCheckers(board, depth, alpha, beta, isMaximizing) {
    let moves = getPossibleMoves(board, isMaximizing ? 'b' : 'w');
    
    if (depth === 0 || moves.length === 0) {
        return evaluateCheckersBoard(board);
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let move of moves) {
            let newBoard = applyMove(board, move, 'b');
            let ev = minimaxCheckers(newBoard, depth - 1, alpha, beta, false);
            maxEval = Math.max(maxEval, ev);
            alpha = Math.max(alpha, ev);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let move of moves) {
            let newBoard = applyMove(board, move, 'w');
            let ev = minimaxCheckers(newBoard, depth - 1, alpha, beta, true);
            minEval = Math.min(minEval, ev);
            beta = Math.min(beta, ev);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

function makeAiMove() {
    if (!gameActive) return;
    let moves = getPossibleMoves(boardState, 'b');
    
    if (moves.length === 0) {
        handleGameOver('w');
        return;
    }

    let bestMove = null;
    
    if (currentDifficulty === 'easy') {
        bestMove = moves[Math.floor(Math.random() * moves.length)];
    } else {
        let bestValue = -Infinity;
        let depth = currentDifficulty === 'medium' ? 2 : 4; 
        
        moves.sort(() => Math.random() - 0.5); // Randomiza pra não ser repetitivo
        
        for (let move of moves) {
            let simulatedBoard = applyMove(boardState, move, 'b');
            let boardValue = minimaxCheckers(simulatedBoard, depth - 1, -Infinity, Infinity, false);
            if (boardValue > bestValue) {
                bestValue = boardValue;
                bestMove = move;
            }
        }
    }

    boardState = applyMove(boardState, bestMove, 'b');
    currentTurn = 'w';
    renderBoard();
}

function handleGameOver(winner) {
    gameActive = false;
    clearInterval(timerInterval);
    if (winner === 'w') {
        statusEl.innerText = texts[currentLang].win;
        statusEl.className = "status-green";
    } else {
        statusEl.innerText = texts[currentLang].lose;
        statusEl.className = "status-red";
    }
}

function updateStatusText() {
    if (!gameActive || statusEl.innerText === texts[currentLang].timeout) return;
    
    if (currentTurn === 'w') {
        statusEl.innerText = texts[currentLang].turnW;
        statusEl.className = "";
    } else {
        statusEl.innerText = texts[currentLang].turnB;
        statusEl.className = "";
    }
}

document.getElementById('restart').addEventListener('click', () => {
    initBoard();
    gameActive = true;
    currentTurn = 'w';
    selectedSquare = null;
    validMovesForSelected = [];
    statusEl.className = ""; 
    resetTimer();
    renderBoard();
});

diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.getAttribute('data-diff');
        
        initBoard();
        gameActive = true;
        currentTurn = 'w';
        selectedSquare = null;
        validMovesForSelected = [];
        statusEl.className = "";
        resetTimer();
        playNextTrack(true); 
        renderBoard();
    });
});

// Inicializações no Load
initBoard();
updateLanguage();
updateSoundIcon();
playNextTrack(true);
resetTimer();
renderBoard();