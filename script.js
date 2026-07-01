// TODO: Hook this up to localStorage later so we don't lose custom-added and removed workouts on refresh
let workouts = {
    Monday: ["Seated Machine Chest Press", "Incline DB Press", "Tricep Pushdowns"],
    Tuesday: ["Deadlift (Target: 160kg)", "Lat Pulldowns", "Bicep Curls"],
    Wednesday: ["Rest"],
    Thursday: ["Squats", "Leg Press", "Shoulder Press"],
    Friday: ["Strict Pull-ups", "Barbell Rows", "Face Pulls"],
    Saturday: ["Cardio / Core"],
    Sunday: ["Rest"] 
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let activeDay = "Monday";

const daySelector = document.getElementById("daySelector");
const workoutList = document.getElementById("workoutList");
const addBtn = document.getElementById("addWorkoutBtn");
const workoutInput = document.getElementById("newWorkoutInput");

// Iinnitializing the UI
function init() {
    days.forEach(day => {
        const btn = document.createElement("button");
        btn.innerText = day.slice(0, 3); // short names like Mon, Tue
        
        btn.onclick = () => setDay(day);
        
        if (day === activeDay) btn.classList.add("active");
        daySelector.appendChild(btn);
    });
    render(); // draw the initial list
}

function setDay(day) {
    activeDay = day;
    
    // Loop through and update active states for the buttons
    document.querySelectorAll('.day-selector button').forEach((btn, i) => {
        btn.classList.toggle("active", days[i] === day);
    });
    
    document.getElementById("currentDayTitle").innerText = day;
    render();
}

function render() {
    workoutList.innerHTML = ""; // get rid of the old list items
    

    workouts[activeDay].forEach((ex, i) => {
        const li = document.createElement("li");
        

        li.innerHTML = `
            <span><input type="checkbox" class="task-check" style="margin-right: 10px;"> ${ex}</span>
            <button class="delete-btn" onclick="removeEx(${i})">X</button>
        `;
        workoutList.appendChild(li);
    });
}

// Handle adding a new exercise
addBtn.addEventListener('click', () => {
    const val = workoutInput.value.trim();
    if (!val) return; // don't add empty strings
    
    workouts[activeDay].push(val);
    workoutInput.value = ""; // reset input field
    render();
});

// Needs to be on the window object so the inline HTML onclick can actually find it
window.removeEx = (index) => {
    workouts[activeDay].splice(index, 1);
    render(); // redraw the updated list
};


// BARBELL CALCULATOR
document.getElementById('calcBtn').addEventListener('click', () => {
    const input = document.getElementById('targetWeight').value;
    const display = document.getElementById('plateDisplay');
    const feedback = document.getElementById('textFeedback');
    
    display.innerHTML = ""; // clear out the old plates
    
    const weight = parseFloat(input);
    const bar = 20; // standard olympic bar weight

    // Error Handling
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

    // Math
    let perSide = (weight - bar) / 2;
    feedback.innerText = `Load ${perSide}kg per side`;

    // The standard plates we have available in the gym
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

    // Weird edge case where they just need micro plates and the bar is otherwise empty
    if (display.children.length === 0 && weight > bar) {
        feedback.innerText = "Empty bar.";
    }
});

// Initialize the app
init();