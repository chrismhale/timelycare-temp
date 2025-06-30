import React from 'react';
import { render, screen } from '@testing-library/react';
import Select from '@/components/ui/Select';

it('renders children', () => {
  render(<Select name="test" value="1" onChange={() => {}}><option value="1">One</option></Select>);
  expect(screen.getByText('One')).toBeInTheDocument();
}); 