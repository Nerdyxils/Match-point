// App.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './services/firebase';
import LandingPage from './components/LandingPage';
import NameInputPage from './components/NameInputPage';
import OnboardingPage from './components/OnboardingPage';
import DashboardPage from './components/DashboardPage';
import QuizLandingPage from './components/QuizLandingPage';
import QuizPage from './components/QuizPage';
import ResultPage from './components/ResultPage';
import SubscriptionPage from './components/SubscriptionPage';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRedirect from './components/AuthRedirect';
import './styles/global.css';

// Create authentication context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userInfo = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          firstName: (firebaseUser.displayName || firebaseUser.email).split(' ')[0],
          lastName: (firebaseUser.displayName || firebaseUser.email).split(' ').slice(1).join(' ')
        };
        console.log('Auth state listener - userInfo:', userInfo);
        setUser(userInfo);
        
        // Load user data from Firebase
        try {
          console.log('Auth state listener - fetching user data for UID:', firebaseUser.uid);
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const firebaseUserData = userDoc.data();
            console.log('Existing user data loaded:', firebaseUserData);
            console.log('onboardingCompleted value:', firebaseUserData.onboardingCompleted);
            console.log('onboardingCompleted type:', typeof firebaseUserData.onboardingCompleted);
            setUserData(firebaseUserData);
            localStorage.setItem('userData', JSON.stringify(firebaseUserData));
          } else {
            // This should not happen for Google Auth since signInWithGoogle creates the user
            // This is a fallback for other auth methods
            const defaultUserData = {
              name: userInfo.name,
              email: userInfo.email,
              subscription: 'free',
              activeLinks: 0,
              totalQuizzes: 0,
              totalResponses: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              onboardingCompleted: false
            };
            
            // Save default data to Firebase
            try {
              await setDoc(userRef, defaultUserData);
              console.log('Fallback: New user data created:', defaultUserData);
            } catch (saveError) {
              console.error('Error saving default user data:', saveError);
            }
            
            setUserData(defaultUserData);
            localStorage.setItem('userData', JSON.stringify(defaultUserData));
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          // Fallback to localStorage
          const storedUserData = localStorage.getItem('userData');
          if (storedUserData) {
            try {
              const parsedData = JSON.parse(storedUserData);
              console.log('Fallback: Loading from localStorage:', parsedData);
              setUserData(parsedData);
            } catch (parseError) {
              console.error('Error parsing stored user data:', parseError);
            }
          }
        }
      } else {
        // User is signed out
        setUser(null);
        setUserData(null);
        localStorage.removeItem('userData');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userInfo) => {
    console.log('LOGIN FUNCTION CALLED with userInfo:', userInfo);
    
    // Don't overwrite existing user data if user already has a UID (from Firebase Auth)
    if (userInfo.uid && userInfo.uid.startsWith('manual_') === false) {
      console.log('LOGIN FUNCTION: User has Firebase UID, not overwriting data');
      return;
    }
    
    // Generate a unique ID for manual flow users if they don't have one
    const userWithUid = {
      ...userInfo,
      uid: userInfo.uid || `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    setUser(userWithUid);
    // Store additional user data in localStorage
    const userData = {
      name: userInfo.name,
      email: userInfo.email,
      subscription: 'free',
      activeLinks: 0,
      totalQuizzes: 0,
      totalResponses: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      onboardingCompleted: false // Default to false for new users
    };
    console.log('LOGIN FUNCTION setting userData:', userData);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUserData(userData);
  };

  const logout = () => {
    setUser(null);
    setUserData(null);
    localStorage.removeItem('userData');
    // Navigate to landing page after logout
    window.location.href = '/';
  };

  const updateUserData = async (data) => {
    try {
      if (user?.uid) {
        // Save to Firebase
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, data, { merge: true });
      } else {
        throw new Error('No user UID available');
      }
      
      // Update local state
      setUserData(data);
      localStorage.setItem('userData', JSON.stringify(data));
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  const authValue = {
    user,
    userData,
    login,
    logout,
    updateUserData,
    setUserData,
    loading
  };

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

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/name-input" element={<NameInputPage />} />
            <Route path="/onboarding" element={
              <ProtectedRoute requireOnboarding={true}>
                <OnboardingPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/auth-redirect" element={
              <ProtectedRoute>
                <AuthRedirect />
              </ProtectedRoute>
            } />
            <Route path="/quiz/:quizId" element={<QuizLandingPage />} />
            <Route path="/quiz/:quizId/take" element={<QuizPage />} />
            <Route path="/result/:quizId" element={<ResultPage />} />
            <Route path="/subscription" element={
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;