import React from 'react';
import { render, screen } from '@testing-library/react';
import ConfirmModal from '@/components/ConfirmModal';

it('renders with a custom message', () => {
  render(<ConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} message="Custom message" />);
  expect(screen.getByText('Custom message')).toBeInTheDocument();
}); 