import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './Sidebar';
import '../styles/TransactionTable.css';
import '../styles/ActivityLog.css';
import { transactionsData, type Transaction } from '../dummy_data/transactionsData';

const TransactionTable: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [currencyFilter, setCurrencyFilter] = useState<string>('All');
    const [dateFilter, setDateFilter] = useState<string>('All');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 5;

    const transactions = transactionsData;

    // Get unique values for filters
    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(transactions.map(t => t.category)));
        return uniqueCategories.sort();
    }, []);

    const currencies = useMemo(() => {
        const uniqueCurrencies = Array.from(new Set(transactions.map(t => t.currency)));
        return uniqueCurrencies.sort();
    }, []);

    const dates = useMemo(() => {
        const uniqueDates = Array.from(new Set(transactions.map(t => t.date)));
        return uniqueDates.sort();
    }, []);

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            // Search filter
            const matchesSearch = searchQuery === '' || 
                Object.values(transaction).some(value => 
                    String(value).toLowerCase().includes(searchQuery.toLowerCase())
                );

            // Category filter
            const matchesCategory = categoryFilter === 'All' || 
                transaction.category === categoryFilter;

            // Currency filter
            const matchesCurrency = currencyFilter === 'All' || 
                transaction.currency === currencyFilter;

            // Date filter (simplified - you can enhance this with date range)
            const matchesDate = dateFilter === 'All' || 
                transaction.date.includes(dateFilter);

            return matchesSearch && matchesCategory && matchesCurrency && matchesDate;
        });
    }, [searchQuery, categoryFilter, currencyFilter, dateFilter]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, currencyFilter, dateFilter]);

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

    const openEditModal = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsEditModalOpen(true);
        setIsClosing(false);
    };

    const closeEditModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsEditModalOpen(false);
            setSelectedTransaction(null);
            setIsClosing(false);
        }, 300);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top of table
        const tableContainer = document.querySelector('.transactions-table-container');
        if (tableContainer) {
            tableContainer.scrollTop = 0;
        }
    };

    return (
        <>
            <Sidebar />
            <main style={{ padding: 'min(30px, 7%)', width: '100%', overflowX: 'hidden' }}>
                <div className="transactions-page-wrapper">
                    {/* Title */}
                    <div className="wpsi-section-header">
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>
                            Transactions
                        </h1>
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="wpsi-controls">
                        <div className="wpsi-search-container">
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="wpsi-search-input"
                                style={{ paddingLeft: '2.5rem', maxWidth: '500px' }}
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

                        <div className="wpsi-dropdown-container">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="wpsi-dropdown"
                            >
                                <option value="All">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div className="wpsi-dropdown-container">
                            <select
                                value={currencyFilter}
                                onChange={(e) => setCurrencyFilter(e.target.value)}
                                className="wpsi-dropdown"
                            >
                                <option value="All">All Currencies</option>
                                {currencies.map(currency => (
                                    <option key={currency} value={currency}>{currency}</option>
                                ))}
                            </select>
                        </div>

                        <div className="wpsi-dropdown-container">
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="wpsi-dropdown"
                            >
                                <option value="All">All Dates</option>
                                {dates.map(date => (
                                    <option key={date} value={date}>{date}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="transactions-table-container">
                        <table className="transactions-table table">
                            <colgroup>
                                <col style={{ width: '12%' }} />
                                <col style={{ width: '25%' }} />
                                <col style={{ width: '15%' }} />
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '15%' }} />
                                <col style={{ width: '23%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Transaction Ref</th>
                                    <th>Payee / Particulars</th>
                                    <th>Vessel</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody className="odd:bg-gray-50 even:bg-white">
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="transactions-table-empty">
                                            {searchQuery || categoryFilter !== 'All' || currencyFilter !== 'All' || dateFilter !== 'All' 
                                                ? 'No transactions found matching your filters'
                                                : 'No transactions found'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTransactions.map((transaction) => (
                                        <tr key={transaction.transactionRef} >
                                            <td>{transaction.transactionRef}</td>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{transaction.payee}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                                    {transaction.particulars}
                                                </div>
                                            </td>
                                            <td>{transaction.vesselPrincipal}</td>
                                            <td>{transaction.date}</td>
                                            <td>{new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.currency }).format(transaction.amount)}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => openModal(transaction)}
                                                        className="transaction-view-button"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(transaction)}
                                                        className="transaction-edit-button"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {filteredTransactions.length > 0 && totalPages > 1 && (
                        <div className="transactions-pagination">
                            <button
                                className="pagination-button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            
                            <div className="pagination-page-numbers">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    // Show first page, last page, current page, and pages around current
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
                                    } else if (page === currentPage - 2 || page === currentPage + 2) {
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

                    {/* Pagination Info */}
                    {filteredTransactions.length > 0 && (
                        <div className="pagination-info">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                        </div>
                    )}
                </div>
            </main>

            {/* Transaction Edit Modal */}
            {isEditModalOpen && selectedTransaction && (
                <>
                    <div className={`transaction-modal-backdrop ${isClosing ? 'closing' : ''}`} onClick={closeEditModal}></div>
                    <div className={`transaction-detail-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
                        <div className="transaction-modal-header">
                            <span className="transaction-modal-title">Edit Transaction</span>
                            <button className="transaction-modal-close" onClick={closeEditModal}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="transaction-modal-content">
                            <h2 className="transaction-modal-ref-title">{selectedTransaction.transactionRef}</h2>
                            
                            <div className="transaction-modal-details">
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Category</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.category}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Transaction Ref</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.transactionRef}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Date</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.date}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Payee</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.payee}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Particulars</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.particulars}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Vessel / Principal</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.vesselPrincipal}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">ETD</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.etd}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Currency</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.currency}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Amount</span>
                                    <span className="transaction-modal-detail-value">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedTransaction.currency }).format(selectedTransaction.amount)}
                                    </span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Reference / eRFP</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.referenceErfp}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Branch to Issue MC</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.branchToIssueMc}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Funding Account</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.fundingAccount}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Batch</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.batch}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Drive File Link</span>
                                    <span className="transaction-modal-detail-value">
                                        <a href={selectedTransaction.driveFileLink} target="_blank" rel="noreferrer" className="transaction-modal-link">
                                            {selectedTransaction.driveFileLink}
                                        </a>
                                    </span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Supporting Docs</span>
                                    <span className="transaction-modal-detail-value">
                                        <a href={selectedTransaction.supportingDocs} target="_blank" rel="noreferrer" className="transaction-modal-link">
                                            {selectedTransaction.supportingDocs}
                                        </a>
                                    </span>
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={closeEditModal}
                                    className="transaction-edit-cancel-button"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        // TODO: Implement save functionality
                                        console.log('Save transaction:', selectedTransaction);
                                        closeEditModal();
                                    }}
                                    className="transaction-edit-save-button"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Transaction Detail Modal */}
            {isModalOpen && selectedTransaction && (
                <>
                    <div className={`transaction-modal-backdrop ${isClosing ? 'closing' : ''}`} onClick={closeModal}></div>
                    <div className={`transaction-detail-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
                        <div className="transaction-modal-header">
                            <span className="transaction-modal-title">Transaction Details</span>
                            <button className="transaction-modal-close" onClick={closeModal}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="transaction-modal-content">
                            <h2 className="transaction-modal-ref-title">{selectedTransaction.transactionRef}</h2>
                            
                            <div className="transaction-modal-details">
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Category</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.category}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Transaction Ref</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.transactionRef}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Date</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.date}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Payee</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.payee}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Particulars</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.particulars}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Vessel / Principal</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.vesselPrincipal}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">ETD</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.etd}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Currency</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.currency}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Amount</span>
                                    <span className="transaction-modal-detail-value">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedTransaction.currency }).format(selectedTransaction.amount)}
                                    </span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Reference / eRFP</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.referenceErfp}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Branch to Issue MC</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.branchToIssueMc}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Funding Account</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.fundingAccount}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Batch</span>
                                    <span className="transaction-modal-detail-value">{selectedTransaction.batch}</span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Drive File Link</span>
                                    <span className="transaction-modal-detail-value">
                                        <a href={selectedTransaction.driveFileLink} target="_blank" rel="noreferrer" className="transaction-modal-link">
                                            {selectedTransaction.driveFileLink}
                                        </a>
                                    </span>
                                </div>
                                <div className="transaction-modal-detail-row">
                                    <span className="transaction-modal-detail-label">Supporting Docs</span>
                                    <span className="transaction-modal-detail-value">
                                        <a href={selectedTransaction.supportingDocs} target="_blank" rel="noreferrer" className="transaction-modal-link">
                                            {selectedTransaction.supportingDocs}
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>

    );
};

export default TransactionTable;
