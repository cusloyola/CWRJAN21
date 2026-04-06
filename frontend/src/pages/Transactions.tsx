import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';
import Sidebar from './Sidebar';
import '../styles/TransactionTable.css';
import { type Transaction } from '../dummy_data/transactionsData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Transactions: React.FC = () => {
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [currencyFilter, setCurrencyFilter] = useState<string>('All');
    const [dateFilter] = useState<string>('All');
    
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

    // Dropdowns
    const [categories, setCategories] = useState<string[]>([]);
    const [currencies, setCurrencies] = useState<string[]>([]);
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
    
   
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editableTransaction, setEditableTransaction] = useState<Transaction | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);

    const getAuthHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
    });

    // =========================
    // FETCH DROPDOWNS
    // =========================
    const fetchDropdowns = async () => {
            try {
                setIsLoadingDropdowns(true);  

                const [catRes, curRes] = await Promise.all([
                    fetch(`${API_BASE}/api/v1/categories/`, { headers: getAuthHeader() }),
                    fetch(`${API_BASE}/api/v1/currencies/`, { headers: getAuthHeader() })
                ]);

                if (!catRes.ok || !curRes.ok) throw new Error();

                const catData = await catRes.json();
                const curData = await curRes.json();

                setCategories(catData.map((c: any) => c.category_description));
                setCurrencies(curData.map((c: any) => c.currency_code))
        } catch (error) {
                toast.error("Failed to load categories");
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    // =========================
    // FETCH TRANSACTIONS
    // =========================    
    const fetchTransactions = async () => {
        try {
            setIsLoadingTransactions(true);

            const res = await fetch(`${API_BASE}/api/v1/transactions/`, {
                headers: getAuthHeader()
            });

            if (!res.ok) throw new Error();

            const data = await res.json();

            // 🔥 Map backend fields to frontend structure if needed
            const mapped = data.map((t: any) => ({
                transactionRef: t.transaction_ref,
                category: t.category_name,
                date: t.date_created,
                payee: t.payee_name,
                particulars: t.particulars,
                vesselPrincipal: t.vessel_principal_name,
                etd: t.etd,
                currency: t.currency_code,
                amount: t.transaction_amount,
                referenceErfp: t.reference_erfp,
                branchToIssueMc: t.branch_to_issue_mc,
                fundingAccount: t.funding_acct_name,
                batch: t.batch_name,
                supportingDocs: t.supporting_docs,
            }));

            setTransactions(mapped);
        } catch (error) {
            toast.error("Failed to load transactions");
        } finally {
            setIsLoadingTransactions(false);
        }
    };

    // =========================
    // LOAD ON MOUNT
    // =========================
    useEffect(() => {
        fetchDropdowns();
        fetchTransactions();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 640);
            setIsVerySmall(window.innerWidth <= 390);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, currencyFilter, dateFilter]);

    // =========================
    // FILTERING
    // =========================
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = searchQuery === '' ||
                Object.values(t).some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
            const matchesCurrency = currencyFilter === 'All' || t.currency === currencyFilter;
            const matchesDate = dateFilter === 'All' || t.date.includes(dateFilter);

            return matchesSearch && matchesCategory && matchesCurrency && matchesDate;
        });
    }, [transactions, searchQuery, categoryFilter, currencyFilter, dateFilter]);

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredTransactions.length);
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
    const [isVerySmall, setIsVerySmall] = useState(window.innerWidth <= 390);


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

        setTransactions(prev =>
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
                                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="wpsi-dropdown" disabled={isLoadingDropdowns}>
                                    <option value="All">
                                        {isLoadingDropdowns ? "Loading..." : "Categories"}
                                    </option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="wpsi-dropdown-container">
                                <select value={currencyFilter} onChange={e => setCurrencyFilter(e.target.value)} className="wpsi-dropdown" disabled={isLoadingDropdowns} >
                                    <option value="All">
                                        {isLoadingDropdowns ? "Loading..." : "Currencies"}
                                    </option>
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
                                    <col style={{ width: '16%' }} />
                                    <col style={{ width: isMobile ? '36%' : '26%' }} />
                                    {!isMobile && <col style={{ width: '14%' }} />}
                                    {!isVerySmall && <col style={{ width: isMobile ? '18%' : '16%' }} />}
                                    {!isVerySmall && <col style={{ width: isMobile ? '14%' : '12%' }} />}
                                    <col style={{ width: isMobile ? '16%' : '16%' }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>Transaction Ref</th>
                                        <th>Payee / Particulars</th>
                                        <th>Batch</th>
                                        {!isMobile && <th>Vessel</th>}
                                        {!isVerySmall && <th>Date</th>}
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="odd:bg-gray-50 even:bg-white">
                                    {isLoadingTransactions ? (
                                        <tr>
                                            <td colSpan={isVerySmall ? 3 : isMobile ? 5 : 6} className="transactions-table-empty">
                                                <div className="transactions-loading-spinner" />
                                            </td>
                                        </tr>
                                    ) : paginatedTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={
                                                isVerySmall ? 3 : isMobile ? 5 : 6
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
                                                <td>{transaction.batch}</td>
                                                {!isMobile && <td>{transaction.vesselPrincipal}</td>}
                                                {!isVerySmall && <td>{transaction.date}</td>}
                                                <td>
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.currency || 'USD' })
                                                        .format(transaction.amount || 0)}
                                                </td>
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