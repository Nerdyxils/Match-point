const { execSync } = require('child_process');

console.log('Deploying Firebase Storage CORS configuration...');

try {
  // Deploy storage rules
  execSync('firebase deploy --only storage', { stdio: 'inherit' });
  console.log('✅ Firebase Storage rules deployed successfully');
} catch (error) {
  console.error('❌ Failed to deploy Firebase Storage rules:', error.message);
  console.log('\nTo fix CORS issues manually:');
  console.log('1. Go to Firebase Console > Storage > Rules');
  console.log('2. Make sure the rules allow authenticated users to read/write');
  console.log('3. For development, you may need to temporarily allow all access');
} 