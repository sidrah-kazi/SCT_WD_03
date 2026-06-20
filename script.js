
// for quiz game 
// DOM Elements
const question = document.getElementById("question");
const submit = document.getElementById("submit");
const responseInput = document.getElementById("response");
const topicInput = document.getElementById("topic");
const start = document.getElementById("start");
const scoreDisplay = document.getElementById("scores");
const answerElement = document.getElementById("answer");
const hintElement = document.getElementById("hint");
const hintBtn = document.getElementById("hintbtn");
hintBtn.addEventListener("click", showHint);

// Quiz Data
let questions = [];
let results=[];
let currentQuestionIndex = 0;
let score = 0;

// Current Question Data
let hintUsed = false;
let timerId;
// questions = [
//     {
//         question: "What is JVM?",
//         answer: "Java Virtual Machine",
//         hint: "Three words"
//     },
//     {
//         question: "What is JDK?",
//         answer: "Java Development Kit",
//         hint: "Development tools"
//     }
// ];

start.addEventListener("click", async () => {

    const topic = topicInput.value;
        if (topic === "") {
        alert("Please enter a topic");
        return;
    }


    document.getElementById("loading").style.display = "block";
    start.disabled = true;

    await generateQuestions(topic);

    document.getElementById("loading").style.display = "none";
    start.disabled = false;

    switchcard();
});
async function generateQuestions(topic) {

    const apiKey = "your_api_key_here";

const prompt = `
If "${topic}" is not a valid educational topic, return ONLY:

{
  "valid": false
}

Otherwise return ONLY:

{
  "valid": true,
  "questions": [
    {
      "question": "",
      "answer": "",
      "hint": ""
    }
  ]
}

Rules:
- Generate exactly 10 beginner-level viva questions.
- Short answer questions only.
- Answers should be 1 word whenever possible.
- Generate a hint for each question.
- Return ONLY valid JSON.
- Do not include markdown.
`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            })
        }
    );
    const data = await response.json();

    console.log(data);
    const generatedText =
    data.candidates[0].content.parts[0].text;

console.log(generatedText);
const cleanedText = generatedText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

const dataObj = JSON.parse(cleanedText);
if (!dataObj.valid) {
    alert("Please enter a valid topic");
    return;
}

questions = dataObj.questions;
console.log(questions)
}
   



function showHint() {

    const currentQuestion =
        questions[currentQuestionIndex];

    hintElement.textContent =
        `Hint: ${currentQuestion.hint}`;

    hintElement.style.display = "block";

    hintUsed = true;
}

function switchcard(){
    const card =document.querySelector(".card");

    card.classList.add("flip");

    setTimeout(() => {

        displayQuestion();

    }, 300);

    setTimeout(() => {

        card.classList.remove("flip");

    }, 600);
document.querySelector(".intro").style.display = "none";
document.querySelector(".cards").style.display = "block";
    
}
function displayQuestion() {
    console.log("displayQuestion called");



    const currentQuestion =
        questions[currentQuestionIndex];

    question.textContent =
        currentQuestion.question;

    responseInput.value = "";

    hintUsed = false;

    hintElement.style.display = "none";

    answerElement.style.display = "none";

    timerId = setTimeout(() => {

        answerElement.textContent =
            `Answer: ${currentQuestion.answer}`;

        answerElement.style.display = "block";

        setTimeout(() => {
            results.push({
                userAnswer: "No Answer",
                correctAnswer: currentQuestion.answer,
                hintUsed: false,
                isCorrect: false
            });
            question: currentQuestion.question,
            currentQuestionIndex++;

            if (currentQuestionIndex >= questions.length) {
                finalScore();
            } else {
                switchcard();
            }

        }, 2000);

    }, 30000);
}
submit.addEventListener("click",checkAnswer);
function checkAnswer() {
    console.log("check answer called");

    const currentQuestion = questions[currentQuestionIndex];
    const userAnswer = responseInput.value.trim();
    let isCorrect = false;

    if (
        userAnswer
    .toLowerCase()
    .includes(
        currentQuestion.answer.toLowerCase()
    )
        && !hintUsed
    ) {
        score += 2;
        isCorrect=true;
    }

    else if (
        userAnswer
    .toLowerCase()
    .includes(
        currentQuestion.answer.toLowerCase()
    )
        && hintUsed
    ) {
        score += 1;
        isCorrect=true;
    }
    results.push({
    question: currentQuestion.question,
    userAnswer: userAnswer,
    correctAnswer: currentQuestion.answer,
    hintUsed: hintUsed,
    isCorrect: isCorrect
});
    // Show correct answer
    answerElement.textContent =
        `Answer: ${currentQuestion.answer}`;

    answerElement.style.display = "block";

clearTimeout(timerId);
    // Wait 2 seconds before moving on
    setTimeout(() => {

        currentQuestionIndex++;

        if (currentQuestionIndex >= questions.length) {
            finalScore();
        } else {
            switchcard();
        }

    }, 2000);
}
function finalScore() {

    document.querySelector(".card").style.display = "none";

    scoreDisplay.style.display = "block";

    const maxScore = questions.length * 2;

    const percentage =
        Math.round((score / maxScore) * 100);

    let analysisHTML = "";

    results.forEach((item, index) => {

        analysisHTML += `
            <div class="analysis-item">
                <h3>Question ${index + 1}</h3>

                <p>
                    <strong>Question:</strong>
                    ${item.question}
                </p>

                <p>
                    <strong>Your Answer:</strong>
                    ${item.userAnswer || "No Answer"}
                </p>

                <p>
                    <strong>Correct Answer:</strong>
                    ${item.correctAnswer}
                </p>

                <p>
                    <strong>Result:</strong>
                    ${item.isCorrect ? "✅ Correct" : "❌ Incorrect"}
                </p>

                <hr>
            </div>
        `;
    });

    scoreDisplay.innerHTML = `
        <h2>Quiz Finished!</h2>

        <p>Score: ${score} / ${maxScore}</p>

        <p>Percentage: ${percentage}%</p>

        <h2>Answer Analysis</h2>

        ${analysisHTML}
    `;
}