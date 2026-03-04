import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './Sidebar';
import AddTransactionModal from '../components/AddTransactionModal';
import EditTransactionModal from '../components/EditTransactionModal';
import '../styles/TransactionTable.css';
import { transactionsData, type Transaction } from '../dummy_data/transactionsData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TransactionTable: React.FC = () => {
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

    const handleAdd = () => {
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
    };

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

            <main style={{ padding: 'min(30px, 7%)', width: '100%', overflowX: 'hidden' }}>

                <div className="transactions-page-wrapper">
                    {/* Header */}
                    <div className="wpsi-section-header">
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937'}}>
                            Transactions
                        </h1>
                    </div>

                    {/* Controls */}
                    <div className="wpsi-controls">
                        <div className="wpsi-search-container">
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
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
                            <button onClick={handleAdd} className="wpsi-add-button">+ Add</button>
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
                                    <th>Transaction Ref</th>
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
                                                <div style={{ fontWeight: 500 }}>{transaction.payee}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
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
                <EditTransactionModal
                    isOpen={isEditModalOpen}
                    isClosing={isClosing}
                    transaction={editableTransaction}
                    categories={categories}
                    currencies={currencies}
                    onClose={closeEditModal}
                    onChange={handleEditChange}
                    onSave={saveEditedTransaction}
                />

                {/* Add Modal */}
                <AddTransactionModal
                    isOpen={isAddModalOpen}
                    isClosing={isAddModalClosing}
                    nextTrxNumber={nextTrxNumber}
                    newTransaction={newTransaction}
                    categories={categories}
                    currencies={currencies}
                    onClose={closeAddModal}
                    onChange={handleAddChange}
                    onSave={handleSaveNewTransaction}
                />
            </main>
        </>
    );
};

export default TransactionTable;