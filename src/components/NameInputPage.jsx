// components/NameInputPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight, Heart } from 'lucide-react';
import Button from './ui/button';
import Input from './ui/Input';
import { useAuth } from '../App';
import '../styles/NameInputPage.css';

export default function NameInputPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the authentication context to login
      const fullName = `${formData.firstName} ${formData.lastName}`;
      login({
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: fullName
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/onboarding');
    } catch (error) {
      console.error('Error saving name:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="name-input-page">
      <div className="name-input-container">
      <motion.div
          className="name-input-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
      >
          <div className="header-section">
            <motion.div
              className="brand-logo"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Heart className="brand-icon" />
              <h1 className="brand-title">MatchPoint</h1>
            </motion.div>
            
            <motion.h2
              className="page-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Let's Get Started
            </motion.h2>
            
            <motion.p
              className="page-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Please enter your name to begin your compatibility quiz
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="name-form">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Input
                label="First Name"
              type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              placeholder="Enter your first name"
                required
                icon={User}
                error={errors.firstName}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Input
                label="Last Name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                required
                icon={User}
                error={errors.lastName}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                className="submit-btn"
              >
                <span>Continue to Quiz</span>
                <ArrowRight size={20} />
            </Button>
            </motion.div>
          </form>

          <motion.div
            className="info-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <p className="info-text">
              Your information is secure and will only be used for the compatibility assessment.
            </p>
          </motion.div>
        </motion.div>
        </div>
    </div>
  );
}