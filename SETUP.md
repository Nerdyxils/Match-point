# MatchPoint Setup Guide

## Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter project name (e.g., "matchpoint-app")
   - Follow setup wizard

2. **Enable Authentication**
   - In Firebase Console, go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google (add your domain to authorized domains)

3. **Create Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Select a location close to your users

4. **Get Firebase Config**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click "Add app" > Web
   - Copy the config object

5. **Update Firebase Rules**
   ```javascript
   // Firestore Rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Users can read/write their own quizzes
       match /quizzes/{quizId} {
         allow read, write: if request.auth != null && 
           (resource.data.userId == request.auth.uid || 
            resource.data.active == true);
       }
       
       // Users can read/write results for their quizzes
       match /results/{resultId} {
         allow read, write: if request.auth != null && 
           (resource.data.userId == request.auth.uid || 
            exists(/databases/$(database)/documents/quizzes/$(resource.data.quizId)));
       }
     }
   }
   ```

## EmailJS Setup

1. **Create EmailJS Account**
   - Go to [EmailJS](https://www.emailjs.com/)
   - Sign up for a free account

2. **Add Email Service**
   - Go to Email Services
   - Add your email provider (Gmail, Outlook, etc.)
   - Follow the setup instructions

3. **Create Email Template**
   - Go to Email Templates
   - Create a new template for quiz results
   - Use these variables in your template:
     - `{{user_name}}` - Quiz creator's name
     - `{{respondent_name}}` - Person who took the quiz
     - `{{score}}` - Compatibility score
     - `{{quiz_name}}` - Name of the quiz
     - `{{date}}` - Date and time
     - `{{message}}` - Custom message based on score

4. **Get Credentials**
   - Service ID: Found in Email Services
   - Template ID: Found in Email Templates
   - User ID: Found in Account > API Keys

## Stripe Setup (for Premium Features)

1. **Create Stripe Account**
   - Go to [Stripe](https://stripe.com/)
   - Sign up for an account
   - Complete account verification

2. **Get API Keys**
   - Go to Developers > API Keys
   - Copy your publishable key (starts with `pk_test_` or `pk_live_`)

3. **Create Product and Price**
   - Go to Products
   - Create a new product called "MatchPoint Premium"
   - Add a recurring price of $10/month
   - Copy the price ID (starts with `price_`)

4. **Update Stripe Configuration**
   - Update `REACT_APP_STRIPE_PUBLISHABLE_KEY` in your `.env` file
   - Update the price ID in `src/services/stripe.js`

## Google Analytics Setup (Optional)

1. **Create Google Analytics Account**
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create a new property for your website

2. **Get Tracking ID**
   - Copy the tracking ID (starts with `G-`)
   - Add it to your `.env` file

## Deployment

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Environment Variables in Production

For Firebase Hosting, you can set environment variables using:
```bash
firebase functions:config:set stripe.publishable_key="pk_live_your_key"
```

## Testing

The app includes demo data for testing. You can:

1. Use the demo credentials in the services
2. Test the quiz creation flow
3. Test the quiz taking flow
4. Test the premium upgrade flow

## Security Checklist

- [ ] Firebase rules are properly configured
- [ ] Environment variables are set
- [ ] CORS policies are configured
- [ ] Input validation is implemented
- [ ] Rate limiting is in place
- [ ] SSL certificate is installed
- [ ] API keys are secured

## Troubleshooting

### Common Issues

1. **Firebase Authentication Not Working**
   - Check if authentication is enabled in Firebase Console
   - Verify your domain is in authorized domains
   - Check browser console for errors

2. **EmailJS Not Sending**
   - Verify your email service is connected
   - Check template variables are correct
   - Test with EmailJS dashboard

3. **Stripe Payments Failing**
   - Use test keys for development
   - Check webhook endpoints are configured
   - Verify price IDs are correct

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check all environment variables are set
   - Verify all dependencies are installed

## Support

For additional help:
- Check the Firebase documentation
- Review EmailJS tutorials
- Consult Stripe documentation
- Create an issue in the repository 