// Progress tracking
let currentStep = 1;
const totalSteps = 4;

// Emission factors
const EMISSION_FACTORS = {
    electricity: 0.233,    // kg CO2 per kWh
    transport: 0.404       // kg CO2 per km
};

// Initialize progress bar
function initializeProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-bar-fill';
    progressBar.appendChild(progressFill);
    document.querySelector('.overlap-2').insertBefore(progressBar, document.querySelector('.step'));
    updateProgress();
}

// Update progress bar
function updateProgress() {
    const progressFill = document.querySelector('.progress-bar-fill');
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressFill.style.width = `${progress < 5 ? 5 : progress}%`; // Show minimum progress
}

// Step navigation
function goToStep(stepNumber) {
    const currentStepElement = document.querySelector('.step.active');
    const nextStepElement = document.getElementById(`step${stepNumber}`);
    
    if (currentStepElement && nextStepElement) {
        currentStepElement.classList.remove('active');
        setTimeout(() => {
            nextStepElement.classList.add('active');
            currentStep = stepNumber;
            updateProgress();
        }, 300);
    }
}

// Input validation
function validateInput(input) {
    const value = input.value.trim();
    if (!value) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
        return false;
    }
    return true;
}

// Navigation validation
function goToStep2() {
    const numPeople = document.getElementById('numPeople');
    if (validateInput(numPeople)) {
        goToStep(2);
    }
}

function goToStep3() {
    const elecConsume = document.getElementById('elecConsume');
    const renewableConsume = document.getElementById('renewableConsume');
    if (validateInput(elecConsume) && validateInput(renewableConsume)) {
        goToStep(3);
    }
}

function goToStep4() {
    const dietDropdown = document.getElementById('dietDropdown');
    const frequencySelect = document.getElementById('frequencySelect');
    if (
        validateInput(dietDropdown) && 
        (dietDropdown.value !== 'non-veg' || validateInput(frequencySelect))
    ) {
        goToStep(4);
    }
}

// Diet dropdown handler
function checkDiet() {
    const dietDropdown = document.getElementById('dietDropdown');
    const frequencyContainer = document.getElementById('frequencyContainer');
    
    if (dietDropdown.value === 'non-veg') {
        frequencyContainer.style.display = 'block';
        frequencyContainer.style.animation = 'fadeIn 0.5s ease-out';
    } else {
        frequencyContainer.style.display = 'none';
    }
}

// Main calculation
function CountCarbon() {
    const drivingDistInput = document.getElementById('drivingDist');
    if (!validateInput(drivingDistInput)) return;

    const resultButton = document.querySelector('button[onclick="CountCarbon()"]');
    const originalText = resultButton.innerHTML;
    resultButton.innerHTML = '<div class="loading"></div>';
    resultButton.disabled = true;

    setTimeout(() => {
        const numPeople = parseInt(document.getElementById('numPeople').value);
        const elecConsume = parseFloat(document.getElementById('elecConsume').value);
        const renewableConsume = parseFloat(document.getElementById('renewableConsume').value);
        const dietType = document.getElementById('dietDropdown').value;
        const drivingDistance = parseFloat(drivingDistInput.value);

        // Basic input check
        if (
            isNaN(numPeople) || isNaN(elecConsume) || 
            isNaN(renewableConsume) || isNaN(drivingDistance)
        ) {
            alert("Please enter valid numbers in all fields.");
            resultButton.innerHTML = originalText;
            resultButton.disabled = false;
            return;
        }

        // Electricity emissions
        const electricityEmissions = (elecConsume * (1 - renewableConsume / 100)) * EMISSION_FACTORS.electricity;

        // Diet emissions
        let dietEmissions = 0;
        if (dietType === 'vegetarian') {
            dietEmissions = 2.5 * numPeople;
        } else if (dietType === 'non-veg') {
            const frequencySelect = document.getElementById('frequencySelect');
            const frequency = frequencySelect ? frequencySelect.value : 'rarely';
            const frequencyMultiplier = frequency === 'everyday' ? 1 : (frequency === 'often' ? 0.7 : 0.3);
            dietEmissions = 5.5 * numPeople * frequencyMultiplier;
        } else if (dietType === 'vegan') {
            dietEmissions = 1.5 * numPeople;
        }

        // Transport emissions
        const transportEmissions = drivingDistance * EMISSION_FACTORS.transport;

        const carbonFootprint = electricityEmissions + dietEmissions + transportEmissions;

        localStorage.setItem('carbonResult', carbonFootprint.toFixed(2));
        window.location.href = 'result.html';
    }, 1500);
}

// Input effects
document.addEventListener('DOMContentLoaded', () => {
    initializeProgressBar();
    
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });
});
