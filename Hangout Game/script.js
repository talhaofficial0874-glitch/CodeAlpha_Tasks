// Predefined list of 5 words with hints
const wordsList = [
    { word: "PYTHON", hint: "A popular programming language named after a snake." },
    { word: "JAVASCRIPT", hint: "The programming language of the Web." },
    { word: "DEVELOPER", hint: "Someone who writes code." },
    { word: "INTERFACE", hint: "A shared boundary across which two separate components exchange information." },
    { word: "ANIMATION", hint: "The illusion of movement created by showing a series of pictures." }
];

// Game state
let availableWords = [];
let currentWordObj = null;
let revealedIndices = []; 
let incorrectGuesses = 0;
const maxIncorrectGuesses = 6;
let hintsLeft = 3;

// Persistent Stats
let score = 0;
let highScore = parseInt(localStorage.getItem("hangmanHighScore")) || 0;
let totalWordsGuessed = parseInt(localStorage.getItem("hangmanTotalWords")) || 0;
let gamesPlayed = parseInt(localStorage.getItem("hangmanGamesPlayed")) || 0;

// DOM Elements - Screens
const dashboardScreen = document.getElementById("dashboard-screen");
const gameScreen = document.getElementById("game-screen");

// DOM Elements - Dashboard
const highScoreDisplay = document.getElementById("high-score-display");
const lastScoreDisplay = document.getElementById("last-score-display");
const wordsGuessedDisplay = document.getElementById("words-guessed-display");
const gamesPlayedDisplay = document.getElementById("games-played-display");
const startGameBtn = document.getElementById("start-game-btn");

// DOM Elements - Game
const currentScoreSpan = document.getElementById("current-score");
const quitBtn = document.getElementById("quit-btn");
const wordDisplay = document.getElementById("word-display");
const keyboard = document.getElementById("keyboard");
const incorrectCountSpan = document.getElementById("incorrect-count");
const figureParts = document.querySelectorAll(".figure-part");
const hintText = document.getElementById("hint-text");
const useHintBtn = document.getElementById("use-hint-btn");
const hintsLeftSpan = document.getElementById("hints-left");

// DOM Elements - Modal
const modal = document.getElementById("message-modal");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const finalWordSpan = document.getElementById("final-word");
const nextWordBtn = document.getElementById("next-word-btn");
const returnDashboardBtn = document.getElementById("return-dashboard-btn");

// Initialize Application
function initApp() {
    updateDashboardStats();
    showDashboard();
}

function updateDashboardStats() {
    highScoreDisplay.textContent = highScore;
    lastScoreDisplay.textContent = score;
    wordsGuessedDisplay.textContent = totalWordsGuessed;
    gamesPlayedDisplay.textContent = gamesPlayed;
}

// Screen Transitions
function showDashboard() {
    gameScreen.classList.add("hidden");
    dashboardScreen.classList.remove("hidden");
    modal.classList.add("hidden"); // FIX: Ensures modal closes when returning
    updateDashboardStats();
}

function showGameScreen() {
    dashboardScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
}

// Start a completely new game
function startGame() {
    score = 0;
    currentScoreSpan.textContent = score;
    availableWords = [...wordsList];
    
    // Increment games played
    gamesPlayed++;
    localStorage.setItem("hangmanGamesPlayed", gamesPlayed);
    
    showGameScreen();
    nextLevel();
}

// Start the next word/level
function nextLevel() {
    // Reset state for the current word
    incorrectGuesses = 0;
    incorrectCountSpan.textContent = incorrectGuesses;
    hintsLeft = 3;
    hintsLeftSpan.textContent = hintsLeft;
    useHintBtn.disabled = false;
    modal.classList.add("hidden");
    
    // Hide all hangman parts
    figureParts.forEach(part => {
        part.classList.remove("visible");
    });
    
    // Check if we ran out of words, if so, reshuffle
    if (availableWords.length === 0) {
        availableWords = [...wordsList];
    }
    
    // Pick a random word from available
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    currentWordObj = availableWords.splice(randomIndex, 1)[0];
    
    // Initialize revealed indices tracking array
    revealedIndices = Array(currentWordObj.word.length).fill(false);
    
    // Set Clue
    hintText.textContent = currentWordObj.hint;
    
    renderWord();
    renderKeyboard();
}

// Render the word display
function renderWord(newlyRevealedIndex = -1) {
    wordDisplay.innerHTML = "";
    
    for (let i = 0; i < currentWordObj.word.length; i++) {
        const letterBox = document.createElement("div");
        
        if (revealedIndices[i]) {
            letterBox.className = "letter-box";
            // Add flip animation if it was just revealed
            if (i === newlyRevealedIndex) {
                letterBox.classList.add("flip-in");
            }
            letterBox.textContent = currentWordObj.word[i];
        } else {
            letterBox.className = "letter-box empty";
            letterBox.textContent = "";
        }
        
        wordDisplay.appendChild(letterBox);
    }
}

// Render the interactive keyboard
function renderKeyboard() {
    keyboard.innerHTML = "";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    
    alphabet.forEach(letter => {
        const button = document.createElement("button");
        button.className = "key";
        button.textContent = letter;
        button.id = "key-" + letter; 
        
        // Handle click
        button.addEventListener("click", () => handleGuess(letter, button));
        
        keyboard.appendChild(button);
    });
}

// Check if a specific letter has any unrevealed instances in the word
function hasUnrevealedInstances(letter) {
    for (let i = 0; i < currentWordObj.word.length; i++) {
        if (currentWordObj.word[i] === letter && !revealedIndices[i]) {
            return true;
        }
    }
    return false;
}

// Find the first unrevealed instance of a letter
function getFirstUnrevealedIndex(letter) {
    for (let i = 0; i < currentWordObj.word.length; i++) {
        if (currentWordObj.word[i] === letter && !revealedIndices[i]) {
            return i;
        }
    }
    return -1;
}

// Handle a letter guess from keyboard
function handleGuess(letter, buttonElement) {
    if (incorrectGuesses >= maxIncorrectGuesses || buttonElement.disabled) {
        return;
    }
    
    const word = currentWordObj.word;
    
    if (word.includes(letter)) {
        // Correct guess - user must find instances one by one
        let indexToReveal = getFirstUnrevealedIndex(letter);
        
        if (indexToReveal !== -1) {
            revealedIndices[indexToReveal] = true;
            renderWord(indexToReveal);
            
            // If there are NO MORE unrevealed instances of this letter, disable the button
            if (!hasUnrevealedInstances(letter)) {
                buttonElement.classList.add("correct");
                buttonElement.disabled = true;
            }
            
            checkWinCondition();
        }
    } else {
        // Incorrect guess
        incorrectGuesses++;
        incorrectCountSpan.textContent = incorrectGuesses;
        buttonElement.classList.add("incorrect");
        buttonElement.disabled = true;
        
        // Show next body part
        if (incorrectGuesses <= maxIncorrectGuesses) {
            figureParts[incorrectGuesses - 1].classList.add("visible");
        }
        
        checkLoseCondition();
    }
}

// Handle Hint Button Click
useHintBtn.addEventListener("click", () => {
    if (hintsLeft <= 0 || incorrectGuesses >= maxIncorrectGuesses) return;
    
    let unrevealed = [];
    for (let i = 0; i < currentWordObj.word.length; i++) {
        if (!revealedIndices[i]) unrevealed.push(i);
    }
    
    if (unrevealed.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * unrevealed.length);
    const indexToReveal = unrevealed[randomIndex];
    const revealedLetter = currentWordObj.word[indexToReveal];
    
    revealedIndices[indexToReveal] = true;
    renderWord(indexToReveal);
    
    hintsLeft--;
    hintsLeftSpan.textContent = hintsLeft;
    if (hintsLeft === 0) {
        useHintBtn.disabled = true;
    }
    
    const keyButton = document.getElementById("key-" + revealedLetter);
    if (keyButton && !hasUnrevealedInstances(revealedLetter)) {
        keyButton.classList.add("correct");
        keyButton.disabled = true;
    }
    
    checkWinCondition();
});

// Check if player won
function checkWinCondition() {
    let won = !revealedIndices.includes(false);
    
    if (won) {
        // Award points
        const pointsEarned = 10 + (maxIncorrectGuesses - incorrectGuesses) * 5 + (hintsLeft * 2);
        score += pointsEarned;
        currentScoreSpan.textContent = score;
        
        // Increment global stats
        totalWordsGuessed++;
        localStorage.setItem("hangmanTotalWords", totalWordsGuessed);
        
        endGame(true);
    }
}

// Check if player lost
function checkLoseCondition() {
    if (incorrectGuesses >= maxIncorrectGuesses) {
        endGame(false);
    }
}

// End the game (win or lose word)
function endGame(isWin) {
    // Disable all remaining keys
    const keys = document.querySelectorAll(".key");
    keys.forEach(key => key.disabled = true);
    useHintBtn.disabled = true;
    
    setTimeout(() => {
        modal.classList.remove("hidden");
        finalWordSpan.textContent = currentWordObj.word;
        
        if (isWin) {
            modalTitle.textContent = "Correct! 🎉";
            modalTitle.className = "win";
            modalDesc.innerHTML = `You guessed it! The word was <span id="final-word">${currentWordObj.word}</span>`;
            
            // Show Next Word, hide Return
            nextWordBtn.classList.remove("hidden");
            returnDashboardBtn.classList.add("hidden");
        } else {
            modalTitle.textContent = "Game Over 💀";
            modalTitle.className = "lose";
            modalDesc.innerHTML = `You ran out of guesses. The word was <span id="final-word">${currentWordObj.word}</span>`;
            
            // Show Return, hide Next Word
            nextWordBtn.classList.add("hidden");
            returnDashboardBtn.classList.remove("hidden");
            
            // Update scores
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("hangmanHighScore", highScore);
            }
        }
    }, 600);
}

// --- Event Listeners ---

startGameBtn.addEventListener("click", startGame);
nextWordBtn.addEventListener("click", nextLevel);
returnDashboardBtn.addEventListener("click", showDashboard);

quitBtn.addEventListener("click", () => {
    // Treat as game over, save score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("hangmanHighScore", highScore);
    }
    showDashboard();
});

// Allow physical keyboard typing
document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("hidden") || gameScreen.classList.contains("hidden")) return;
    
    const letter = e.key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
        const keyButton = document.getElementById("key-" + letter);
        if (keyButton && !keyButton.disabled) {
            handleGuess(letter, keyButton);
        }
    }
});

// Run init on load
initApp();
