import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './Sidebar';
import '../styles/TransactionTable.css';
import '../styles/ActivityLog.css';
import { transactionsData, type Transaction } from '../dummy_data/transactionsData';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddTransactionForm from './AddTransactionForm';


const ArchivesTable: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [currencyFilter, setCurrencyFilter] = useState<string>('All');
    const [dateFilter, setDateFilter] = useState<string>('All');
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editableTransaction, setEditableTransaction] = useState<Transaction | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [newTransaction, setNewTransaction] = useState<Transaction | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 5;

    const transactions = transactionsData;

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

    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            const matchesSearch = searchQuery === '' ||
                Object.values(transaction).some(value =>
                    String(value).toLowerCase().includes(searchQuery.toLowerCase())
                );
            const matchesCategory = categoryFilter === 'All' ||
                transaction.category === categoryFilter;

            const matchesCurrency = currencyFilter === 'All' ||
                transaction.currency === currencyFilter;

            const matchesDate = dateFilter === 'All' ||
                transaction.date.includes(dateFilter);

            return matchesSearch && matchesCategory && matchesCurrency && matchesDate;
        });
    }, [searchQuery, categoryFilter, currencyFilter, dateFilter]);

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    const handleAdd = () => {
        setNewTransaction({
            transactionRef: '',
            category: '',
            date: '',
            payee: '',
            particulars: '',
            vesselPrincipal: '',
            etd: '',
            currency: '',
            amount: 0,
            referenceErfp: '',
            branchToIssueMc: '',
            fundingAccount: '',
            batch: '',
            driveFileLink: '',
            supportingDocs: ''
        });
        setIsAddModalOpen(true);
        setIsClosing(false);
    };

    const closeAddModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsAddModalOpen(false);
            setIsClosing(false);
        }, 300);
    };

    const handleNewChange = (field: keyof Transaction, value: any) => {
        if (!newTransaction) return;
        setNewTransaction({ ...newTransaction, [field]: value });
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, currencyFilter, dateFilter]);

    const openEditModal = (transaction: Transaction) => {
        setEditableTransaction({ ...transaction }); // clone for editing
        setIsEditModalOpen(true);
        setIsClosing(false);
    };

    const closeEditModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsEditModalOpen(false);
            setIsClosing(false);
        }, 300);
    };

    const handleEditChange = (field: keyof Transaction, value: any) => {
        if (!editableTransaction) return;
        setEditableTransaction({ ...editableTransaction, [field]: value });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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
                    <div className="wpsi-section-header">
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>
                            Archives
                        </h1>
                    </div>
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
                        <div className="wpsi-add-button-container">
                            <button onClick={handleAdd} className="wpsi-add-button"> + Add </button>
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
                    <div className="transactions-table-container">
                        <table className="transactions-table table">
                            <colgroup>
                                <col style={{ width: '17%' }} />
                                <col style={{ width: '28%' }} />
                                <col style={{ width: '15%' }} />
                                <col style={{ width: '20%' }} />
                                <col style={{ width: '20%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Archives Ref</th>
                                    <th>Payee / Particulars</th>
                                    <th>Vessel</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody className="odd:bg-gray-50 even:bg-white">
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="transactions-table-empty">
                                            {searchQuery || categoryFilter !== 'All' || currencyFilter !== 'All' || dateFilter !== 'All'
                                                ? 'No transactions found matching your filters'
                                                : 'No transactions found'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTransactions.map((transaction) => (
                                        <tr key={transaction.transactionRef} onClick={() => openEditModal(transaction)} className="transaction-edit-button">
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
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
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
                    {filteredTransactions.length > 0 && (
                        <div className="pagination-info">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                        </div>
                    )}
                </div>
            </main >
            <ToastContainer position="top-center" autoClose={1500} theme="colored" />
            {
                <AddTransactionForm
                    isOpen={isAddModalOpen}
                    isClosing={isClosing}
                    transaction={newTransaction}
                    onChange={handleNewChange}
                    onCancel={closeAddModal}
                    onSave={() => {
                        toast.success("Transaction added successfully!");
                        closeAddModal();
                        // Logic to actually add the transaction would go here
                    }}
                />
            }
            {
                isEditModalOpen && editableTransaction && (
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
                                <h2 className="transaction-modal-ref-title">
                                    <input
                                        type="text"
                                        value={editableTransaction.transactionRef}
                                        onChange={e => handleEditChange('transactionRef', e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </h2>
                                <div className="transaction-modal-details">
                                    <div className="transaction-modal-detail-row">
                                        <span className="transaction-modal-detail-label">Category</span>
                                        <input
                                            type="text"
                                            className="transaction-modal-detail-value"
                                            value={editableTransaction.category}
                                            onChange={e => handleEditChange('category', e.target.value)}
                                        />
                                    </div>
                                    <div className="transaction-modal-detail-row">
                                        <span className="transaction-modal-detail-label">Archives Ref</span>
                                        <input
                                            type="text"
                                            className="transaction-modal-detail-value"
                                            value={editableTransaction.transactionRef}
                                            onChange={e => handleEditChange('transactionRef', e.target.value)}
                                        />
                                    </div>
                                    <div className="transaction-modal-detail-row">
                                        <span className="transaction-modal-detail-label">Date</span>
                                        <input
                                            type="text"
                                            className="transaction-modal-detail-value"
                                            value={editableTransaction.date}
                                            onChange={e => handleEditChange('date', e.target.value)}
                                        />
                                    </div>
                                    <div className="transaction-modal-detail-row">
                                        <span className="transaction-modal-detail-label">Payee</span>
                                        <input
                                            type="text"
                                            className="transaction-modal-detail-value"
                                            value={editableTransaction.payee}
                                            onChange={e => handleEditChange('payee', e.target.value)}
                                        />
                                    </div>
                                    <div className="transaction-modal-detail-row">
                                        <span className="transaction-modal-detail-label">Particulars</span>
                                        <textarea
                                            className="transaction-modal-detail-value"
                                            value={editableTransaction.particulars}
                                            onChange={e => handleEditChange('particulars', e.target.value)}
                                        />
                                    </div>
                                    <div className="transaction-modal-detail-row">
                                        <span className="transaction-modal-detail-label">Vessel / Principal</span>
                                        <input
                                            type="text"
                                            className="transaction-modal-detail-value"
                                            value={editableTransaction.vesselPrincipal}
                                            onChange={e => handleEditChange('vesselPrincipal', e.target.value)}
                                        />
                                    </div>
                                    <div className="transaction-modal-detail-row">
                                        <span className="transaction-modal-detail-label">ETD</span>
                                        <input
                                            type="text"
                                            className="transaction-modal-detail-value"
                                            value={editableTransaction.etd}
                                            onChange={e => handleEditChange('etd', e.target.value)}
                                        />
                                    </div>
                                    <div className="transaction-modal-detail-row">
                                        <span className="transaction-modal-detail-label">Currency</span>
                                        <input
                                            type="text"
                                            className="transaction-modal-detail-value"
                                            value={editableTransaction.currency}
                                            onChange={e => handleEditChange('currency', e.target.value)}
                                        />
                                    </div>
                                    <div className="transaction-modal-detail-row">
                                        <span className="transaction-modal-detail-label">Amount</span>
                                        <input
                                            type="number"
                                            className="transaction-modal-detail-value"
                                            value={editableTransaction.amount}
                                            onChange={e => handleEditChange('amount', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="transaction-modal-detail-row">
                                        <span className="transaction-modal-detail-label">Reference / eRFP</span>
                                        <input
                                            type="text"
                                            className="transaction-modal-detail-value"
                                            value={editableTransaction.referenceErfp}
                                            onChange={e => handleEditChange('referenceErfp', e.target.value)}
                                        />
                                    </div>
                                    <div className="transaction-modal-detail-row">
                                        <span className="transaction-modal-detail-label">Branch to Issue MC</span>
                                        <input
                                            type="text"
                                            className="transaction-modal-detail-value"
                                            value={editableTransaction.branchToIssueMc}
                                            onChange={e => handleEditChange('branchToIssueMc', e.target.value)}
                                        />
                                    </div>
                                    <div className="transaction-modal-detail-row">
                                        <span className="transaction-modal-detail-label">Funding Account</span>
                                        <input
                                            type="text"
                                            className="transaction-modal-detail-value"
                                            value={editableTransaction.fundingAccount}
                                            onChange={e => handleEditChange('fundingAccount', e.target.value)}
                                        />
                                    </div>
                                    <div className="transaction-modal-detail-row">
                                        <span className="transaction-modal-detail-label">Batch</span>
                                        <input
                                            type="text"
                                            className="transaction-modal-detail-value"
                                            value={editableTransaction.batch}
                                            onChange={e => handleEditChange('batch', e.target.value)}
                                        />
                                    </div>
                                    <div className="transaction-modal-detail-row">
                                        <span className="transaction-modal-detail-label">Drive File Link</span>
                                        <input
                                            type="text"
                                            className="transaction-modal-detail-value"
                                            value={editableTransaction.driveFileLink}
                                            onChange={e => handleEditChange('driveFileLink', e.target.value)}
                                        />
                                    </div>
                                    <div className="transaction-modal-detail-row">
                                        <span className="transaction-modal-detail-label">Supporting Docs</span>
                                        <input
                                            type="text"
                                            className="transaction-modal-detail-value"
                                            value={editableTransaction.supportingDocs}
                                            onChange={e => handleEditChange('supportingDocs', e.target.value)}
                                        />
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
                                            toast.success("Edit Saved successfully!");
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
                )
            }
        </>
    );
};

export default ArchivesTable;
