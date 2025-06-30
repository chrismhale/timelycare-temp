'use client';

import React from 'react';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    error?: string;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, ...props }, ref) => {
    const id = props.id || props.name;
    return (
      <div className="w-full">
        {label && <label htmlFor={id} className="sr-only">{label}</label>}
        <textarea
          id={id}
          ref={ref}
          className={`w-full border rounded px-3 py-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`}
          {...props}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea; 