// EmailJS service for sending notifications
import emailjs from '@emailjs/browser';

// TODO: Replace with your actual EmailJS credentials
const EMAILJS_CONFIG = {
  serviceId: 'demo-service-id-replace-with-actual',
  templateId: 'demo-template-id-replace-with-actual',
  userId: 'demo-user-id-replace-with-actual'
};

export const sendQuizResultEmail = async (quizCreatorEmail, respondentName, score, quizName) => {
  try {
    const templateParams = {
      to_email: quizCreatorEmail,
      respondent_name: respondentName,
      score: score,
      quiz_name: quizName,
      date: new Date().toLocaleString(),
      message: score >= 70 
        ? `Great news! ${respondentName} scored ${score}% on your quiz "${quizName}". They might be a great match! 💕`
        : `${respondentName} scored ${score}% on your quiz "${quizName}". Keep looking for your perfect match! 💫`
    };

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.userId
    );

    return { success: true, result };
  } catch (error) {
    console.error('EmailJS error:', error);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const templateParams = {
      to_email: userEmail,
      user_name: userName,
      date: new Date().toLocaleString(),
      message: `Welcome to MatchPoint, ${userName}! Start creating your compatibility quizzes and find your perfect match. 💫`
    };

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'welcome-template-id', // You'll need to create this template
      templateParams,
      EMAILJS_CONFIG.userId
    );

    return { success: true, result };
  } catch (error) {
    console.error('EmailJS error:', error);
    return { success: false, error: error.message };
  }
}; 