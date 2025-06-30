/* eslint-disable react/prop-types */
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = ({
  children,
  className = '',
  ...props
}: ButtonProps) => {
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  const base = `${sizeClasses[props.size || 'md']} rounded focus:outline-none focus:ring-2 focus:ring-offset-2`;

  return (
    <button
      className={`bg-blue-600 text-white ${base} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
