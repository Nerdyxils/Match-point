import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const AuthRedirect = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();

  useEffect(() => {
    // Redirect based on onboarding status
    if (userData?.onboardingCompleted) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/onboarding', { replace: true });
    }
  }, [userData, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <div className="spinner" />
    </div>
  );
};

export default AuthRedirect; 