import React, { useState } from 'react';
import { X, Upload, Trash2, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { createQuiz, compressImage } from '../services/firebase';
import { useAuth } from '../App';

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

  // Import questions from the JSON file
  const questions = require('../questions.json');
  
  // Debug: Log the questions being imported
  console.log('=== QUESTIONS IMPORTED ===');
  console.log('Total questions available:', questions.length);
  console.log('First few questions:', questions.slice(0, 3).map(q => ({ id: q.id, question: q.question.substring(0, 30) + '...' })));

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

  const toggleQuestion = (question) => {
    console.log('=== TOGGLING QUESTION ===');
    console.log('Question being toggled:', { id: question.id, question: question.question.substring(0, 30) + '...' });
    
    setSelectedQuestions(prev => {
      const isSelected = prev.find(q => q.id === question.id);
      console.log('Currently selected questions:', prev.map(q => q.id));
      console.log('Is this question already selected?', !!isSelected);
      
      if (isSelected) {
        const newSelection = prev.filter(q => q.id !== question.id);
        console.log('Removing question. New selection:', newSelection.map(q => q.id));
        return newSelection;
      } else {
        const newSelection = [...prev, question];
        console.log('Adding question. New selection:', newSelection.map(q => q.id));
        return newSelection;
      }
    });
  };

  const setPreferredAnswer = (questionId, answerIndex) => {
    setPreferredAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const toggleExpandedQuestion = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
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

    // Check if all selected questions have preferred answers
    const missingAnswers = selectedQuestions.filter(q => preferredAnswers[q.id] === undefined);
    if (missingAnswers.length > 0) {
      setError('Please set your preferred answer for all selected questions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let processedImage = quizImage;
      if (quizImage) {
        processedImage = await compressImage(quizImage);
      }

      // Add preferred answers to questions
      const questionsWithAnswers = selectedQuestions.map(q => ({
        ...q,
        preferredAnswer: preferredAnswers[q.id]
      }));

      console.log('=== CREATING QUIZ FROM MODAL ===');
      console.log('Creating quiz with questions:', questionsWithAnswers);
      console.log('Number of questions:', questionsWithAnswers.length);
      console.log('Selected question IDs:', selectedQuestions.map(q => q.id));
      console.log('Selected question texts:', selectedQuestions.map(q => q.question.substring(0, 50) + '...'));
      console.log('Preferred answers:', preferredAnswers);
      console.log('Total questions available in JSON:', questions.length);
      console.log('Questions being saved to Firebase:', questionsWithAnswers.length);
      
      // Additional debugging - show exactly what's being sent to Firebase
      console.log('=== DETAILED QUIZ DATA ===');
      questionsWithAnswers.forEach((q, index) => {
        console.log(`Question ${index + 1}:`, {
          id: q.id,
          question: q.question,
          options: q.options,
          preferredAnswer: q.preferredAnswer
        });
      });

      const result = await createQuiz(user.uid, questionsWithAnswers, quizName, processedImage);
      
      if (result.success) {
        console.log('Quiz created successfully:', result);
        onQuizCreated();
      } else {
        console.error('Failed to create quiz:', result.error);
        setError(result.error || 'Failed to create quiz');
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
      <div
        style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create New Quiz</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: '0.5rem',
              borderRadius: '0.375rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Debug Info */}
        <div style={{ 
          padding: '1rem', 
          background: '#f3f4f6', 
          borderRadius: '0.5rem', 
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          <div><strong>Selected Questions:</strong> {selectedQuestions.length}/20</div>
          <div><strong>Validation:</strong> {selectedQuestions.length >= 1 && selectedQuestions.length <= 20 ? '✅ Valid' : '❌ Invalid'}</div>
          <div><strong>Missing Answers:</strong> {selectedQuestions.filter(q => preferredAnswers[q.id] === undefined).length}</div>
          <div><strong>Available Questions:</strong> {questions.length} total in bank</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quiz Name */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Quiz Name (e.g., "Quiz for Ayo")
            </label>
            <input
              type="text"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="Quiz for..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          {/* Quiz Image */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
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
                      borderRadius: '0.5rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: '#ef4444',
                      border: 'none',
                      color: 'white',
                      padding: '0.25rem',
                      borderRadius: '50%',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label style={{ 
                  width: '100%', 
                  height: '128px', 
                  border: '2px dashed #e5e7eb', 
                  borderRadius: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <Upload size={24} style={{ margin: '0 auto 0.5rem', color: '#9ca3af' }} />
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Click to upload image</span>
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

          {/* Questions Selection */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                Select Questions ({selectedQuestions.length}/20 selected)
              </label>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Choose 1-20 questions
              </span>
            </div>
            
            <div style={{ 
              padding: '0.75rem', 
              background: '#f0f9ff', 
              border: '1px solid #bae6fd', 
              borderRadius: '0.5rem', 
              marginBottom: '1rem',
              fontSize: '0.75rem',
              color: '#0369a1'
            }}>
              💡 <strong>Tip:</strong> Choose questions that best represent your preferences. With freemium limits, make each question count!
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
              {questions.map((question) => {
                const isSelected = selectedQuestions.find(q => q.id === question.id);
                const isExpanded = expandedQuestion === question.id;
                
                return (
                  <div
                    key={question.id}
                    style={{ borderBottom: '1px solid #e5e7eb' }}
                  >
                    {/* Question Header */}
                    <div
                      style={{
                        padding: '1rem',
                        cursor: 'pointer',
                        background: isSelected ? '#f0f9ff' : 'white',
                        borderLeft: isSelected ? '4px solid #00cecb' : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => toggleQuestion(question)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            style={{ margin: 0 }}
                          />
                          <span style={{ fontWeight: 500, color: '#374151' }}>
                            {question.question}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                          {question.options.length} options
                        </div>
                      </div>
                      
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandedQuestion(question.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '0.25rem'
                          }}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      )}
                    </div>

                    {/* Preferred Answer Selection */}
                    {isSelected && isExpanded && (
                      <div style={{ padding: '1rem', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                        <p style={{ fontWeight: 600, color: '#374151', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
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
                                background: preferredAnswers[question.id] === index ? '#e0f2fe' : 'white',
                                border: preferredAnswers[question.id] === index ? '1px solid #00cecb' : '1px solid #e5e7eb'
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
                              <span style={{ flex: 1, fontSize: '0.875rem' }}>{option}</span>
                              {preferredAnswers[question.id] === index && (
                                <CheckCircle size={16} style={{ color: '#00cecb' }} />
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
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '0.5rem', 
              color: '#dc2626',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.875rem 1.75rem',
                borderRadius: '9999px',
                fontWeight: 600,
                border: '2px solid #e5e7eb',
                background: 'white',
                color: '#374151',
                cursor: 'pointer'
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
                background: loading || selectedQuestions.length < 1 ? '#9ca3af' : '#00cecb',
                color: 'white',
                cursor: loading || selectedQuestions.length < 1 ? 'not-allowed' : 'pointer',
                opacity: loading || selectedQuestions.length < 1 ? 0.5 : 1
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

export default CreateQuizModal;