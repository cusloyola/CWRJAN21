import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './Sidebar';
import '../styles/TransactionTable.css';
import { transactionsData, type Transaction } from '../dummy_data/transactionsData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Archives: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [currencyFilter, setCurrencyFilter] = useState<string>('All');
    const [dateFilter] = useState<string>('All');

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;

    // Transactions data
    const [staticTransactions, setStaticTransactions] = useState<Transaction[]>([...transactionsData]);

    // Edit modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editableTransaction, setEditableTransaction] = useState<Transaction | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);

    // Add modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isAddModalClosing, setIsAddModalClosing] = useState<boolean>(false);

    const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
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
        supportingDocs: '',
    });

    const transactions = staticTransactions;

    useEffect(() => {
        // Find the highest existing TRX number
        const existingRefs = staticTransactions
            .map(t => t.transactionRef)
            .filter(ref => typeof ref === 'string' && ref.startsWith('TRX'));

        if (existingRefs.length === 0) {
            setNextTrxNumber(11);
            return;
        }

        const numbers = existingRefs
            .map(ref => {
                const numStr = ref.replace('TRX', '');
                const num = Number(numStr);
                return isNaN(num) ? 0 : num;
            })
            .filter(n => n > 0);

        if (numbers.length === 0) {
            setNextTrxNumber(11);
        } else {
            const maxNum = Math.max(...numbers);
            setNextTrxNumber(maxNum + 1);
        }
    }, []);

    // Unique filter values
    const categories = useMemo(() => {
        const unique = Array.from(new Set(transactions.map(t => t.category))).sort();
        return unique;
    }, [transactions]);

    const currencies = useMemo(() => {
        const unique = Array.from(new Set(transactions.map(t => t.currency))).sort();
        return unique;
    }, [transactions]);

    // Filtered & paginated transactions
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

    const [nextTrxNumber, setNextTrxNumber] = useState<number>(11);

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
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, currencyFilter, dateFilter]);

    // Modal Handlers
    const openEditModal = (transaction: Transaction) => {
        setEditableTransaction({ ...transaction });
        setIsEditModalOpen(true);
        setIsClosing(false);
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

/*     const handleAdd = () => {
        setNewTransaction({
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
            supportingDocs: '',
        });
        setIsAddModalOpen(true);
        setIsAddModalClosing(false);
    }; */

    const closeAddModal = () => {
        setIsAddModalClosing(true);
        setTimeout(() => {
            setIsAddModalOpen(false);
            setIsAddModalClosing(false);
        }, 300);
    };

    const handleAddChange = (field: keyof typeof newTransaction, value: any) => {
        setNewTransaction(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveNewTransaction = () => {
        if (!newTransaction.payee || !newTransaction.date || newTransaction.amount == null || !newTransaction.currency) {
            toast.error("Please fill required fields: Payee, Date, Amount, Currency");
            return;
        }

        const paddedNumber = String(nextTrxNumber).padStart(3, '0'); // → 011, 012, ...
        const newRef = `TRX${paddedNumber}`;


        const transactionToAdd: Transaction = {
            transactionRef: newRef,
            ...newTransaction as Omit<Transaction, 'transactionRef'>,
            amount: newTransaction.amount!,
        };

        setStaticTransactions(prev => [transactionToAdd, ...prev]);
        setNextTrxNumber(prev => prev + 1);

        toast.success("Transaction added successfully!");
        closeAddModal();
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
                    <h2 className="transaction-form-title">Archives</h2>
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
                                    <col style={{ width: '17%' }} />
                                    <col style={{ width: isMobile ? '38%' : '28%' }} />
                                    {!isMobile && <col style={{ width: '15%' }} />}
                                    {!isVerySmall && <col style={{ width: '20%' }} />}
                                    <col style={{ width: '20%' }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>Archive Ref</th>
                                        <th>Payee / Particulars</th>
                                        {!isMobile && <th>Vessel</th>}
                                        {!isVerySmall && <th>Date</th>}
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="odd:bg-gray-50 even:bg-white">
                                    {paginatedTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={
                                                isVerySmall ? 3 : isMobile ? 4 : 5
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
                                                    <div className='rfp-secondary-text' >
                                                        {transaction.particulars}
                                                    </div>
                                                </td>
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

                    {/* Add Modal */}
                    {isAddModalOpen && (
                        <>
                            <div
                                className={`transaction-modal-backdrop ${isAddModalClosing ? 'closing' : ''}`}
                                onClick={closeAddModal}
                            />
                            <div
                                className={`transaction-detail-modal ${isAddModalClosing ? 'closing' : ''}`}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="transaction-modal-header">
                                    <span className="transaction-modal-title">Add New Transaction</span>
                                    <button className="transaction-modal-close" onClick={closeAddModal}>
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
                                            TRX{String(nextTrxNumber).padStart(3, '0')}
                                        </h2>
                                    </div>

                                    <div className="transaction-modal-details">
                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Category</span>
                                            <select
                                                className="transaction-modal-detail-value"
                                                value={newTransaction.category || ''}
                                                onChange={e => handleAddChange('category', e.target.value)}
                                            >
                                                <option value="">Select Category</option>
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
                                                value={newTransaction.date || ''}
                                                onChange={e => handleAddChange('date', e.target.value)}
                                            />
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Payee</span>
                                            <input
                                                type="text"
                                                className="transaction-modal-detail-value"
                                                value={newTransaction.payee || ''}
                                                onChange={e => handleAddChange('payee', e.target.value)}
                                                placeholder="Enter payee name"
                                            />
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Particulars</span>
                                            <textarea
                                                className="transaction-modal-detail-value"
                                                value={newTransaction.particulars || ''}
                                                onChange={e => handleAddChange('particulars', e.target.value)}
                                                placeholder="Enter transaction details..."
                                            />
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Vessel / Principal</span>
                                            <input
                                                type="text"
                                                className="transaction-modal-detail-value"
                                                value={newTransaction.vesselPrincipal || ''}
                                                onChange={e => handleAddChange('vesselPrincipal', e.target.value)}
                                                placeholder="Enter vessel or principal"
                                            />
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">ETD</span>
                                            <input
                                                type="date"
                                                className="transaction-modal-detail-value"
                                                value={newTransaction.etd || ''}
                                                onChange={e => handleAddChange('etd', e.target.value)}
                                            />
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Currency</span>
                                            <select
                                                className="transaction-modal-detail-value"
                                                value={newTransaction.currency || ''}
                                                onChange={e => handleAddChange('currency', e.target.value)}
                                            >
                                                <option value="">Select Currency</option>
                                                {currencies.map(cur => (
                                                    <option key={cur} value={cur}>{cur}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Amount</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="transaction-modal-detail-value"
                                                value={newTransaction.amount ?? ''}
                                                onChange={e => handleAddChange('amount', e.target.value ? Number(e.target.value) : null)}
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Reference / eRFP</span>
                                            <input
                                                type="text"
                                                className="transaction-modal-detail-value"
                                                value={newTransaction.referenceErfp || ''}
                                                onChange={e => handleAddChange('referenceErfp', e.target.value)}
                                                placeholder="Enter reference or eRFP"
                                            />
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Branch to Issue MC</span>
                                            <input
                                                type="text"
                                                className="transaction-modal-detail-value"
                                                value={newTransaction.branchToIssueMc || ''}
                                                onChange={e => handleAddChange('branchToIssueMc', e.target.value)}
                                                placeholder="Enter branch"
                                            />
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Funding Account</span>
                                            <input
                                                type="text"
                                                className="transaction-modal-detail-value"
                                                value={newTransaction.fundingAccount || ''}
                                                onChange={e => handleAddChange('fundingAccount', e.target.value)}
                                                placeholder="Enter funding account"
                                            />
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Batch</span>
                                            <input
                                                type="text"
                                                className="transaction-modal-detail-value"
                                                value={newTransaction.batch || ''}
                                                onChange={e => handleAddChange('batch', e.target.value)}
                                                placeholder="Enter batch number"
                                            />
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Drive File Link</span>
                                            <input
                                                type="text"
                                                className="transaction-modal-detail-value"
                                                value={newTransaction.driveFileLink || ''}
                                                onChange={e => handleAddChange('driveFileLink', e.target.value)}
                                                placeholder="https://drive.google.com/..."
                                            />
                                        </div>

                                        <div className="transaction-modal-detail-row">
                                            <span className="transaction-modal-detail-label">Supporting Docs</span>
                                            <input
                                                type="text"
                                                className="transaction-modal-detail-value"
                                                value={newTransaction.supportingDocs || ''}
                                                onChange={e => handleAddChange('supportingDocs', e.target.value)}
                                                placeholder="List supporting documents"
                                            />
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={closeAddModal} className="transaction-edit-cancel-button">
                                            Cancel
                                        </button>
                                        <button onClick={handleSaveNewTransaction} className="transaction-edit-save-button">
                                            Add Transaction
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

export default Archives;