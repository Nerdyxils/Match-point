import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="page" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--gradient-bottom-right)'
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{
          width: '4rem',
          height: '4rem',
          border: '4px solid var(--bittersweet)',
          borderTop: '4px solid transparent',
          borderRadius: '50%'
        }}
      />
    </div>
  );
};

export default LoadingSpinner; 