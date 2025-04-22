// components/NameInputPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import "./styles/NameInputPage.css";

export default function NameInputPage({ onSubmit }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="name-input-page">
      <motion.div
        className="name-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-card">
          <h2 className="question">Who's answering?</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your first name"
              className="name-input"
              autoFocus
            />
            <Button type="submit" disabled={!name.trim()} className="submit-button">
              Start Quiz
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}