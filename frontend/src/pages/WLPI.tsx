import { useState } from "react";
import Sidebar from "./Sidebar";
import '../styles/WPSI.css';

interface Transaction {
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

const WLPI = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const transactions: Transaction[] = [
    {
      id: 1,
      label: "PAYMENT FOR TRUCKING CHARGES /SI: 068260683",
      title: "FULL BLAST TRUCKING SERVICES",
      amount: "109,739.80",
      section: "CFII-ACA",
      refNo: "COTS0326202504808",
      date: "3/26/2025",
      payee: "FULL BLAST TRUCKING SERVICES",
      particulars: "PAYMENT FOR TRUCKING CHARGES /SI: 068280683",
      vessel: "WPSI/PROTANK",
      fundingAccount: "BDO Check",
      reference: "PV#04808",
      admin: "n/a",
      dam: "Endorsed",
      eya: "n/a",
      con: "PENDING"
    },
    {
      id: 2,
      label: "PAYMENT FOR REFUND FOR OVERPAYMENT TO ONE/BL: MNLF17771600",
      title: "CAROLYN C. DAKIS",
      amount: "2,240.00",
      section: "CFII-ACA",
      refNo: "COTS0326202504809",
      date: "3/26/2025",
      payee: "CAROLYN C. DAKIS",
      particulars: "PAYMENT FOR REFUND FOR OVERPAYMENT TO ONE/BL: MNLF17771600",
      vessel: "WPSI/PROTANK",
      fundingAccount: "BDO Check",
      reference: "PV#04809",
      admin: "n/a",
      dam: "Endorsed",
      eya: "n/a",
      con: "PENDING"
    },
    {
      id: 3,
      label: "CONTAINER DEPOSIT / BL NO: JEADVO/2409/1",
      title: "WEE ENG CONSTRUCTION, INC.",
      amount: "604,500.00",
      section: "CFII-OL REFUND (PHP)",
      refNo: "COTS0326202504810",
      date: "3/26/2025",
      payee: "WEE ENG CONSTRUCTION, INC.",
      particulars: "CONTAINER DEPOSIT / BL NO: JEADVO/2409/1",
      vessel: "WPSI/PROTANK",
      fundingAccount: "BDO Check",
      reference: "PV#04810",
      admin: "n/a",
      dam: "Endorsed",
      eya: "n/a",
      con: "PENDING"
    }
  ];

  const openModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
    setIsClosing(false);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setSelectedTransaction(null);
      setIsClosing(false);
    }, 300);
  };

  const cfiiAcaTransactions = transactions.filter(t => t.section === "CFII-ACA");
  const cfiiOlTransactions = transactions.filter(t => t.section === "CFII-OL REFUND (PHP)");

  return (
    <>
      <Sidebar />
      <div className="wpsi-content">
        <main className="wpsi-main">
          <div className="wpsi-inner">
            {/* For Review Section */}
            <div className="wpsi-card wpsi-card-review">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>For Review</span>
            </div>
            <div className="wpsi-count-box">
              <div className="wpsi-count">3</div>
              <div className="wpsi-count-label">Transaction/s</div>
            </div>

            {/* List of Transactions */}
            <div className="wpsi-card wpsi-card-review">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>List of Transactions</span>
            </div>

            {/* On Hold (PENDING) Section */}
            <div className="wpsi-card wpsi-card-pending">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>On Hold (PENDING)</span>
            </div>

            {/* CFII-ACA Section */}
            <div className="wpsi-section-header">WLPI Page</div>

            {cfiiAcaTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="wpsi-transaction-item"
                onClick={() => openModal(transaction)}
              >
                <div className="wpsi-transaction-label">{transaction.label}</div>
                <div className="wpsi-transaction-row">
                  <div>
                    <div className="wpsi-transaction-title">{transaction.title}</div>
                    <div className="wpsi-transaction-amount">{transaction.amount}</div>
                  </div>
                  <svg className="wpsi-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}

            {/* CFII-OL REFUND (PHP) Section */}
            <div className="wpsi-section-header">CFII-OL REFUND (PHP)</div>

            {cfiiOlTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="wpsi-transaction-item"
                onClick={() => openModal(transaction)}
              >
                <div className="wpsi-transaction-label">{transaction.label}</div>
                <div className="wpsi-transaction-row">
                  <div>
                    <div className="wpsi-transaction-title">{transaction.title}</div>
                    <div className="wpsi-transaction-amount">{transaction.amount}</div>
                  </div>
                  <svg className="wpsi-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Transaction Detail Bottom Sheet */}
      {isModalOpen && selectedTransaction && (
        <>
          <div className={`modal-backdrop ${isClosing ? 'closing' : ''}`} onClick={closeModal}></div>
          <div className={`transaction-modal ${isClosing ? 'closing' : ''}`}>
            <div className="modal-drag-handle" onClick={closeModal}></div>
            <div className="modal-header">
              <span className="modal-title">{selectedTransaction.section}</span>
              <button className="modal-close" onClick={closeModal}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-section-label">{selectedTransaction.section}</div>
              <h2 className="modal-transaction-title">{selectedTransaction.title}</h2>
              <p className="modal-ref-no">{selectedTransaction.refNo}</p>

              <div className="modal-details">
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Date</span>
                  <span className="modal-detail-value">{selectedTransaction.date}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Payee</span>
                  <span className="modal-detail-value">{selectedTransaction.payee}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Particulars</span>
                  <span className="modal-detail-value">{selectedTransaction.particulars}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Vessel / Principal</span>
                  <span className="modal-detail-value">{selectedTransaction.vessel}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">CWR Amt</span>
                  <span className="modal-detail-value">PHP {selectedTransaction.amount}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Funding Account</span>
                  <span className="modal-detail-value">{selectedTransaction.fundingAccount}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Reference / eRFP</span>
                  <span className="modal-detail-value">{selectedTransaction.reference}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Admin</span>
                  <span className="modal-detail-value">{selectedTransaction.admin}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">DAM</span>
                  <span className="modal-detail-value">{selectedTransaction.dam}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">EYA</span>
                  <span className="modal-detail-value">{selectedTransaction.eya}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">CON</span>
                  <span className="modal-detail-value">{selectedTransaction.con}</span>
                </div>
              </div>

              <div className="modal-section-header">Supporting Docs</div>
              {/* Remarks Section */}
              <div className="modal-section-header-remarks">Remarks</div>
              <div className="modal-remarks">
                <textarea
                  className="modal-remarks-input"
                  placeholder="Optional"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              {/* CFII CON Action */}
              <div className="modal-section-header">CFII CON Action</div>
              <div className="modal-con-actions">
                {['Approve', 'Hold', 'Void', 'Cancel'].map((action) => (
                  <button
                    key={action}
                    className={`modal-con-button ${selectedAction === action ? 'selected' : ''}`}
                    onClick={() => setSelectedAction(action)}
                  >
                    {action}
                  </button>
                ))}
              </div>

              {/* Icon + Back */}
              <div className="modal-con-footer">
                <button className="modal-con-icon-button">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m-4 0H7a2 2 0 01-2-2V10a2 2 0 012-2h6m0 0V4m0 4l-2-2m2 2l2-2" />
                  </svg>
                  Comment
                </button>
                <button className="modal-con-back-button" onClick={closeModal}>
                  ← Back
                </button>
              </div>



            </div>
          </div>
        </>
      )}
    </>
  );
};

export default WLPI;