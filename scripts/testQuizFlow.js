// Test script to verify quiz creation and retrieval
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');
require('dotenv').config();

// Your Firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testQuizFlow() {
  try {
    console.log('🔍 Testing quiz flow...');
    
    // Get all quizzes
    const quizzesRef = collection(db, 'quizzes');
    const querySnapshot = await getDocs(quizzesRef);
    
    console.log(`📊 Found ${querySnapshot.size} quizzes in database`);
    
    if (querySnapshot.size > 0) {
      querySnapshot.forEach((docSnapshot) => {
        const quizId = docSnapshot.id;
        const quizData = docSnapshot.data();
        console.log(`\n📝 Quiz: ${quizId}`);
        console.log(`   Name: ${quizData.name}`);
        console.log(`   Questions: ${quizData.questions?.length || 0}`);
        console.log(`   Question IDs: ${quizData.questions?.map(q => q.id).join(', ')}`);
        console.log(`   Created: ${quizData.createdAt}`);
      });
    } else {
      console.log('✅ No quizzes found - database is clean');
    }
    
  } catch (error) {
    console.error('❌ Error testing quiz flow:', error);
  }
}

// Run the test
testQuizFlow(); 