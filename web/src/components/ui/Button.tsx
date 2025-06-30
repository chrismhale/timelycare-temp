'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) => {
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const base = `${sizeClasses[size]} ${variantClasses[variant]} rounded font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150`;

  return (
    <button
      className={`${base} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 