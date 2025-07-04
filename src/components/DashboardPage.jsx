import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Plus, 
  Trash2, 
  Copy,
  CheckCircle,
  Users,
  BarChart3,
  Crown,
  TrendingUp
} from 'lucide-react';
import Button from './ui/button';
import CreateQuizModal from './CreateQuizModal';
import QuizResultsModal from './QuizResultsModal';
import { getUserData, getUserQuizzes, deleteQuiz, getQuiz } from '../services/firebase';
import { useAuth } from '../App';
import '../styles/DashboardPage.css';

const palette = {
  lavender: '#e9e6f7',
  blue: '#e3f6fd',
  mint: '#e6f6f2',
  blush: '#fdf6f0',
  sand: '#ffe082',
  accent: '#4f8cff',
  error: '#fef2f2',
  errorBorder: '#fecaca',
  errorText: '#dc2626',
  border: '#e5e7eb',
  border2: '#d1c4e9',
  text: '#1a223f',
  subtext: '#7b809a',
  check: '#00cecb',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, userData: authUserData, logout, updateUserData } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [copiedQuizId, setCopiedQuizId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) {
          console.log('No user found, redirecting to name input');
          navigate('/name-input');
          return;
        }

        console.log('Current user:', user);
        console.log('Auth user data:', authUserData);

        // Fetch user data from Firebase (or use mock data for demo)
        const userResult = await getUserData(user.uid);
        console.log('Firebase user result:', userResult);
        
        if (userResult.success) {
          updateUserData(userResult.data);
        } else {
          // Create default user data if none exists
          const defaultUserData = {
            name: user.name,
            email: user.email || '',
            subscription: 'free',
            activeLinks: 0,
            totalQuizzes: 0,
            totalResponses: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          console.log('Creating default user data:', defaultUserData);
          updateUserData(defaultUserData);
        }

        // Fetch user's quizzes
        const quizzesResult = await getUserQuizzes(user.uid);
        console.log('Quizzes result:', quizzesResult);
        
        if (quizzesResult.success) {
          setQuizzes(quizzesResult.data);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate, updateUserData, authUserData]);

  const handleCreateQuiz = () => {
    setShowCreateModal(true);
  };

  const handleQuizCreated = () => {
    setShowCreateModal(false);
    // Refresh quizzes
    if (user) {
      getUserQuizzes(user.uid).then(result => {
        if (result.success) {
          setQuizzes(result.data);
        }
      });
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      const result = await deleteQuiz(quizId);
      if (result.success) {
        setQuizzes(quizzes.filter(q => q.id !== quizId));
      } else {
        alert('Failed to delete quiz');
      }
    } catch (error) {
      alert('An error occurred while deleting the quiz');
    }
    setShowDeleteModal(false);
    setQuizToDelete(null);
  };

  const handleViewResults = async (quiz) => {
    // Fetch the latest quiz data from Firestore
    try {
      const result = await getQuiz(quiz.id);
      if (result.success) {
        setSelectedQuiz(result.data);
      } else {
        setSelectedQuiz(quiz); // fallback to existing quiz data
      }
    } catch (e) {
      setSelectedQuiz(quiz); // fallback to existing quiz data
    }
    setShowResultsModal(true);
  };

  const copyQuizLink = async (quizId) => {
    try {
      const quizLink = `${window.location.origin}/quiz/${quizId}`;
      await navigator.clipboard.writeText(quizLink);
      setCopiedQuizId(quizId);
      setTimeout(() => setCopiedQuizId(null), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const canCreateQuiz = (!authUserData?.subscription || authUserData?.subscription === 'free') && quizzes.length >= 5;

  if (loading) {
    return (
      <div className="dashboard-page">
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
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
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

            <div className="user-section">
              {authUserData?.isSubscribed && (
                <div className="premium-badge">
                  <Crown size={16} />
                  <span>Premium</span>
                </div>
              )}
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="logout-btn"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="container">
          {/* Welcome Section */}
          <motion.div
            className="welcome-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="welcome-title">
              Welcome back, {authUserData?.name || 'User'}! 👋
            </h2>
            <p className="welcome-subtitle">
              Create quizzes to find your perfect match
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            className="stats-overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <BarChart3 size={24} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{quizzes.length}</h3>
                  <p className="stat-label">Total Quizzes</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">
                    {quizzes.reduce((total, quiz) => total + (quiz.responses?.length || 0), 0)}
                  </h3>
                  <p className="stat-label">Total Responses</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">
                    {quizzes.reduce((total, quiz) => {
                      const matches = quiz.responses?.filter(r => r.score >= 70).length || 0;
                      return total + matches;
                    }, 0)}
                  </h3>
                  <p className="stat-label">Matches Found</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">
                    {(() => {
                      const totalResponses = quizzes.reduce((total, quiz) => total + (quiz.responses?.length || 0), 0);
                      const totalMatches = quizzes.reduce((total, quiz) => {
                        const matches = quiz.responses?.filter(r => r.score >= 70).length || 0;
                        return total + matches;
                      }, 0);
                      return totalResponses > 0 ? Math.round((totalMatches / totalResponses) * 100) : 0;
                    })()}%
                  </h3>
                  <p className="stat-label">Match Rate</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detailed Analytics */}
          {quizzes.length > 0 && (
            <motion.div
              className="analytics-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="section-title">Analytics Overview</h3>
              <div className="analytics-grid">
                {/* Performance Metrics */}
                <div className="analytics-card">
                  <h4 className="analytics-title">Performance Metrics</h4>
                  <div className="metrics-list">
                    <div className="metric-item">
                      <span className="metric-label">Average Score:</span>
                      <span className="metric-value">
                        {(() => {
                          const allScores = quizzes.flatMap(quiz => 
                            quiz.responses?.map(r => r.score) || []
                          );
                          return allScores.length > 0 
                            ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
                            : 0;
                        })()}%
                      </span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Best Performing Quiz:</span>
                      <span className="metric-value">
                        {(() => {
                          const bestQuiz = quizzes.reduce((best, quiz) => {
                            const avgScore = quiz.responses?.length > 0 
                              ? quiz.responses.reduce((sum, r) => sum + r.score, 0) / quiz.responses.length
                              : 0;
                            return avgScore > best.score ? { name: quiz.name, score: avgScore } : best;
                          }, { name: 'None', score: 0 });
                          return bestQuiz.name;
                        })()}
                      </span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Response Rate:</span>
                      <span className="metric-value">
                        {(() => {
                          const totalQuizzes = quizzes.length;
                          const quizzesWithResponses = quizzes.filter(q => (q.responses?.length || 0) > 0).length;
                          return Math.round((quizzesWithResponses / totalQuizzes) * 100);
                        })()}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="analytics-card">
                  <h4 className="analytics-title">Recent Activity</h4>
                  <div className="activity-list">
                    {(() => {
                      const allResponses = quizzes.flatMap(quiz => 
                        quiz.responses?.map(r => ({ ...r, quizName: quiz.name })) || []
                      );
                      const recentResponses = allResponses
                        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                        .slice(0, 3);
                      
                      return recentResponses.length > 0 ? (
                        recentResponses.map((response, index) => (
                          <div key={index} className="activity-item">
                            <div className="activity-content">
                              <span className="activity-name">{response.respondentName}</span>
                              <span className="activity-quiz">took {response.quizName}</span>
                            </div>
                            <div className="activity-score">
                              {response.score}% {response.score >= 70 ? '✅' : '❌'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="no-activity">No recent activity</p>
                      );
                    })()}
                  </div>
                </div>

                {/* Score Distribution */}
                <div className="analytics-card">
                  <h4 className="analytics-title">Score Distribution</h4>
                  <div className="score-distribution">
                    {(() => {
                      const allScores = quizzes.flatMap(quiz => 
                        quiz.responses?.map(r => r.score) || []
                      );
                      const excellent = allScores.filter(s => s >= 80).length;
                      const good = allScores.filter(s => s >= 60 && s < 80).length;
                      const poor = allScores.filter(s => s < 60).length;
                      const total = allScores.length;
                      
                      return total > 0 ? (
                        <>
                          <div className="score-bar">
                            <span className="score-label">Excellent (80%+)</span>
                            <div className="score-bar-container">
                              <div 
                                className="score-bar-fill excellent" 
                                style={{ width: `${(excellent / total) * 100}%` }}
                              />
                            </div>
                            <span className="score-count">{excellent}</span>
                          </div>
                          <div className="score-bar">
                            <span className="score-label">Good (60-79%)</span>
                            <div className="score-bar-container">
                              <div 
                                className="score-bar-fill good" 
                                style={{ width: `${(good / total) * 100}%` }}
                              />
                            </div>
                            <span className="score-count">{good}</span>
                          </div>
                          <div className="score-bar">
                            <span className="score-label">Poor (&lt;60%)</span>
                            <div className="score-bar-container">
                              <div 
                                className="score-bar-fill poor" 
                                style={{ width: `${(poor / total) * 100}%` }}
                              />
                            </div>
                            <span className="score-count">{poor}</span>
                          </div>
                        </>
                      ) : (
                        <p className="no-data">No score data available</p>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Create Quiz Section */}
          <motion.div
            className="create-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="create-card">
              <div className="create-content">
                <h3 className="create-title">Create New Quiz</h3>
                <p className="create-subtitle">
                  {authUserData?.isSubscribed 
                    ? 'Unlimited quizzes with Premium!' 
                    : `${quizzes.length}/5 quizzes used`
                  }
                </p>
              </div>
              
              {canCreateQuiz ? (
                <div className="upgrade-prompt">
                  <Crown size={20} />
                  <span>Upgrade to Premium for unlimited quizzes</span>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/subscription')}
                    size="sm"
                  >
                    Upgrade
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleCreateQuiz}
                  className="create-btn"
                >
                  <Plus size={20} />
                  Create Quiz
                </Button>
              )}
            </div>
          </motion.div>

          {/* Quizzes List */}
          <motion.div
            className="quizzes-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="section-title">Your Quizzes</h3>
            
            {quizzes.length === 0 ? (
              <div className="empty-state">
                <Heart size={48} style={{ color: '#ff5e5b', marginBottom: '1rem' }} />
                <h4>No quizzes yet</h4>
                <p>Create your first quiz to start finding matches!</p>
              </div>
            ) : (
              <div className="quizzes-grid">
                {quizzes
                  .slice() // copy array to avoid mutating state
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((quiz, index) => {
                    const responseCount = quiz.responses?.length || 0;
                    const matchCount = quiz.responses?.filter(r => r.score >= 70).length || 0;
                    
                    return (
                      <motion.div
                        key={quiz.id}
                        className="quiz-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 * index }}
                      >
                        {/* Quiz Image */}
                        {quiz.imageURL && (
                          <div className="quiz-image">
                            <img src={quiz.imageURL} alt={quiz.name} />
                          </div>
                        )}

                        {/* Quiz Info */}
                        <div className="quiz-info">
                          <h4 className="quiz-name">{quiz.name}</h4>
                          <p className="quiz-questions">{quiz.questions.length} questions</p>
                          
                          {/* Quiz Stats */}
                          <div className="quiz-stats">
                            <div className="stat">
                              <Users size={16} />
                              <span>{responseCount} responses</span>
                            </div>
                            <div className="stat">
                              <CheckCircle size={16} />
                              <span>{matchCount} matches</span>
                            </div>
                          </div>

                          {/* Created Date */}
                          <p className="quiz-date">
                            Created {new Date(quiz.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Quiz Actions */}
                        <div className="quiz-actions">
                          <Button
                            variant="secondary"
                            onClick={() => copyQuizLink(quiz.id)}
                            size="sm"
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.25rem' 
                            }}
                          >
                            {copiedQuizId === quiz.id ? (
                              <>
                                <CheckCircle size={16} />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={16} />
                                Copy Link
                              </>
                            )}
                          </Button>

                          {responseCount > 0 && (
                            <Button
                              variant="primary"
                              onClick={() => handleViewResults(quiz)}
                              size="sm"
                            >
                              View Results
                            </Button>
                          )}

                          <Button
                            variant="secondary"
                            onClick={() => {
                              setQuizToDelete(quiz);
                              setShowDeleteModal(true);
                            }}
                            size="sm"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateQuizModal
          onClose={() => setShowCreateModal(false)}
          onQuizCreated={handleQuizCreated}
          user={user}
          userData={authUserData}
        />
      )}

      {showResultsModal && selectedQuiz && (
        <QuizResultsModal
          quiz={selectedQuiz}
          onClose={() => {
            setShowResultsModal(false);
            setSelectedQuiz(null);
          }}
        />
      )}

      {showDeleteModal && quizToDelete && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            style={{
              background: palette.blush,
              borderRadius: '1.25rem',
              padding: '2rem 2.5rem',
              minWidth: 320,
              maxWidth: '90vw',
              boxShadow: '0 8px 32px rgba(245,87,108,0.13)',
              border: `2px solid ${palette.errorBorder}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              alignItems: 'center',
            }}
            onClick={e => e.stopPropagation()}
          >
            <Trash2 size={32} color={palette.errorText} />
            <h3 style={{ color: palette.text, fontWeight: 700, fontSize: '1.15rem', margin: 0 }}>Delete Quiz?</h3>
            <p style={{ color: palette.subtext, fontSize: '1rem', textAlign: 'center', margin: 0 }}>
              Are you sure you want to delete <b>{quizToDelete.name}</b>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                style={{ borderRadius: 9999, padding: '0.75rem 2rem', fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDeleteQuiz(quizToDelete.id)}
                style={{ borderRadius: 9999, padding: '0.75rem 2rem', fontWeight: 600, background: palette.errorText, color: '#fff', border: 'none' }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 