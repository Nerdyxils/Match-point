import React from 'react';
import { motion } from 'framer-motion';

const Input = ({ 
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
  icon: Icon,
  ...props 
}) => {
  return (
    <motion.div 
      className={`form-group ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <label className="form-label">
          {label}
          {required && <span style={{ color: 'var(--bittersweet)' }}> *</span>}
        </label>
      )}
      
      <div className="input-group" style={{ position: 'relative' }}>
        {Icon && (
          <Icon 
            className="input-icon" 
            style={{ 
              position: 'absolute', 
              left: '1rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--gray-400)', 
              width: '20px', 
              height: '20px', 
              zIndex: 2 
            }} 
          />
        )}
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`form-input ${Icon ? 'pl-12' : ''} ${error ? 'border-red-500' : ''}`}
          style={{ 
            paddingLeft: Icon ? '3rem' : '1rem',
            borderColor: error ? 'var(--bittersweet)' : undefined
          }}
          {...props}
        />
      </div>
      
      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          style={{ 
            color: 'var(--bittersweet)', 
            fontSize: '0.875rem', 
            marginTop: '0.5rem', 
            fontWeight: 500 
          }}
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Input; 