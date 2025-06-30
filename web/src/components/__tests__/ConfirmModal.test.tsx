import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmModal from '../ConfirmModal';

// Mock the underlying Modal component to isolate the ConfirmModal logic
jest.mock('../Modal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-modal" onClick={onClose}>
        {children}
        <button onClick={onClose}>Close Modal</button>
      </div>
    );
  },
}));

describe('ConfirmModal component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders with default text when no props are provided', () => {
    render(<ConfirmModal isOpen={true} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders with custom text provided via props', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Delete Item"
        message="This cannot be undone."
        confirmText="Yes, Delete"
      />
    );
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes, Delete' })).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', () => {
    render(<ConfirmModal isOpen={true} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel when the cancel button is clicked', () => {
    render(<ConfirmModal isOpen={true} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onCancel when the underlying modal is closed', () => {
    render(<ConfirmModal isOpen={true} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    // In our mock, clicking the modal container or the "Close Modal" button calls onClose
    fireEvent.click(screen.getByTestId('mock-modal'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    render(<ConfirmModal isOpen={false} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('applies outline variant class when confirmVariant="outline"', () => {
    render(<ConfirmModal isOpen={true} onConfirm={mockOnConfirm} onCancel={mockOnCancel} confirmVariant="outline" />);
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    // Should not have red background class for primary variant
    expect(confirmBtn.className).not.toMatch(/bg-red-600/);
  });
}); 