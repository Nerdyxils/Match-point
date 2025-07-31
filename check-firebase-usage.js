const { execSync } = require('child_process');

console.log('Checking Firebase project usage...\n');

try {
  // Check if Firebase CLI is installed
  execSync('firebase --version', { stdio: 'pipe' });
  
  console.log('Firebase CLI is installed. Checking project status...');
  
  // Get project info
  const projectInfo = execSync('firebase projects:list', { encoding: 'utf8' });
  console.log('Available projects:');
  console.log(projectInfo);
  
  console.log('\nTo check quota usage:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project: matchpoint-app-584bd');
  console.log('3. Go to Usage and billing > Details & settings');
  console.log('4. Check Firestore and Storage usage');
  
  console.log('\nTo fix quota issues:');
  console.log('1. Upgrade to Blaze plan (pay-as-you-go)');
  console.log('2. Or wait for quota reset (usually monthly)');
  console.log('3. Or reduce usage by optimizing data size');
  
} catch (error) {
  console.error('Firebase CLI not found. Please install it:');
  console.log('npm install -g firebase-tools');
  console.log('firebase login');
  console.log('firebase use matchpoint-app-584bd');
} 