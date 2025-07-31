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
  LogOut,
  User,
  Camera,
  Edit3,
  Save,
  X as XIcon
} from 'lucide-react';
import Button from './ui/button';
import CreateQuizModal from './CreateQuizModal';
import QuizResultsModal from './QuizResultsModal';
import { getUserQuizzes, deleteQuiz, getQuiz, compressImage, uploadUserProfilePicture, deleteUserProfilePicture } from '../services/firebase';
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
  const [activeView, setActiveView] = useState('overview'); // overview, create, quizzes, profile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(0);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [failedImageUrls, setFailedImageUrls] = useState(new Set());
  const [imageLoadAttempts, setImageLoadAttempts] = useState({});
  const [profileFormData, setProfileFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    photo: null,
    photoUrl: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) {
          navigate('/');
          return;
        }

        // Check if we're in offline mode due to quota issues
        if (quotaExceeded || offlineMode) {
          setLoading(false);
          return;
        }

        // Fetch user's quizzes with error handling
        const quizzesResult = await getUserQuizzes(user.uid);
        
        if (quizzesResult.success) {
          setQuizzes(quizzesResult.data);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        
        // Check for quota exceeded or rate limiting errors
        if (error.code === 'resource-exhausted' || error.message?.includes('quota') || error.message?.includes('429')) {
          setQuotaExceeded(true);
          setOfflineMode(true);
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we haven't exceeded quota
    if (!quotaExceeded && !offlineMode) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user, navigate, quotaExceeded, offlineMode]); // Only fetch quizzes, let App.js handle user data



  // Global error handler for quota exceeded
  useEffect(() => {
    const handleGlobalError = (event) => {
      const error = event.error || event.reason;
      if (error && (
        error.code === 'resource-exhausted' || 
        error.message?.includes('quota') || 
        error.message?.includes('429') ||
        error.message?.includes('Quota exceeded')
      )) {
        setQuotaExceeded(true);
        setOfflineMode(true);
        console.error('Global quota exceeded detected, entering offline mode');
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleGlobalError);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
    };
  }, []);

  // Helper function to check if we should attempt to load an image
  const shouldLoadImage = (imageUrl) => {
    if (!imageUrl) return false;
    if (failedImageUrls.has(imageUrl)) return false;
    
    const attempts = imageLoadAttempts[imageUrl] || 0;
    return attempts < 3; // Max 3 attempts per image URL
  };

  // Helper function to record image load failure
  const recordImageFailure = (imageUrl) => {
    if (!imageUrl) return;
    
    setImageLoadAttempts(prev => ({
      ...prev,
      [imageUrl]: (prev[imageUrl] || 0) + 1
    }));
    
    // If we've failed 3 times, mark as permanently failed
    if ((imageLoadAttempts[imageUrl] || 0) >= 2) {
      setFailedImageUrls(prev => new Set([...prev, imageUrl]));
    }
  };

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

  // Profile functions
  const handleEditProfile = () => {
    const profile = authUserData?.profile || {};
    setProfileFormData({
      firstName: profile.firstName || authUserData?.firstName || '',
      lastName: profile.lastName || authUserData?.lastName || '',
      age: profile.age || '',
      photo: null,
      photoUrl: profile.photoUrl || authUserData?.photoURL || ''
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (isSavingProfile) return; // Prevent multiple saves
    
    // Check if we're in offline mode
    if (quotaExceeded || offlineMode) {
      alert('Unable to save profile: Service temporarily unavailable due to quota limits. Please try again later.');
      return;
    }
    
    // Add debounce to prevent rapid saves
    const now = Date.now();
    if (now - lastSaveTime < 2000) { // 2 second debounce
      return;
    }
    setLastSaveTime(now);
    
    setIsSavingProfile(true);
    try {
      // Validate user object has required properties
      if (!user?.uid) {
        throw new Error('User UID not available. Please try logging out and back in.');
      }

      // Check if user data is available
      if (!authUserData) {
        throw new Error('User data not loaded. Please refresh the page and try again.');
      }

      // Validate form data
      if (!profileFormData.firstName?.trim()) {
        throw new Error('First name is required.');
      }

      if (!profileFormData.lastName?.trim()) {
        throw new Error('Last name is required.');
      }

      if (!profileFormData.age || parseInt(profileFormData.age) < 18) {
        throw new Error('Valid age (18+) is required.');
      }
      
      // Check if profile data is too large (base64 images can be very large)
      const profileDataSize = JSON.stringify(profileFormData).length;
      if (profileDataSize > 500000) { // 500KB limit
        throw new Error('Profile data is too large. Please use a smaller image or try again.');
      }

      // Check if we're trying to save the same data (prevent unnecessary saves)
      const currentProfile = authUserData?.profile || {};
      const newProfile = {
        firstName: profileFormData.firstName,
        lastName: profileFormData.lastName,
        age: parseInt(profileFormData.age) || 0,
        photoUrl: profileFormData.photoUrl
      };

      // Check if data has actually changed
      const hasChanged = 
        currentProfile.firstName !== newProfile.firstName ||
        currentProfile.lastName !== newProfile.lastName ||
        currentProfile.age !== newProfile.age ||
        currentProfile.photoUrl !== newProfile.photoUrl;

      if (!hasChanged) {
        setIsEditingProfile(false);
        setProfileFormData({
          firstName: '',
          lastName: '',
          age: '',
          photo: null,
          photoUrl: ''
        });
        return; // No changes, don't save
      }
      
      // Delete old profile picture if it exists and is different
      const currentPhotoUrl = authUserData?.profile?.photoUrl || authUserData?.photoURL;
      if (currentPhotoUrl && currentPhotoUrl !== profileFormData.photoUrl && !currentPhotoUrl.includes('googleusercontent.com')) {
        await deleteUserProfilePicture(currentPhotoUrl);
      }
      
      const updatedUserData = {
        ...authUserData,
        profile: {
          ...authUserData?.profile,
          firstName: profileFormData.firstName,
          lastName: profileFormData.lastName,
          age: parseInt(profileFormData.age) || 0,
          photoUrl: profileFormData.photoUrl
        },
        updatedAt: new Date().toISOString()
      };
      
      // Only attempt Firebase save if not in offline mode
      if (!quotaExceeded && !offlineMode) {
        await updateUserData(updatedUserData);
      } else {
        // Save to localStorage as fallback
        localStorage.setItem('pendingProfileUpdate', JSON.stringify(updatedUserData));
        alert('Profile saved locally. Changes will sync when service is restored.');
      }
      
      setIsEditingProfile(false);
      setProfileFormData({
        firstName: '',
        lastName: '',
        age: '',
        photo: null,
        photoUrl: ''
      });
      
    } catch (error) {
      console.error('Error saving profile:', error);
      
      // Check for quota/rate limiting errors
      if (error.code === 'resource-exhausted' || error.message?.includes('quota') || error.message?.includes('429')) {
        setQuotaExceeded(true);
        setOfflineMode(true);
        alert('Service temporarily unavailable due to high usage. Your changes have been saved locally and will sync when service is restored.');
      } else {
        alert(`Error saving profile: ${error.message}. Please try again.`);
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if we're in offline mode
    if (quotaExceeded || offlineMode) {
      alert('Image upload temporarily unavailable due to quota limits. Please try again later.');
      return;
    }

    let compressedFile;
    
    try {
      // Compress the image
      compressedFile = await compressImage(file);
      
      // Check file size after compression
      if (compressedFile.size > 1024 * 1024) { // 1MB limit
        alert('Image is too large. Please use a smaller image (under 1MB).');
        return;
      }
      
      // Try to upload to Firebase Storage first
      try {
        const downloadURL = await uploadUserProfilePicture(compressedFile, user.uid);
        
        setProfileFormData(prev => ({
          ...prev,
          photo: compressedFile,
          photoUrl: downloadURL
        }));
        return; // Success, exit early
      } catch (uploadError) {
        console.error('Firebase Storage upload failed:', uploadError);
        
        // Check for quota/rate limiting errors
        if (uploadError.code === 'resource-exhausted' || uploadError.message?.includes('quota') || uploadError.message?.includes('429')) {
          setQuotaExceeded(true);
          setOfflineMode(true);
          alert('Image upload temporarily unavailable due to high usage. Please try again later.');
          return;
        }
        
        // If Firebase Storage upload fails, fall back to base64
        if (uploadError.code === 'storage/unauthorized' || 
            uploadError.message?.includes('CORS') || 
            uploadError.message?.includes('ERR_FAILED') ||
            uploadError.message?.includes('preflight')) {
          
          // Immediately fall back to base64 for small images
          if (compressedFile && compressedFile.size < 200 * 1024) { // Only for images under 200KB
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64Data = e.target.result;
              setProfileFormData(prev => ({
                ...prev,
                photo: compressedFile,
                photoUrl: base64Data
              }));
            };
            reader.readAsDataURL(compressedFile);
            return; // Success with fallback
          } else {
            alert('Image upload failed due to service restrictions. Please try using a smaller image (under 200KB).');
          }
        }
        
        // Re-throw if it's not a handled error
        throw uploadError;
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    }
  };

  const removePhoto = () => {
    setProfileFormData(prev => ({
      ...prev,
      photo: null,
      photoUrl: ''
    }));
  };

  const canCreateQuiz = (!authUserData?.subscription || authUserData?.subscription === 'free') && quizzes.length >= 5;

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home, description: 'Dashboard stats and welcome' },
    { id: 'create', label: 'Create Quiz', icon: Plus, description: 'Build a new compatibility quiz' },
    { id: 'quizzes', label: 'My Quizzes', icon: FileText, description: 'View and manage your quizzes' },
    { id: 'profile', label: 'Profile', icon: User, description: 'Manage your profile and preferences' },
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
      {/* Quota Exceeded Banner */}
      {(quotaExceeded || offlineMode) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#f59e0b',
          color: 'white',
          padding: '12px',
          textAlign: 'center',
          zIndex: 1000,
          fontSize: '14px'
        }}>
          ⚠️ Service temporarily unavailable due to high usage. Some features may be limited. Please try again later.
        </div>
      )}
      
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

            {activeView === 'profile' && (
              <motion.div
                key="profile"
                className="profile-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="profile-section">
                  <div className="section-header">
                    <h3 className="section-title">Profile & Preferences</h3>
                    {!isEditingProfile && (
                      <Button
                        variant="primary"
                        onClick={handleEditProfile}
                        size="sm"
                      >
                        <Edit3 size={16} />
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <div className="profile-edit">
                      <div className="edit-section">
                        <h5>Profile Information</h5>
                        <div className="photo-upload-section">
                          <label className="photo-upload-label">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              style={{ display: 'none' }}
                            />
                            {profileFormData.photoUrl ? (
                              <div className="photo-preview">
                                <img 
                                  src={profileFormData.photoUrl} 
                                  alt="Profile preview" 
                                  onLoad={() => console.log('Profile preview loaded successfully')}
                                  onError={(e) => console.log('Profile preview failed to load:', e)}
                                />
                                <button 
                                  type="button" 
                                  className="remove-photo-btn"
                                  onClick={removePhoto}
                                >
                                  <XIcon size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="photo-upload-placeholder">
                                <Camera size={24} />
                                <span>Upload Photo</span>
                              </div>
                            )}
                          </label>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>First Name</label>
                            <input
                              type="text"
                              value={profileFormData.firstName}
                              onChange={(e) => setProfileFormData(prev => ({ ...prev, firstName: e.target.value }))}
                              placeholder="Enter first name"
                            />
                          </div>
                          <div className="form-group">
                            <label>Last Name</label>
                            <input
                              type="text"
                              value={profileFormData.lastName}
                              onChange={(e) => setProfileFormData(prev => ({ ...prev, lastName: e.target.value }))}
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label>Age</label>
                          <input
                            type="number"
                            value={profileFormData.age}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, age: e.target.value }))}
                            placeholder="Enter age"
                            min="18"
                            max="100"
                          />
                        </div>
                      </div>
                      
                      <div className="edit-actions">
                        <button 
                          type="button" 
                          className="btn-secondary"
                          onClick={handleCancelEdit}
                          disabled={isSavingProfile}
                        >
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          className="btn-primary"
                          onClick={handleSaveProfile}
                          disabled={isSavingProfile}
                        >
                          {isSavingProfile ? (
                            <>
                              <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%' }}></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              Save Profile
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-display">
                      <div className="profile-header">
                        <div className="profile-photo">
                          {(() => {
                            // Simplified image source logic - prioritize Firebase Storage URLs
                            const photoUrl = authUserData?.profile?.photoUrl || authUserData?.photoURL;
                            const shouldShow = photoUrl && shouldLoadImage(photoUrl);
                            
                            return (
                              <>
                                {shouldShow && (
                                  <img 
                                    src={photoUrl} 
                                    alt="Profile" 
                                    onError={(e) => {
                                      console.error('Profile image failed to load:', photoUrl);
                                      recordImageFailure(photoUrl);
                                      // Simple error handling - just hide the image on error
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) {
                                        e.target.nextSibling.style.display = 'flex';
                                      }
                                    }}
                                    onLoad={() => {
                                      // Remove console.log to reduce noise
                                    }}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                )}
                                <div className="profile-photo-placeholder" style={{ display: shouldShow ? 'none' : 'flex' }}>
                                  <User size={32} />
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        <div className="profile-info">
                          <h4 className="profile-name">
                            {authUserData?.profile?.firstName && authUserData?.profile?.lastName
                              ? `${authUserData.profile.firstName} ${authUserData.profile.lastName}`
                              : authUserData?.name || 'User'
                            }
                          </h4>
                          <p className="profile-email">{authUserData?.email}</p>
                          {authUserData?.profile?.age && (
                            <p className="profile-age">{authUserData.profile.age} years old</p>
                          )}
                        </div>
                      </div>

                      {authUserData?.preferences && (
                        <div className="preferences-section">
                          <h5>Preferences</h5>
                          <div className="preferences-grid">
                            {authUserData.preferences.gender && (
                              <div className="preference-item">
                                <span className="preference-label">Gender:</span>
                                <span className="preference-value">{authUserData.preferences.gender}</span>
                              </div>
                            )}
                            {authUserData.preferences.ageRange && (
                              <div className="preference-item">
                                <span className="preference-label">Age Range:</span>
                                <span className="preference-value">
                                  {authUserData.preferences.ageRange.min} - {authUserData.preferences.ageRange.max}
                                </span>
                              </div>
                            )}
                            {authUserData.preferences.interests && authUserData.preferences.interests.length > 0 && (
                              <div className="preference-item">
                                <span className="preference-label">Interests:</span>
                                <div className="interests-tags">
                                  {authUserData.preferences.interests.map((interest, index) => (
                                    <span key={index} className="interest-tag">{interest}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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