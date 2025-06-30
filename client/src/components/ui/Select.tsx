import React from 'react';

/* eslint-disable react/prop-types */

const Select = ({
  name,
  value,
  onChange,
  children,
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className={`w-full border rounded px-3 py-2 ${className}`}
    {...props}
  >
    {children}
  </select>
);

export default Select;
