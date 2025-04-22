// App.jsx
import { useState } from "react";
import emailjs from "@emailjs/browser"; // Import EmailJS
import LandingPage from "./components/LandingPage";
import QuizPage from "./components/QuizPage";
import ResultPage from "./components/ResultPage";
import NameInputPage from "./components/NameInputPage";
import questions from "./questions.json";
import './App.css';

export default function App() {
  const [step, setStep] = useState("landing");
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [userName, setUserName] = useState("");

  const myAnswers = {
      q1: "d",
      q2: "c",
      q3: ["a", "b"],
      q4: "c",
      q5: "b",
      q6: ["e", "b"],
      q7: "c",
      q8: "a",
      q9: ["a", "c"],
      q10: "b",
      q11: ["a", "b"],
      q12: "b",
      q13: "b",
      q14: "d",
      q15: "b",
      q16: "a",
      q17: ["b", "c"],
      q18: "a",
      q19: "b",
      q20: "b",
      q21: ["a", "b"],
      q22: "a",
      q23: "d",
      q24: ["b", "d"],
      q25: "a",
      q26: "c",
      q27: "b",
      q28: "c",
      q29: "a",
      q30: "d",
      q31: "c"
  };

  const handleStart = () => setStep("name");

  const handleNameSubmit = (name) => {
    setUserName(name);
    setStep("quiz");
  };

  const handleAnswerChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const calculateScore = () => {
    let matchPoints = 0;
    let total = 0;
    questions.forEach((q) => {
      if (answers[q.id]) {
        total++;
        if (q.multiSelect) {
          const userAnswers = Array.isArray(answers[q.id]) ? answers[q.id] : [answers[q.id]];
          const correctAnswers = Array.isArray(myAnswers[q.id]) ? myAnswers[q.id] : [myAnswers[q.id]];
          const matches = userAnswers.filter((ans) => correctAnswers.includes(ans)).length;
          if (matches === 2) {
            matchPoints += 1.5;
          } else if (matches === 1) {
            matchPoints += 1;
          }
        } else {
          if (answers[q.id] === myAnswers[q.id]) {
            matchPoints += 1;
          }
        }
      }
    });
    const finalScore = Math.round((matchPoints / total) * 100);
    setScore(finalScore);

    // Send email notification via EmailJS
    emailjs
      .send(
        "service_nok8l3k", // Replace with your EmailJS Service ID
        "template_cq899ev", // Replace with your EmailJS Template ID
        {
          user_name: userName,
          score: finalScore,
          date: new Date().toLocaleString(),
        },
        "user_MgUIWcsi1jH4DWOrLSNHx" // Replace with your EmailJS User ID
      )
      .then(
        (result) => {
          console.log("Email sent successfully:", result.text);
        },
        (error) => {
          console.error("Email failed to send:", error.text);
        }
      );

    setStep("result");
  };

  if (step === "name") {
    return <NameInputPage onSubmit={handleNameSubmit} />;
  }

  if (step === "quiz") {
    return (
      <QuizPage
        questions={questions}
        answers={answers}
        onAnswerChange={handleAnswerChange}
        onSubmit={calculateScore}
      />
    );
  }

  if (step === "result") {
    return <ResultPage score={score} userName={userName} onRestart={() => setStep("landing")} />;
  }

  return <LandingPage onStart={handleStart} />;
}