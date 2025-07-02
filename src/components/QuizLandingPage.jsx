import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, User } from 'lucide-react';
import { getQuiz } from '../services/firebase';
import Button from './ui/button';

const QuizLandingPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondentName, setRespondentName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const result = await getQuiz(quizId);
        if (result.success) {
          setQuiz(result.data);
        } else {
          setError('Quiz not found');
        }
      } catch (error) {
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const handleStartQuiz = () => {
    if (respondentName.trim()) {
      // Navigate to quiz with name
      navigate(`/quiz/${quizId}/take?name=${encodeURIComponent(respondentName.trim())}`);
    } else {
      // Navigate to quiz without name
      navigate(`/quiz/${quizId}/take`);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="spinner"
          />
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '1rem',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <Heart size={64} style={{ color: '#ff5e5b' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#374151' }}>Quiz Not Found</h1>
          <p style={{ color: '#6b7280', maxWidth: '400px' }}>
            {error || 'This quiz does not exist or has been removed by the creator.'}
          </p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem 0'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              maxWidth: '600px',
              width: '100%',
              textAlign: 'center'
            }}
          >
            {/* Quiz Image */}
            {quiz.imageURL && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ marginBottom: '2rem' }}
              >
                <img
                  src={quiz.imageURL}
                  alt="Quiz"
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '1rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </motion.div>
            )}

            {/* Quiz Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <h1 style={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold', 
                color: '#374151',
                marginBottom: '1rem'
              }}>
                {quiz.name}
              </h1>
              <p style={{ 
                fontSize: '1.25rem', 
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                Someone wants to see if you're a potential match! 💕
              </p>
            </motion.div>

            {/* Quiz Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ 
                marginBottom: '2rem',
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '1rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: '#ff5e5b',
                    marginBottom: '0.5rem'
                  }}>
                    {quiz.questions.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Questions
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: '#00cecb',
                    marginBottom: '0.5rem'
                  }}>
                    5 min
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Estimated Time
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Name Input (Optional) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{ marginBottom: '2rem' }}
            >
              {!showNameInput ? (
                <Button
                  variant="secondary"
                  onClick={() => setShowNameInput(true)}
                  style={{ marginBottom: '1rem' }}
                >
                  <User size={16} />
                  Add Your Name (Optional)
                </Button>
              ) : (
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    placeholder="Enter your name..."
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      marginBottom: '0.5rem'
                    }}
                  />
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    This helps personalize your results
                  </div>
                </div>
              )}
            </motion.div>

            {/* Start Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button
                variant="primary"
                onClick={handleStartQuiz}
                size="lg"
                style={{
                  fontSize: '1.125rem',
                  padding: '1rem 2rem',
                  borderRadius: '9999px',
                  boxShadow: '0 10px 25px -5px rgba(255, 94, 91, 0.3)'
                }}
              >
                <span>See if You're a Match</span>
                <ArrowRight size={20} />
              </Button>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{ 
                marginTop: '3rem',
                padding: '1rem',
                fontSize: '0.875rem',
                color: '#9ca3af'
              }}
            >
              <p>This quiz will help determine your compatibility score</p>
              <p>One attempt per quiz • Your answers are private</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuizLandingPage; 