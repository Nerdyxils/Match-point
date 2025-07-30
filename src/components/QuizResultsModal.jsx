import React from 'react';
import { motion } from 'framer-motion';
import { X, Users, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import Button from './ui/button';

const QuizResultsModal = ({ quiz, onClose }) => {
  const responseCount = quiz.responses?.length || 0;
  const matchCount = quiz.responses?.filter(r => r.score >= 70).length || 0;
  const averageScore = responseCount > 0 
    ? Math.round(quiz.responses.reduce((sum, r) => sum + r.score, 0) / responseCount)
    : 0;

  const getMatchStatus = (score) => {
    if (score >= 70) return { text: 'Match!', color: '#FF6B6B', icon: CheckCircle };
    return { text: 'No Match', color: '#8A8A8A', icon: XCircle };
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: 'rgba(0, 0, 0, 0.6)', 
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          background: '#1A1A1A',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF' }}>Quiz Results</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#8A8A8A',
              padding: '0.5rem',
              borderRadius: '0.375rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Quiz Info */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: '#FFFFFF' }}>
            {quiz.name}
          </h3>
          <p style={{ color: '#B0B0B0', fontSize: '0.875rem' }}>
            Created {new Date(quiz.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Stats Overview */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center'
          }}>
            <Users size={24} style={{ color: '#FF6B6B', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFFFFF' }}>
              {responseCount}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#B0B0B0' }}>
              Total Responses
            </div>
          </div>

          <div style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <CheckCircle size={24} style={{ color: '#00cecb', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }}>
              {matchCount}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Matches Found
            </div>
          </div>

          <div style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <BarChart3 size={24} style={{ color: '#ffed66', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }}>
              {averageScore}%
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Avg Score
            </div>
          </div>
        </div>

        {/* Responses List */}
        {responseCount > 0 ? (
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
              Recent Responses
            </h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {quiz.responses.slice(-5).reverse().map((response) => {
                const matchStatus = getMatchStatus(response.score);
                return (
                  <div
                    key={response.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, color: '#374151' }}>
                        {response.respondentName}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {new Date(response.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: 'bold', 
                        color: matchStatus.color 
                      }}>
                        {response.score}%
                      </div>
                      <matchStatus.icon size={20} style={{ color: matchStatus.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: '#6b7280' 
          }}>
            <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No responses yet</p>
            <p style={{ fontSize: '0.875rem' }}>
              Share your quiz link to start receiving responses!
            </p>
          </div>
        )}

        {/* Close Button */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Button
            variant="secondary"
            onClick={onClose}
            style={{ minWidth: '120px' }}
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizResultsModal; 