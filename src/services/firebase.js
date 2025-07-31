// Firebase configuration and services
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Authentication functions
export const signUpWithEmail = async (email, password, name, profilePicture = null) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    let profilePictureURL = null;
    
    // Upload profile picture if provided
    if (profilePicture) {
      const storageRef = ref(storage, `profile-pictures/${user.uid}/${profilePicture.name}`);
      const snapshot = await uploadBytes(storageRef, profilePicture);
      profilePictureURL = await getDownloadURL(snapshot.ref);
    }
    
    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      profilePicture: profilePictureURL,
      subscription: 'free',
      activeLinks: 0,
      totalQuizzes: 0,
      totalResponses: 0,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    console.log('Google Auth - User UID:', user.uid);
    
    // Simple logic: only create user if they don't exist
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      // Create new user document
      const newUserData = {
        name: user.displayName,
        email: user.email,
        profilePicture: user.photoURL,
        subscription: 'free',
        activeLinks: 0,
        totalQuizzes: 0,
        totalResponses: 0,
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid), newUserData);
      console.log('Google Auth: Created new user with data:', newUserData);
    } else {
      const existingData = userDoc.data();
      console.log('Google Auth: Existing user found with data:', existingData);
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// User data functions
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserName = async (userId, name) => {
  try {
    await updateDoc(doc(db, 'users', userId), { name });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserProfilePicture = async (userId, file) => {
  try {
    // Upload image to Firebase Storage
    const storageRef = ref(storage, `profile-pictures/${userId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update user document with new profile picture URL
    await updateDoc(doc(db, 'users', userId), { 
      profilePicture: downloadURL,
      updatedAt: serverTimestamp()
    });
    
    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};



// Quiz functions
export const createQuiz = async (userId, questions, quizName, quizImage = null) => {
  try {
    console.log('=== CREATING QUIZ ===');
    console.log('Creating quiz with data:', { userId, questions, quizName });
    console.log('Number of questions to save:', questions.length);
    console.log('Selected question IDs:', questions.map(q => q.id));
    console.log('Selected question texts:', questions.map(q => q.question.substring(0, 50) + '...'));
    
    const quizId = generateQuizId();
    const quizData = {
      id: quizId,
      userId,
      name: quizName,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        preferredAnswer: q.preferredAnswer // Add preferred answer for scoring
      })),
      createdAt: new Date().toISOString(),
      responses: [],
      imageURL: null
    };

    console.log('=== QUIZ DATA TO SAVE ===');
    console.log('Quiz data to save:', quizData);
    console.log('Questions array length:', quizData.questions.length);
    console.log('Questions in quiz data:', quizData.questions.map(q => ({ id: q.id, question: q.question.substring(0, 30) + '...' })));

    // Upload image if provided
    if (quizImage) {
      const imageUrl = await uploadQuizImage(quizId, quizImage);
      quizData.imageURL = imageUrl;
    }

    // Save to Firestore
    await setDoc(doc(db, 'quizzes', quizId), quizData);

    console.log('=== QUIZ CREATED SUCCESSFULLY ===');
    console.log('Quiz created successfully with ID:', quizId);
    console.log('Final quiz data saved:', quizData);
    return { success: true, quizId, data: quizData };
  } catch (error) {
    console.error('Error creating quiz:', error);
    return { success: false, error: error.message };
  }
};

export const updateQuizImage = async (quizId, file) => {
  try {
    // Upload new image
    const storageRef = ref(storage, `quiz-images/${quizId}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update quiz document
    await updateDoc(doc(db, 'quizzes', quizId), { 
      imageURL: downloadURL,
      updatedAt: serverTimestamp()
    });
    
    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteQuizImage = async (quizId, currentImageURL) => {
  try {
    // Delete from Storage if URL exists
    if (currentImageURL) {
      const storageRef = ref(storage, currentImageURL);
      await deleteObject(storageRef);
    }
    
    // Remove from quiz document
    await updateDoc(doc(db, 'quizzes', quizId), { 
      imageURL: null,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getQuiz = async (quizId) => {
  try {
    console.log('=== FETCHING QUIZ ===');
    console.log('Fetching quiz with ID:', quizId);
    
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    if (quizDoc.exists()) {
      const quizData = quizDoc.data();
      console.log('=== QUIZ DATA RETRIEVED ===');
      console.log('Quiz data retrieved:', quizData);
      console.log('Questions array length:', quizData.questions?.length);
      console.log('Questions in retrieved data:', quizData.questions?.map(q => ({ id: q.id, question: q.question.substring(0, 30) + '...' })));
      console.log('Quiz name:', quizData.name);
      console.log('Quiz ID:', quizData.id);
      
      return { success: true, data: quizData };
    }
    console.log('Quiz not found in database');
    return { success: false, error: 'Quiz not found' };
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return { success: false, error: error.message };
  }
};

export const getUserQuizzes = async (userId) => {
  try {
    const quizzesQuery = query(collection(db, 'quizzes'), where('userId', '==', userId));
    const querySnapshot = await getDocs(quizzesQuery);
    const quizzes = [];
    querySnapshot.forEach((doc) => {
      quizzes.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: quizzes };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Results functions
export const saveQuizResult = async (quizId, userId, respondentName, answers, score) => {
  try {
    console.log('Saving quiz result:', { quizId, userId, respondentName, answers, score });
    
    // Check if this quiz has already been taken by this respondent (one attempt per quiz)
    const quizRef = doc(db, 'quizzes', quizId);
    const quizDoc = await getDoc(quizRef);
    
    if (!quizDoc.exists()) {
      console.error('Quiz not found:', quizId);
      return { success: false, error: 'Quiz not found' };
    }

    const quizData = quizDoc.data();
    console.log('Quiz data retrieved:', quizData);
    
    const existingResponse = quizData.responses?.find(r => r.respondentName === respondentName);
    
    if (existingResponse) {
      console.log('User already took this quiz:', respondentName);
      return { success: false, error: 'You have already taken this quiz' };
    }

    // Add new response
    const newResponse = {
      id: generateQuizId(),
      respondentName,
      answers,
      score,
      submittedAt: new Date().toISOString()
    };

    console.log('New response to save:', newResponse);

    const updatedResponses = [...(quizData.responses || []), newResponse];
    console.log('Updated responses array:', updatedResponses);
    
    await updateDoc(quizRef, {
      responses: updatedResponses
    });

    console.log('Quiz result saved successfully');
    return { success: true, responseId: newResponse.id };
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return { success: false, error: error.message };
  }
};

export const getQuizResults = async (quizId) => {
  try {
    const resultsQuery = query(collection(db, 'results'), where('quizId', '==', quizId));
    const querySnapshot = await getDocs(resultsQuery);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Subscription functions
export const updateUserSubscription = async (userId, subscription) => {
  try {
    await updateDoc(doc(db, 'users', userId), { subscription });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Auth state listener
export const listenToAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Utility functions
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid image file (JPEG, PNG, or WebP)' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }
  
  return { valid: true };
};

export const compressImage = async (file, maxWidth = 400, quality = 0.6) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // More aggressive compression for profile pictures
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now()
        });
        resolve(compressedFile);
      }, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Database structure reference
export const DATABASE_STRUCTURE = {
  users: {
    '[userId]': {
      name: 'string',
      email: 'string',
      profilePicture: 'string (URL)',
      subscription: 'free | premium',
      activeLinks: 'number',
      totalQuizzes: 'number',
      totalResponses: 'number',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },
  quizzes: {
    '[quizId]': {
      userId: 'string',
      name: 'string',
      questions: 'array',
      imageURL: 'string (URL)',
      active: 'boolean',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },
  results: {
    '[resultId]': {
      quizId: 'string',
      userId: 'string',
      respondentName: 'string',
      answers: 'array',
      score: 'number',
      timestamp: 'timestamp'
    }
  }
};

// Helper function to generate unique quiz ID
const generateQuizId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Upload quiz image to Firebase Storage
const uploadQuizImage = async (quizId, imageFile) => {
  try {
    const storageRef = ref(storage, `quiz-images/${quizId}/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading quiz image:', error);
    throw error;
  }
};

// Delete a quiz
export const deleteQuiz = async (quizId) => {
  try {
    // Get quiz data to check for image
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    if (!quizDoc.exists()) {
      return { success: false, error: 'Quiz not found' };
    }

    const quizData = quizDoc.data();
    
    // Delete quiz image if it exists
    if (quizData.imageURL) {
      try {
        const imageRef = ref(storage, quizData.imageURL);
        await deleteObject(imageRef);
      } catch (error) {
        console.error('Error deleting quiz image:', error);
        // Continue with quiz deletion even if image deletion fails
      }
    }

    // Delete quiz document
    await deleteDoc(doc(db, 'quizzes', quizId));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return { success: false, error: error.message };
  }
};

export { auth, db }; 

// Firebase Storage functions for profile pictures
export const uploadUserProfilePicture = async (file, userId) => {
  try {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `profile-pictures/${userId}/${fileName}`);
    
    // Upload the file with metadata
    const metadata = {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000',
    };
    
    const snapshot = await uploadBytes(storageRef, file, metadata);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

export const deleteUserProfilePicture = async (imageUrl) => {
  try {
    if (!imageUrl || imageUrl.includes('googleusercontent.com')) {
      // Skip deletion for Google profile images or empty URLs
      return;
    }



    // If we receive a full HTTP(S) download URL, convert it to the corresponding
    // Storage path ("profile-pictures/uid/filename.ext") so that Security Rules
    // are evaluated against the correct location. Using the raw download URL in
    // ref() sometimes results in a generic "storage/unauthorized" error.
    let imageRef;
    if (imageUrl.startsWith('http')) {
      try {
        const decoded = decodeURIComponent(imageUrl);
        // URL format: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<FULL_PATH>?alt=media&token=...
        const pathStart = decoded.indexOf('/o/') + 3;
        const pathEnd = decoded.indexOf('?', pathStart);
        const fullPath = decoded.substring(pathStart, pathEnd);
        imageRef = ref(storage, fullPath);
      } catch (parseErr) {
        console.warn('Failed to parse storage path from URL, falling back to direct ref:', parseErr);
        imageRef = ref(storage, imageUrl);
      }
    } else {
      imageRef = ref(storage, imageUrl);
    }

    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    // Suppress deletion errors so they don't interrupt the user flow
  }
}; 