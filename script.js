const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('status-message');
const resetButton = document.getElementById('reset-button');
const crypticMessagesContainer = document.getElementById('cryptic-messages-container');
const backgroundAudio = document.getElementById('background-audio');

let gameBoard = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let isGameActive = true;
let disturbanceLevel = 0; // Starts at 0, increases with player wins

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

const CRYPTIC_PHRASES = [
    "Why do you keep winning?",
    "This isn't right.",
    "You shouldn't be able to do that.",
    "It's breaking...",
    "STOP.",
    "The system is failing.",
    "ERROR: REALITY MISMATCH",
    "CAN YOU HEAR IT?",
    "IT'S WATCHING.",
    "YOUR MOVES ARE NOT YOUR OWN."
];

const AMBIENT_SOUNDS = [
    'audio/static.mp3', // Create these audio files
    'audio/whispers.mp3',
    'audio/hum.mp3'
];

// --- Game Logic ---

function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.cellIndex);

    if (gameBoard[clickedCellIndex] !== '' || !isGameActive) {
        return;
    }

    placeMark(clickedCell, clickedCellIndex, currentPlayer);
    checkResult();

    if (isGameActive) {
        // Player's turn is done, now bot makes a move after a slight delay
        setTimeout(botMove, 500 + (disturbanceLevel * 50)); // Bot delay increases with disturbance
    }
}

function placeMark(cell, index, player) {
    gameBoard[index] = player;
    cell.classList.add(player);
    // Add glitchy piece appearance for 'O' (bot's pieces) at higher disturbance
    if (player === 'O' && disturbanceLevel >= 4) {
        if (Math.random() < (disturbanceLevel * 0.1)) { // Chance increases
            cell.classList.add('corrupted');
        }
    }
    // Screen flash effect on move
    if (disturbanceLevel >= 2) {
        document.body.classList.add('flash-glitch');
        setTimeout(() => document.body.classList.remove('flash-glitch'), 100);
    }
}

function checkResult() {
    let roundWon = false;
    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
        const winCondition = WINNING_COMBINATIONS[i];
        let a = gameBoard[winCondition[0]];
        let b = gameBoard[winCondition[1]];
        let c = gameBoard[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusMessage.textContent = `${currentPlayer} Wins!`;
        isGameActive = false;
        if (currentPlayer === 'X') { // Player wins! Increase disturbance
            disturbanceLevel++;
            applyDisturbanceEffects();
            statusMessage.textContent += " The system screams.";
        } else { // Bot wins
            statusMessage.textContent += " The silence grows.";
        }
        return;
    }

    let roundDraw = !gameBoard.includes('');
    if (roundDraw) {
        statusMessage.textContent = 'Draw!';
        isGameActive = false;
        return;
    }

    // Only switch player if game is still active
    if (isGameActive) {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusMessage.textContent = `It's ${currentPlayer}'s turn.`;
    }
}

function botMove() {
    if (!isGameActive) return;

    let availableCells = [];
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            availableCells.push(i);
        }
    }

    if (availableCells.length > 0) {
        let randomIndex = Math.floor(Math.random() * availableCells.length);
        let chosenCellIndex = availableCells[randomIndex];
        let chosenCell = cells[chosenCellIndex];

        // Subtle cheating: Bot double-places and then erases one (higher disturbance)
        if (disturbanceLevel >= 5 && Math.random() < 0.3) {
            const secondRandomIndex = Math.floor(Math.random() * availableCells.length);
            const secondChosenCellIndex = availableCells[secondRandomIndex];
            const secondChosenCell = cells[secondChosenCellIndex];

            placeMark(chosenCell, chosenCellIndex, 'O');
            placeMark(secondChosenCell, secondChosenCellIndex, 'O');
            statusMessage.textContent = "Processing... (a glitch)";
            setTimeout(() => {
                gameBoard[secondChosenCellIndex] = '';
                secondChosenCell.classList.remove('o', 'corrupted');
                secondChosenCell.innerHTML = ''; // Clear content
                // Re-apply original mark
                gameBoard[chosenCellIndex] = 'O';
                chosenCell.classList.add('o');
                checkResult();
                statusMessage.textContent = `It's ${currentPlayer}'s turn.`; // Reset status
            }, 300 + (disturbanceLevel * 100)); // Delay for effect
        } else {
            placeMark(chosenCell, chosenCellIndex, 'O');
            checkResult();
        }
    }
}

function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    currentPlayer = 'X';
    statusMessage.textContent = "It's X's turn.";

    cells.forEach(cell => {
        cell.classList.remove('x', 'o', 'corrupted');
        cell.innerHTML = ''; // Ensure content is cleared
    });

    // Reset some visual disturbances for a new round (not all)
    document.body.classList.remove('disturbed-1', 'disturbed-2', 'disturbed-3'); // Add more
    board.classList.remove('shake-board');
    // Keep ambient audio if it's already playing from previous wins
}

// --- Disturbance Management ---

function applyDisturbanceEffects() {
    console.log(`Disturbance Level: ${disturbanceLevel}`);

    // Level 1: Subtle flicker
    if (disturbanceLevel >= 1) {
        board.classList.add('glitch-flicker');
        cells.forEach(cell => cell.classList.add('glitch-flicker'));
        triggerCrypticMessage();
    }
    // Level 2: Color shift, more frequent cryptic messages, screen flash on moves
    if (disturbanceLevel >= 2) {
        document.body.classList.add('disturbed-1'); // Shift to red/darker hues
        setInterval(triggerCrypticMessage, 3000); // More frequent
    }
    // Level 3: RGB split on pieces, board shake
    if (disturbanceLevel >= 3) {
        cells.forEach(cell => cell.classList.add('glitch-rgb'));
        board.classList.add('shake-board');
        document.body.classList.add('disturbed-2'); // Deeper color shift
        playAmbientSound('static');
    }
    // Level 4: Cursor glitches, distorted pieces
    if (disturbanceLevel >= 4) {
        document.body.style.cursor = 'none'; // Make it disappear sometimes
        setInterval(() => {
            document.body.style.cursor = Math.random() > 0.5 ? 'none' : 'auto';
        }, 1000); // Glitch cursor
        // Piece corruption added in placeMark function
        document.body.classList.add('disturbed-3'); // Even deeper color shift
        playAmbientSound('whispers');
    }
    // Level 5: More intense glitches, subtle bot cheating
    if (disturbanceLevel >= 5) {
        // More aggressive CSS animations can be added here
        playAmbientSound('hum');
    }
    // Add more levels for more intense effects
}

function triggerCrypticMessage() {
    const messageText = CRYPTIC_PHRASES[Math.floor(Math.random() * CRYPTIC_PHRASES.length)];
    const msgElement = document.createElement('div');
    msgElement.classList.add('cryptic-message');
    msgElement.textContent = messageText;

    // Random positioning
    msgElement.style.top = `${20 + Math.random() * 60}%`;
    msgElement.style.left = `${10 + Math.random() * 80}%`;
    msgElement.style.fontSize = `${1 + Math.random() * 1.5}em`;
    msgElement.style.color = `rgba(${Math.random() * 255}, 0, 0, ${0.5 + Math.random() * 0.5})`;

    crypticMessagesContainer.appendChild(msgElement);

    setTimeout(() => {
        msgElement.remove();
    }, 5000); // Remove after animation
}

function playAmbientSound(type) {
    let audioFile;
    if (type === 'static') {
        audioFile = 'audio/static.mp3';
    } else if (type === 'whispers') {
        audioFile = 'audio/whispers.mp3';
    } else if (type === 'hum') {
        audioFile = 'audio/hum.mp3';
    }

    if (audioFile && backgroundAudio.src !== window.location.origin + '/' + audioFile) {
        backgroundAudio.src = audioFile;
        backgroundAudio.volume = 0.3 + (disturbanceLevel * 0.05); // Volume increases
        backgroundAudio.play().catch(e => console.error("Audio playback failed:", e));
    } else if (backgroundAudio.src === window.location.origin + '/' + audioFile) {
        // If already playing this sound, just increase volume
        backgroundAudio.volume = Math.min(1, backgroundAudio.volume + 0.1);
    }
}


// --- Event Listeners ---
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);

// Initial setup
statusMessage.textContent = "It's X's turn.";
