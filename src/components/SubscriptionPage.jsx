import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ArrowLeft, 
  Check, 
  Star,
  Zap,
  Crown,
  Users,
  BarChart3,
  Shield,
  Clock
} from 'lucide-react';
import Button from './ui/button';
import '../styles/SubscriptionPage.css';

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '3 quizzes per month',
        'Basic results',
        'Standard support',
        'Community access'
      ],
      popular: false,
      icon: Users
    },
    {
      id: 'monthly',
      name: 'Premium',
      price: '$9.99',
      period: 'month',
      features: [
        'Unlimited quizzes',
        'Detailed analytics',
        'Priority support',
        'Advanced insights',
        'Export results',
        'Custom questions'
      ],
      popular: true,
      icon: Crown
    },
    {
      id: 'yearly',
      name: 'Premium',
      price: '$99.99',
      period: 'year',
      features: [
        'Unlimited quizzes',
        'Detailed analytics',
        'Priority support',
        'Advanced insights',
        'Export results',
        'Custom questions',
        '2 months free'
      ],
      popular: false,
      icon: Star
    }
  ];

  const handleSubscribe = async (planId) => {
    if (planId === 'free') {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    
    try {
      // In a real app, you'd call your backend to create a checkout session
      // For demo purposes, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful subscription
      localStorage.setItem('subscription', JSON.stringify({
        plan: planId,
        status: 'active',
        startDate: new Date().toISOString()
      }));
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error subscribing:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-page">
      {/* Header */}
      <header className="subscription-header">
        <div className="container">
          <div className="header-content">
            <motion.div
              className="brand-section"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Heart className="brand-icon" />
              <h1 className="brand-title">MatchPoint</h1>
            </motion.div>

            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="back-btn"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="subscription-main">
        <div className="container">
          <motion.div
            className="subscription-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header Section */}
            <motion.div
              className="header-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="page-title">Choose Your Plan</h2>
              <p className="page-subtitle">
                Unlock the full potential of MatchPoint with our premium features
              </p>
            </motion.div>

            {/* Plan Toggle */}
            <motion.div
              className="plan-toggle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="toggle-container">
                <button
                  className={`toggle-btn ${selectedPlan === 'monthly' ? 'active' : ''}`}
                  onClick={() => setSelectedPlan('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`toggle-btn ${selectedPlan === 'yearly' ? 'active' : ''}`}
                  onClick={() => setSelectedPlan('yearly')}
                >
                  Yearly
                  <span className="save-badge">Save 17%</span>
                </button>
              </div>
            </motion.div>

            {/* Plans Grid */}
            <motion.div
              className="plans-grid"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  className={`plan-card ${plan.popular ? 'popular' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {plan.popular && (
                    <div className="popular-badge">
                      <Zap size={16} />
                      Most Popular
                    </div>
                  )}

                  <div className="plan-header">
                    <div className="plan-icon">
                      <plan.icon size={32} />
                    </div>
                    <h3 className="plan-name">{plan.name}</h3>
                    <div className="plan-price">
                      <span className="price">{plan.price}</span>
                      <span className="period">/{plan.period}</span>
                    </div>
                  </div>

                  <div className="plan-features">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        className="feature-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 + featureIndex * 0.05 }}
                      >
                        <Check size={20} />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    variant={plan.popular ? 'primary' : 'secondary'}
                    fullWidth
                    onClick={() => handleSubscribe(plan.id)}
                    loading={loading}
                    className="subscribe-btn"
                  >
                    {plan.id === 'free' ? 'Get Started' : 'Subscribe Now'}
                  </Button>
                </motion.div>
              ))}
            </motion.div>

            {/* Features Comparison */}
            <motion.div
              className="features-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h3 className="section-title">Why Choose Premium?</h3>
              <div className="features-grid">
                <div className="feature-card">
                  <BarChart3 className="feature-icon" />
                  <h4>Advanced Analytics</h4>
                  <p>Get detailed insights into your compatibility patterns and trends.</p>
                </div>
                
                <div className="feature-card">
                  <Shield className="feature-icon" />
                  <h4>Privacy First</h4>
                  <p>Your data is encrypted and never shared with third parties.</p>
                </div>
                
                <div className="feature-card">
                  <Clock className="feature-icon" />
                  <h4>Priority Support</h4>
                  <p>Get help when you need it with our dedicated support team.</p>
                </div>
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              className="faq-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <h3 className="section-title">Frequently Asked Questions</h3>
              <div className="faq-grid">
                <div className="faq-item">
                  <h4>Can I cancel anytime?</h4>
                  <p>Yes, you can cancel your subscription at any time. No questions asked.</p>
                </div>
                
                <div className="faq-item">
                  <h4>Is there a free trial?</h4>
                  <p>Yes! Start with our free plan and upgrade when you're ready.</p>
                </div>
                
                <div className="faq-item">
                  <h4>What payment methods do you accept?</h4>
                  <p>We accept all major credit cards, PayPal, and Apple Pay.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 