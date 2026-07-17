// Grab saved workouts or fallback to default
const defaultWorkouts = {
    Monday: ["Seated Machine Chest Press", "Incline DB Press", "Tricep Pushdowns"],
    Tuesday: ["Deadlift (Target: 160kg)", "Lat Pulldowns", "Bicep Curls"],
    Wednesday: ["Rest"],
    Thursday: ["Squats", "Leg Press", "Shoulder Press"],
    Friday: ["Strict Pull-ups", "Barbell Rows", "Face Pulls"],
    Saturday: ["Cardio / Core"],
    Sunday: ["Rest"]
};

let workouts = JSON.parse(localStorage.getItem('gymBuddyWorkouts')) || defaultWorkouts;

function saveToMemory() {
    localStorage.setItem('gymBuddyWorkouts', JSON.stringify(workouts));
}


const jsDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Automatically set the active day to today's actual day
const todayIndex = new Date().getDay(); 
let activeDay = jsDays[todayIndex];

// UI display array 
const uiDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const daySelector = document.getElementById("daySelector");
const workoutList = document.getElementById("workoutList");
const addBtn = document.getElementById("addWorkoutBtn");
const workoutInput = document.getElementById("newWorkoutInput");

function init() {
    uiDays.forEach(day => {
        const btn = document.createElement("button");
        btn.innerText = day.slice(0, 3);
        btn.onclick = () => setDay(day);
        
        if (day === activeDay) btn.classList.add("active");
        
        daySelector.appendChild(btn);
    });
    render();
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
    workouts[activeDay].forEach((ex, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span><input type="checkbox" class="task-check" style="margin-right: 10px;"> ${ex}</span>
            <button class="delete-btn" onclick="removeEx(${i})">X</button>
        `;
        workoutList.appendChild(li);
    });
}

// Add new exercise
addBtn.addEventListener('click', () => {
    const val = workoutInput.value.trim();
    if (!val) return; 
    
    workouts[activeDay].push(val);
    saveToMemory();
    workoutInput.value = ""; 
    render();
});

// Delete exercise
window.removeEx = (index) => {
    workouts[activeDay].splice(index, 1);
    saveToMemory();
    render();
};


// --- BARBELL CALCULATOR ---
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

// -- CAROUSEL LOGIC ---

const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextButton = document.querySelector('.next-btn');
const prevButton = document.querySelector('.prev-btn');

let currentSlideIndex = 0;

function moveToSlide(index) {
    // Wrap around logic so it loops infinitely
    if (index < 0) {
        index = slides.length - 1;
    } else if (index >= slides.length) {
        index = 0;
    }
    
    currentSlideIndex = index;
    
    // Find out how wide a slide is on the user's screen
    const slideWidth = slides[0].getBoundingClientRect().width;
    
    // Move the track over by found width
    track.style.transform = 'translateX(-' + (slideWidth * currentSlideIndex) + 'px)';
}

// Click events for the arrows
nextButton.addEventListener('click', () => moveToSlide(currentSlideIndex + 1));
prevButton.addEventListener('click', () => moveToSlide(currentSlideIndex - 1));

// Auto-play the carousel every 6 seconds so it feels active
setInterval(() => {
    moveToSlide(currentSlideIndex + 1);
}, 6000);

// Fix alignment if they rotate their phone or resize the browser
window.addEventListener('resize', () => {
    moveToSlide(currentSlideIndex);
});

// Iniitialize the app
init();