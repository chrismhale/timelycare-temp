import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '@/components/ConfirmModal';

describe('ConfirmModal', () => {
  it('renders with a custom message', () => {
    render(<ConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} message="Custom message" />);
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<ConfirmModal isOpen={false} onConfirm={jest.fn()} onCancel={jest.fn()} message="Should not show" />);
    expect(screen.queryByText('Should not show')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = jest.fn();
    render(<ConfirmModal isOpen={true} onConfirm={onConfirm} onCancel={jest.fn()} message="Confirm?" />);
    fireEvent.click(screen.getByText('Yes'));
    expect(onConfirm).toHaveBeenCalled();
  });
}); 