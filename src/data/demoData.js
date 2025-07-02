// Demo data for testing the MatchPoint application
export const demoUsers = [
  {
    userId: "demo1",
    name: "Alex",
    email: "alex@demo.com",
    subscription: "free",
    createdAt: "2025-01-26",
    activeLinks: 1
  },
  {
    userId: "demo2", 
    name: "Emma",
    email: "emma@demo.com",
    subscription: "premium",
    createdAt: "2025-01-26",
    activeLinks: 0
  },
  {
    userId: "demo3",
    name: "Sarah",
    email: "sarah@demo.com", 
    subscription: "free",
    createdAt: "2025-01-26",
    activeLinks: 0
  }
];

export const demoQuizzes = [
  {
    id: "quiz1",
    userId: "demo1",
    name: "My Perfect Match Quiz",
    questions: [
      {
        id: "q1",
        question: "What's your ideal way to spend a weekend?",
        options: [
          "Binge-watch shows with takeout",
          "Out exploring the city",
          "Reading or doing something chill at home",
          "Mixed of all, depending on the vibe"
        ],
        preferredAnswer: 0
      },
      {
        id: "q2",
        question: "How do you prefer to communicate in a relationship?",
        options: [
          "Texting all day",
          "Phone calls & FaceTime",
          "I'm open to all",
          "In person only"
        ],
        preferredAnswer: 2
      },
      {
        id: "q3",
        question: "Your love language?",
        options: [
          "Words of affirmation",
          "Physical touch",
          "Gifts",
          "Quality time"
        ],
        preferredAnswer: 3
      },
      {
        id: "q4",
        question: "What's your take on posting each other on socials?",
        options: [
          "Post me or we got problems 😤",
          "Post if it feels right",
          "I'd rather keep things private"
        ],
        preferredAnswer: 1
      },
      {
        id: "q5",
        question: "What's most important in a partner?",
        options: [
          "Loyalty and trust",
          "Fun and connection",
          "Shared goals and values"
        ],
        preferredAnswer: 0
      }
    ],
    createdAt: "2025-01-26",
    responses: [
      {
        id: "response1",
        respondentName: "Sam",
        answers: [0, 2, 3, 1, 0],
        score: 85,
        submittedAt: "2025-01-26T10:30:00Z"
      },
      {
        id: "response2",
        respondentName: "Jordan",
        answers: [1, 0, 2, 0, 1],
        score: 72,
        submittedAt: "2025-01-26T14:15:00Z"
      }
    ]
  },
  {
    id: "quiz2",
    userId: "demo2",
    name: "Compatibility Check",
    questions: [
      {
        id: "q1",
        question: "What's your energy level in relationships?",
        options: [
          "High energy, always doing something",
          "Balanced, mix of active and chill",
          "Low key, prefer quiet moments"
        ],
        preferredAnswer: 1
      },
      {
        id: "q2",
        question: "How do you handle conflict?",
        options: [
          "Talk it out immediately",
          "Take space and revisit later",
          "Let it blow over naturally"
        ],
        preferredAnswer: 0
      }
    ],
    createdAt: "2025-01-26",
    responses: [
      {
        id: "response3",
        respondentName: "Casey",
        answers: [1, 0],
        score: 78,
        submittedAt: "2025-01-26T11:20:00Z"
      }
    ]
  }
];

export const demoResults = [
  {
    id: "result1",
    quizId: "quiz1",
    userId: "demo1",
    respondentName: "Sam",
    answers: [0, 2, 3, 1, 0],
    score: 85,
    timestamp: "2025-01-26T10:30:00Z"
  },
  {
    id: "result2", 
    quizId: "quiz1",
    userId: "demo1",
    respondentName: "Jordan",
    answers: [1, 0, 2, 0, 1],
    score: 72,
    timestamp: "2025-01-26T14:15:00Z"
  },
  {
    id: "result3",
    quizId: "quiz1", 
    userId: "demo1",
    respondentName: "Taylor",
    answers: [2, 3, 0, 2, 0],
    score: 45,
    timestamp: "2025-01-26T16:45:00Z"
  },
  {
    id: "result4",
    quizId: "quiz2",
    userId: "demo2", 
    respondentName: "Casey",
    answers: [1, 0],
    score: 78,
    timestamp: "2025-01-26T11:20:00Z"
  }
];

// Mock Firebase responses for demo purposes
export const mockFirebaseResponses = {
  auth: {
    signUp: { success: true, user: { uid: "demo1" } },
    signIn: { success: true, user: { uid: "demo1" } },
    googleSignIn: { success: true, user: { uid: "demo1" } }
  },
  firestore: {
    getUserData: { success: true, data: demoUsers[0] },
    createQuiz: { success: true, quizId: "new-quiz-id" },
    getQuiz: { success: true, data: demoQuizzes[0] },
    saveResult: { success: true }
  }
};

// Mock EmailJS responses
export const mockEmailJSResponses = {
  sendQuizResult: { success: true, result: { text: "Email sent successfully" } },
  sendWelcome: { success: true, result: { text: "Welcome email sent" } }
};

// Mock Stripe responses
export const mockStripeResponses = {
  createCheckoutSession: { success: true, sessionId: "cs_demo_session" },
  simulateUpgrade: { success: true, message: "Premium upgrade successful!" }
}; 