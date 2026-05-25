// SISTEMA DE UI (Idioma, Tema, Som, Menu)
let currentLang = 'PT';
const texts = {
    'PT': {
        title: 'Xadrez', easy: 'Fácil', medium: 'Médio', hard: 'Difícil',
        restart: 'Nova Partida', turnW: 'Sua vez! (Brancas)', turnB: 'IA pensando...',
        win: '🎉 Você venceu!', lose: '💀 A IA venceu!', tie: '🤝 Deu Empate!',
        timeout: '⏰ Tempo Esgotado!', // Texto limpo, sem emoji extra de caveira
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
    timerEl.className = 'timer-box'; 
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
    
    // Inicia a animação de piscar 5 vezes rápido
    timerEl.className = 'timer-box rapid-blink'; 
    
    // Após 1000ms (tempo exato das 5 piscadas), fixa o visual de derrota
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
    if (gameInst.in_checkmate()) {
        return gameInst.turn() === 'w' ? -9999 : 9999;
    }
    if (gameInst.in_draw() || gameInst.in_stalemate() || gameInst.in_threefold_repetition()) {
        return 0; 
    }
    
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

// Minimax com Poda Alfa-Beta
function minimax(depth, gameInst, alpha, beta, isMaximizingPlayer) {
    if (depth === 0 || gameInst.game_over()) {
        return evaluateBoard(gameInst);
    }

    const moves = gameInst.moves();

    if (isMaximizingPlayer) {
        let bestVal = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            gameInst.move(moves[i]);
            let value = minimax(depth - 1, gameInst, alpha, beta, !isMaximizingPlayer);
            gameInst.undo();
            bestVal = Math.max(bestVal, value);
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) break; // Poda Alfa
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
    let bestValue = Infinity; // IA é o jogador minimizador (pretas), então começamos com +Infinity
    let bestMove = null;

    // Embaralha os movimentos para evitar sempre escolher o mesmo em situações de empate
    moves.sort(() => Math.random() - 0.5);

    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        gameInst.move(move);
        // A IA é o jogador minimizador, então queremos o valor mínimo do tabuleiro após a jogada
        let boardValue = minimax(depth - 1, gameInst, -Infinity, Infinity, true);
        gameInst.undo();
        
        if (boardValue < bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }
    return bestMove || moves[0];
}

// LÓGICA DO XADREZ (Interface)
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

    // Roteamento da IA por Dificuldade
    if (currentDifficulty === 'easy') {
        // Fácil: Escolhe aleatoriamente
        selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    } else if (currentDifficulty === 'medium') {
        // Médio: Minimax superficial (Profundidade 2)
        selectedMove = getBestMove(game, 2);
    } else {
        // Difícil: Minimax tático (Profundidade 3)
        selectedMove = getBestMove(game, 3);
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