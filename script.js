let timeLeft;
let timerId = null;
let isWorkTime = true;
let isRunning = false;
let sessionFocus = null;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const modeToggleButton = document.getElementById('mode-toggle');
const modeText = document.getElementById('mode-text');
const quoteText = document.getElementById('quote-text');
const quoteContainer = document.querySelector('.quote');
const focusModal = document.getElementById('focus-modal');
const focusInput = document.getElementById('focus-input');
const focusSubmit = document.getElementById('focus-submit');
const focusCancel = document.getElementById('focus-cancel');

const productivityQuotes = [
    "Focus on being productive instead of busy.",
    "Do the hard work especially when you don't feel like it.",
    "Small progress is still progress.",
    "Your time is limited, don't waste it.",
    "Done is better than perfect.",
    "Stay focused, go after your dreams, and keep moving toward your goals.",
    "The only way to do great work is to love what you do.",
    "Success is built one focused moment at a time.",
    "Action is the foundational key to all success.",
    "Productivity is never an accident. It is always the result of commitment."
];

function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * productivityQuotes.length);
    return productivityQuotes[randomIndex];
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

function switchMode() {
    isWorkTime = !isWorkTime;
    timeLeft = isWorkTime ? 25 * 60 : 5 * 60;
    modeText.textContent = isWorkTime ? 'Work Time' : 'Break Time';
    modeText.style.display = 'inline';
    modeToggleButton.textContent = isWorkTime ? 'Rest Mode' : 'Work Mode';
    quoteContainer.classList.remove('show');
    updateDisplay();
    if (!isWorkTime) {
        sessionFocus = null;
        const focusText = document.querySelector('.focus-text');
        if (focusText) focusText.remove();
    }
}

// Wind animation functionality
const windContainer = document.createElement('div');
windContainer.className = 'wind-container';
document.body.appendChild(windContainer);

const particles = [];
const NUM_PARTICLES = 75;

function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'wind-particle';
    
    // Random starting position with more vertical spread
    const startY = Math.random() * window.innerHeight * 1.2 - window.innerHeight * 0.1;
    const startX = Math.random() * -100; // Start slightly off-screen
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    
    // More varied animation duration and delay
    const duration = 5 + Math.random() * 8;
    const delay = Math.random() * 3;
    particle.style.animation = `float ${duration}s linear ${delay}s infinite`;
    
    // Random size variation
    const scale = 0.7 + Math.random() * 0.6;
    particle.style.transform = `scale(${scale})`;
    
    // Random opacity variation
    const opacity = 0.7 + Math.random() * 0.3;
    particle.style.opacity = opacity;
    
    windContainer.appendChild(particle);
    particles.push(particle);
    
    // Remove particle when it goes off screen and create a new one
    setTimeout(() => {
        particle.remove();
        particles.splice(particles.indexOf(particle), 1);
        createParticle();
    }, (duration + delay) * 1000);
}

// Initialize particles
for (let i = 0; i < NUM_PARTICLES; i++) {
    createParticle();
}

function updateWindAnimation(isPlaying) {
    particles.forEach(particle => {
        particle.classList.toggle('paused', !isPlaying);
    });
}

function showFocusModal() {
    focusModal.style.display = 'flex';
    focusInput.focus();
    return new Promise((resolve) => {
        function handleSubmit() {
            const focus = focusInput.value.trim();
            if (focus) {
                focusModal.style.display = 'none';
                focusInput.value = '';
                cleanup();
                resolve(focus);
            }
        }

        function handleCancel() {
            focusModal.style.display = 'none';
            focusInput.value = '';
            cleanup();
            resolve(null);
        }

        function handleKeydown(e) {
            if (e.key === 'Enter') {
                handleSubmit();
            } else if (e.key === 'Escape') {
                handleCancel();
            }
        }

        function cleanup() {
            focusSubmit.removeEventListener('click', handleSubmit);
            focusCancel.removeEventListener('click', handleCancel);
            focusInput.removeEventListener('keydown', handleKeydown);
        }

        focusSubmit.addEventListener('click', handleSubmit);
        focusCancel.addEventListener('click', handleCancel);
        focusInput.addEventListener('keydown', handleKeydown);
    });
}

function startTimer() {
    if (isRunning) {
        // Pause the timer
        clearInterval(timerId);
        isRunning = false;
        startButton.textContent = 'Start';
        updateWindAnimation(false);
        return;
    }

    if (isWorkTime && !sessionFocus) {
        // Show custom modal to get user's focus
        showFocusModal().then(focus => {
            if (!focus) return; // Don't start if user cancels
            sessionFocus = focus;
            updateFocusDisplay();
            startTimerCountdown();
        });
    } else {
        startTimerCountdown();
    }
}

function startTimerCountdown() {
    isRunning = true;
    startButton.textContent = 'Pause';
    updateWindAnimation(true);
    timerId = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            clearInterval(timerId);
            isRunning = false;
            startButton.textContent = 'Start';
            updateWindAnimation(false);
        }
    }, 1000);
}

// Add new function to update focus display
function updateFocusDisplay() {
    const container = document.querySelector('.container');
    const existingFocus = container.querySelector('.focus-text');
    
    if (existingFocus) {
        existingFocus.textContent = sessionFocus;
    } else if (sessionFocus) {
        const focusElement = document.createElement('p');
        focusElement.className = 'focus-text';
        focusElement.textContent = sessionFocus;
        container.insertBefore(focusElement, container.querySelector('.controls'));
    }
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    isWorkTime = true;
    timeLeft = 25 * 60;
    modeText.textContent = 'Work Time';
    modeText.style.display = 'inline';
    modeToggleButton.textContent = 'Rest Mode';
    startButton.textContent = 'Start';
    quoteContainer.classList.remove('show');
    updateWindAnimation(false);
    updateDisplay();
}

startButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);
modeToggleButton.addEventListener('click', () => {
    if (!isRunning) {
        switchMode();
    }
});

// Initialize the display
resetTimer(); 