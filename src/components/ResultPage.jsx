// components/ResultPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Trophy, 
  Share2, 
  Download, 
  ArrowLeft,
  Star,
  CheckCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import Button from './ui/button';
import '../styles/ResultPage.css';

export default function ResultPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get results from localStorage
    const storedResults = localStorage.getItem('quizResults');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    setLoading(false);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My MatchPoint Results',
        text: `I scored ${results?.score}% on my compatibility quiz!`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    // Create a simple PDF-like report
    const report = `
MatchPoint Compatibility Results
==============================

Score: ${results?.score}%
Date: ${new Date(results?.timestamp).toLocaleDateString()}
Quiz ID: ${quizId}

Thank you for taking the compatibility quiz!
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matchpoint-results-${quizId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "Exceptional Match! You're practically soulmates!";
    if (score >= 80) return "Great Compatibility! You have excellent potential!";
    if (score >= 70) return "Good Match! There's definitely potential here!";
    if (score >= 60) return "Fair Compatibility! Worth exploring further!";
    if (score >= 50) return "Moderate Match! Some areas to work on.";
    return "Limited Compatibility! Consider if this is the right fit.";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--maize)';
    if (score >= 60) return 'var(--robin-egg-blue)';
    return 'var(--bittersweet)';
  };

  if (loading) {
    return (
      <div className="result-page">
        <div className="spinner" />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="result-page">
        <div className="error-card">
          <h2>No Results Found</h2>
          <p>It looks like you haven't completed a quiz yet.</p>
          <Button onClick={() => navigate('/')}>
            Take a Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="result-page">
      {/* Header */}
      <header className="result-header">
        <div className="container">
          <div className="header-content">
            <motion.div
              className="brand-section"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Heart className="brand-icon" />
              <h1 className="brand-title">MatchPoint</h1>
            </motion.div>

            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="back-btn"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="result-main">
        <div className="container">
          <motion.div
            className="result-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Score Card */}
            <motion.div
              className="score-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="score-header">
                <Trophy className="trophy-icon" />
                <h2 className="score-title">Your Results</h2>
              </div>
              
              <div className="score-display">
                <motion.div
                  className="score-circle"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                  style={{ 
                    background: `conic-gradient(${getScoreColor(results.score)} ${results.score * 3.6}deg, var(--gray-200) 0deg)` 
                  }}
                >
                  <div className="score-inner">
                    <span className="score-value">{results.score}%</span>
                    <span className="score-label">Match</span>
                  </div>
                </motion.div>
              </div>
              
              <motion.p
                className="score-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {getScoreMessage(results.score)}
              </motion.p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              className="stats-grid"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="stat-card">
                <div className="stat-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-content">
                  <h4 className="stat-value">{Math.round(results.score / 10)}</h4>
                  <p className="stat-label">Correct Answers</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <h4 className="stat-value">{results.score >= 80 ? 'High' : results.score >= 60 ? 'Medium' : 'Low'}</h4>
                  <p className="stat-label">Compatibility Level</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <h4 className="stat-value">{Math.floor(results.score / 20) + 1}</h4>
                  <p className="stat-label">Match Rating</p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="action-buttons"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button
                variant="primary"
                onClick={handleShare}
                className="action-btn"
              >
                <Share2 size={20} />
                Share Results
              </Button>

              <Button
                variant="secondary"
                onClick={handleDownload}
                className="action-btn"
              >
                <Download size={20} />
                Download Report
              </Button>

              <Button
                variant="accent"
                onClick={() => navigate('/dashboard')}
                className="action-btn"
              >
                <Star size={20} />
                Take Another Quiz
              </Button>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              className="recommendations"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h3 className="recommendations-title">Recommendations</h3>
              <div className="recommendations-grid">
                <div className="recommendation-card">
                  <CheckCircle className="recommendation-icon" />
                  <h4>Communication</h4>
                  <p>Focus on open and honest communication to strengthen your connection.</p>
                </div>
                <div className="recommendation-card">
                  <Heart className="recommendation-icon" />
                  <h4>Quality Time</h4>
                  <p>Spend meaningful time together to deepen your emotional bond.</p>
                </div>
                <div className="recommendation-card">
                  <Star className="recommendation-icon" />
                  <h4>Growth</h4>
                  <p>Support each other's personal growth and shared goals.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 