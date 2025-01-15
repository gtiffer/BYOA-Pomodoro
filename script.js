let timeLeft;
let timerId = null;
let isWorkTime = true;
let isRunning = false;
let sessionFocus = null;

// Create audio context and click sound
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const clickSound = {
    play: async () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Set up oscillator for a quick tick sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.03);
        
        // Set up gain for a shorter, lighter sound
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Play sound with shorter duration
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.03);
    }
};

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const modeToggleButton = document.getElementById('mode-toggle');
const modeText = document.getElementById('mode-text');
const quoteText = document.getElementById('quote-text');
const quoteContainer = document.querySelector('.quote');

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

function startTimer() {
    if (isRunning) {
        // Pause the timer
        clearInterval(timerId);
        isRunning = false;
        startButton.textContent = 'Start';
        updateWindAnimation(false);
        return;
    }
    
    startTimerCountdown();
}

function startTimerCountdown() {
    isRunning = true;
    startButton.textContent = 'Pause';
    updateWindAnimation(true);
    clickSound.play(); // Play click sound when starting
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

// Task Management
let tasks = [];
let taskCounter = 1;

function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.dataset.id = task.id;
    taskItem.draggable = true;

    // Add drag and drop event listeners
    taskItem.addEventListener('dragstart', handleDragStart);
    taskItem.addEventListener('dragend', handleDragEnd);
    taskItem.addEventListener('dragover', handleDragOver);
    taskItem.addEventListener('drop', handleDrop);

    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.innerHTML = '⋮⋮';

    const checkbox = document.createElement('div');
    checkbox.className = `task-checkbox ${task.completed ? 'checked' : ''}`;
    checkbox.addEventListener('click', () => toggleTask(task.id));

    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;
    if (task.completed) {
        taskText.style.textDecoration = 'line-through';
        taskText.style.opacity = '0.7';
    }

    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'task-action-btn';
    editBtn.innerHTML = '✎';
    editBtn.addEventListener('click', () => editTask(task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-action-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    taskActions.appendChild(editBtn);
    taskActions.appendChild(deleteBtn);

    taskItem.appendChild(dragHandle);
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(taskActions);

    return taskItem;
}

function createTaskInput() {
    const inputContainer = document.createElement('div');
    inputContainer.className = 'task-input-container';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-input';
    input.placeholder = 'What are you working on?';
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            addTask(input.value.trim());
            showAddTaskButton();
        } else if (e.key === 'Escape') {
            showAddTaskButton();
        }
    });

    inputContainer.appendChild(input);
    return inputContainer;
}

function showAddTaskButton() {
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const inputContainer = document.querySelector('.task-input-container');
    
    if (inputContainer) {
        inputContainer.remove();
    }
    addTaskBtn.style.display = 'block';
}

function showTaskInput() {
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    
    addTaskBtn.style.display = 'none';
    const inputContainer = createTaskInput();
    taskList.parentNode.insertBefore(inputContainer, addTaskBtn);
    inputContainer.querySelector('input').focus();
}

function addTask(text) {
    const task = {
        id: Date.now(),
        text,
        completed: false
    };
    tasks.push(task);
    updateTaskList();
    updateTaskCount();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        updateTaskList();
        updateTaskCount();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    updateTaskList();
    updateTaskCount();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const taskItem = document.querySelector(`[data-id="${id}"]`);
        const taskText = taskItem.querySelector('.task-text');
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'task-input';
        input.value = task.text;
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                task.text = input.value.trim();
                updateTaskList();
            } else if (e.key === 'Escape') {
                updateTaskList();
            }
        });
        
        input.addEventListener('blur', () => {
            updateTaskList();
        });
        
        taskText.replaceWith(input);
        input.focus();
        input.select();
    }
}

function updateTaskList() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        taskList.appendChild(createTaskElement(task));
    });
}

function updateTaskCount() {
    const tasksTitle = document.querySelector('.tasks h2');
    const completedCount = tasks.filter(t => t.completed).length;
    tasksTitle.innerHTML = `Tasks <span class="task-count">${completedCount}/${tasks.length}</span>`;
}

// Add task button click handler
document.getElementById('add-task-btn').addEventListener('click', showTaskInput);

// Initialize task list
updateTaskList();
updateTaskCount(); 

// Drag and drop functionality
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedItem = null;
    
    // Update tasks array to match new order
    const taskElements = document.querySelectorAll('.task-item');
    const newTasks = [];
    taskElements.forEach(element => {
        const task = tasks.find(t => t.id === parseInt(element.dataset.id));
        if (task) newTasks.push(task);
    });
    tasks = newTasks;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const taskList = document.getElementById('task-list');
    const taskItems = [...taskList.querySelectorAll('.task-item:not(.dragging)')];
    
    const afterElement = getDragAfterElement(taskList, e.clientY);
    if (draggedItem !== null) {
        if (afterElement) {
            taskList.insertBefore(draggedItem, afterElement);
        } else {
            taskList.appendChild(draggedItem);
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
} 