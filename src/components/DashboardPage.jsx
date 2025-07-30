import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  TrendingUp,
  Loader,
  Menu,
  X,
  Home,
  FileText,

  LogOut
} from 'lucide-react';
import Button from './ui/button';
import CreateQuizModal from './CreateQuizModal';
import QuizResultsModal from './QuizResultsModal';
import { getUserData, getUserQuizzes, deleteQuiz, getQuiz } from '../services/firebase';
import { useAuth } from '../App';
import '../styles/DashboardPage.css';

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
  const [activeView, setActiveView] = useState('overview'); // overview, create, quizzes
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) {
          navigate('/name-input');
          return;
        }

        // Fetch user data from Firebase
        const userResult = await getUserData(user.uid);
        
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
          updateUserData(defaultUserData);
        }

        // Fetch user's quizzes
        const quizzesResult = await getUserQuizzes(user.uid);
        
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
    // Refresh quizzes list
    const fetchQuizzes = async () => {
      const result = await getUserQuizzes(user.uid);
      if (result.success) {
        setQuizzes(result.data);
      }
    };
    fetchQuizzes();
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      const result = await deleteQuiz(quizId);
      if (result.success) {
        setQuizzes(quizzes.filter(q => q.id !== quizId));
        setShowDeleteModal(false);
        setQuizToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete quiz:', error);
    }
  };

  const handleViewResults = async (quiz) => {
    try {
      // Fetch the latest quiz data
      const result = await getQuiz(quiz.id);
      if (result.success) {
        setSelectedQuiz(result.data);
        setShowResultsModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch quiz data:', error);
    }
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

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home, description: 'Dashboard stats and welcome' },
    { id: 'create', label: 'Create Quiz', icon: Plus, description: 'Build a new compatibility quiz' },
    { id: 'quizzes', label: 'My Quizzes', icon: FileText, description: 'View and manage your quizzes' },
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <Loader className="loading-spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
        initial={{ x: '-100%' }}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="sidebar-header">
          <div className="brand-section">
            <div className="brand-icon">
              <Heart />
            </div>
            <h2 className="brand-title">MatchPoint</h2>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveView(item.id);
                setSidebarOpen(false);
              }}
            >
              <item.icon size={20} />
              <div className="nav-item-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {authUserData?.isSubscribed && (
            <div className="premium-badge">
              <Crown size={16} />
              <span>Premium Member</span>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="header-title">
              <h1>{menuItems.find(item => item.id === activeView)?.label}</h1>
            </div>

            <div className="user-info">
              <span className="user-name">{authUserData?.name || 'User'}</span>
              {authUserData?.isSubscribed && (
                <div className="premium-indicator">
                  <Crown size={16} />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="dashboard-main">
          <AnimatePresence mode="wait">
            {activeView === 'overview' && (
              <motion.div
                key="overview"
                className="overview-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Welcome Section */}
                <div className="welcome-section">
                  <div className="welcome-content">
                    <h2 className="welcome-title">
                      Welcome back, {authUserData?.name || 'User'}! 👋
                    </h2>
                    <p className="welcome-subtitle">
                      Your dating compatibility journey starts here
                    </p>
                  </div>
                </div>

                {/* Stats Overview */}
                <div className="stats-overview">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon quizzes">
                        <BarChart3 size={24} />
                      </div>
                      <div className="stat-content">
                        <h3 className="stat-value">{quizzes.length}</h3>
                        <p className="stat-label">Total Quizzes</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon responses">
                        <Users size={24} />
                      </div>
                      <div className="stat-content">
                        <h3 className="stat-value">
                          {quizzes.reduce((total, quiz) => {
                            const responses = Array.isArray(quiz.responses) ? quiz.responses : [];
                            return total + responses.length;
                          }, 0)}
                        </h3>
                        <p className="stat-label">Total Responses</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon compatibility">
                        <CheckCircle size={24} />
                      </div>
                      <div className="stat-content">
                        <h3 className="stat-value">
                          {quizzes.reduce((total, quiz) => {
                            const responses = Array.isArray(quiz.responses) ? quiz.responses : [];
                            const matches = responses.filter(r => r && r.score >= 70).length;
                            return total + matches;
                          }, 0)}
                        </h3>
                        <p className="stat-label">Matches Found</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon compatibility">
                        <TrendingUp size={24} />
                      </div>
                      <div className="stat-content">
                        <h3 className="stat-value">
                          {(() => {
                            const totalResponses = quizzes.reduce((total, quiz) => {
                              const responses = Array.isArray(quiz.responses) ? quiz.responses : [];
                              return total + responses.length;
                            }, 0);
                            const totalMatches = quizzes.reduce((total, quiz) => {
                              const responses = Array.isArray(quiz.responses) ? quiz.responses : [];
                              const matches = responses.filter(r => r && r.score >= 70).length;
                              return total + matches;
                            }, 0);
                            return totalResponses > 0 ? Math.round((totalMatches / totalResponses) * 100) : 0;
                          })()}%
                        </h3>
                        <p className="stat-label">Match Rate</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <div className="action-card">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons">
                      <Button
                        variant="primary"
                        onClick={() => setActiveView('create')}
                        className="action-btn"
                      >
                        <Plus size={20} />
                        Create New Quiz
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setActiveView('quizzes')}
                        className="action-btn"
                      >
                        <FileText size={20} />
                        View My Quizzes
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'create' && (
              <motion.div
                key="create"
                className="create-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="create-section">
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
                </div>
              </motion.div>
            )}

            {activeView === 'quizzes' && (
              <motion.div
                key="quizzes"
                className="quizzes-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="quizzes-section">
                  <div className="section-header">
                    <h3 className="section-title">Your Quizzes</h3>
                    <Button
                      variant="primary"
                      onClick={() => setActiveView('create')}
                      size="sm"
                    >
                      <Plus size={16} />
                      New Quiz
                    </Button>
                  </div>
                  
                  {quizzes.length === 0 ? (
                    <div className="empty-state">
                      <Heart size={48} className="empty-icon" />
                      <h4>No quizzes yet</h4>
                      <p>Create your first quiz to start finding matches!</p>
                      <Button
                        variant="primary"
                        onClick={() => setActiveView('create')}
                        className="create-first-btn"
                      >
                        <Plus size={20} />
                        Create Your First Quiz
                      </Button>
                    </div>
                  ) : (
                    <div className="quizzes-grid">
                      {quizzes
                        .slice()
                        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                        .map((quiz, index) => {
                          // Safely handle quiz data with fallbacks
                          const quizName = quiz.name || 'Untitled Quiz';
                          const questionsCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
                          const responses = Array.isArray(quiz.responses) ? quiz.responses : [];
                          const responseCount = responses.length;
                          const matchCount = responses.filter(r => r && r.score >= 70).length;
                          const createdAt = quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'Unknown date';
                          
                          return (
                            <motion.div
                              key={quiz.id}
                              className="quiz-card"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6, delay: 0.1 * index }}
                            >
                              {/* Quiz Header */}
                              <div className="quiz-header">
                                {/* Quiz Image */}
                                {quiz.imageURL ? (
                                  <div className="quiz-image">
                                    <img src={quiz.imageURL} alt={quizName} onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }} />
                                    <div className="quiz-image-fallback" style={{ display: 'none' }}>
                                      <Heart size={24} />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="quiz-image">
                                    <Heart size={24} />
                                  </div>
                                )}

                                {/* Quiz Basic Info */}
                                <div className="quiz-basic-info">
                                  <h4 className="quiz-name">{quizName}</h4>
                                  <p className="quiz-questions">{questionsCount} questions</p>
                                  <p className="quiz-date">Created {createdAt}</p>
                                </div>
                              </div>

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

                              {/* Quiz Actions */}
                              <div className="quiz-actions">
                                <Button
                                  variant="secondary"
                                  onClick={() => copyQuizLink(quiz.id)}
                                  size="sm"
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
                                  className="delete-btn"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && quizToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <div className="delete-modal-content">
              <Trash2 size={32} className="delete-icon" />
              <h3>Delete Quiz?</h3>
              <p>
                Are you sure you want to delete <strong>{quizToDelete.name}</strong>? 
                This action cannot be undone.
              </p>
              <div className="delete-modal-actions">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteQuiz(quizToDelete.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 