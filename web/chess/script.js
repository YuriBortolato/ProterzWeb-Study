// SISTEMA DE UI (Idioma, Tema, Som, Menu)
let currentLang = 'PT';
const texts = {
    'PT': {
        title: 'Xadrez', easy: 'Fácil', medium: 'Médio', hard: 'Difícil',
        restart: 'Nova Partida', turnW: 'Sua vez! (Brancas)', turnB: 'IA pensando...',
        win: '🎉 Você venceu!', lose: '💀 A IA venceu!', tie: '🤝 Deu Empate!'
    },
    'EN': {
        title: 'Chess', easy: 'Easy', medium: 'Medium', hard: 'Hard',
        restart: 'New Game', turnW: 'Your turn! (White)', turnB: 'AI thinking...',
        win: '🎉 You win!', lose: '💀 AI wins!', tie: '🤝 It\'s a Tie!'
    },
    'ES': {
        title: 'Ajedrez', easy: 'Fácil', medium: 'Medio', hard: 'Difícil',
        restart: 'Nueva Partida', turnW: '¡Tu turno! (Blancas)', turnB: 'IA pensando...',
        win: '🎉 ¡Tú ganas!', lose: '💀 ¡La IA gana!', tie: '🤝 ¡Empate!'
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
    updateStatus();
}

const themeBtn = document.getElementById('themeBtn');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeBtn.querySelector('i').className = document.body.classList.contains('dark-mode') ? 'fas fa-moon' : 'fas fa-sun';
});

// LÓGICA DO XADREZ (Motor e Tabuleiro)
const boardEl = document.getElementById('chessboard');
const statusEl = document.getElementById('status');
const diffButtons = document.querySelectorAll('.diff-btn');

let game = new Chess(); // chess.js
let gameActive = true;
let currentDifficulty = 'hard';
let selectedSquare = null;

// Mapeamento de peças para Unicode
const pieceUnicode = {
    'w': { 'p': '♙', 'n': '♘', 'b': '♗', 'r': '♖', 'q': '♕', 'k': '♔' },
    'b': { 'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚' }
};

// Renderiza o tabuleiro na tela
function renderBoard() {
    boardEl.innerHTML = ''; // Limpa o tabuleiro antes de redesenhar
    
    // O chess.js representa o tabuleiro como uma matriz 8x8
    const board = game.board(); 

    for (let r = 0; r < 8; r++) {
        for (let c = 0; r < 8; c++) {
            if (c > 7) break;
            
            // Converte coordenadas para notação algébrica (ex: 0,0 -> a8, 7,7 -> h1)
            const file = String.fromCharCode(97 + c); // coluna a-h
            const rank = 8 - r; // linha 8-1
            const squareId = file + rank;
            
            const squareEl = document.createElement('div');
            // Determina a cor da casa
            const isLight = (r + c) % 2 === 0;
            squareEl.className = `square ${isLight ? 'light' : 'dark'}`;
            
            // Destaca a casa selecionada
            if (selectedSquare === squareId) {
                squareEl.classList.add('selected');
            }

            // Destaca os movimentos possíveis da peça selecionada
            if (selectedSquare) {
                const moves = game.moves({ square: selectedSquare, verbose: true });
                if (moves.some(m => m.to === squareId)) {
                    squareEl.style.boxShadow = "inset 0 0 10px rgba(0,255,0,0.8)";
                }
            }

            // Coloca a peça na casa, se houver
            const piece = board[r][c];
            if (piece) {
                squareEl.innerText = pieceUnicode[piece.color][piece.type];
            }

            // Adiciona o evento de clique para a casa
            squareEl.addEventListener('click', () => handleSquareClick(squareId));
            
            boardEl.appendChild(squareEl);
        }
    }
    updateStatus();
}

// Lida com o clique do jogador
function handleSquareClick(squareId) {
    if (!gameActive || game.turn() === 'b') return; // Ignora cliques se o jogo acabou ou se for a vez da IA

    if (selectedSquare) {
        const move = game.move({
            from: selectedSquare,
            to: squareId,
            promotion: 'q' // Sempre promove para Rainha por padrão (ajustável nF)
        });

        if (move) {
            // Movimento válido, atualiza o tabuleiro
            selectedSquare = null;
            renderBoard();
            
            if (!checkGameOver()) {
                setTimeout(makeAiMove, 250); // Pequena pausa para a IA "pensar"
            }
        } else {
            // Movimento inválido, tenta selecionar outra peça (apenas se for branca)
            const piece = game.get(squareId);
            if (piece && piece.color === 'w') {
                selectedSquare = squareId; // Seleciona a nova peça
            } else {
                selectedSquare = null; // Deseleciona se clicar em um quadrado vazio ou em uma peça preta
            }
            renderBoard();
        }
    } else {
        // Nenhuma peça selecionada, tenta selecionar uma peça branca
        const piece = game.get(squareId);
        if (piece && piece.color === 'w') {
            selectedSquare = squareId;
            renderBoard();
        }
    }
}

// IA Provisória (Escolhe um movimento aleatório)
function makeAiMove() {
    if (!gameActive) return;

    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) return;

    // Escolhe um movimento aleatório da lista de movimentos possíveis
    const randomIdx = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIdx]);
    
    renderBoard();
    checkGameOver();
}

function checkGameOver() {
    if (game.in_checkmate()) {
        gameActive = false;
        statusEl.innerText = game.turn() === 'w' ? texts[currentLang].lose : texts[currentLang].win;
        statusEl.className = game.turn() === 'w' ? "status-red" : "status-green";
        return true;
    } else if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) {
        gameActive = false;
        statusEl.innerText = texts[currentLang].tie;
        statusEl.className = "status-gray";
        return true;
    }
    return false;
}

function updateStatus() {
    if (!gameActive) return;
    
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
    renderBoard();
});

diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.getAttribute('data-diff');
        // Mudar a dificuldade alterará a profundidade do Minimax nF
    });
});

// Inicializa o tabuleiro na tela
renderBoard();