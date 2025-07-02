// Script to delete all quizzes from Firebase database
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

async function deleteAllQuizzes() {
  try {
    console.log('🔍 Fetching all quizzes from database...');
    
    // Get all quizzes
    const quizzesRef = collection(db, 'quizzes');
    const querySnapshot = await getDocs(quizzesRef);
    
    console.log(`📊 Found ${querySnapshot.size} quizzes in database`);
    
    if (querySnapshot.size === 0) {
      console.log('✅ No quizzes found to delete');
      return;
    }
    
    // Delete each quiz
    const deletePromises = [];
    querySnapshot.forEach((docSnapshot) => {
      const quizId = docSnapshot.id;
      const quizData = docSnapshot.data();
      console.log(`🗑️  Deleting quiz: ${quizId} - "${quizData.name}" (${quizData.questions?.length || 0} questions)`);
      
      deletePromises.push(deleteDoc(doc(db, 'quizzes', quizId)));
    });
    
    // Wait for all deletions to complete
    await Promise.all(deletePromises);
    
    console.log('✅ Successfully deleted all quizzes from database');
    console.log('🎉 Database is now clean! You can create new quizzes.');
    
  } catch (error) {
    console.error('❌ Error deleting quizzes:', error);
  }
}

// Run the deletion
deleteAllQuizzes(); 