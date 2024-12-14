import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import path from "path";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "World",
    password: "bhumi21@",
    port: 5432
});

const app = express();
const port = 3000;

db.connect();

let quiz = [];

// Fetch quiz data from the database
db.query("SELECT * FROM capitals", (err, res) => {
    if (err) {
        console.error("error executing query", err.stack);
    } else {
        quiz = res.rows; // Correctly assign the database query result
    }
});



let totalCorrect = 0;
let questionCount = 0; 

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs'); 
let currentQuestion = {};

// GET home page
app.get("/", async (req, res) => {
    totalCorrect = 0;
    questionCount = 0; // Reset question count
    await nextQuestion();
    res.render("index.ejs", { question: currentQuestion });
});

// POST a new answer
app.post("/submit", (req, res) => {
    let answer = req.body.answer.trim();
    let isCorrect = false;
    let warningMessage = "";

    // Check if the answer is correct
    if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
        totalCorrect++;
        isCorrect = true;
    } else {
        warningMessage = "Wrong answer! Please try again.";
    }

    questionCount++; // Increment question count

    // Check if all questions have been answered
    if (questionCount >= quiz.length) {
        return res.render("result.ejs", { totalCorrect: totalCorrect, quizLength: quiz.length });
    }

    nextQuestion();
    res.render("index.ejs", {
        question: currentQuestion,
        wasCorrect: isCorrect,
        totalScore: totalCorrect,
        warningMessage: warningMessage,
    });
});

// Function to get the next question
async function nextQuestion() {
    const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
    currentQuestion = randomCountry;
}


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
