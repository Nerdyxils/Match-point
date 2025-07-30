// App.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import LandingPage from './components/LandingPage';
import NameInputPage from './components/NameInputPage';
import DashboardPage from './components/DashboardPage';
import QuizLandingPage from './components/QuizLandingPage';
import QuizPage from './components/QuizPage';
import ResultPage from './components/ResultPage';
import SubscriptionPage from './components/SubscriptionPage';
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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userInfo = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email,
          email: firebaseUser.email,
          firstName: (firebaseUser.displayName || firebaseUser.email).split(' ')[0],
          lastName: (firebaseUser.displayName || firebaseUser.email).split(' ').slice(1).join(' ')
        };
        setUser(userInfo);
        
        // Load additional user data from localStorage if available
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          try {
            setUserData(JSON.parse(storedUserData));
          } catch (error) {
            console.error('Error parsing stored user data:', error);
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
    setUser(userInfo);
    // Store additional user data in localStorage
    localStorage.setItem('userData', JSON.stringify({
      name: userInfo.name,
      email: userInfo.email,
      subscription: 'free',
      activeLinks: 0,
      totalQuizzes: 0,
      totalResponses: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  };

  const logout = () => {
    setUser(null);
    setUserData(null);
    localStorage.removeItem('userData');
    // Navigate to landing page after logout
    window.location.href = '/';
  };

  const updateUserData = (data) => {
    setUserData(data);
    localStorage.setItem('userData', JSON.stringify(data));
  };

  const authValue = {
    user,
    userData,
    login,
    logout,
    updateUserData,
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/quiz/:quizId" element={<QuizLandingPage />} />
            <Route path="/quiz/:quizId/take" element={<QuizPage />} />
            <Route path="/result/:quizId" element={<ResultPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;