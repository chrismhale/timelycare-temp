import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Select from '../Select';

describe('Select component', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ];

  it('renders with options', () => {
    render(
      <Select>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </Select>
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('handles value change', () => {
    const handleChange = jest.fn();
    render(
      <Select onChange={handleChange}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </Select>
    );

    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: '2' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    // Note: In a real scenario, the parent component would control the value.
    // This test just ensures the native onChange is wired up.
  });

  it('is disabled when the disabled prop is true', () => {
    render(
      <Select disabled>
        <option value="1">Disabled</option>
      </Select>
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
}); 