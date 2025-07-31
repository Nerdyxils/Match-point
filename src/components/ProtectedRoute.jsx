import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../App';

const ProtectedRoute = ({ children, requireOnboarding = false }) => {
  const { user, userData, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
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
  }

  // If no user, redirect to landing page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Simple logic: Check onboarding status
  if (userData) {
    console.log('ProtectedRoute - userData:', userData);
    console.log('ProtectedRoute - requireOnboarding:', requireOnboarding);
    
    // Handle different data types for onboardingCompleted
    const hasCompletedOnboarding = userData.onboardingCompleted === true || userData.onboardingCompleted === 'true';
    
    if (hasCompletedOnboarding) {
      // User has completed onboarding
      if (requireOnboarding) {
        // User trying to access onboarding page but already completed it
        console.log('User completed onboarding, redirecting to dashboard');
        return <Navigate to="/dashboard" replace />;
      }
      // User can access protected routes (dashboard, etc.)
    } else {
      // User hasn't completed onboarding
      if (!requireOnboarding) {
        // User trying to access protected routes but hasn't completed onboarding
        console.log('User needs onboarding, redirecting to onboarding page');
        return <Navigate to="/onboarding" replace />;
      }
      // User can access onboarding page
    }
  }

  return children;
};

export default ProtectedRoute; 