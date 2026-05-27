// --- SISTEMA DE UI GLOBAL (Idioma, Tema, Som, Menu) ---

let currentLang = localStorage.getItem('arcadeLang') || 'PT';
const texts = {
    'PT': {
        title: 'Barricade', easy: 'Fácil', medium: 'Médio', hard: 'Difícil',
        restart: 'Nova Partida', turnW: 'Sua vez!', turnB: 'IA pensando...',
        win: '🎉 Você venceu!', lose: '💀 A IA venceu!', tie: '🤝 Deu Empate!',
        timeout: '⏰ Tempo Esgotado!',
        menuTitle: 'Proterz', menuTicTac: 'Jogo da Velha', menuChess: 'Xadrez', menuCheckers: 'Damas', menuBarricade: 'Barricade'
    },
    'EN': {
        title: 'Barricade', easy: 'Easy', medium: 'Medium', hard: 'Hard',
        restart: 'New Game', turnW: 'Your turn!', turnB: 'AI thinking...',
        win: '🎉 You win!', lose: '💀 AI wins!', tie: '🤝 It\'s a Tie!',
        timeout: '⏰ Time Out!',
        menuTitle: 'Proterz', menuTicTac: 'Tic Tac Toe', menuChess: 'Chess', menuCheckers: 'Checkers', menuBarricade: 'Barricade'
    },
    'ES': {
        title: 'Barricade', easy: 'Fácil', medium: 'Medio', hard: 'Difícil',
        restart: 'Nueva Partida', turnW: '¡Tu turno!', turnB: 'IA pensando...',
        win: '🎉 ¡Tú ganas!', lose: '💀 ¡La IA gana!', tie: '🤝 ¡Empate!',
        timeout: '⏰ ¡Tiempo Agotado!',
        menuTitle: 'Proterz', menuTicTac: 'Tres en Raya', menuChess: 'Ajedrez', menuCheckers: 'Damas', menuBarricade: 'Barricade'
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
    document.getElementById('menuBarricade').innerText = t.menuBarricade;
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

// SOM (Mesmo comportamento de fading robusto)
const soundBtn = document.getElementById('soundBtn');
const savedVol = localStorage.getItem('arcadeVolume');

let volumeState = savedVol !== null ? parseInt(savedVol) : 2;
let targetVolume = volumeState === 2 ? 1.0 : (volumeState === 1 ? 0.25 : 0.0);

const bgMusic = new Audio();
let currentTrackIndex = 1;

const playlists = {
    'easy': { total: 4, path: '../audio/barricade/easy/musica' },
    'medium': { total: 3, path: '../audio/barricade/medium/musica' },
    'hard': { total: 2, path: '../audio/barricade/hard/musica' }
};

function updateSoundIcon() {
    const icon = soundBtn.querySelector('i');
    if (volumeState === 2) icon.className = 'fas fa-volume-up';
    else if (volumeState === 1) icon.className = 'fas fa-volume-down';
    else icon.className = 'fas fa-volume-mute';
}

function calculateFade() {
    if (isNaN(bgMusic.duration)) {
        bgMusic.volume = 0;
        return;
    }
    const currentTime = bgMusic.currentTime;
    const timeLeft = bgMusic.duration - currentTime;
    let currentVol = targetVolume;

    if (targetVolume > 0) {
        if (currentTime < 5) currentVol = targetVolume * (currentTime / 5);
        else if (timeLeft < 10) currentVol = targetVolume * (timeLeft / 10);
    }
    bgMusic.volume = Math.max(0, Math.min(currentVol, 1));
}

bgMusic.addEventListener('timeupdate', calculateFade);

function applyVolumeSettings() {
    if (volumeState === 2) targetVolume = 1.0;
    else if (volumeState === 1) targetVolume = 0.25;
    else targetVolume = 0.0;
    if (bgMusic.paused) bgMusic.play().catch(()=>{});
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
    bgMusic.volume = 0; 
    bgMusic.src = `${playlist.path}${currentTrackIndex}.mp3`;
    bgMusic.currentTime = 0; 
    applyVolumeSettings();
}

bgMusic.onended = () => {
    const playlist = playlists[currentDifficulty];
    currentTrackIndex = currentTrackIndex >= playlist.total ? 1 : currentTrackIndex + 1;
    playNextTrack(false);
};

// --- ENGINE DE BARRICADE (QUORIDOR) ---
// O tabuleiro é um grid lógico 17x17. Células pares (0, 2, 4) são blocos. Ímpares são muros.
let gameActive = true;
let currentDifficulty = 'hard';
let currentTurn = 'w'; 
let p1Pos = { r: 16, c: 8 }; // Player 1 (Red/Bottom) target row = 0
let p2Pos = { r: 0, c: 8 };  // Player 2 (Blue/Top) target row = 16
let p1Walls = 10;
let p2Walls = 10;
let gridState = Array(17).fill().map(() => Array(17).fill(0)); // 0 = vazio, 1 = muro, 2 = player

const boardEl = document.getElementById('barricadeboard');
const statusEl = document.getElementById('status');

function initGame() {
    gridState = Array(17).fill().map(() => Array(17).fill(0));
    p1Pos = { r: 16, c: 8 };
    p2Pos = { r: 0, c: 8 };
    p1Walls = 10;
    p2Walls = 10;
    gameActive = true;
    currentTurn = 'w';
    renderBoard();
    updateHUD();
}

function updateHUD() {
    document.getElementById('humanWalls').innerText = p1Walls;
    document.getElementById('aiWalls').innerText = p2Walls;
    updateStatusText();
}

// Retorna os movimentos de peão válidos (pulando o oponente se necessário)
function getValidMoves(pos) {
    let moves = [];
    const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]]; // Movimento de célula pra célula (pula o muro)
    
    for (let [dr, dc] of dirs) {
        let nr = pos.r + dr, nc = pos.c + dc;
        let wr = pos.r + dr/2, wc = pos.c + dc/2; // O muro entre as células
        
        if (nr >= 0 && nr < 17 && nc >= 0 && nc < 17 && gridState[wr][wc] === 0) {
            // Se tem um oponente na célula alvo
            if ((nr === p1Pos.r && nc === p1Pos.c) || (nr === p2Pos.r && nc === p2Pos.c)) {
                // Tenta pular por cima
                let j_nr = nr + dr, j_nc = nc + dc;
                let j_wr = nr + dr/2, j_wc = nc + dc/2;
                if (j_nr >= 0 && j_nr < 17 && j_nc >= 0 && j_nc < 17 && gridState[j_wr][j_wc] === 0) {
                    moves.push({ r: j_nr, c: j_nc });
                }
            } else {
                moves.push({ r: nr, c: nc });
            }
        }
    }
    return moves;
}

// Verifica se colocar um muro nas posições dadas é legal
function isWallLegal(r, c, type) {
    if (gridState[r][c] !== 0) return false;
    
    if (type === 'H') {
        if (c + 2 >= 17 || gridState[r][c+1] !== 0 || gridState[r][c+2] !== 0) return false;
    } else {
        if (r + 2 >= 17 || gridState[r+1][c] !== 0 || gridState[r+2][c] !== 0) return false;
    }

    // Simula colocar o muro
    gridState[r][c] = 1;
    if (type === 'H') { gridState[r][c+1] = 1; gridState[r][c+2] = 1; }
    else { gridState[r+1][c] = 1; gridState[r+2][c] = 1; }

    // Valida o pathfinding (Nenhum jogador pode ficar trancado)
    let p1Path = getShortestPathLength(p1Pos, 0);
    let p2Path = getShortestPathLength(p2Pos, 16);

    // Reverte a simulação
    gridState[r][c] = 0;
    if (type === 'H') { gridState[r][c+1] = 0; gridState[r][c+2] = 0; }
    else { gridState[r+1][c] = 0; gridState[r+2][c] = 0; }

    return p1Path !== Infinity && p2Path !== Infinity;
}

function placeWall(r, c, type, isP1) {
    if (isP1) p1Walls--; else p2Walls--;
    gridState[r][c] = 1;
    if (type === 'H') { gridState[r][c+1] = 1; gridState[r][c+2] = 1; }
    else { gridState[r+1][c] = 1; gridState[r+2][c] = 1; }
}

// Pathfinding Algoritmo BFS para encontrar o menor caminho até a linha de objetivo
function getShortestPathLength(startPos, targetRow) {
    let queue = [{ r: startPos.r, c: startPos.c, dist: 0 }];
    let visited = Array(17).fill().map(() => Array(17).fill(false));
    visited[startPos.r][startPos.c] = true;

    while (queue.length > 0) {
        let curr = queue.shift();
        if (curr.r === targetRow) return curr.dist;

        let moves = getValidMoves({ r: curr.r, c: curr.c });
        for (let m of moves) {
            if (!visited[m.r][m.c]) {
                visited[m.r][m.c] = true;
                queue.push({ r: m.r, c: m.c, dist: curr.dist + 1 });
            }
        }
    }
    return Infinity; // Trancado
}

function renderBoard() {
    boardEl.innerHTML = '';
    let validMoves = currentTurn === 'w' && gameActive ? getValidMoves(p1Pos) : [];

    for (let r = 0; r < 17; r++) {
        for (let c = 0; c < 17; c++) {
            const el = document.createElement('div');
            
            // Células (Peões)
            if (r % 2 === 0 && c % 2 === 0) {
                el.className = 'cell';
                let isTargetMove = validMoves.some(m => m.r === r && m.c === c);
                if (isTargetMove) {
                    el.classList.add('valid-move');
                    el.addEventListener('click', () => movePlayerTo(r, c));
                }

                if (p1Pos.r === r && p1Pos.c === c) {
                    let pawn = document.createElement('div');
                    pawn.className = 'pawn p1';
                    el.appendChild(pawn);
                } else if (p2Pos.r === r && p2Pos.c === c) {
                    let pawn = document.createElement('div');
                    pawn.className = 'pawn p2';
                    el.appendChild(pawn);
                }
            } 
            // Muros Horizontais
            else if (r % 2 !== 0 && c % 2 === 0) {
                el.className = gridState[r][c] === 1 ? 'wall-h wall-placed' : 'wall-h';
                if (gridState[r][c] === 0 && currentTurn === 'w' && gameActive && p1Walls > 0 && isWallLegal(r, c, 'H')) {
                    el.addEventListener('click', () => { placeWall(r, c, 'H', true); switchTurn(); });
                }
            }
            // Muros Verticais
            else if (r % 2 === 0 && c % 2 !== 0) {
                el.className = gridState[r][c] === 1 ? 'wall-v wall-placed' : 'wall-v';
                if (gridState[r][c] === 0 && currentTurn === 'w' && gameActive && p1Walls > 0 && isWallLegal(r, c, 'V')) {
                    el.addEventListener('click', () => { placeWall(r, c, 'V', true); switchTurn(); });
                }
            }
            // Interseções
            else {
                el.className = gridState[r][c] === 1 ? 'intersection wall-placed' : 'intersection';
            }

            boardEl.appendChild(el);
        }
    }
}

function movePlayerTo(r, c) {
    if (currentTurn === 'w') p1Pos = { r, c };
    else p2Pos = { r, c };
    
    if (p1Pos.r === 0) return handleGameOver('w');
    if (p2Pos.r === 16) return handleGameOver('b');
    
    switchTurn();
}

function switchTurn() {
    currentTurn = currentTurn === 'w' ? 'b' : 'w';
    updateHUD();
    renderBoard();
    if (currentTurn === 'b' && gameActive) {
        setTimeout(makeAiMove, 500);
    }
}

// IA Heurística (Tenta maximizar a distância do jogador enquanto diminui a própria)
function makeAiMove() {
    if (!gameActive) return;

    let bestScore = -Infinity;
    let bestAction = null; // { type: 'move'|'wall', val: obj }

    let p1CurrentDist = getShortestPathLength(p1Pos, 0);
    let moves = getValidMoves(p2Pos);

    // 1. Avalia Mover o Peão
    for (let m of moves) {
        let oldPos = p2Pos; p2Pos = m;
        let p2Dist = getShortestPathLength(p2Pos, 16);
        p2Pos = oldPos; // Reverte simulação
        
        let score = (p1CurrentDist - p2Dist); 
        // Adiciona pequena aleatoriedade para não ser 100% robótico
        if (currentDifficulty !== 'hard') score += (Math.random() * 2 - 1); 

        if (score > bestScore) {
            bestScore = score;
            bestAction = { type: 'move', val: m };
        }
    }

    // 2. Avalia Colocar Muro (Somente Médio e Difícil se tiver muros)
    if (p2Walls > 0 && currentDifficulty !== 'easy' && p1CurrentDist <= 6) {
        // Para não explodir processamento, a IA testa muros perto do jogador
        for (let r = Math.max(1, p1Pos.r - 4); r <= Math.min(15, p1Pos.r + 4); r+=2) {
            for (let c = 0; c < 16; c+=2) {
                // Testa Horizontal e Vertical
                ['H', 'V'].forEach(dir => {
                    let rCheck = dir === 'H' ? r-1 : r;
                    let cCheck = dir === 'V' ? c-1 : c;
                    
                    if (rCheck > 0 && cCheck > 0 && isWallLegal(rCheck, cCheck, dir)) {
                        placeWall(rCheck, cCheck, dir, false);
                        let newP1Dist = getShortestPathLength(p1Pos, 0);
                        let newP2Dist = getShortestPathLength(p2Pos, 16);
                        
                        // Retira muro
                        gridState[rCheck][cCheck] = 0;
                        if (dir === 'H') { gridState[rCheck][cCheck+1] = 0; gridState[rCheck][cCheck+2] = 0; }
                        else { gridState[rCheck+1][cCheck] = 0; gridState[rCheck+2][cCheck] = 0; }
                        p2Walls++;

                        let score = (newP1Dist - newP2Dist) + 0.5; // Bônus por bloquear
                        if (score > bestScore) {
                            bestScore = score;
                            bestAction = { type: 'wall', val: { r: rCheck, c: cCheck, dir: dir } };
                        }
                    }
                });
            }
        }
    }

    if (bestAction.type === 'move') {
        movePlayerTo(bestAction.val.r, bestAction.val.c);
    } else {
        placeWall(bestAction.val.r, bestAction.val.c, bestAction.val.dir, false);
        switchTurn();
    }
}

function handleGameOver(winner) {
    gameActive = false;
    if (winner === 'w') {
        statusEl.innerText = texts[currentLang].win;
        statusEl.className = "status-green";
    } else {
        statusEl.innerText = texts[currentLang].lose;
        statusEl.className = "status-red";
    }
    renderBoard();
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

document.getElementById('restart').addEventListener('click', initGame);

diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.getAttribute('data-diff');
        initGame();
        playNextTrack(true); 
    });
});

// Inicializações
updateLanguage();
updateSoundIcon();
playNextTrack(true);
initGame();