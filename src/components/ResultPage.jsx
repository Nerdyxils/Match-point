// components/ResultPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Heart, 
  Share2, 
  RotateCcw, 
  ArrowLeft,
  Users,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Button from './ui/button';
import { getQuiz } from '../services/firebase';
import { demoQuizzes } from '../data/demoData';
import '../styles/ResultPage.css';

// Temporarily disable Confetti to fix import issues
// const Confetti = lazy(() => import('react-confetti'));

// Premium Match Card Component
const MatchCard = ({ quiz, score, respondentName, isMatch }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        background: '#1A1A1A',
        borderRadius: '24px',
        padding: '32px 24px',
        margin: '0 16px',
        border: '1px solid #2A2A2A',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle accent border for matches */}
      {isMatch && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #FF6B6B, #FF8E8E)',
          borderRadius: '24px 24px 0 0'
        }} />
      )}
      
      {/* Profile Avatar */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: isMatch 
              ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)'
              : 'linear-gradient(135deg, #4A4A4A 0%, #6A6A6A 100%)',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            border: '4px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}
        >
          {isMatch ? '💖' : '💙'}
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            color: '#FFFFFF',
            marginTop: '16px',
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}
        >
          {respondentName}
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            background: isMatch ? 'rgba(255, 107, 107, 0.15)' : 'rgba(255, 255, 255, 0.1)',
            color: isMatch ? '#FF8E8E' : '#B0B0B0',
            padding: '8px 16px',
            borderRadius: '20px',
            display: 'inline-block',
            fontSize: '14px',
            fontWeight: '600',
            border: `1px solid ${isMatch ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`
          }}
        >
          {isMatch ? '✨ Perfect Match' : '🤔 Keep Looking'}
        </motion.div>
      </div>
      
      {/* Compatibility Score */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.9, type: 'spring' }}
        style={{ 
          textAlign: 'center',
          marginBottom: '24px'
        }}
      >
        <div style={{ 
          fontSize: '64px', 
          fontWeight: '800',
          color: isMatch ? '#FF6B6B' : '#8A8A8A',
          lineHeight: '1',
          marginBottom: '8px',
          letterSpacing: '-2px'
        }}>
          {score}%
        </div>
        <div style={{ 
          fontSize: '16px', 
          color: '#8A8A8A',
          fontWeight: '500'
        }}>
          Compatibility
        </div>
      </motion.div>
      
      {/* Personality Tags */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        style={{ 
          display: 'flex', 
          gap: '8px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}
      >
        {getVibeTagsFromScore(score).slice(0, 3).map((tag, index) => (
          <span
            key={index}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#B0B0B0',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '500',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            {tag}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
};

// Premium CTA Button Component
const PremiumButton = ({ variant, children, onClick, icon: Icon, disabled, ...props }) => {
  const variants = {
    primary: {
      background: '#FF6B6B',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: '0 8px 24px rgba(255, 107, 107, 0.3)'
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.08)',
      color: '#FFFFFF',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
    },
    ghost: {
      background: 'transparent',
      color: '#8A8A8A',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: 'none'
    }
  };
  
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        padding: '16px 24px',
        borderRadius: '16px',
        fontSize: '16px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1,
        minHeight: '56px',
        ...props.style
      }}
      {...props}
    >
      {Icon && <Icon size={20} />}
      {children}
    </motion.button>
  );
};

// Stats Card Component
const StatsCard = ({ icon: Icon, value, label, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '20px',
      textAlign: 'center',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      flex: 1
    }}
  >
    <Icon size={24} color="#FF6B6B" style={{ marginBottom: '8px' }} />
    <div style={{ 
      fontSize: '20px', 
      fontWeight: '700', 
      color: '#FFFFFF',
      marginBottom: '4px'
    }}>
      {value}
    </div>
    <div style={{ 
      fontSize: '12px', 
      color: '#8A8A8A',
      fontWeight: '500'
    }}>
      {label}
    </div>
  </motion.div>
);

// Main Component
export default function ResultPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const score = parseInt(searchParams.get('score') || '0');
  const respondentName = searchParams.get('name') || 'Anonymous';
  const isMatch = score >= 70;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const result = await getQuiz(quizId);
        if (result.success) {
          setQuiz(result.data);
        } else {
          const demoQuiz = demoQuizzes?.find(q => q.id === quizId);
          if (demoQuiz) {
            setQuiz(demoQuiz);
          } else {
            setQuiz(null);
          }
        }
      } catch (error) {
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (quizId) {
      fetchQuiz();
    }
    
    // Show confetti for matches
    if (isMatch) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [quizId, isMatch]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: isMatch ? "🎉 It's a Match!" : "MatchPoint Results",
        text: `I scored ${score}% compatibility on MatchPoint! ${isMatch ? "We're a perfect match! 💖" : "Still searching for my person ✨"}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleTryAgain = () => {
    navigate(`/quiz/${quizId}/take`);
  };

  const handleFindMatches = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#0F0F0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Heart size={32} color="#FF6B6B" />
        </motion.div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#0F0F0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div>
          <Heart size={48} color="#FF6B6B" style={{ marginBottom: '16px' }} />
          <h1 style={{ fontSize: '24px', color: '#FFFFFF', marginBottom: '8px', fontWeight: '700' }}>
            Quiz Not Found
          </h1>
          <p style={{ color: '#8A8A8A', marginBottom: '24px', fontSize: '16px' }}>
            This quiz doesn't exist or has been removed.
          </p>
          <PremiumButton variant="primary" onClick={() => navigate('/')} icon={ArrowLeft}>
            Go Home
          </PremiumButton>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0F0F0F',
      color: '#FFFFFF'
    }}>
      {/* Confetti - Temporarily disabled
      {showConfetti && (
        <Suspense fallback={null}>
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={150}
            recycle={false}
            colors={['#FF6B6B', '#FF8E8E', '#FFB3B3', '#FFC1C1']}
            gravity={0.3}
          />
        </Suspense>
      )}
      */}
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '12px',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </motion.button>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px'
          }}
        >
          <Heart size={20} color="#FF6B6B" />
          <span style={{ 
            fontSize: '18px', 
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>
            MatchPoint
          </span>
        </motion.div>
        
        <div style={{ width: '44px' }} />
      </motion.header>
      
      {/* Main Content */}
      <main style={{ 
        padding: '32px 0 24px',
        maxWidth: '480px',
        margin: '0 auto'
      }}>
        {/* Match Status Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{ 
            textAlign: 'center', 
            marginBottom: '32px',
            padding: '0 20px'
          }}
        >
          <motion.div
            animate={isMatch ? { 
              scale: [1, 1.05, 1],
              rotate: [0, 1, -1, 0]
            } : {}}
            transition={{ 
              duration: 2,
              repeat: isMatch ? Infinity : 0,
              repeatType: 'reverse'
            }}
            style={{ fontSize: '48px', marginBottom: '12px' }}
          >
            {isMatch ? '🎉' : '😕'}
          </motion.div>
          
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '800',
            marginBottom: '8px',
            color: isMatch ? '#FF6B6B' : '#8A8A8A',
            letterSpacing: '-1px',
            lineHeight: '1.2'
          }}>
            {isMatch ? "It's a Match!" : "Not a Match"}
          </h1>
          
          <p style={{ 
            color: '#8A8A8A', 
            fontSize: '16px',
            lineHeight: '1.5',
            maxWidth: '280px',
            margin: '0 auto'
          }}>
            {isMatch
              ? "You two have incredible chemistry! Time to connect and see where this goes 💖" 
              : "Don't worry - your perfect match is out there waiting to be discovered ✨"
            }
          </p>
        </motion.div>
        
        {/* Match Card */}
        <div style={{ marginBottom: '32px' }}>
          <MatchCard
            quiz={quiz}
            score={score}
            respondentName={respondentName}
            isMatch={isMatch}
          />
        </div>
        
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          style={{ 
            display: 'flex',
            gap: '12px',
            margin: '0 16px 32px',
            marginBottom: '32px'
          }}
        >
          <StatsCard
            icon={Heart}
            value={Math.round(score / 10)}
            label="Matches"
            delay={1.4}
          />
          <StatsCard
            icon={Users}
            value={score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low'}
            label="Chemistry"
            delay={1.5}
          />
          <StatsCard
            icon={Sparkles}
            value={Math.floor(score / 20) + 1}
            label="Stars"
            delay={1.6}
          />
        </motion.div>
        
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          style={{ 
            padding: '0 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {isMatch ? (
            <>
              <PremiumButton
                variant="primary"
                onClick={handleShare}
                icon={Share2}
              >
                Share This Match
              </PremiumButton>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <PremiumButton
                  variant="secondary"
                  onClick={handleTryAgain}
                  icon={RotateCcw}
                  style={{ flex: 1 }}
                >
                  Try Again
                </PremiumButton>
                
                <PremiumButton
                  variant="secondary"
                  onClick={handleFindMatches}
                  icon={ChevronRight}
                  style={{ flex: 1 }}
                >
                  Find More
                </PremiumButton>
              </div>
            </>
          ) : (
            <>
              <PremiumButton
                variant="primary"
                onClick={handleTryAgain}
                icon={RotateCcw}
              >
                Try Again
              </PremiumButton>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <PremiumButton
                  variant="secondary"
                  onClick={handleShare}
                  icon={Share2}
                  style={{ flex: 1 }}
                >
                  Share
                </PremiumButton>
                
                <PremiumButton
                  variant="secondary"
                  onClick={handleFindMatches}
                  icon={Users}
                  style={{ flex: 1 }}
                >
                  New Matches
                </PremiumButton>
      </div>
            </>
          )}
        </motion.div>
        
        {/* Bottom Spacing */}
        <div style={{ height: '32px' }} />
      </main>
    </div>
  );
}

// Helper function to get vibe tags based on score
function getVibeTagsFromScore(score) {
  if (score >= 90) return ['Soulmate', 'Perfect', 'Destiny'];
  if (score >= 80) return ['Amazing', 'Strong', 'Potential'];
  if (score >= 70) return ['Good Vibes', 'Compatible', 'Worth It'];
  if (score >= 60) return ['Some Spark', 'Interesting', 'Maybe'];
  if (score >= 50) return ['Different', 'Learning', 'Growth'];
  return ['Opposites', 'Perspective', 'Friends'];
}