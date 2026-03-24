import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import '../styles/WPSI.css';
import WpsiTransactionDetailsPanel, { type WpsiTransaction } from "../components/WpsiTransactionDetailsPanel";

const WPSI = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<WpsiTransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1025px)');

    const updateScreenMode = (event: MediaQueryList | MediaQueryListEvent) => {
      setIsDesktopView(event.matches);
    };

    updateScreenMode(mediaQuery);
    mediaQuery.addEventListener('change', updateScreenMode);

    return () => {
      mediaQuery.removeEventListener('change', updateScreenMode);
    };
  }, []);

  useEffect(() => {
    if (!isDesktopView) return;

    setIsModalOpen(false);
    setIsClosing(false);
  }, [isDesktopView]);

  // Static transaction data
  const transactions: WpsiTransaction[] = [
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

  const openModal = (transaction: WpsiTransaction) => {
    setSelectedTransaction(transaction);

    if (isDesktopView) return;

    setIsModalOpen(true);
    setIsClosing(false);
  };

  const closeModal = () => {
    if (isDesktopView) {
      setSelectedTransaction(null);
      return;
    }

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
          <div className="wpsi-layout">
            <div className="wpsi-inner">
            {/* For Review Section */}
            <div className="wpsi-card wpsi-card-review">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>For Review</span>
            </div>
            <div className="wpsi-count-box">
              <div className="wpsi-count">{transactions.length}</div>
              <div className="wpsi-count-label">Transaction/s</div>
            </div>

            {/* List of Transactions */}
            <div className="wpsi-card wpsi-card-review">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
            <div className="wpsi-section-header">Recent Transactions</div>

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

            {isDesktopView && !selectedTransaction && (
              <aside className="wpsi-desktop-panel">
                <div className="wpsi-desktop-empty-state">
                  <h3>Select a transaction</h3>
                  <p>Choose any record on the left to view and process details here.</p>
                </div>
              </aside>
            )}

            <WpsiTransactionDetailsPanel
              transaction={selectedTransaction}
              isDesktopView={isDesktopView}
              isModalOpen={isModalOpen}
              isClosing={isClosing}
              onClose={closeModal}
            />
          </div>
        </main>
      </div>
    </>
  );
};

export default WPSI;