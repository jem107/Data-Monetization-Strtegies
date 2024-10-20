let currentQuestionIndex = 0;
let selectedAnswers = [];

// Fetch the CSV file and load the questions
document.addEventListener('DOMContentLoaded', function () {
    const csvUrl = 'qaFinal.csv';

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(csvText => {
            console.log("CSV file fetched successfully.");
            processCSV(csvText);  // Call the function to process the CSV
        })
        .catch(error => console.error('Error fetching CSV:', error));
});

let questions = [];
let strategies = [];

// Custom function to split the CSV row but keep content inside parentheses together
function smartSplit(row) {
    const regex = /(?:\([^()]*\)|[^,])+/g;
    return row.match(regex).map(part => part.trim());
}

function processCSV(csvText) {
    const rows = csvText.split('\n').map(row => smartSplit(row));

    // First row contains strategy names, so we'll store that
    strategies = rows[0].slice(1);  // Ignore the first column (questions)

    console.log("Strategies loaded:", strategies); // Log the strategies to check

    // Process each row for questions and their respective answers
    for (let i = 1; i < rows.length; i++) {
        const question = rows[i][0];  // First column is the question
        let answers = rows[i].slice(1);  // Remaining columns are the answers

        // Clean up answers (trim spaces and keep everything inside parentheses intact)
        answers = answers.map(answer => answer.replace(/["']/g, '').trim());

        // Remove duplicate answers for display purposes, but we'll track all possible answers later
        const uniqueAnswers = [...new Set(answers)];

        questions.push({ question, answers: uniqueAnswers, allAnswers: answers });
    }

    console.log("Questions loaded:", questions); // Log questions to check if they're loaded correctly

    // Start with the first question
    if (questions.length > 0) {
        displayQuestion(0);
    } else {
        console.error("No questions found.");
    }
}

function displayQuestion(index) {
    const questionContainer = document.getElementById('questions-container');
    const nextButton = document.getElementById('next-btn');

    questionContainer.innerHTML = '';  // Clear previous question

    if (questions[index]) {
        const q = questions[index];
        console.log("Displaying question:", q.question);  // Debugging log

        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question-container', 'active');

        const label = document.createElement('h3');
        label.textContent = q.question;
        questionDiv.appendChild(label);

        q.answers.forEach((answer, answerIndex) => {
            const checkboxLabel = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = answer;
            checkbox.name = `question-${index}`;
            checkboxLabel.appendChild(checkbox);
            checkboxLabel.appendChild(document.createTextNode(answer));
            questionDiv.appendChild(checkboxLabel);
            questionDiv.appendChild(document.createElement('br'));
        });

        questionContainer.appendChild(questionDiv);

        // Show the next button after the question is displayed
        nextButton.style.display = 'inline-block';
    } else {
        console.error("No question to display for index", index);
    }
}

function nextQuestion() {
    const questionContainer = document.querySelector('.question-container');
    const checkboxes = document.querySelectorAll(`input[name=question-${currentQuestionIndex}]:checked`);

    if (checkboxes.length === 0) {
        alert('Please select at least one answer');
        return;
    }

    // Collect selected answers
    checkboxes.forEach(checkbox => {
        selectedAnswers.push(checkbox.value);
    });

    questionContainer.classList.remove('active');
    questionContainer.style.opacity = '0';

    // Move to the next question or show the result
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        setTimeout(() => {
            displayQuestion(currentQuestionIndex);
        }, 500);  // Delay to create a smooth transition
    } else {
        calculateResult();
    }
}

function calculateResult() {
    // Initialize score for each strategy
    let score = Array(strategies.length).fill(0);

    console.log("Selected answers:", selectedAnswers); // Debugging log

    // Iterate over selected answers
    selectedAnswers.forEach(answer => {
        questions.forEach((q, questionIndex) => {
            q.allAnswers.forEach((ans, answerIndex) => {
                // Increment score for all strategies where the answer belongs
                if (answer === ans) {
                    score[answerIndex]++;
                }
            });
        });
    });

    console.log("Score array:", score); // Debugging log

    // Find the highest score
    const maxScore = Math.max(...score);
    console.log("Max score:", maxScore); // Debugging log

    // Find all strategies with the highest score
    const bestStrategies = strategies.filter((strategy, index) => score[index] === maxScore);

    console.log("Best Strategies:", bestStrategies); // Debugging log

    // If no strategy is found, show a message instead of an empty result
    if (bestStrategies.length === 0) {
        document.getElementById('result').textContent = "No strategies could be determined based on your answers.";
    } else {
      
