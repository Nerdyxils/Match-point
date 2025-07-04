// components/LandingPage.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, Heart, ArrowRight, Star, Zap, X } from 'lucide-react';
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '../services/firebase';
import { useAuth } from '../App';
import '../styles/LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let result;
      if (isSignUp) {
        result = await signUpWithEmail(formData.email, formData.password, formData.name);
      } else {
        result = await signInWithEmail(formData.email, formData.password);
      }
      if (result.success) {
        if (result.user) {
          login({
            uid: result.user.uid,
            name: result.user.displayName || formData.name,
            email: result.user.email,
            firstName: (result.user.displayName || formData.name).split(' ')[0],
            lastName: (result.user.displayName || formData.name).split(' ').slice(1).join(' ')
          });
        }
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        if (result.user) {
          login({
            uid: result.user.uid,
            name: result.user.displayName,
            email: result.user.email,
            firstName: result.user.displayName.split(' ')[0],
            lastName: result.user.displayName.split(' ').slice(1).join(' ')
          });
        }
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, type: 'spring', stiffness: 200 } },
    exit: { opacity: 0, scale: 0.95, y: 40, transition: { duration: 0.2 } }
  };

  return (
    <div className={`landing-page${modalOpen ? ' modal-active' : ''}`}>
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="bg-gradient"></div>
        <div className="floating-hearts">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="floating-heart"
              initial={{ y: 100, opacity: 0 }}
              animate={{ 
                y: -100, 
                opacity: [0, 1, 0],
                x: Math.sin(i * 60) * 50
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "easeInOut"
              }}
            >
              <Heart size={20 + i * 5} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Blur and dark overlay when modal is open */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Header/Nav */}
      <header className="landing-header">
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
            <motion.div
              className="header-actions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <button className="header-btn primary" onClick={() => setModalOpen(true)}>Get Started</button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <motion.div
              className="hero-text"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="hero-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Find Your Perfect
                <span className="gradient-text"> Match</span>
              </motion.h1>
              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Discover compatibility before the first date. Create personality quizzes 
                and find people who truly match your vibe.
              </motion.p>
              <motion.div
                className="hero-features"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="feature-item">
                  <Star className="feature-icon" />
                  <span>Smart Matching</span>
                </div>
                <div className="feature-item">
                  <Zap className="feature-icon" />
                  <span>Instant Results</span>
                </div>
                <div className="feature-item">
                  <Heart className="feature-icon" />
                  <span>Real Connections</span>
                </div>
              </motion.div>
              <motion.div
                className="hero-actions"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <button className="hero-btn primary" onClick={() => setModalOpen(true)}>
                  Start Matching
                  <ArrowRight size={20} />
                </button>
              </motion.div>
            </motion.div>
          </div>
          {/* Hero Image: desktop/tablet right, mobile background */}
          <div className="hero-visual-wrapper">
            <motion.div
              className="hero-visual"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="hero-image-container">
                <img
                  src="/images/couple.jpg"
                  alt="Happy couples enjoying their time together"
                  className="hero-image"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1519742866993-66d3cfef4bbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
                  }}
                />
                <div className="image-overlay"></div>
                <div className="floating-card">
                  <div className="card-content">
                    <div className="card-avatar">💕</div>
                    <div className="card-text">
                      <p className="card-name">Sarah & Mike</p>
                      <p className="card-match">95% Match!</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modal Popup for Auth */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="auth-modal-wrapper"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <div className="auth-modal">
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X size={24} />
              </button>
              <div className="auth-header">
                <motion.div
                  className="auth-brand"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Heart className="auth-icon" />
                  <h2 className="auth-title">Join MatchPoint</h2>
                </motion.div>
                <p className="auth-subtitle">
                  {isSignUp ? 'Create your account and start matching' : 'Welcome back! Sign in to continue'}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="auth-form">
                {isSignUp && (
                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <div className="input-wrapper">
                      <User className="input-icon" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="auth-input"
                        required={isSignUp}
                      />
                    </div>
                  </motion.div>
                )}
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: isSignUp ? 0.4 : 0.3, duration: 0.6 }}
                >
                  <div className="input-wrapper">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      className="auth-input"
                      required
                    />
                  </div>
                </motion.div>
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: isSignUp ? 0.5 : 0.4, duration: 0.6 }}
                >
                  <div className="input-wrapper">
                    <Lock className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className="auth-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </motion.div>
                {error && (
                  <motion.div
                    className="error-message"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error}
                  </motion.div>
                )}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="auth-btn primary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: isSignUp ? 0.6 : 0.5, duration: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="loading-spinner" />
                  ) : (
                    <Sparkles size={20} />
                  )}
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                </motion.button>
              </form>
              <motion.div
                className="divider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <span className="divider-text">Or continue with</span>
              </motion.div>
              <motion.button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="auth-btn secondary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </motion.button>
              <motion.div
                className="auth-toggle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="toggle-btn"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="mobile-hero-bg"
        style={{
          background: "url('/images/couple.jpg') center center/cover no-repeat",
        }}
      ></div>
      <div className="mobile-hero-overlay" />
    </div>
  );
}