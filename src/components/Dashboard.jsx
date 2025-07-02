import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Link, 
  BarChart3, 
  Crown, 
  LogOut, 
  Copy, 
  Eye
} from 'lucide-react';
import { 
  getUserData, 
  getUserQuizzes, 
  getQuizResults, 
  signOutUser 
} from '../services/firebase';
import { simulatePremiumUpgrade } from '../services/stripe';
import CreateQuizModal from './CreateQuizModal';
import QuizResultsModal from './QuizResultsModal';

const Dashboard = ({ user, userData, setUserData }) => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [upgrading, setUpgrading] = useState(false);

  const loadUserData = useCallback(async () => {
    if (user) {
      const result = await getUserData(user.uid);
      if (result.success) {
        setUserData(result.data);
      }
    }
  }, [user, setUserData]);

  const loadQuizzes = useCallback(async () => {
    if (user) {
      const result = await getUserQuizzes(user.uid);
      if (result.success) {
        setQuizzes(result.data);
      }
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
    loadQuizzes();
  }, [loadUserData, loadQuizzes]);

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/');
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const result = await simulatePremiumUpgrade(user.uid);
      if (result.success) {
        await loadUserData();
        alert('Premium upgrade successful!');
      }
    } catch (error) {
      alert('Upgrade failed. Please try again.');
    }
    setUpgrading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  const handleViewResults = async (quiz) => {
    setSelectedQuiz(quiz);
    const result = await getQuizResults(quiz.id);
    if (result.success) {
      setResults(result.data);
    }
    setShowResultsModal(true);
  };

  const canCreateQuiz = () => {
    console.log('canCreateQuiz called');
    console.log('userData:', userData);
    if (!userData) {
      console.log('No userData, returning false');
      return false;
    }
    if (userData.subscription === 'premium') {
      console.log('Premium user, returning true');
      return true;
    }
    const result = userData.activeLinks < 1;
    console.log('Free user, activeLinks:', userData.activeLinks, 'returning:', result);
    return result;
  };

  const handleCreateQuizClick = (e) => {
    e.preventDefault(); // Prevent any default behavior
    e.stopPropagation(); // Stop event bubbling
    console.log('Create Quiz button clicked!');
    console.log('canCreateQuiz result:', canCreateQuiz());
    console.log('userData:', userData);
    alert('Button clicked!'); // Simple test
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="spinner"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ padding: '2rem 0' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ maxWidth: '1200px', margin: '0 auto' }}
          >
            {/* Header */}
            <div className="glass-card p-4 mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome, {userData?.name || 'User'}! 👋
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {userData?.subscription === 'premium' ? (
                        <>
                          <Crown style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
                          <span style={{ color: '#6b7280' }}>Premium Member</span>
                        </>
                      ) : (
                        <>
                          <Link style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                          <span style={{ color: '#6b7280' }}>
                            {userData?.activeLinks || 0}/1 links used
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                  {userData?.subscription !== 'premium' && (
                    <button
                      type="button"
                      onClick={handleUpgrade}
                      disabled={upgrading}
                      className="btn btn-primary"
                    >
                      <Crown style={{ width: '16px', height: '16px' }} />
                      <span style={{ marginLeft: '8px' }}>
                        {upgrading ? 'Upgrading...' : 'Upgrade to Premium'}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="btn btn-secondary"
                  >
                    <LogOut style={{ width: '16px', height: '16px' }} />
                    <span style={{ marginLeft: '8px' }}>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Create Quiz Section */}
            <div className="glass-card p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">
                  Your Quizzes
                </h2>
                <button
                  type="button"
                  onClick={handleCreateQuizClick}
                  disabled={!canCreateQuiz()}
                  className="btn btn-primary"
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  <span style={{ marginLeft: '8px' }}>Create New Quiz</span>
                </button>
              </div>
              
              {!canCreateQuiz() && userData?.subscription !== 'premium' && (
                <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)', border: '1px solid #fbbf24', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                  <p style={{ color: '#374151' }}>
                    You've used your free quiz link. Upgrade to Premium for unlimited quizzes!
                  </p>
                </div>
              )}

              {quizzes.length === 0 ? (
                <div className="text-center" style={{ padding: '3rem 0' }}>
                  <BarChart3 style={{ width: '64px', height: '64px', color: '#9ca3af', margin: '0 auto 1rem' }} />
                  <h3 className="text-xl text-gray-600 mb-2">
                    No quizzes yet
                  </h3>
                  <p style={{ color: '#6b7280' }}>
                    Create your first compatibility quiz to get started!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                  {quizzes.map((quiz) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card p-4"
                    >
                      <h3 className="font-semibold mb-2">
                        {quiz.name}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.75rem' }}>
                        {quiz.questions?.length || 0} questions
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`${window.location.origin}/quiz/${quiz.id}`)}
                          className="btn btn-secondary"
                          style={{ fontSize: '14px', padding: '0.5rem 0.75rem' }}
                        >
                          <Copy style={{ width: '12px', height: '12px' }} />
                          <span style={{ marginLeft: '4px' }}>Copy Link</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleViewResults(quiz)}
                          className="btn btn-primary"
                          style={{ fontSize: '14px', padding: '0.5rem 0.75rem' }}
                        >
                          <Eye style={{ width: '12px', height: '12px' }} />
                          <span style={{ marginLeft: '4px' }}>Results</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateQuizModal
          onClose={() => setShowCreateModal(false)}
          onQuizCreated={() => {
            setShowCreateModal(false);
            loadQuizzes();
            loadUserData();
          }}
          user={user}
          userData={userData}
        />
      )}

      {showResultsModal && selectedQuiz && (
        <QuizResultsModal
          quiz={selectedQuiz}
          results={results}
          onClose={() => {
            setShowResultsModal(false);
            setSelectedQuiz(null);
            setResults([]);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard; 