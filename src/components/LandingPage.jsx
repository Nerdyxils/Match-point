// components/LandingPage.jsx
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Sparkles } from "lucide-react";
import "./styles/LandingPage.css";

export default function LandingPage({ onStart }) {
  return (
    <div className="landing-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass-card"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <img
            src="https://api.dicebear.com/7.x/personas/svg?seed=Silas"
            alt="avatar"
            className="avatar"
          />
        </motion.div>
        <h1 className="title">Match With Silas</h1>
        <p className="description">
          Skip the small talk. Let’s see if we’re really a match 💫
        </p>
        <div className="button-container">
          <Button onClick={onStart} className="gap-2">
            <Sparkles className="w-5 h-5 sparkles" />
            Take the Compatibility Test
          </Button>
        </div>
      </motion.div>
      {/* Decorative hearts */}
      <div className="heart"></div>
      <div className="heart"></div>
      <div className="heart"></div>
      <div className="heart"></div>
    </div>
  );
}