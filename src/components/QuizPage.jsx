// components/QuizPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  Circle,
  BarChart3,
  Loader
} from 'lucide-react';
import Button from './ui/button';
import { getQuiz, saveQuizResult } from '../services/firebase';
import '../styles/QuizPage.css';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [error, setError] = useState('');

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const result = await getQuiz(quizId);
        if (result.success) {
          console.log('Quiz data received:', result.data);
          console.log('Questions structure:', result.data.questions);
          console.log('Number of questions in quiz:', result.data.questions?.length);
          console.log('Quiz ID:', quizId);
          
          if (result.data.questions && result.data.questions.length > 0) {
            console.log('First question options:', result.data.questions[0].options);
            console.log('All question IDs:', result.data.questions.map(q => q.id));
          }
          
          // Additional debugging - show exactly what questions are in the quiz
          console.log('=== DETAILED QUIZ QUESTIONS ===');
          result.data.questions?.forEach((q, index) => {
            console.log(`Question ${index + 1}:`, {
              id: q.id,
              question: q.question,
              options: q.options,
              preferredAnswer: q.preferredAnswer
            });
          });
          
          // Validate quiz data structure
          if (!result.data.questions || !Array.isArray(result.data.questions)) {
            console.error('Invalid quiz structure - no questions array');
            setError('Invalid quiz data structure');
            return;
          }
          
          setQuiz(result.data);
        } else {
          console.error('Quiz not found:', quizId);
          setError('Quiz not found');
        }
      } catch (error) {
        console.error('Failed to load quiz:', error);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  // Debug: Log when quiz state changes
  useEffect(() => {
    if (quiz) {
      console.log('=== QUIZ STATE UPDATED ===');
      console.log('Quiz state updated with questions:', quiz.questions.length);
      console.log('Quiz questions:', quiz.questions.map(q => ({ id: q.id, question: q.question.substring(0, 30) + '...' })));
    }
  }, [quiz]);

  // Calculate compatibility score based on matching answers
  const calculateCompatibilityScore = (userAnswers, quizQuestions) => {
    let matchingAnswers = 0;
    let totalQuestions = quizQuestions.length;

    quizQuestions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const preferredAnswer = question.preferredAnswer;
      
      if (userAnswer === preferredAnswer) {
        matchingAnswers++;
      }
    });

    return Math.round((matchingAnswers / totalQuestions) * 100);
  };

  const handleSubmit = useCallback(async () => {
    if (!quiz) {
      alert('Quiz data not available.');
      return;
    }

    const answeredQuestions = Object.keys(answers).length;
    if (answeredQuestions < quiz.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    
    try {
      console.log('Submitting quiz with answers:', answers);
      console.log('Quiz data:', quiz);
      console.log('Quiz ID:', quizId);
      
      // Calculate compatibility score
      const score = calculateCompatibilityScore(answers, quiz.questions);
      console.log('Calculated score:', score);
      
      // Get respondent name from URL params or use default
      const urlParams = new URLSearchParams(window.location.search);
      const respondentName = urlParams.get('name') || 'Anonymous';
      console.log('Respondent name:', respondentName);
      
      // Save result
      const result = await saveQuizResult(quizId, quiz.userId, respondentName, answers, score);
      console.log('Save result response:', result);
      
      if (result.success) {
        console.log('Quiz result saved successfully');
        // Navigate to results page
        navigate(`/result/${quizId}?score=${score}&name=${encodeURIComponent(respondentName)}`);
      } else {
        console.error('Failed to save quiz result:', result.error);
        alert('Failed to save your results. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [quiz, answers, quizId, navigate]);

  useEffect(() => {
    if (!quiz) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmit, quiz]);

  const handleAnswerSelect = (questionId, answer) => {
    console.log('Answer selected:', { questionId, answer });
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: answer
      };
      console.log('Updated answers:', newAnswers);
      console.log('Current question answer:', newAnswers[currentQuestion]);
      console.log('Next button should be disabled:', newAnswers[currentQuestion] === undefined);
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <Loader size={48} className="spinner" />
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="quiz-page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h2>Quiz Not Found</h2>
          <p>{error || 'This quiz does not exist or has been removed.'}</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  // Debug: Log the current quiz state
  console.log('=== QUIZ PAGE DISPLAY ===');
  console.log('Current question index:', currentQuestion);
  console.log('Total questions in quiz:', quiz.questions.length);
  console.log('Current question:', currentQ);
  console.log('All questions in quiz:', quiz.questions.map(q => ({ id: q.id, question: q.question.substring(0, 30) + '...' })));
  console.log('Progress:', progress);
  console.log('Answered questions:', answeredQuestions);
  console.log('Question numbering - Current:', currentQuestion + 1, 'Total:', quiz.questions.length);

  // Comprehensive safety check for quiz data structure
  if (!currentQ || !currentQ.options || !Array.isArray(currentQ.options)) {
    console.error('Invalid quiz data structure:', currentQ);
    return (
      <div className="quiz-page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h2>Invalid Quiz Data</h2>
          <p>The quiz data is not in the expected format.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Additional validation for options
  if (!currentQ.options.every(option => 
    typeof option === 'string' || 
    (typeof option === 'object' && (option.label || option.value))
  )) {
    console.error('Invalid options format:', currentQ.options);
    return (
      <div className="quiz-page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h2>Invalid Quiz Options</h2>
          <p>The quiz options are not in the expected format.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      {/* Header */}
      <header className="quiz-header">
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

            <div className="quiz-info">
              <div className="timer">
                <Clock size={20} />
                <span>{formatTime(timeLeft)}</span>
              </div>
              <div className="progress-info">
                <BarChart3 size={20} />
                <span>{currentQuestion + 1} / {quiz.questions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="quiz-main">
        <div className="container">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              className="question-container"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="question-card">
                <div className="question-header">
                  <span className="question-number">Question {currentQuestion + 1}</span>
                </div>
                
                <h2 className="question-text">{currentQ.question}</h2>
                
                <div className="options-container">
                  {currentQ.options.map((option, index) => {
                    // Handle both string and object formats with more robust error handling
                    let optionText = 'Option';
                    
                    try {
                      if (typeof option === 'string') {
                        optionText = option;
                      } else if (option && typeof option === 'object') {
                        optionText = option.label || option.value || 'Option';
                      } else {
                        optionText = String(option) || 'Option';
                      }
                    } catch (error) {
                      console.error('Error processing option:', option, error);
                      optionText = 'Option';
                    }
                    
                    return (
                      <motion.button
                        key={index}
                        className={`option-button ${answers[currentQuestion] === index ? 'selected' : ''}`}
                        onClick={() => handleAnswerSelect(currentQuestion, index)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="option-icon">
                          {answers[currentQuestion] === index ? (
                            <CheckCircle size={20} />
                          ) : (
                            <Circle size={20} />
                          )}
                        </div>
                        <span className="option-text">{optionText}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="navigation-buttons">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="nav-btn"
            >
              <ArrowLeft size={20} />
              Previous
            </Button>

            {currentQuestion === quiz.questions.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={submitting}
                disabled={Object.keys(answers).length < quiz.questions.length}
                className="nav-btn"
              >
                Submit Quiz
                <ArrowRight size={20} />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={answers[currentQuestion] === undefined}
                className="nav-btn"
                style={{
                  opacity: answers[currentQuestion] === undefined ? 0.5 : 1,
                  cursor: answers[currentQuestion] === undefined ? 'not-allowed' : 'pointer'
                }}
              >
                Next
                <ArrowRight size={20} />
              </Button>
            )}
          </div>

          {/* Footer with Question Numbering */}
          <div className="quiz-footer">
            <div className="question-progress">
              <span className="progress-text">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </span>
              <div className="question-dots">
                {quiz.questions.map((_, index) => (
                  <div
                    key={index}
                    className={`question-dot ${index === currentQuestion ? 'active' : ''} ${answers[index] !== undefined ? 'answered' : ''}`}
                    onClick={() => setCurrentQuestion(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 