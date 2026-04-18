import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE, getAuthHeader } from '../config/api';
import Sidebar from './Sidebar';
import '../styles/TransactionTable.css';
import { type Transaction } from '../types/transaction';
import { mapTransactionFromAPI } from '../utils/transactionMapper';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CategorySelect from '../components/SelectCategoryFilter';
import CurrencySelect from '../components/SelectCurrencyFilter';

const Transactions: React.FC = () => {
    const navigate = useNavigate();
    // For Checkbox
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    // Helper to toggle a single row
    const toggleSelectRow = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        // Ensure these are mapped as strings
        const currentPageIds = paginatedTransactions.map(t => String(t.transactionId));
        const allSelected = currentPageIds.every(id => selectedIds.includes(id));

        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...currentPageIds])]);
        }
    };
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [currencyFilter, setCurrencyFilter] = useState<string>('All');
    const [dateFilter] = useState<string>('All');

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
    // const [isVerySmall, setIsVerySmall] = useState(window.innerWidth <= 390);

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

            // 🔥 Map backend fields to frontend structure
            const mapped = data.map(mapTransactionFromAPI);

            setTransactions(mapped);

        } catch (error) {
            toast.error("Failed to load transactions");
        } finally {
            setIsLoadingTransactions(false);
        }
    };

    // =========================
    // INITIAL LOAD
    // =========================
    useEffect(() => {
        fetchTransactions();
    }, []);

    // =========================
    // RESPONSIVE HANDLING
    // =========================
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 640);
            // setIsVerySmall(window.innerWidth <= 390);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // =========================
    // RESET PAGE ON FILTER
    // =========================
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
            const matchesDate = dateFilter === 'All' || t.dateCreated.includes(dateFilter);

            return matchesSearch && matchesCategory && matchesCurrency && matchesDate;
        });
    }, [transactions, searchQuery, categoryFilter, currencyFilter, dateFilter]);

    // =========================
    // PAGINATION
    // =========================
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredTransactions.length);
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        const container = document.querySelector('.transactions-table-container');
        if (container) container.scrollTop = 0;
    };

    // =========================
    // NAVIGATION (NO MODAL)
    // =========================
    const handleRowClick = (transaction: Transaction) => {
        navigate(`/transactions/${transaction.transactionId}/edit`);
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
                                    style={{ paddingLeft: '2.5rem'/* , maxWidth: '500px'  */ }}
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

                            <Link
                                to="/transactions/new"
                                className="wpsi-add-button"
                                style={{ textDecoration: 'none' }}
                            >
                                + Add
                            </Link>
                            {/* CATEGORY Filter*/}
                            <div className="wpsi-dropdown-container">
                                <CategorySelect
                                    value={categoryFilter}
                                    onChange={setCategoryFilter}
                                />
                            </div>
                            {/* CURRENCY Filter*/}
                            <div className="wpsi-dropdown-container">
                                <CurrencySelect
                                    value={currencyFilter}
                                    onChange={setCurrencyFilter}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="transactions-table-container">
                            <table className="transactions-table table">
                                <colgroup>
                                    {/* New checkbox column */}
                                    <col style={{ width: '40px' }} />
                                    <col style={{ width: '18%' }} />
                                    <col style={{ width: isMobile ? '50%' : '44%' }} />
                                    {!isMobile && <col style={{ width: '16%' }} />}
                                    <col style={{ width: '16%' }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                onChange={toggleSelectAll}
                                                checked={paginatedTransactions.length > 0 && paginatedTransactions.every(t => selectedIds.includes(t.transactionId))}
                                            />
                                        </th>
                                        <th>Transaction Ref</th>
                                        <th>Payee / Particulars</th>
                                        {!isMobile && <th>Vessel</th>}
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="odd:bg-gray-50 even:bg-white">
                                    {isLoadingTransactions ? (
                                        <tr>
                                            {/* Adjusted colSpan: Checkbox(1) + Ref(1) + Payee(1) + Vessel(if !isMobile) + Amount(1) */}
                                            <td colSpan={isMobile ? 4 : 5} className="transactions-table-empty">
                                                <div className="transactions-loading-spinner" />
                                            </td>
                                        </tr>
                                    ) : paginatedTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={isMobile ? 4 : 5} className="transactions-table-empty">
                                                No transactions found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedTransactions.map(transaction => {
                                            // Cast ID to string to ensure compatibility with selectedIds (string[])
                                            const tId = String(transaction.transactionId);
                                            const isSelected = selectedIds.includes(tId);

                                            return (
                                                <tr
                                                    key={tId}
                                                    onClick={() => handleRowClick(transaction)}
                                                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''
                                                        }`}
                                                >
                                                    {/* Checkbox Cell - stopPropagation prevents row click navigation */}
                                                    <td onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => toggleSelectRow(tId, e as any)}
                                                        />
                                                    </td>

                                                    <td>{transaction.transactionRef}</td>

                                                    <td>
                                                        <div className='rfp-primary-text'>{transaction.payee}</div>
                                                        <div className='rfp-secondary-text'>
                                                            {transaction.particulars}
                                                        </div>
                                                    </td>

                                                    {!isMobile && <td>{transaction.vesselPrincipal}</td>}

                                                    <td>
                                                        {new Intl.NumberFormat('en-US', {
                                                            style: 'currency',
                                                            currency: transaction.currency || 'USD'
                                                        }).format(transaction.amount || 0)}
                                                    </td>
                                                </tr>
                                            );
                                        })
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
                </main>
            </div>

        </>
    );
};

export default Transactions;