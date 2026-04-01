import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/TransactionTable.css';
import { transactionsData, type Transaction } from '../dummy_data/transactionsData';
import {
    type CompanyCode,
    transactionCategories,
    transactionCategoriesByCompany,
} from '../dummy_data/transactionCategoriesData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const isCompanyCode = (value: string): value is CompanyCode => (
    Object.prototype.hasOwnProperty.call(transactionCategoriesByCompany, value)
);

const normalizeTransaction = (transaction: any): Transaction => ({
    ...transaction,
    status: transaction.status || 'pending',
    pendingApprovalFrom: transaction.pendingApprovalFrom,
    rejectedBy: transaction.rejectedBy,
    approvedBy: transaction.approvedBy,
});

const Transactions: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [currencyFilter, setCurrencyFilter] = useState<string>('All');
    const [dateFilter] = useState<string>('All');

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;

    const TRANSACTIONS_STORAGE_KEY = 'transactionsData';

    // Transactions data
    const [staticTransactions, setStaticTransactions] = useState<Transaction[]>(() => {
        const savedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
        if (savedTransactions) {
            try {
                const parsedTransactions = JSON.parse(savedTransactions) as Transaction[];
                const hasKnownCategory = parsedTransactions.some((transaction) =>
                    transactionCategories.includes(transaction.category),
                );

                // Fallback for legacy localStorage records that used placeholder categories.
                if (!hasKnownCategory) {
                    return [...transactionsData].map(normalizeTransaction);
                }

                return parsedTransactions.map(normalizeTransaction);
            } catch {
                return [...transactionsData].map(normalizeTransaction);
            }
        }
        return [...transactionsData].map(normalizeTransaction);
    });

    // Edit modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editableTransaction, setEditableTransaction] = useState<Transaction | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);



    const transactions = staticTransactions;

    const [categories, setCategories] = useState<string[]>([]);
    const [currencies, setCurrencies] = useState<string[]>([]);
    const [categoriesLoaded, setCategoriesLoaded] = useState(false);
    const [currenciesLoaded, setCurrenciesLoaded] = useState(false);

    const getAuthHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
    });

    const fetchCategories = async () => {
        if (categoriesLoaded) return;

        try {
            const res = await fetch('http://localhost:8000/api/v1/categories/', {
                headers: getAuthHeader()
            });

            if (!res.ok) throw new Error();

            const data = await res.json();

            const mapped = data.map((c: any) => c.category_description);
            setCategories(mapped);
            // setCategoriesLoaded(true);
        } catch {
            toast.error("Failed to load categories");
        }
    };

    const fetchCurrencies = async () => {
        if (currenciesLoaded) return;

        try {
            const res = await fetch('http://localhost:8000/api/v1/currencies/', {
                headers: getAuthHeader()
            });

            if (!res.ok) throw new Error();

            const data = await res.json();

            const mapped = data.map((c: any) => c.currency_code);
            setCurrencies(mapped);
            // setCurrenciesLoaded(true);
        } catch {
            toast.error("Failed to load currencies");
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchCurrencies();
    }, []);

    // Filtered & paginated transactions
    const filteredTransactions = useMemo(() => {
        return companyScopedTransactions.filter(t => {
            const matchesSearch = searchQuery === '' ||
                Object.values(t).some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
            const matchesCurrency = currencyFilter === 'All' || t.currency === currencyFilter;
            const matchesDate = dateFilter === 'All' || t.date.includes(dateFilter);

            return matchesSearch && matchesCategory && matchesCurrency && matchesDate;
        });
    }, [companyScopedTransactions, searchQuery, categoryFilter, currencyFilter, dateFilter]);

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredTransactions.length);
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
    const [isVerySmall, setIsVerySmall] = useState(window.innerWidth <= 390);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 640);
            setIsVerySmall(window.innerWidth <= 390);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(staticTransactions));
    }, [staticTransactions]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, currencyFilter, dateFilter]);

    // Modal Handlers
    const openEditModal = (transaction: Transaction) => {
        navigate(`/edit-transaction/${transaction.transactionRef}`);
    };

    const closeEditModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsEditModalOpen(false);
            setEditableTransaction(null);
            setIsClosing(false);
        }, 300);
    };

    const handleEditChange = (field: keyof Transaction, value: any) => {
        if (!editableTransaction) return;
        setEditableTransaction(prev => ({ ...prev!, [field]: value }));
    };

    const saveEditedTransaction = () => {
        if (!editableTransaction) return;

        setStaticTransactions(prev =>
            prev.map(t =>
                t.transactionRef === editableTransaction.transactionRef ? { ...editableTransaction } : t
            )
        );

        toast.success("Changes saved successfully!");
        closeEditModal();
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        const container = document.querySelector('.transactions-table-container');
        if (container) container.scrollTop = 0;
    };

    return (
        <>
            <Sidebar />
            <div className='dashboard-content'>
                {/* Header */}
                <div className="transaction-form-header">
                    <h2 className="transaction-form-title">Transactions</h2>
                </div>
                <main style={{ width: '100%', overflowX: 'hidden' }}>

                    <div className="transactions-page-wrapper">


                        {/* Controls */}
                        <div className="wpsi-controls">
                            <div className="wpsi-search-container">
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="wpsi-search-input"
                                    style={{ paddingLeft: '2.5rem'/* , maxWidth: '500px'  */}}
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

                            <Link to="/add-transaction" className="wpsi-add-button" style={{ textDecoration: 'none' }}>
                                + Add
                            </Link>

                            <div className="wpsi-dropdown-container">
                                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="wpsi-dropdown">
                                    <option value="All">Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="wpsi-dropdown-container">
                                <select value={currencyFilter} onChange={e => setCurrencyFilter(e.target.value)} className="wpsi-dropdown">
                                    <option value="All">Currencies</option>
                                    {currencies.map(cur => (
                                        <option key={cur} value={cur}>{cur}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="transactions-table-container">
                            <table className="transactions-table table">
                                <colgroup>
                                    <col style={{ width: isMobile ? '22%' : '12%' }} />
                                    <col style={{ width: isMobile ? (isVerySmall ? '50%' : '42%') : '20%' }} />
                                    {!isMobile && <col style={{ width: '12%' }} />}
                                    {!isMobile && <col style={{ width: '14%' }} />}
                                    {!isVerySmall && <col style={{ width: isMobile ? '12%' : '10%' }} />}
                                    <col style={{ width: isMobile ? (isVerySmall ? '28%' : '20%') : '12%' }} />
                                    {!isMobile && <col style={{ width: '12%' }} />}
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th style={{ whiteSpace: 'nowrap' }}>{isMobile ? 'Tx Ref' : 'Transaction Ref'}</th>
                                        <th>Payee / Particulars</th>
                                        {!isMobile && <th>Batch</th>}
                                        {!isMobile && <th>Vessel</th>}
                                        {!isVerySmall && <th>Date</th>}
                                        <th>Amount</th>
                                        {!isMobile && <th>Status</th>}
                                    </tr>
                                </thead>
                                <tbody className="odd:bg-gray-50 even:bg-white">
                                    {paginatedTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={
                                                isVerySmall ? 3 : isMobile ? 4 : 7
                                            } className="transactions-table-empty">
                                                No transactions found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedTransactions.map(transaction => (
                                            <tr
                                                key={transaction.transactionRef}
                                                onClick={() => openEditModal(transaction)}
                                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                <td>{transaction.transactionRef}</td>
                                                <td>
                                                    <div className='rfp-primary-text'>{transaction.payee}</div>
                                                    <div className='rfp-secondary-text'>
                                                        {transaction.particulars}
                                                    </div>
                                                </td>
                                                {!isMobile && <td>{transaction.batch}</td>}
                                                {!isMobile && <td>{transaction.vesselPrincipal}</td>}
                                                {!isVerySmall && <td>{transaction.date}</td>}
                                                <td>
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.currency || 'USD' })
                                                        .format(transaction.amount || 0)}
                                                </td>
                                                {!isMobile && (
                                                    <td>
                                                        <div className={`status-badge ${transaction.status === 'approved' ? 'completed' : transaction.status === 'pending' ? 'pending' : 'failed'}`}>
                                                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
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

                        {filteredTransactions.length > 0 && (
                            <div className="pagination-info">
                                Showing {startIndex + 1} to {endIndex} of {filteredTransactions.length} transactions
                            </div>
                        )}
                    </div>

                    {/* Edit Modal */}
                    {isEditModalOpen && editableTransaction && (
                        <>
                            <div className={`transaction-modal-backdrop ${isClosing ? 'closing' : ''}`} onClick={closeEditModal} />
                            <div className={`transaction-detail-modal ${isClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
                                <div className="transaction-modal-header">
                                    <span className="transaction-modal-title">Edit Transaction</span>
                                    <button className="transaction-modal-close" onClick={closeEditModal}>
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="transaction-modal-content">
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span className="transaction-modal-detail-label" style={{ textAlign: 'center' }}>
                                            Transaction Ref
                                        </span>
                                        <h2 className="transaction-modal-ref-title" style={{ textAlign: 'center', margin: 0 }}>
                                            {editableTransaction.transactionRef}
                                        </h2>
                                    </div>

                                    <div className="transaction-modal-details">
                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Category</span>
                                            <select
                                                className="transaction-modal-detail-value"
                                                value={editableTransaction.category}
                                                onChange={e => handleEditChange('category', e.target.value)}
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Date</span>
                                            <input
                                                type="date"
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
                                                type="date"
                                                className="transaction-modal-detail-value"
                                                value={editableTransaction.etd}
                                                onChange={e => handleEditChange('etd', e.target.value)}
                                            />
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Currency</span>
                                            <select
                                                className="transaction-modal-detail-value"
                                                value={editableTransaction.currency}
                                                onChange={e => handleEditChange('currency', e.target.value)}
                                            >
                                                {currencies.map(cur => (
                                                    <option key={cur} value={cur}>{cur}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Amount</span>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                pattern="^\\d*(\\.\\d{0,2})?$"
                                                className="transaction-modal-detail-value"
                                                value={
                                                    editableTransaction.amount === null || editableTransaction.amount === undefined
                                                        ? ''
                                                        : (typeof editableTransaction.amount === 'string'
                                                            ? editableTransaction.amount
                                                            : Number(editableTransaction.amount).toFixed(2))
                                                }
                                                onChange={e => {
                                                    // Allow only digits and dot, and allow empty string for backspace
                                                    let val = e.target.value.replace(/[^\d.]/g, '');
                                                    val = val.replace(/(\..*)\./g, '$1');
                                                    handleEditChange('amount', val);
                                                }}
                                                onBlur={e => {
                                                    let val = e.target.value;
                                                    if (val !== '' && !isNaN(Number(val))) {
                                                        handleEditChange('amount', Number(val).toFixed(2));
                                                    } else if (val === '') {
                                                        handleEditChange('amount', '');
                                                    }
                                                }}
                                                style={{ MozAppearance: 'textfield' }}
                                                onWheel={e => e.currentTarget.blur()}
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

{/*                                         <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Drive File Link</span>
                                            <input
                                                type="text"
                                                className="transaction-modal-detail-value"
                                                value={editableTransaction.driveFileLink}
                                                onChange={e => handleEditChange('driveFileLink', e.target.value)}
                                            />
                                        </div> */}

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Supporting Docs</span>
                                            <input
                                                type="text"
                                                className="transaction-modal-detail-value"
                                                value={editableTransaction.supportingDocs}
                                                onChange={e => handleEditChange('supportingDocs', e.target.value)}
                                            />
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Status</span>
                                            <select
                                                className="transaction-modal-detail-value"
                                                value={editableTransaction.status}
                                                onChange={e => handleEditChange('status', e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </div>

                                        {editableTransaction.status === 'pending' && (
                                            <div className="transaction-modal-detail-row">
                                                <span className="transaction-modal-detail-label">Pending Approval From</span>
                                                <select
                                                    className="transaction-modal-detail-value"
                                                    value={editableTransaction.pendingApprovalFrom || ''}
                                                    onChange={e => handleEditChange('pendingApprovalFrom', e.target.value === '' ? undefined : (e.target.value as 'DAM' | 'Deputy' | 'Approver'))}
                                                >
                                                    <option value="">-- Select --</option>
                                                    <option value="DAM">DAM</option>
                                                    <option value="Deputy">Deputy</option>
                                                    <option value="Approver">Approver</option>
                                                </select>
                                            </div>
                                        )}

                                        {editableTransaction.status === 'rejected' && (
                                            <div className="transaction-modal-detail-row">
                                                <span className="transaction-modal-detail-label">Rejected By</span>
                                                <input
                                                    type="text"
                                                    className="transaction-modal-detail-value"
                                                    value={editableTransaction.rejectedBy || ''}
                                                    onChange={e => handleEditChange('rejectedBy', e.target.value)}
                                                />
                                            </div>
                                        )}

                                        {editableTransaction.status === 'approved' && (
                                            <div className="transaction-modal-detail-row">
                                                <span className="transaction-modal-detail-label">Approved By</span>
                                                <input
                                                    type="text"
                                                    className="transaction-modal-detail-value"
                                                    value={editableTransaction.approvedBy || ''}
                                                    onChange={e => handleEditChange('approvedBy', e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={closeEditModal} className="transaction-edit-cancel-button">
                                            Cancel
                                        </button>
                                        <button onClick={saveEditedTransaction} className="transaction-edit-save-button">
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </main>
            </div>

        </>
    );
};

export default Transactions;