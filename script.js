class HangmanGame {
    constructor() {
        // Game elements
        this.wordDisplay = document.getElementById('word-display');
        this.wrongLettersEl = document.getElementById('wrong-letters');
        this.popup = document.getElementById('popup');
        this.popupTitle = document.getElementById('popup-title');
        this.popupMessage = document.getElementById('popup-message');
        this.correctWordEl = document.getElementById('correct-word');
        this.popupIcon = document.getElementById('popup-icon');
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notification-text');
        this.guessesLeftEl = document.getElementById('guesses-left');
        this.hintEl = document.getElementById('hint');
        this.winsEl = document.getElementById('wins');
        this.lossesEl = document.getElementById('losses');
        this.keyboardEl = document.getElementById('keyboard');
        this.hintBtn = document.getElementById('hint-btn');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.playAgainBtn = document.getElementById('play-again-btn');
        
        // Figure parts
        this.figureParts = document.querySelectorAll('.figure-part');
        
        // Game data
        this.words = [
            { word: 'javascript', hint: 'Programming language for web development' },
            { word: 'hangman', hint: 'The name of this game' },
            { word: 'computer', hint: 'Electronic device for processing data' },
            { word: 'programming', hint: 'Writing code for software' },
            { word: 'internet', hint: 'Global network connecting computers' },
            { word: 'browser', hint: 'Software for accessing the web' },
            { word: 'keyboard', hint: 'Input device with keys' },
            { word: 'developer', hint: 'Person who writes software' },
            { word: 'website', hint: 'Collection of web pages' },
            { word: 'algorithm', hint: 'Step-by-step problem-solving procedure' },
            { word: 'database', hint: 'Organized collection of data' },
            { word: 'function', hint: 'Block of reusable code' },
            { word: 'variable', hint: 'Container for storing data' },
            { word: 'responsive', hint: 'Design that works on all devices' },
            { word: 'framework', hint: 'Platform for developing applications' }
        ];
        
        // Game state
        this.selectedWord = '';
        this.wordHint = '';
        this.correctLetters = [];
        this.wrongLetters = [];
        this.guessesLeft = 6;
        this.wins = parseInt(localStorage.getItem('hangmanWins')) || 0;
        this.losses = parseInt(localStorage.getItem('hangmanLosses')) || 0;
        this.gameOver = false;
        
        // Initialize
        this.init();
    }
    
    init() {
        this.updateStats();
        this.createKeyboard();
        this.selectRandomWord();
        this.setupEventListeners();
    }
    
    selectRandomWord() {
        const randomIndex = Math.floor(Math.random() * this.words.length);
        this.selectedWord = this.words[randomIndex].word.toLowerCase();
        this.wordHint = this.words[randomIndex].hint;
        
        // Reset game state
        this.correctLetters = [];
        this.wrongLetters = [];
        this.guessesLeft = 6;
        this.gameOver = false;
        
        // Update UI
        this.hintEl.textContent = `Hint: ${this.wordHint}`;
        this.guessesLeftEl.textContent = this.guessesLeft;
        this.wrongLettersEl.innerHTML = '';
        
        // Clear the word display
        this.displayWord();
        
        // Reset hangman figure
        this.figureParts.forEach(part => part.classList.remove('show'));
        
        // Reset keyboard
        document.querySelectorAll('.key').forEach(key => {
            key.classList.remove('correct', 'wrong');
            key.disabled = false;
        });
        
        // Hide popup
        this.popup.style.display = 'none';
    }
    
    createKeyboard() {
        this.keyboardEl.innerHTML = '';
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        
        for (let letter of letters) {
            const button = document.createElement('button');
            button.className = 'key';
            button.textContent = letter.toUpperCase();
            button.dataset.letter = letter;
            
            button.addEventListener('click', () => this.handleGuess(letter));
            this.keyboardEl.appendChild(button);
        }
    }
    
    displayWord() {
        const wordArray = this.selectedWord.split('');
        const display = wordArray.map(letter => {
            if (this.correctLetters.includes(letter)) {
                return `<div class="letter-box filled">${letter.toUpperCase()}</div>`;
            } else {
                return '<div class="letter-box"></div>';
            }
        }).join('');
        
        this.wordDisplay.innerHTML = display;
        
        // If this is a fresh start (no correct letters), show empty boxes
        if (this.correctLetters.length === 0) {
            // Make sure all boxes are empty
            const boxes = this.wordDisplay.querySelectorAll('.letter-box');
            boxes.forEach(box => {
                if (box.classList.contains('filled')) {
                    box.classList.remove('filled');
                }
            });
        }
    }
    
    handleGuess(letter) {
        if (this.gameOver) return;
        
        // Check if letter was already guessed
        if (this.correctLetters.includes(letter) || this.wrongLetters.includes(letter)) {
            this.showNotification('You already guessed this letter!');
            return;
        }
        
        if (this.selectedWord.includes(letter)) {
            // Correct guess
            this.correctLetters.push(letter);
            this.displayWord();
            
            // Update keyboard button
            const key = document.querySelector(`.key[data-letter="${letter}"]`);
            if (key) {
                key.classList.add('correct');
                key.classList.remove('wrong');
                key.disabled = true;
            }
            
            // Check if player won
            if (this.checkWin()) {
                setTimeout(() => this.winGame(), 300); // Small delay for animation
            }
        } else {
            // Wrong guess
            this.wrongLetters.push(letter);
            this.guessesLeft--;
            this.guessesLeftEl.textContent = this.guessesLeft;
            
            // Update wrong letters display
            const wrongLetterSpan = document.createElement('span');
            wrongLetterSpan.className = 'wrong-letter';
            wrongLetterSpan.textContent = letter.toUpperCase();
            this.wrongLettersEl.appendChild(wrongLetterSpan);
            
            // Update keyboard button
            const key = document.querySelector(`.key[data-letter="${letter}"]`);
            if (key) {
                key.classList.add('wrong');
                key.classList.remove('correct');
                key.disabled = true;
            }
            
            // Update hangman figure
            this.updateHangman();
            
            // Check if player lost
            if (this.guessesLeft === 0) {
                setTimeout(() => this.loseGame(), 300); // Small delay for animation
            }
        }
    }
    
    updateHangman() {
        const wrongCount = this.wrongLetters.length;
        if (wrongCount <= this.figureParts.length) {
            this.figureParts[wrongCount - 1]?.classList.add('show');
        }
    }
    
    checkWin() {
        const wordLetters = [...new Set(this.selectedWord.split(''))];
        return wordLetters.every(letter => this.correctLetters.includes(letter));
    }
    
    winGame() {
        this.gameOver = true;
        this.wins++;
        localStorage.setItem('hangmanWins', this.wins);
        
        this.popupTitle.textContent = '🎉 Congratulations! 🎉';
        this.popupMessage.textContent = 'You guessed the word!';
        this.correctWordEl.textContent = this.selectedWord.toUpperCase();
        this.popupIcon.className = 'fas fa-trophy';
        this.popupIcon.style.color = '#51cf66';
        this.popup.style.display = 'flex';
        
        // Animate winning letters
        const letterBoxes = document.querySelectorAll('.letter-box.filled');
        letterBoxes.forEach((box, index) => {
            setTimeout(() => {
                box.style.transform = 'scale(1.2)';
                box.style.boxShadow = '0 0 20px rgba(81, 207, 102, 0.8)';
                
                setTimeout(() => {
                    box.style.transform = '';
                    box.style.boxShadow = '';
                }, 300);
            }, index * 100);
        });
        
        this.updateStats();
    }
    
    loseGame() {
        this.gameOver = true;
        this.losses++;
        localStorage.setItem('hangmanLosses', this.losses);
        
        this.popupTitle.textContent = '💀 Game Over 💀';
        this.popupMessage.textContent = 'Better luck next time!';
        this.correctWordEl.textContent = this.selectedWord.toUpperCase();
        this.popupIcon.className = 'fas fa-skull';
        this.popupIcon.style.color = '#ff6b6b';
        this.popup.style.display = 'flex';
        
        // Reveal the word on the board
        const letterBoxes = document.querySelectorAll('.letter-box');
        const wordArray = this.selectedWord.split('');
        
        letterBoxes.forEach((box, index) => {
            if (!box.classList.contains('filled')) {
                setTimeout(() => {
                    box.textContent = wordArray[index].toUpperCase();
                    box.classList.add('filled');
                    box.style.background = '#ff6b6b';
                    box.style.color = 'white';
                    box.style.borderBottomColor = '#ff6b6b';
                }, index * 100);
            }
        });
        
        this.updateStats();
    }
    
    showNotification(message) {
        this.notificationText.textContent = message;
        this.notification.style.display = 'flex';
        
        setTimeout(() => {
            this.notification.style.display = 'none';
        }, 2000);
    }
    
    giveHint() {
        if (this.gameOver) return;
        
        // Find a letter that hasn't been guessed
        const unguessedLetters = this.selectedWord
            .split('')
            .filter(letter => !this.correctLetters.includes(letter));
        
        if (unguessedLetters.length > 0) {
            const randomLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
            this.showNotification(`Try the letter "${randomLetter.toUpperCase()}"`);
            
            // Highlight the letter in the word display
            const letterBoxes = document.querySelectorAll('.letter-box');
            this.selectedWord.split('').forEach((letter, index) => {
                if (letter === randomLetter) {
                    letterBoxes[index].style.borderBottomColor = '#f6d365';
                    letterBoxes[index].style.boxShadow = '0 0 10px rgba(246, 211, 101, 0.5)';
                    
                    setTimeout(() => {
                        letterBoxes[index].style.borderBottomColor = '';
                        letterBoxes[index].style.boxShadow = '';
                    }, 3000);
                }
            });
        } else {
            this.showNotification('All letters have been guessed!');
        }
    }
    
    updateStats() {
        this.winsEl.textContent = this.wins;
        this.lossesEl.textContent = this.losses;
    }
    
    resetStats() {
        this.wins = 0;
        this.losses = 0;
        localStorage.setItem('hangmanWins', 0);
        localStorage.setItem('hangmanLosses', 0);
        this.updateStats();
        this.selectRandomWord();
    }
    
    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            const letter = e.key.toLowerCase();
            if (/^[a-z]$/.test(letter)) {
                this.handleGuess(letter);
            }
        });
        
        // Hint button
        this.hintBtn.addEventListener('click', () => this.giveHint());
        
        // New game button
        this.newGameBtn.addEventListener('click', () => this.selectRandomWord());
        
        // Reset button
        this.resetBtn.addEventListener('click', () => this.resetStats());
        
        // Play again button
        this.playAgainBtn.addEventListener('click', () => {
            this.popup.style.display = 'none';
            this.selectRandomWord();
        });
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new HangmanGame();
});