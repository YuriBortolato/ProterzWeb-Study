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

// SOM
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

    if (currentDifficulty === 'easy') {
        timeSeconds = 0;
        timerEl.innerText = '00:00';
    } else if (currentDifficulty === 'medium') {
        timeSeconds = 2 * 60; // 2 minutos
        timerEl.innerText = '02:00';
    } else {
        timeSeconds = 80; // 1 minuto e 20 segundos
        timerEl.innerText = '01:20';
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
                setTimeout(() => timerEl.classList.remove('blink-yellow'), 5000);
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
            
            let yellowAlertTime = currentDifficulty === 'medium' ? 60 : 45;
            
            if (timeSeconds === yellowAlertTime) {
                timerEl.classList.add('blink-yellow');
                setTimeout(() => timerEl.classList.remove('blink-yellow'), 5000); 
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
        timerEl.className = 'timer-box timeout-red'; 
    }, 1000);

    statusEl.innerText = texts[currentLang].timeout; 
    statusEl.className = "status-red";
}


// --- ENGINE DE BARRICADE (QUORIDOR) ---
let gameActive = true;
let currentDifficulty = 'hard';
let currentTurn = 'w'; 
let p1Pos = { r: 16, c: 8 }; 
let p2Pos = { r: 0, c: 8 };  
let p1Walls = 10;
let p2Walls = 10;
let gridState = Array(17).fill().map(() => Array(17).fill(0)); 

const boardEl = document.getElementById('barricadeboard');
const statusEl = document.getElementById('status');
const diffButtons = document.querySelectorAll('.diff-btn');

function initGame() {
    gridState = Array(17).fill().map(() => Array(17).fill(0));
    p1Pos = { r: 16, c: 8 };
    p2Pos = { r: 0, c: 8 };
    p1Walls = 10;
    p2Walls = 10;
    gameActive = true;
    currentTurn = 'w';
    resetTimer();
    updateHUD();
    renderBoard();
}

function updateHUD() {
    document.getElementById('humanWalls').innerText = p1Walls;
    document.getElementById('aiWalls').innerText = p2Walls;
    updateStatusText();
}

function getValidMoves(pos) {
    let moves = [];
    const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]]; 
    
    for (let [dr, dc] of dirs) {
        let nr = pos.r + dr, nc = pos.c + dc;
        let wr = pos.r + dr/2, wc = pos.c + dc/2; 
        
        if (nr >= 0 && nr < 17 && nc >= 0 && nc < 17 && gridState[wr][wc] === 0) {
            if ((nr === p1Pos.r && nc === p1Pos.c) || (nr === p2Pos.r && nc === p2Pos.c)) {
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

function isWallLegal(r, c, type) {
    if (type === 'H') {
        if (c + 2 >= 17 || gridState[r][c] !== 0 || gridState[r][c+1] !== 0 || gridState[r][c+2] !== 0) return false;
    } else {
        if (r + 2 >= 17 || gridState[r][c] !== 0 || gridState[r+1][c] !== 0 || gridState[r+2][c] !== 0) return false;
    }

    gridState[r][c] = 1;
    if (type === 'H') { gridState[r][c+1] = 1; gridState[r][c+2] = 1; }
    else { gridState[r+1][c] = 1; gridState[r+2][c] = 1; }

    let p1Path = getShortestPath(p1Pos, 0);
    let p2Path = getShortestPath(p2Pos, 16);

    gridState[r][c] = 0;
    if (type === 'H') { gridState[r][c+1] = 0; gridState[r][c+2] = 0; }
    else { gridState[r+1][c] = 0; gridState[r+2][c] = 0; }

    return p1Path !== null && p2Path !== null;
}

function placeWall(r, c, type, isP1) {
    if (isP1) p1Walls--; else p2Walls--;
    gridState[r][c] = 1;
    if (type === 'H') { gridState[r][c+1] = 1; gridState[r][c+2] = 1; }
    else { gridState[r+1][c] = 1; gridState[r+2][c] = 1; }
}

function getShortestPath(startPos, targetRow) {
    let queue = [{ r: startPos.r, c: startPos.c, path: [] }];
    let visited = Array(17).fill().map(() => Array(17).fill(false));
    visited[startPos.r][startPos.c] = true;

    while (queue.length > 0) {
        let curr = queue.shift();
        if (curr.r === targetRow) return curr.path;

        let moves = getValidMoves({ r: curr.r, c: curr.c });
        for (let m of moves) {
            if (!visited[m.r][m.c]) {
                visited[m.r][m.c] = true;
                queue.push({ r: m.r, c: m.c, path: [...curr.path, m] });
            }
        }
    }
    return null; 
}

function highlightWall(r, c, type, isHover) {
    const ids = type === 'H' ? [`cell-${r}-${c}`, `cell-${r}-${c+1}`, `cell-${r}-${c+2}`] : [`cell-${r}-${c}`, `cell-${r+1}-${c}`, `cell-${r+2}-${c}`];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (isHover) el.classList.add('wall-hover');
            else el.classList.remove('wall-hover');
        }
    });
}

function renderBoard() {
    boardEl.innerHTML = '';
    let validMoves = currentTurn === 'w' && gameActive ? getValidMoves(p1Pos) : [];

    for (let r = 0; r < 17; r++) {
        for (let c = 0; c < 17; c++) {
            const el = document.createElement('div');
            el.id = `cell-${r}-${c}`;
            
            if (r % 2 === 0 && c % 2 === 0) {
                el.className = 'cell';
                let isTargetMove = validMoves.some(m => m.r === r && m.c === c);
                if (isTargetMove) {
                    el.classList.add('valid-move');
                    el.addEventListener('click', () => {
                        if (!timerStarted) startTimer();
                        movePlayerTo(r, c);
                    });
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
            else if (r % 2 !== 0 && c % 2 === 0) {
                el.className = 'wall-h';
                if (gridState[r][c] === 1) el.classList.add('wall-placed');
                else if (currentTurn === 'w' && gameActive && p1Walls > 0 && isWallLegal(r, c, 'H')) {
                    el.addEventListener('mouseover', () => highlightWall(r, c, 'H', true));
                    el.addEventListener('mouseout', () => highlightWall(r, c, 'H', false));
                    el.addEventListener('click', () => { 
                        if (!timerStarted) startTimer();
                        placeWall(r, c, 'H', true); switchTurn(); 
                    });
                }
            }
            else if (r % 2 === 0 && c % 2 !== 0) {
                el.className = 'wall-v';
                if (gridState[r][c] === 1) el.classList.add('wall-placed');
                else if (currentTurn === 'w' && gameActive && p1Walls > 0 && isWallLegal(r, c, 'V')) {
                    el.addEventListener('mouseover', () => highlightWall(r, c, 'V', true));
                    el.addEventListener('mouseout', () => highlightWall(r, c, 'V', false));
                    el.addEventListener('click', () => { 
                        if (!timerStarted) startTimer();
                        placeWall(r, c, 'V', true); switchTurn(); 
                    });
                }
            }
            else {
                el.className = 'intersection';
                if (gridState[r][c] === 1) el.classList.add('wall-placed');
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

function makeAiMove() {
    if (!gameActive) return;

    let bestScore = -Infinity;
    let bestAction = null; 

    let p1Path = getShortestPath(p1Pos, 0);
    let p2Path = getShortestPath(p2Pos, 16);

    let p1Dist = p1Path ? p1Path.length : Infinity;
    let p2Dist = p2Path ? p2Path.length : Infinity;

    let moves = getValidMoves(p2Pos);
    for (let m of moves) {
        let oldPos = p2Pos; p2Pos = m;
        let newP2Path = getShortestPath(p2Pos, 16);
        p2Pos = oldPos; 
        
        if (newP2Path) {
            let score = (p1Dist - newP2Path.length); 
            if (currentDifficulty !== 'hard') score += (Math.random() * 2 - 1); 

            if (score > bestScore) {
                bestScore = score;
                bestAction = { type: 'move', val: m };
            }
        }
    }

    if (p2Walls > 0 && currentDifficulty !== 'easy' && p1Path && p1Path.length > 0) {
        let wallCandidates = [];
        let stepsToBlock = p1Path.slice(0, 4);
        stepsToBlock.push(p1Pos); 
        
        for (let step of stepsToBlock) {
            let r = step.r, c = step.c;
            let potentialWalls = [
                {r: r-1, c: c, dir: 'H'}, {r: r-1, c: c-2, dir: 'H'},
                {r: r+1, c: c, dir: 'H'}, {r: r+1, c: c-2, dir: 'H'},
                {r: r, c: c-1, dir: 'V'}, {r: r-2, c: c-1, dir: 'V'},
                {r: r, c: c+1, dir: 'V'}, {r: r-2, c: c+1, dir: 'V'}
            ];
            for (let pw of potentialWalls) {
                if (pw.r > 0 && pw.r < 17 && pw.c > 0 && pw.c < 17) {
                    wallCandidates.push(pw);
                }
            }
        }

        let uniqueWalls = wallCandidates.filter((v, i, a) => a.findIndex(t => (t.r === v.r && t.c === v.c && t.dir === v.dir)) === i);

        for (let cand of uniqueWalls) {
            let rCheck = cand.r, cCheck = cand.c, dir = cand.dir;
            
            if (isWallLegal(rCheck, cCheck, dir)) {
                placeWall(rCheck, cCheck, dir, false);
                let newP1Path = getShortestPath(p1Pos, 0);
                let newP2Path = getShortestPath(p2Pos, 16);
                
                gridState[rCheck][cCheck] = 0;
                if (dir === 'H') { gridState[rCheck][cCheck+1] = 0; gridState[rCheck][cCheck+2] = 0; }
                else { gridState[rCheck+1][cCheck] = 0; gridState[rCheck+2][cCheck] = 0; }
                p2Walls++;

                if (newP1Path && newP2Path) {
                    let newP1Dist = newP1Path.length;
                    let newP2Dist = newP2Path.length;
                    let score = (newP1Dist - newP2Dist);
                    
                    if (currentDifficulty === 'hard') {
                        score += (newP1Dist - p1Dist) * 2; 
                    } else {
                        score += Math.random(); 
                    }

                    if (score > bestScore) {
                        bestScore = score;
                        bestAction = { type: 'wall', val: cand };
                    }
                }
            }
        }
    }

    if (bestAction && bestAction.type === 'move') {
        movePlayerTo(bestAction.val.r, bestAction.val.c);
    } else if (bestAction && bestAction.type === 'wall') {
        placeWall(bestAction.val.r, bestAction.val.c, bestAction.val.dir, false);
        switchTurn();
    } else {
        let fallbackMoves = getValidMoves(p2Pos);
        if (fallbackMoves.length > 0) movePlayerTo(fallbackMoves[0].r, fallbackMoves[0].c);
    }
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

document.getElementById('restart').addEventListener('click', () => {
    initGame();
});

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