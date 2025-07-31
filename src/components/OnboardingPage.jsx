import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  Camera, 
  ArrowRight, 
  ArrowLeft, 
  Heart, 
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../App';
import { compressImage, uploadUserProfilePicture } from '../services/firebase';
import '../styles/OnboardingPage.css';

const OnboardingPage = () => {

  const { user, userData, updateUserData } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const hasImportedGooglePhoto = useRef(false);

  
  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    age: '',
    photo: null,
    photoUrl: user?.photoURL || ''
  });

  // Preference data
  const [preferences, setPreferences] = useState({
    gender: '',
    ageRange: {
      min: 18,
      max: 35
    },
    interests: []
  });

  const [errors, setErrors] = useState({});

  // Interest options
  const interestOptions = [
    'Travel', 'Music', 'Movies', 'Reading', 'Cooking', 'Sports',
    'Art', 'Technology', 'Fitness', 'Photography', 'Gaming', 'Dancing',
    'Hiking', 'Yoga', 'Fashion', 'Pets', 'Food', 'Writing'
  ];

  // Gender options
  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

  useEffect(() => {
    // Import Google photo if available (only once)
    if (user?.photoURL && !hasImportedGooglePhoto.current) {
      hasImportedGooglePhoto.current = true;
      setProfileData(prev => ({
        ...prev,
        photoUrl: user.photoURL
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Compress the image
      const compressedFile = await compressImage(file);
      
      // Upload to Firebase Storage
      const downloadURL = await uploadUserProfilePicture(compressedFile, user.uid);
      
      setProfileData(prev => ({
        ...prev,
        photo: compressedFile,
        photoUrl: downloadURL
      }));
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    }
  };

  const removePhoto = () => {
    setProfileData(prev => ({
      ...prev,
      photo: null,
      photoUrl: ''
    }));
  };

  const handleInterestToggle = (interest) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAgeRangeChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    setPreferences(prev => ({
      ...prev,
      ageRange: {
        ...prev.ageRange,
        [type]: numValue
      }
    }));
  };

  const validateProfileStep = () => {
    const newErrors = {};
    
    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!profileData.age) {
      newErrors.age = 'Age is required';
    } else if (parseInt(profileData.age) < 18 || parseInt(profileData.age) > 100) {
      newErrors.age = 'Age must be between 18 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePreferencesStep = () => {
    if (preferences.interests.length < 3) {
      alert('Please select at least 3 interests');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateProfileStep()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validatePreferencesStep()) {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save profile and preferences to Firebase
      const updatedUserData = {
        ...userData,
        profile: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          age: parseInt(profileData.age) || 0,
          photoUrl: profileData.photoUrl,
          gender: preferences.gender,
          ageRange: preferences.ageRange,
          interests: preferences.interests
        },
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      };
      
      await updateUserData(updatedUserData);
      
      // Navigate to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      alert(`Error saving your profile: ${error.message}. Please try again.`);
    }
  };

  const ProfileStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="onboarding-step"
    >
      <div className="step-header">
        <h2>Tell us about yourself</h2>
        <p>Let's start with the basics</p>
      </div>

      <div className="form-section">
        <div className="photo-upload-section">
          <label className="photo-upload-label">
            {profileData.photoUrl ? (
              <div className="photo-preview">
                <img src={profileData.photoUrl} alt="Profile" />
                <button 
                  type="button" 
                  className="remove-photo-btn"
                  onClick={removePhoto}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="photo-upload-placeholder">
                <Camera size={32} />
                <span>Upload Photo</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={profileData.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={profileData.lastName}
              onChange={handleInputChange}
              placeholder="Enter your last name"
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            name="age"
            value={profileData.age}
            onChange={handleInputChange}
            placeholder="Enter your age"
            min="18"
            max="100"
            className={errors.age ? 'error' : ''}
          />
          {errors.age && <span className="error-text">{errors.age}</span>}
        </div>
      </div>
    </motion.div>
  );

  const PreferencesStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="onboarding-step"
    >
      <div className="step-header">
        <h2>What are you looking for?</h2>
        <p>Help us find your perfect matches</p>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label>I am a</label>
          <div className="radio-group">
            {genderOptions.map(gender => (
              <label key={gender} className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value={gender}
                  checked={preferences.gender === gender}
                  onChange={(e) => setPreferences(prev => ({ ...prev, gender: e.target.value }))}
                />
                <span className="radio-custom"></span>
                {gender}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Age Range I'm interested in</label>
          <div className="age-range-section">
            <div className="age-input">
              <input
                type="number"
                value={preferences.ageRange.min}
                onChange={(e) => handleAgeRangeChange('min', e.target.value)}
                min="18"
                max={preferences.ageRange.max}
              />
              <span>to</span>
              <input
                type="number"
                value={preferences.ageRange.max}
                onChange={(e) => handleAgeRangeChange('max', e.target.value)}
                min={preferences.ageRange.min}
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Interests (select at least 3)</label>
          <div className="interests-grid">
            {interestOptions.map(interest => (
              <button
                key={interest}
                type="button"
                className={`interest-tag ${preferences.interests.includes(interest) ? 'selected' : ''}`}
                onClick={() => handleInterestToggle(interest)}
              >
                {interest}
                {preferences.interests.includes(interest) && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <div className="brand-section">
            <Heart className="brand-icon" />
            <h1>MatchPoint</h1>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
          
          <div className="step-indicator">
            Step {currentStep} of 2
          </div>
        </div>

        <div className="onboarding-content">
          <AnimatePresence mode="wait">
            {currentStep === 1 ? <ProfileStep key="profile" /> : <PreferencesStep key="preferences" />}
          </AnimatePresence>
        </div>

        <div className="onboarding-actions">
          {currentStep > 1 && (
            <button 
              className="btn-secondary" 
              onClick={handleBack}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}
          
          <button 
            className="btn-primary" 
            onClick={handleNext}
          >
            {currentStep === 2 ? (
              <>
                Complete Setup
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                Next
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage; 