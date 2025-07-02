// Script to check quizzes in the database
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkQuizzes() {
  try {
    console.log('=== CHECKING QUIZZES IN DATABASE ===');
    
    const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));
    
    if (quizzesSnapshot.empty) {
      console.log('No quizzes found in database');
      return;
    }
    
    console.log(`Found ${quizzesSnapshot.size} quiz(zes) in database:`);
    console.log('');
    
    quizzesSnapshot.forEach((doc) => {
      const quiz = doc.data();
      console.log(`Quiz ID: ${doc.id}`);
      console.log(`Name: ${quiz.name}`);
      console.log(`User ID: ${quiz.userId}`);
      console.log(`Questions count: ${quiz.questions?.length || 0}`);
      console.log(`Created: ${quiz.createdAt}`);
      
      if (quiz.questions && quiz.questions.length > 0) {
        console.log('First few questions:');
        quiz.questions.slice(0, 3).forEach((q, index) => {
          console.log(`  ${index + 1}. ${q.question.substring(0, 50)}...`);
        });
        if (quiz.questions.length > 3) {
          console.log(`  ... and ${quiz.questions.length - 3} more questions`);
        }
      }
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error checking quizzes:', error);
  }
}

checkQuizzes(); 