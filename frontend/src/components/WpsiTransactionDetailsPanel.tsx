import { useEffect, useRef, useState } from "react";

export interface WpsiTransaction {
  id: number;
  label: string;
  title: string;
  amount: string;
  section: string;
  refNo: string;
  date: string;
  payee: string;
  particulars: string;
  vessel: string;
  fundingAccount: string;
  reference: string;
  admin: string;
  dam: string;
  eya: string;
  con: string;
}

interface WpsiTransactionDetailsPanelProps {
  transaction: WpsiTransaction | null;
  isDesktopView: boolean;
  isModalOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
}

const WpsiTransactionDetailsPanel = ({
  transaction,
  isDesktopView,
  isModalOpen,
  isClosing,
  onClose,
}: WpsiTransactionDetailsPanelProps) => {
  const [remarks, setRemarks] = useState("");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  useEffect(() => {
    setRemarks("");
    setSelectedAction(null);
    setOffsetY(0);
    setIsDragging(false);
  }, [transaction?.id, isDesktopView, isModalOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    if (diff > 0) {
      setOffsetY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (offsetY > 150) {
      onClose();
    } else {
      setOffsetY(0);
    }
  };

  if (!transaction) return null;

  const renderTransactionDetails = (isDesktopPanel = false) => (
    <>
      <div className="modal-section-label">{transaction.section}</div>
      <h2 className="modal-transaction-title">{transaction.title}</h2>
      <p className="modal-ref-no">{transaction.refNo}</p>

      <div className="modal-details">
        <div className="modal-detail-row">
          <span className="modal-detail-label">Date</span>
          <span className="modal-detail-value">{transaction.date}</span>
        </div>
        <div className="modal-detail-row">
          <span className="modal-detail-label">Payee</span>
          <span className="modal-detail-value">{transaction.payee}</span>
        </div>
        <div className="modal-detail-row">
          <span className="modal-detail-label">Particulars</span>
          <span className="modal-detail-value">{transaction.particulars}</span>
        </div>
        <div className="modal-detail-row">
          <span className="modal-detail-label">Vessel / Principal</span>
          <span className="modal-detail-value">{transaction.vessel}</span>
        </div>
        <div className="modal-detail-row">
          <span className="modal-detail-label">CWR Amount</span>
          <span className="modal-detail-value">PHP {transaction.amount}</span>
        </div>
        <div className="modal-detail-row">
          <span className="modal-detail-label">Funding Account</span>
          <span className="modal-detail-value">{transaction.fundingAccount}</span>
        </div>
        <div className="modal-detail-row">
          <span className="modal-detail-label">Reference / eRFP</span>
          <span className="modal-detail-value">{transaction.reference}</span>
        </div>
        <div className="modal-detail-row">
          <span className="modal-detail-label">Admin</span>
          <span className="modal-detail-value">{transaction.admin}</span>
        </div>
        <div className="modal-detail-row">
          <span className="modal-detail-label">DAM</span>
          <span className="modal-detail-value">{transaction.dam}</span>
        </div>
        <div className="modal-detail-row">
          <span className="modal-detail-label">EYA</span>
          <span className="modal-detail-value">{transaction.eya}</span>
        </div>
        <div className="modal-detail-row">
          <span className="modal-detail-label">CON</span>
          <span className="modal-detail-value">{transaction.con}</span>
        </div>
      </div>

      <div className="modal-section-header">Supporting Docs</div>
      <div className="modal-section-header-remarks">Remarks</div>
      <div className="modal-remarks">
        <textarea
          className="modal-remarks-input"
          placeholder="Optional"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      <div className="modal-section-header">CFII CON Action</div>
      <div className="modal-con-actions">
        {["Approve", "Hold", "Void", "Cancel"].map((action) => (
          <button
            key={action}
            className={`modal-con-button ${selectedAction === action ? "selected" : ""}`}
            onClick={() => setSelectedAction(action)}
          >
            {action}
          </button>
        ))}
      </div>

      {!isDesktopPanel && (
        <div className="modal-con-footer">
          <button className="modal-con-icon-button">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m-4 0H7a2 2 0 01-2-2V10a2 2 0 012-2h6m0 0V4m0 4l-2-2m2 2l2-2" />
            </svg>
          </button>
          <button className="modal-con-back-button" onClick={onClose}>
            Back
          </button>
        </div>
      )}
    </>
  );

  if (isDesktopView) {
    return (
      <aside className="wpsi-desktop-panel">
        <div className="wpsi-desktop-panel-header">
          <div>
            <p className="wpsi-desktop-panel-subtitle">Transaction Details</p>
            <h3 className="wpsi-desktop-panel-title">{transaction.section}</h3>
          </div>
          <button className="wpsi-desktop-close" onClick={onClose} aria-label="Close details panel">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="wpsi-desktop-panel-content">{renderTransactionDetails(true)}</div>
      </aside>
    );
  }

  if (!isModalOpen) return null;

  return (
    <>
      <div className={`modal-backdrop ${isClosing ? "closing" : ""}`} onClick={onClose}></div>
      <div
        className={`transaction-modal ${isClosing ? "closing" : ""}`}
        style={{
          transform: offsetY > 0 ? `translateY(${offsetY}px)` : undefined,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
      >
        <div
          className="modal-drag-handle"
          onClick={() => {
            if (offsetY === 0) onClose();
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        ></div>
        <div className="modal-header">
          <span className="modal-title">{transaction.section}</span>
          <button className="modal-close" onClick={onClose}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-content">{renderTransactionDetails()}</div>
      </div>
    </>
  );
};

export default WpsiTransactionDetailsPanel;
