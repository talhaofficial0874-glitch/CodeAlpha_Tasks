// DOM Elements
const addCardBtn = document.getElementById('add-card-btn');
const noCardsMessage = document.getElementById('no-cards-message');
const flashcardContainer = document.getElementById('flashcard-container');
const flashcard = document.getElementById('flashcard');
const questionText = document.getElementById('question-text');
const answerText = document.getElementById('answer-text');
const currentCardNum = document.getElementById('current-card-num');
const totalCardsNum = document.getElementById('total-cards-num');

// User Answer Elements
const userAnswerInput = document.getElementById('user-answer-input');
const submitAnswerBtn = document.getElementById('submit-answer-btn');
const feedbackBadge = document.getElementById('feedback-badge');
const userAnswerDisplay = document.getElementById('user-answer-display');
const userAnswerText = document.getElementById('user-answer-text');

// Controls
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const editBtns = document.querySelectorAll('.edit-btn');
const deleteBtns = document.querySelectorAll('.delete-btn');

// Modal Elements
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelBtn = document.getElementById('cancel-btn');
const flashcardForm = document.getElementById('flashcard-form');
const questionInput = document.getElementById('question-input');
const answerInput = document.getElementById('answer-input');
const cardIdInput = document.getElementById('card-id');
const modalTitle = document.getElementById('modal-title');

// State
let flashcards = [];
let currentIndex = 0;
let isFlipped = false;

// Initialize app
function init() {
    loadFlashcards();
    updateUI();
    setupEventListeners();
}

// Load data from local storage
function loadFlashcards() {
    const savedCards = localStorage.getItem('flashcards');
    if (savedCards) {
        flashcards = JSON.parse(savedCards);
    }
}

// Save data to local storage
function saveFlashcards() {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
}

// Update the user interface based on state
function updateUI() {
    if (flashcards.length === 0) {
        noCardsMessage.classList.remove('hidden');
        flashcardContainer.classList.add('hidden');
    } else {
        noCardsMessage.classList.add('hidden');
        flashcardContainer.classList.remove('hidden');
        
        // Ensure index is within bounds
        if (currentIndex >= flashcards.length) {
            currentIndex = flashcards.length - 1;
        }
        if (currentIndex < 0) {
            currentIndex = 0;
        }

        const currentCard = flashcards[currentIndex];
        questionText.textContent = currentCard.question;
        answerText.textContent = currentCard.answer;
        
        currentCardNum.textContent = currentIndex + 1;
        totalCardsNum.textContent = flashcards.length;

        // Update button states
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === flashcards.length - 1;

        // Reset flip state when card changes
        if (isFlipped) {
            toggleFlip(false);
        }
        
        // Reset user answer fields
        userAnswerInput.value = '';
        userAnswerDisplay.classList.add('hidden');
        feedbackBadge.classList.add('hidden');
    }
}

// Flip card logic
function toggleFlip(forceState) {
    if (typeof forceState === 'boolean') {
        isFlipped = forceState;
    } else {
        isFlipped = !isFlipped;
    }
    
    if (isFlipped) {
        flashcard.classList.add('flipped');
    } else {
        flashcard.classList.remove('flipped');
    }
}

// Modal Logic
function openModal(isEdit = false) {
    modalOverlay.classList.remove('hidden');
    if (isEdit) {
        modalTitle.textContent = 'Edit Flashcard';
        const currentCard = flashcards[currentIndex];
        questionInput.value = currentCard.question;
        answerInput.value = currentCard.answer;
        cardIdInput.value = currentCard.id;
    } else {
        modalTitle.textContent = 'Add New Flashcard';
        flashcardForm.reset();
        cardIdInput.value = '';
    }
    setTimeout(() => questionInput.focus(), 100);
}

function closeModal() {
    modalOverlay.classList.add('hidden');
    flashcardForm.reset();
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateUI();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < flashcards.length - 1) {
            currentIndex++;
            updateUI();
        }
    });

    // User Answer Actions
    submitAnswerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        checkAnswer();
    });
    
    userAnswerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            checkAnswer();
        }
    });

    function checkAnswer() {
        const userAnswer = userAnswerInput.value.trim();
        const currentCard = flashcards[currentIndex];
        
        if (!userAnswer) {
            alert('Please enter an answer to continue!');
            return;
        }
        
        userAnswerText.textContent = userAnswer;
        userAnswerDisplay.classList.remove('hidden');
        feedbackBadge.classList.remove('hidden');
        
        if (userAnswer.toLowerCase() === currentCard.answer.toLowerCase()) {
            feedbackBadge.textContent = 'Correct!';
            feedbackBadge.className = 'feedback-badge feedback-correct';
        } else {
            feedbackBadge.textContent = 'Incorrect!';
            feedbackBadge.className = 'feedback-badge feedback-incorrect';
        }
        
        toggleFlip(true);
    }

    // Add/Edit Actions
    addCardBtn.addEventListener('click', () => openModal(false));
    
    editBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent flip
            openModal(true);
        });
    });

    // Delete Action
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent flip
            if (confirm('Are you sure you want to delete this flashcard?')) {
                flashcards.splice(currentIndex, 1);
                saveFlashcards();
                updateUI();
            }
        });
    });

    // Modal Actions
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Close modal on click outside
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Form Submit
    flashcardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const question = questionInput.value.trim();
        const answer = answerInput.value.trim();
        const id = cardIdInput.value;

        if (question && answer) {
            if (id) {
                // Edit existing
                const cardIndex = flashcards.findIndex(c => c.id === id);
                if (cardIndex !== -1) {
                    flashcards[cardIndex] = { id, question, answer };
                }
            } else {
                // Add new
                flashcards.push({
                    id: Date.now().toString(),
                    question,
                    answer
                });
                currentIndex = flashcards.length - 1; // go to new card
            }
            
            saveFlashcards();
            updateUI();
            closeModal();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts if typing in input
        if (document.activeElement === userAnswerInput || document.activeElement.tagName === 'TEXTAREA') {
            return;
        }
        
        if (modalOverlay.classList.contains('hidden') && flashcards.length > 0) {
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                currentIndex--;
                updateUI();
            } else if (e.key === 'ArrowRight' && currentIndex < flashcards.length - 1) {
                currentIndex++;
                updateUI();
            }
        } else if (!modalOverlay.classList.contains('hidden') && e.key === 'Escape') {
            closeModal();
        }
    });
}

// Run init
init();
