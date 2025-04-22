// components/QuizPage.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import "./styles/QuizPage.css";

export default function QuizPage({ questions, answers, onAnswerChange, onSubmit }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const question = questions[currentQuestion];
  const selectedAnswers = Array.isArray(answers[question.id])
    ? answers[question.id]
    : question.multiSelect
    ? []
    : answers[question.id] || [];

  const handleAnswer = (value) => {
    let newAnswers = Array.isArray(selectedAnswers) ? [...selectedAnswers] : [];

    if (question.multiSelect) {
      if (newAnswers.includes(value)) {
        newAnswers = newAnswers.filter((ans) => ans !== value);
      } else {
        newAnswers.push(value);
      }
      onAnswerChange(question.id, newAnswers);
    } else {
      newAnswers = [value];
      onAnswerChange(question.id, newAnswers[0]);

      // Auto-advance for single-select
      if (currentQuestion < questions.length - 1) {
        setTimeout(() => setCurrentQuestion((prev) => prev + 1), 400);
      } else {
        onSubmit();
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      onSubmit();
    }
  };

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
                    Array.isArray(selectedAnswers) && selectedAnswers.includes(option.value)
                      ? "selected"
                      : ""
                  } ${
                    question.multiSelect &&
                    Array.isArray(selectedAnswers) &&
                    selectedAnswers.length >= 2 &&
                    !selectedAnswers.includes(option.value)
                      ? "disabled"
                      : ""
                  }`}
                  onClick={() => handleAnswer(option.value)}
                  disabled={
                    question.multiSelect &&
                    Array.isArray(selectedAnswers) &&
                    selectedAnswers.length >= 2 &&
                    !selectedAnswers.includes(option.value)
                  }
                >
                  <span className="checkmark">✔</span> {option.label}
                </button>
              ))}
            </div>

            {/* Only show Next button for multiSelect questions */}
            {question.multiSelect && selectedAnswers.length > 0 && (
              <Button
                className="next-button mt-4"
                onClick={handleNext}
                disabled={selectedAnswers.length === 0}
              >
                Next
              </Button>
            )}

            <div className="progress">
              {currentQuestion + 1} / {questions.length}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
