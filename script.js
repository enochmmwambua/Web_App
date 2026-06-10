document.getElementById('calcBtn').addEventListener('click', function() {
    const weightInput = document.getElementById('targetWeight').value;
    const plateDisplay = document.getElementById('plateDisplay');
    const feedbackText = document.getElementById('textFeedback');
    
    // Clear display from previous calculations
    plateDisplay.innerHTML = "";
    
    const totalWeight = parseFloat(weightInput);
    const BAR_WEIGHT = 20;

    // Error handling
    if (isNaN(totalWeight) || totalWeight < BAR_WEIGHT) {
        feedbackText.innerText = "Please enter a valid weight of 20kg or more.";
        return;
    }

    let totalPlateWeight = totalWeight - BAR_WEIGHT;

    if ((totalWeight - BAR_WEIGHT) % 5 !== 0) {
        feedbackText.innerText = "Weight must be divisible evenly across both sides (intervals of 2.5kg/5kg).";
        return;
    }

    let weightPerSide = (totalWeight - BAR_WEIGHT) / 2;
    feedbackText.innerText = `Load each side with: ${weightPerSide} kg`;

    // Available plates array ordered descending
    const standardPlates = [25, 20, 10, 5, 2.5];
    
    // Calculate and generate the HTML structure for plates dynamically
    standardPlates.forEach(plateWeight => {
        while (weightPerSide >= plateWeight) {
            // Create the HTML div container element
            const plateDiv = document.createElement('div');
            plateDiv.classList.add('plate', `plate-${plateWeight}`);
            plateDiv.innerText = plateWeight;
            
            // Append onto display shaft container
            plateDisplay.appendChild(plateDiv);
            
            // Subtract weight from target
            weightPerSide -= plateWeight;
        }
    });

    if (plateDisplay.children.length === 0 && totalWeight > BAR_WEIGHT) {
        feedbackText.innerText = `Barbell is empty. Use small fractional plates for remaining ${weightPerSide * 2}kg.`;
    }
});