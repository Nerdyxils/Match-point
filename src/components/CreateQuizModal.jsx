import React, { useState } from 'react';
import { X, Upload, Trash2, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { createQuiz, compressImage } from '../services/firebase';
import { useAuth } from '../App';
import '../styles/DashboardPage.css'; // for palette

const palette = {
  lavender: 'linear-gradient(135deg, rgba(30, 30, 50, 0.9), rgba(20, 20, 40, 0.95))',
  blue: 'linear-gradient(135deg, rgba(25, 35, 45, 0.8), rgba(15, 25, 35, 0.9))',
  mint: 'linear-gradient(135deg, rgba(25, 45, 35, 0.8), rgba(15, 35, 25, 0.9))',
  blush: 'linear-gradient(135deg, rgba(35, 25, 45, 0.8), rgba(25, 15, 35, 0.9))',
  sand: 'linear-gradient(135deg, rgba(45, 35, 25, 0.8), rgba(35, 25, 15, 0.9))',
  accent: '#FF6B6B',
  error: 'rgba(255, 107, 107, 0.15)',
  errorBorder: 'rgba(255, 107, 107, 0.3)',
  errorText: '#FF6B6B',
  border: 'rgba(255, 255, 255, 0.1)',
  border2: 'rgba(255, 255, 255, 0.15)',
  text: '#FFFFFF',
  subtext: 'rgba(255, 255, 255, 0.7)',
  check: '#FF6B6B',
  inputBg: 'rgba(0, 0, 0, 0.3)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
};

const CreateQuizModal = ({ onClose, onQuizCreated }) => {
  const { user } = useAuth();
  const [quizName, setQuizName] = useState('');
  const [quizImage, setQuizImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [preferredAnswers, setPreferredAnswers] = useState({});
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdQuizId, setCreatedQuizId] = useState(null);
  const [copied, setCopied] = useState(false);
  const questions = require('../questions.json');

  // Custom checkbox
  const CustomCheckbox = ({ checked }) => (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 22,
        height: 22,
        borderRadius: 8,
        border: `2px solid ${checked ? palette.check : palette.border}`,
        background: checked ? palette.check : 'rgba(255, 255, 255, 0.05)',
        transition: 'all 0.2s',
        marginRight: 10,
        boxShadow: checked ? '0 2px 8px rgba(255, 107, 107, 0.3)' : 'none',
      }}
    >
      {checked && <CheckCircle size={16} color="#fff" fill={palette.check} />}
    </span>
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQuizImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setQuizImage(null);
    setImagePreview('');
  };

  // When a question row is clicked, check and expand
  const handleQuestionClick = (question) => {
    setSelectedQuestions(prev => {
      const isSelected = prev.find(q => q.id === question.id);
      if (isSelected) {
        setExpandedQuestion(null);
        return prev.filter(q => q.id !== question.id);
      } else {
        setExpandedQuestion(question.id);
        return [...prev, question];
      }
    });
  };

  const setPreferredAnswer = (questionId, answerIndex) => {
    setPreferredAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
    setExpandedQuestion(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quizName.trim()) {
      setError('Please enter a quiz name');
      return;
    }
    if (selectedQuestions.length === 0) {
      setError('Please select at least 1 question for your quiz');
      return;
    }
    if (selectedQuestions.length > 20) {
      setError('Please select no more than 20 questions (maximum allowed)');
      return;
    }
    const missingAnswers = selectedQuestions.filter(q => preferredAnswers[q.id] === undefined);
    if (missingAnswers.length > 0) {
      setError('Please set your preferred answer for all selected questions');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let processedImage = quizImage;
      if (quizImage) processedImage = await compressImage(quizImage);
      const questionsWithAnswers = selectedQuestions.map(q => ({
        ...q,
        preferredAnswer: preferredAnswers[q.id]
      }));
      const result = await createQuiz(user.uid, questionsWithAnswers, quizName, processedImage);
      if (result.success) {
        setCreatedQuizId(result.quizId || result.id || questionsWithAnswers[0]?.id || '');
      } else setError(result.error || 'Failed to create quiz');
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Share handlers
  const quizLink = createdQuizId ? `${window.location.origin}/quiz/${createdQuizId}` : '';
  const handleCopy = async () => {
    if (quizLink) {
      await navigator.clipboard.writeText(quizLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const handleShare = (platform) => {
    const encodedLink = encodeURIComponent(quizLink);
    const text = encodeURIComponent('Take my MatchPoint quiz!');
    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${text}%20${encodedLink}`;
        break;
      case 'imessage':
        url = `sms:&body=${text}%20${encodedLink}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}&url=${encodedLink}`;
        break;
      case 'instagram':
        url = `https://www.instagram.com/?url=${encodedLink}`;
        break;
      default:
        url = quizLink;
    }
    window.open(url, '_blank');
  };

  if (createdQuizId) {
    // Show the share/copy modal
    return (
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0, 0, 0, 0.8)', 
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: palette.lavender,
            backdropFilter: 'blur(20px)',
            borderRadius: '1.25rem',
            padding: '2rem 1.5rem',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            border: `1px solid ${palette.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
          onClick={e => e.stopPropagation()}
        >
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: palette.text, marginBottom: '0.5rem' }}>Quiz Created!</h2>
          <div style={{ width: '100%', marginBottom: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.95rem', color: palette.text, marginBottom: '0.5rem' }}>Share your quiz link:</div>
            <input
              type="text"
              value={quizLink}
              readOnly
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: `1px solid ${palette.inputBorder}`,
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                background: palette.inputBg,
                color: palette.text,
                marginBottom: '0.5rem',
                textAlign: 'center',
                fontWeight: 500,
                backdropFilter: 'blur(10px)'
              }}
            />
            <button
              onClick={handleCopy}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                background: copied ? palette.check : palette.accent,
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                marginBottom: '0.5rem',
                transition: 'background 0.2s',
              }}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            <button onClick={() => handleShare('whatsapp')} style={shareBtnStyle}>WhatsApp</button>
            <button onClick={() => handleShare('imessage')} style={shareBtnStyle}>iMessage</button>
            <button onClick={() => handleShare('facebook')} style={shareBtnStyle}>Facebook</button>
            <button onClick={() => handleShare('twitter')} style={shareBtnStyle}>Twitter</button>
            <button onClick={() => handleShare('instagram')} style={shareBtnStyle}>Instagram</button>
          </div>
          <button
            onClick={onClose}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 2rem',
              borderRadius: '9999px',
              background: palette.lavender,
              color: palette.text,
              border: `2px solid ${palette.border2}`,
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
          <div 
        style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0, 0, 0, 0.8)', 
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
        onClick={onClose}
    >
                      <div
          style={{
            background: palette.lavender,
            backdropFilter: 'blur(20px)',
            borderRadius: '1.25rem',
            padding: '2.5rem 2rem',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            border: `1px solid ${palette.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient overlay for hover effect */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.1))',
              opacity: 0,
              transition: 'opacity 0.4s ease',
              pointerEvents: 'none',
              borderRadius: '1.25rem',
              zIndex: 1,
            }}
          />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: palette.text }}>Create New Quiz</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: palette.subtext,
              padding: '0.5rem',
              borderRadius: '0.375rem',
              transition: 'background 0.2s',
            }}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', zIndex: 2, minHeight: 0 }}>
          {/* Quiz Name & Image */}
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: 0 }}>
              <label style={{ display: 'block', fontWeight: 600, color: palette.text, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                Quiz Name
              </label>
              <input
                type="text"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
                placeholder="Quiz for..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: `1px solid ${palette.inputBorder}`,
                  borderRadius: '0.75rem',
                  fontSize: '1.05rem',
                  background: palette.inputBg,
                  color: palette.text,
                  fontWeight: 500,
                  outline: 'none',
                  marginBottom: '0.5rem',
                  backdropFilter: 'blur(10px)',
                }}
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ display: 'block', fontWeight: 600, color: palette.text, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                Quiz Image (Optional)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {imagePreview ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '128px',
                        objectFit: 'cover',
                        borderRadius: '0.75rem',
                        border: `1px solid ${palette.border}`,
                        background: palette.inputBg
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: palette.errorText,
                        border: 'none',
                        color: 'white',
                        padding: '0.25rem',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(220,38,38,0.10)'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label style={{ 
                    width: '100%', 
                    height: '128px', 
                    border: `2px dashed ${palette.border}`,
                    borderRadius: '0.75rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    background: palette.inputBg,
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <Upload size={24} style={{ margin: '0 auto 0.5rem', color: palette.subtext }} />
                      <span style={{ fontSize: '0.875rem', color: palette.subtext }}>Click to upload image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Questions Selection */}
          <div style={{ background: palette.mint, borderRadius: '1rem', padding: '1.5rem', border: `1px solid ${palette.border}`, backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ fontWeight: 700, color: palette.text, fontSize: '1.05rem' }}>
                Select Questions ({selectedQuestions.length}/20)
              </label>
              <span style={{ fontSize: '0.85rem', color: palette.subtext }}>
                Choose 1-20 questions
              </span>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: `1px solid ${palette.border}`, borderRadius: '0.75rem', background: palette.inputBg, backdropFilter: 'blur(10px)' }}>
              {questions.map((question) => {
                const isSelected = selectedQuestions.find(q => q.id === question.id);
                const isExpanded = expandedQuestion === question.id;
                return (
                  <div
                    key={question.id}
                    style={{ borderBottom: `1px solid ${palette.border}` }}
                  >
                    {/* Question Header */}
                    <div
                      style={{
                        padding: '1rem',
                        cursor: 'pointer',
                        background: isSelected ? palette.lavender : 'transparent',
                        borderLeft: isSelected ? `4px solid ${palette.check}` : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: isSelected ? '0.5rem' : 0,
                        transition: 'background 0.2s',
                      }}
                      onClick={() => handleQuestionClick(question)}
                    >
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CustomCheckbox checked={!!isSelected} />
                        <span style={{ fontWeight: 600, color: palette.text, fontSize: '1.01rem' }}>
                          {question.question}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: palette.subtext }}>
                          {question.options.length} options
                        </span>
                        {isSelected && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setExpandedQuestion(isExpanded ? null : question.id); }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: palette.subtext,
                              padding: '0.25rem',
                              borderRadius: '0.375rem',
                              transition: 'background 0.2s',
                            }}
                            aria-label="Expand options"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Preferred Answer Selection */}
                    {isSelected && isExpanded && (
                      <div style={{ padding: '1rem', background: palette.blue, borderTop: `1px solid ${palette.border}`, borderRadius: '0 0 0.5rem 0.5rem', backdropFilter: 'blur(10px)' }}>
                        <p style={{ fontWeight: 600, color: palette.text, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                          Set Your Preferred Answer:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {question.options.map((option, index) => (
                            <label 
                              key={index} 
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                background: preferredAnswers[question.id] === index ? palette.sand : palette.inputBg,
                                border: preferredAnswers[question.id] === index ? `1px solid ${palette.check}` : `1px solid ${palette.inputBorder}`,
                                fontWeight: preferredAnswers[question.id] === index ? 700 : 500,
                                color: palette.text,
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <input
                                type="radio"
                                name={question.id}
                                value={index}
                                checked={preferredAnswers[question.id] === index}
                                onChange={() => setPreferredAnswer(question.id, index)}
                                style={{ margin: 0 }}
                              />
                              <span style={{ flex: 1, fontSize: '0.95rem' }}>{option}</span>
                              {preferredAnswers[question.id] === index && (
                                <CheckCircle size={16} style={{ color: palette.check }} />
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ 
              padding: '0.75rem', 
              background: palette.error, 
              border: `1.5px solid ${palette.errorBorder}`, 
              borderRadius: '0.5rem', 
              color: palette.errorText,
              fontSize: '0.95rem',
              fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', position: 'relative', zIndex: 10, marginTop: 'auto' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.875rem 1.75rem',
                borderRadius: '9999px',
                fontWeight: 600,
                border: `1px solid ${palette.border}`,
                background: palette.inputBg,
                color: palette.text,
                cursor: 'pointer',
                fontSize: '1.05rem',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedQuestions.length < 1}
              style={{
                flex: 1,
                padding: '0.875rem 1.75rem',
                borderRadius: '9999px',
                fontWeight: 600,
                border: 'none',
                background: loading || selectedQuestions.length < 1 ? palette.subtext : palette.check,
                color: 'white',
                cursor: loading || selectedQuestions.length < 1 ? 'not-allowed' : 'pointer',
                opacity: loading || selectedQuestions.length < 1 ? 0.5 : 1,
                fontSize: '1.05rem',
                transition: 'all 0.2s ease',
                boxShadow: loading || selectedQuestions.length < 1 ? 'none' : '0 4px 16px rgba(255, 107, 107, 0.3)',
              }}
            >
              {loading ? 'Creating...' : `Create Quiz (${selectedQuestions.length} question${selectedQuestions.length !== 1 ? 's' : ''})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Share button style
const shareBtnStyle = {
  padding: '0.5rem 0.75rem',
  borderRadius: '0.5rem',
  background: palette.accent,
  color: '#fff',
  border: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  cursor: 'pointer',
  margin: '0.15rem',
  transition: 'background 0.2s',
};

export default CreateQuizModal;