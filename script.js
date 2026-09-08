/* Workouts and Database Connection */
let workoutsDB = []; // Will hold data fetched from Express

const jsDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let activeDay = jsDays[new Date().getDay()];
const uiDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const daySelector = document.getElementById("daySelector");
const workoutList = document.getElementById("workoutList");
const addBtn = document.getElementById("addWorkoutBtn");
const workoutInput = document.getElementById("newWorkoutInput");

// SELECT: Fetch data from database on load
async function fetchWorkouts() {
    try {
        const res = await fetch('http://localhost:5000/api/workouts');
        workoutsDB = await res.json();
        render();
    } catch (err) {
        console.error("Failed to fetch workouts from DB:", err);
    }
}

function init() {
    uiDays.forEach(day => {
        const btn = document.createElement("button");
        btn.innerText = day.slice(0, 3);
        btn.onclick = () => setDay(day);
        if (day === activeDay) btn.classList.add("active");
        daySelector.appendChild(btn);
    });
    fetchWorkouts(); // Replaces localStorage load
}

function setDay(day) {
    activeDay = day;
    document.querySelectorAll('.day-selector button').forEach((btn, i) => {
        btn.classList.toggle("active", uiDays[i] === day);
    });
    document.getElementById("currentDayTitle").innerText = day;
    render();
}

function render() {
    workoutList.innerHTML = ""; 
    // Filter the flat database array for the current day
    const todaysWorkouts = workoutsDB.filter(w => w.day === activeDay);

    todaysWorkouts.forEach((ex) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>
                <input type="checkbox" class="task-check" style="margin-right: 10px;" 
                ${ex.is_completed ? 'checked' : ''} 
                onchange="toggleComplete(${ex.id}, this.checked)"> 
                ${ex.exercise}
            </span>
            <button class="delete-btn" onclick="removeEx(${ex.id})">X</button>
        `;
        workoutList.appendChild(li);
    });
}

// UPDATE: Triggered when a checkbox is clicked
window.toggleComplete = async (id, isCompleted) => {
    try {
        await fetch(`http://localhost:5000/api/workouts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_completed: isCompleted })
        });
        // Update local state so it matches the database
        const index = workoutsDB.findIndex(w => w.id === id);
        if(index !== -1) workoutsDB[index].is_completed = isCompleted;
    } catch (err) {
        console.error("Failed to update status", err);
    }
};

// INSERT: Add new exercise to DB
addBtn.addEventListener('click', async () => {
    const val = workoutInput.value.trim();
    if (!val) return; 
    
    try {
        const res = await fetch('http://localhost:5000/api/workouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ day: activeDay, exercise: val })
        });
        const newExercise = await res.json();
        workoutsDB.push(newExercise); // Add to local array
        workoutInput.value = ""; 
        render();
    } catch (err) {
        console.error("Failed to save to DB", err);
    }
});

// DELETE: Remove exercise from DB
window.removeEx = async (id) => {
    try {
        await fetch(`http://localhost:5000/api/workouts/${id}`, { method: 'DELETE' });
        workoutsDB = workoutsDB.filter(w => w.id !== id);
        render();
    } catch (err) {
        console.error("Failed to delete", err);
    }
};

/* BARBELL CALCULATOR */
document.getElementById('calcBtn').addEventListener('click', () => {
    const input = document.getElementById('targetWeight').value;
    const display = document.getElementById('plateDisplay');
    const feedback = document.getElementById('textFeedback');
    
    display.innerHTML = ""; 
    
    const weight = parseFloat(input);
    const bar = 20; 

    if (isNaN(weight) || weight < bar) {
        feedback.innerText = "The bar weighs 20kg. Enter a weight higher than that.";
        return;
    }
    if (weight > 500) {
        feedback.innerText = "Max limit is 500kg. Please enter a lower weight.";
        return;
    }
    if ((weight - bar) % 5 !== 0) {
        feedback.innerText = "Weight must be divisible by 2.5kg or 5kg increments.";
        return;
    }

    let perSide = (weight - bar) / 2;
    feedback.innerText = `Load ${perSide}kg per side`;

    const plates = [25, 20, 10, 5, 2.5];
    
    plates.forEach(p => {
        while (perSide >= p) {
            const div = document.createElement('div');
            const cName = p === 2.5 ? 'plate-2\\.5' : `plate-${p}`;
            div.className = `plate ${cName}`;
            div.innerText = p;
            
            display.appendChild(div);
            perSide -= p;
        }
    });

    if (display.children.length === 0 && weight > bar) {
        feedback.innerText = "Empty bar.";
    }
});

/* CAROUSEL */
const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextButton = document.querySelector('.next-btn');
const prevButton = document.querySelector('.prev-btn');

let currentSlideIndex = 0;

function moveToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    currentSlideIndex = index;
    const slideWidth = slides[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${slideWidth * currentSlideIndex}px)`;
}

nextButton.addEventListener('click', () => moveToSlide(currentSlideIndex + 1));
prevButton.addEventListener('click', () => moveToSlide(currentSlideIndex - 1));

setInterval(() => {
    moveToSlide(currentSlideIndex + 1);
}, 6000);

window.addEventListener('resize', () => {
    moveToSlide(currentSlideIndex);
});

// Innitiaslization
init();