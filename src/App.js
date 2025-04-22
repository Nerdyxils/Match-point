import { useState } from "react";
import LandingPage from "./components/LandingPage";
import QuizPage from "./components/QuizPage";
import ResultPage from "./components/ResultPage";
import questions from "./questions.json";
import './App.css';


export default function App() {
  const [step, setStep] = useState("landing");
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const myAnswers = {
    q1: "d",
    q2: "c",
    q3: "a",
    q4: "c",
    q5: "b",
    q6: "e",
    q7: "c",
    q8: "a",
    q9: "a",
    q10: "b",
    q11: "a",
    q12: "a",
    q13: "b",
    q14: "d",
    q15: "b",
    q16: "a",
    q17: "c",
    q18: "a",
    q19: "b",
    q20: "b",
    q21: "a",
    q22: "a",
    q23: "a",
    q24: "a",
    q25: "a",
    q26: "a",
    q27: "b",
    q28: "a",
    q29: "a",
    q30: "a",
    q31: "a"
  };

  const handleStart = () => setStep("quiz");

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
          // For multi-select, award 1 point if at least one answer matches, 1.5 points if both match
          const userAnswers = Array.isArray(answers[q.id]) ? answers[q.id] : [answers[q.id]];
          const correctAnswers = Array.isArray(myAnswers[q.id]) ? myAnswers[q.id] : [myAnswers[q.id]];
          const matches = userAnswers.filter((ans) => correctAnswers.includes(ans)).length;
          if (matches === 2) {
            matchPoints += 1.5; // Extra points for perfect match
          } else if (matches === 1) {
            matchPoints += 1; // Partial match
          }
        } else {
          // For single-select, award 1 point for exact match
          if (answers[q.id] === myAnswers[q.id]) {
            matchPoints += 1;
          }
        }
      }
    });
    setScore(Math.round((matchPoints / total) * 100));
    setStep("result");
  };

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
    return <ResultPage score={score} onRestart={() => setStep("landing")} />;
  }

  return <LandingPage onStart={handleStart} />;
}
