// components/ResultPage.jsx
import React, { useEffect } from "react";
import JSConfetti from "js-confetti";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import "./styles/ResultPage.css";

export default function ResultPage({ score, userName, onRestart }) {
  const isMatch = score >= 70;

  useEffect(() => {
    if (isMatch) {
      const audio = new Audio("/success.mp3");
      audio.play();
      const confetti = new JSConfetti();
      confetti.addConfetti({
        emojis: ["💖", "🌸", "✨"],
        confettiNumber: 100,
      });
    }
  }, [isMatch]);

  return (
    <div className="result-page">
      <div className="result-card">
        <div className="glass-card">
          <Heart className={`heart-icon ${isMatch ? "match" : "no-match"}`} />
          <h2 className="result-title">
            {isMatch ? `Congratulations ${userName}!` : `Sorry ${userName}, not quite a match`}
          </h2>
          <p className="result-score">Your compatibility score: {score}%</p>
          <p className="result-message">
            {isMatch
              ? "You're a great match for Silas! Your answers align beautifully."
              : "Your vibe is unique, but it doesn't quite sync with Silas. Try again or find another match!"}
          </p>
          <Button onClick={onRestart} className="restart-button">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}