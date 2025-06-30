import React from 'react';

/* eslint-disable react/prop-types */

const Input = ({
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    name={name}
    value={value}
    onChange={onChange}
    type={type}
    placeholder={placeholder}
    required={required}
    className={`w-full border rounded px-3 py-2 ${className}`}
    {...props}
  />
);

export default Input;
