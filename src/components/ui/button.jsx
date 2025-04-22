// src/components/ui/button.jsx
import React from "react";

export const Button = ({ children, onClick, className = "", ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-xl bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
