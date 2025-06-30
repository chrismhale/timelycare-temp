import React from 'react';

/* eslint-disable react/prop-types */

const Textarea = ({
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className={`w-full border rounded px-3 py-2 ${className}`}
    {...props}
  />
);

export default Textarea;
