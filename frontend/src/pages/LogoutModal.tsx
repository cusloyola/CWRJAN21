import React from "react";
import "../styles/LogoutModal.css";

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-backdrop">
      <div className="logout-modal">
        <h2>Confirm Logout</h2>
        <p>Are you sure you want to log out?</p>
        <div className="logout-modal-actions">
          <button onClick={onCancel} className="logout-modal-cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="logout-modal-confirm">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
