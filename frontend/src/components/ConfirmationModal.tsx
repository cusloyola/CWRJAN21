import React from "react";
import "../styles/LogoutModal.css"; // Reusing the same styles for consistency

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  onBackdropClick?: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  title,
  message,
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm, 
  onCancel,
  onBackdropClick
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onBackdropClick) {
      onBackdropClick();
    }
  };

  return (
    <div className="logout-modal-backdrop" onClick={handleBackdropClick}>
      <div className="logout-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="logout-modal-actions">
          <button onClick={onCancel} className="logout-modal-cancel">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="logout-modal-confirm confirmation-modal-confirm">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
