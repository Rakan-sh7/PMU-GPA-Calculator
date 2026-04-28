// Grade scale from PMU Academic Catalog
const grades = {
    'A+': 4.00,
    'A': 3.75,
    'B+': 3.50,
    'B': 3.00,
    'C+': 2.50,
    'C': 2.00,
    'D+': 1.50,
    'D': 1.00,
    'F': 0.00
};

let courses = [];

// Hexagram animation system
let mouseX = 0;
let mouseY = 0;
let hexagramPositions = [];
let activationRadius = 150; // Distance from mouse to activate hexagrams

// Initialize hexagram positions
function initializeHexagrams() {
    const hexagrams = document.querySelectorAll('.hexagram');
    hexagrams.forEach((hexagram, index) => {
        const randomX = Math.random() * (window.innerWidth - 100);
        const randomY = Math.random() * (window.innerHeight - 100);
        hexagram.style.left = randomX + 'px';
        hexagram.style.top = randomY + 'px';
        hexagramPositions[index] = { 
            x: randomX, 
            y: randomY,
            originalX: randomX,
            originalY: randomY,
            activated: false
        };
        
        // Add rotation animation
        hexagram.classList.add('animate');
    });
}

// Initialize mouse tracking
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Check for hexagram activation
    checkHexagramActivation();
});

function checkHexagramActivation() {
    const hexagrams = document.querySelectorAll('.hexagram');
    hexagrams.forEach((hexagram, index) => {
        const hexagramData = hexagramPositions[index];
        const distance = Math.sqrt(
            Math.pow(mouseX - hexagramData.x, 2) + 
            Math.pow(mouseY - hexagramData.y, 2)
        );
        
        if (distance < activationRadius && !hexagramData.activated) {
            // Activate hexagram
            hexagram.classList.add('activated');
            hexagramData.activated = true;
            
            // Move to new position near mouse
            const offsetX = (Math.random() - 0.5) * 100;
            const offsetY = (Math.random() - 0.5) * 100;
            const newX = Math.max(0, Math.min(window.innerWidth - 100, mouseX + offsetX));
            const newY = Math.max(0, Math.min(window.innerHeight - 100, mouseY + offsetY));
            
            hexagram.style.left = newX + 'px';
            hexagram.style.top = newY + 'px';
            hexagramData.x = newX;
            hexagramData.y = newY;
            
        } else if (distance >= activationRadius && hexagramData.activated) {
            // Deactivate hexagram and return to original position
            hexagram.classList.remove('activated');
            hexagramData.activated = false;
            
            // Return to original position
            hexagram.style.left = hexagramData.originalX + 'px';
            hexagram.style.top = hexagramData.originalY + 'px';
            hexagramData.x = hexagramData.originalX;
            hexagramData.y = hexagramData.originalY;
        }
    });
}

// Initialize hexagrams when page loads
document.addEventListener('DOMContentLoaded', initializeHexagrams);

// Validation function
function validateInputs(courseName, grade, credits) {
    const errorMessage = document.getElementById('errorMessage');
    
    if (!courseName.trim()) {
        showError('Please enter a course name.');
        return false;
    }
    
    if (!grade || !grades.hasOwnProperty(grade)) {
        showError('Invalid grade entered. Please select a valid grade.');
        return false;
    }
    
    if (!credits || credits < 1 || credits > 6) {
        showError('Credit hours must be between 1 and 6.');
        return false;
    }
    
    hideError();
    return true;
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.classList.remove('show');
}

function addCourse() {
    const form = document.getElementById('gpaForm');
    const courseName = form.elements['courseName'].value.trim();
    const grade = form.elements['grade'].value;
    const credits = parseInt(form.elements['credits'].value);

    if (validateInputs(courseName, grade, credits)) {
        courses.push({
            courseName: courseName,
            grade: grade,
            credits: credits
        });
        
        // Clear form
        form.elements['courseName'].value = '';
        form.elements['grade'].value = '';
        form.elements['credits'].value = '';
        
        // Update display
        updateCoursesDisplay();
        updateResults();
    }
}

function updateCoursesDisplay() {
    const coursesDisplay = document.getElementById('coursesDisplay');
    coursesDisplay.innerHTML = '';
    
    courses.forEach((course, index) => {
        const courseItem = document.createElement('div');
        courseItem.className = 'course-item';
        courseItem.innerHTML = `
            <div class="course-info">
                <span class="course-name">${course.courseName}</span>
                <span class="course-grade">${course.grade}</span>
                <span class="course-credits">${course.credits} credits</span>
            </div>
            <button class="remove-btn" onclick="removeCourse(${index})">Remove</button>
        `;
        coursesDisplay.appendChild(courseItem);
    });
}

function removeCourse(index) {
    courses.splice(index, 1);
    updateCoursesDisplay();
    updateResults();
}

function calculateGPA() {
    const form = document.getElementById('gpaForm');
    const previousGPA = parseFloat(form.elements['previousGPA'].value);
    const previousCredits = parseInt(form.elements['previousCredits'].value);
    
    if (!previousGPA || !previousCredits) {
        showError('Please enter both previous GPA and previous total credits.');
        return;
    }
    
    if (courses.length === 0) {
        showError('Please add at least one course.');
        return;
    }
    
    hideError();
    updateResults();
}

function updateResults() {
    const form = document.getElementById('gpaForm');
    const previousGPA = parseFloat(form.elements['previousGPA'].value) || 0;
    const previousCredits = parseInt(form.elements['previousCredits'].value) || 0;
    
    let totalQualityPoints = previousGPA * previousCredits;
    let totalCredits = previousCredits;

    for (let course of courses) {
        const { grade, credits } = course;
        totalQualityPoints += grades[grade] * credits;
        totalCredits += credits;
    }
    
    const gpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
    
    document.getElementById('totalCredits').textContent = totalCredits;
    document.getElementById('calculatedGPA').textContent = gpa.toFixed(2);
}

function resetForm() {
    const form = document.getElementById('gpaForm');
    form.reset();
    courses = [];
    updateCoursesDisplay();
    updateResults();
    hideError();
}
