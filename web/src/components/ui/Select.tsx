'use client';

import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, label, ...props }, ref) => {
    const id = props.id || props.name;
    return (
      <div>
        {label && <label htmlFor={id} className="sr-only">{label}</label>}
        <select
          id={id}
          ref={ref}
          className={`w-full border rounded px-3 py-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select; 