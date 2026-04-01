import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import '../styles/WPSI.css';
import '../styles/TransactionTable.css';
import WpsiTransactionDetailsPanel, { type WpsiTransaction } from "../components/WpsiTransactionDetailsPanel";
import { wpsiTransactionsData } from "../dummy_data/wpsiTransactionsData";

const WPSI = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<WpsiTransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(false);
  const [viewedRecordIds, setViewedRecordIds] = useState<Set<number>>(new Set());
  const [activeFilter, setActiveFilter] = useState<'recent' | 'forReview' | 'all' | 'onHold'>('recent');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  useEffect(() => {
    const resetToRecentFilter = () => {
      setActiveFilter('recent');
      setSearchQuery('');
      setCurrentPage(1);
    };

    window.addEventListener('wpsi:reset-filter', resetToRecentFilter);

    return () => {
      window.removeEventListener('wpsi:reset-filter', resetToRecentFilter);
    };
  }, []);

  const transactions: WpsiTransaction[] = wpsiTransactionsData;
  const displayedTransactions = transactions.slice(0, 4);
  const itemsPerPage = 5;
  const unviewedRecordIds = new Set<number>([1, 3]);

  const hasNoAction = (transaction: WpsiTransaction) => {
    const action = transaction.con.trim().toUpperCase();
    return action === '' || action === 'PENDING';
  };

  const isOnHold = (transaction: WpsiTransaction) => {
    const action = transaction.con.trim().toUpperCase();
    return action === 'HOLD' || action === 'ON HOLD' || action === 'PENDING';
  };

  const needsAttention = (transaction: WpsiTransaction) => {
    if (viewedRecordIds.has(transaction.id)) return false;

    const isUnviewed = unviewedRecordIds.has(transaction.id);
    const hasNoActionYet = hasNoAction(transaction);
    return isUnviewed || hasNoActionYet;
  };

  const openModal = (transaction: WpsiTransaction) => {
    setSelectedTransaction(transaction);
    setViewedRecordIds((prev) => {
      const updated = new Set(prev);
      updated.add(transaction.id);
      return updated;
    });

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

  const baseTransactions =
    activeFilter === 'forReview'
      ? transactions.filter(hasNoAction)
      : activeFilter === 'all'
        ? transactions
        : activeFilter === 'onHold'
          ? transactions.filter(isOnHold)
          : displayedTransactions;

  const filteredBySearch = baseTransactions.filter(t => {
    const query = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      t.payee.toLowerCase().includes(query) ||
      t.refNo.toLowerCase().includes(query) ||
      t.label.toLowerCase().includes(query)
    );
  });

  const isPaginatedMode = activeFilter !== 'recent';
  const totalPages = Math.ceil(filteredBySearch.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredBySearch.length);
  const transactionsToRender = isPaginatedMode
    ? filteredBySearch.slice(startIndex, endIndex)
    : filteredBySearch;

  const cfiiAcaTransactions = transactionsToRender.filter(t => t.section === "CFII-ACA");
  const cfiiOlTransactions = transactionsToRender.filter(t => t.section === "CFII-OL REFUND (PHP)");
  const unviewedRecordsCount = 7;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <Sidebar />
      <div className="wpsi-content">

        <main className="wpsi-main">
          <div className="wpsi-layout">
            <div className="wpsi-inner">

              {activeFilter === 'recent' && (
                <div className="wpsi-count-box">
                  <div className="wpsi-count">{transactions.length}</div>
                  <div className="wpsi-count-label">Total Transactions</div>
                </div>
              )}
              {/* For Review Section */}
              {(activeFilter === 'recent' || activeFilter === 'forReview') && (
                <div
                  className="wpsi-card wpsi-card-review"
                  onClick={() => setActiveFilter((prev) => (prev === 'forReview' ? 'recent' : 'forReview'))}
                >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>For Review</span>
                <span className="wpsi-review-badge">{unviewedRecordsCount}</span>
                </div>
              )}

              {(activeFilter === 'recent' || activeFilter === 'all') && (
                <div
                  className="wpsi-card wpsi-card-review"
                  onClick={() => setActiveFilter((prev) => (prev === 'all' ? 'recent' : 'all'))}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>List of Transactions</span>
                </div>
              )}

              {(activeFilter === 'recent' || activeFilter === 'onHold') && (
                <div
                  className="wpsi-card wpsi-card-pending"
                  onClick={() => setActiveFilter((prev) => (prev === 'onHold' ? 'recent' : 'onHold'))}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>On Hold</span>
                </div>
              )}

              {/* CFII-ACA Section */}
              <div className="wpsi-section-header">
                {activeFilter === 'forReview'
                  ? 'For Review Transactions'
                  : activeFilter === 'all'
                    ? 'All Transactions'
                    : activeFilter === 'onHold'
                      ? 'On Hold Transactions'
                      : 'Recent Transactions'}
              </div>

              {activeFilter !== 'recent' && (
                <div className="wpsi-list-search-container">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="wpsi-search-input"
                  />
                  <svg
                    className="wpsi-search-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                    <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              )}

              {cfiiAcaTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`wpsi-transaction-item ${needsAttention(transaction) ? 'wpsi-transaction-item-attention' : ''}`}
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
              {/*             <div className="wpsi-section-header">CFII-OL REFUND (PHP)</div>
 */}
              {cfiiOlTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`wpsi-transaction-item ${needsAttention(transaction) ? 'wpsi-transaction-item-attention' : ''}`}
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

              {isPaginatedMode && baseTransactions.length > 0 && totalPages > 1 && (
                <div className="transactions-pagination">
                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  <div className="pagination-page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            className={`pagination-page-button ${currentPage === page ? 'active' : ''}`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        );
                      }

                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="pagination-ellipsis">...</span>;
                      }

                      return null;
                    })}
                  </div>

                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}

              {isPaginatedMode && baseTransactions.length > 0 && (
                <div className="pagination-info">
                  Showing {startIndex + 1} to {endIndex} of {baseTransactions.length} transactions
                </div>
              )}

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