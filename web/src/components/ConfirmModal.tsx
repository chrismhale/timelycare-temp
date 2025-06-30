'use client';

import React from 'react';
import Modal from './Modal';
import Button from './ui/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  confirmVariant?: 'primary' | 'outline';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  confirmVariant = 'primary'
}) => {
  if (!isOpen) return null;

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div className="mt-5 sm:mt-6 flex justify-center gap-3">
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            className={confirmVariant === 'primary' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : ''}
          >
            {confirmText}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal; 