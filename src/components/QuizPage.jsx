// components/QuizPage.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import "./styles/QuizPage.css";

export default function QuizPage({ questions, answers, onAnswerChange, onSubmit }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswer = (value) => {
    const question = questions[currentQuestion];
    let newAnswers = Array.isArray(answers[question.id]) ? [...answers[question.id]] : [];

    if (question.multiSelect) {
      if (newAnswers.includes(value)) {
        // Deselect if already selected
        newAnswers = newAnswers.filter((ans) => ans !== value);
      } else if (newAnswers.length < 2) {
        // Add new answer if less than 2 selected
        newAnswers.push(value);
      } else {
        // Replace the oldest answer if 2 are already selected
        newAnswers.shift();
        newAnswers.push(value);
      }
    } else {
      // Single-select: set the answer directly
      newAnswers = [value];
    }

    onAnswerChange(question.id, question.multiSelect ? newAnswers : newAnswers[0]);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion((prev) => prev + 1), 400);
    } else {
      onSubmit();
    }
  };

  const question = questions[currentQuestion];

  return (
    <div className="quiz-page">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          className="question-card"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.4 }}
        >
          <div className="glass-card">
            <h2 className="question">{question.question}</h2>
            {question.multiSelect && (
              <p className="multi-select-info">You can select up to 2 answers</p>
            )}
            <div className="options">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${
                    Array.isArray(answers[question.id]) && answers[question.id].includes(option.value)
                      ? "selected"
                      : ""
                  } ${
                    question.multiSelect && Array.isArray(answers[question.id]) && answers[question.id].length >= 2 && !answers[question.id].includes(option.value)
                      ? "disabled"
                      : ""
                  }`}
                  onClick={() => handleAnswer(option.value)}
                  disabled={question.multiSelect && Array.isArray(answers[question.id]) && answers[question.id].length >= 2 && !answers[question.id].includes(option.value)}
                >
                  <span className="checkmark">✔</span> {option.label}
                </button>
              ))}
            </div>
            <div className="progress">
              {currentQuestion + 1} / {questions.length}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}