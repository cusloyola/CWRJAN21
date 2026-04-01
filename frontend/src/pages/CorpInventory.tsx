import React, { useMemo, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import '../styles/TransactionTable.css';
import {
    corpChequeBalanceRows,
    corpChequeBalanceSummary,
    type CorpChequeBalanceRow,
} from '../dummy_data/corpChequeBalanceData';

const CorpInventory: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 12;

    const rows: CorpChequeBalanceRow[] = corpChequeBalanceRows;

    const filteredRows = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (q === '') return rows;

        return rows.filter(r => {
            const dateStr = r.date.toLowerCase();
            const checksStr = r.checksPrinted == null ? '-' : String(r.checksPrinted);
            return dateStr.includes(q) || checksStr.toLowerCase().includes(q);
        });
    }, [rows, searchQuery]);

    const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredRows.length);
    const paginatedRows = filteredRows.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const formatRowDate = (isoDate: string) => {
        const d = new Date(isoDate);
        if (Number.isNaN(d.getTime())) return isoDate;
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatBegInventoryAsOf = (isoDate: string) => {
        const d = new Date(isoDate);
        if (Number.isNaN(d.getTime())) return isoDate;
        return d.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
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
                    <h2 className="transaction-form-title">Corp Cheque Inventory</h2>
                </div>
                <main className="corp-inventory-main">

                    <div className="transactions-page-wrapper corp-inventory-page">


                        <section className="corp-summary-card" aria-label="Corp cheque inventory summary">
                            <div className="corp-summary-row corp-summary-row-primary">
                                <div className="corp-summary-label">CORP. CHEQUE BALANCE</div>
                                <div className="corp-summary-value">
                                    {new Intl.NumberFormat('en-US').format(corpChequeBalanceSummary.corpChequeBalance)}
                                </div>
                            </div>

                            <div className="corp-summary-row">
                                <div className="corp-summary-subtext">
                                    Beg. Inventory ({formatBegInventoryAsOf(corpChequeBalanceSummary.beginningInventoryAsOf)})
                                </div>
                                <div className="corp-summary-value">
                                    {new Intl.NumberFormat('en-US').format(corpChequeBalanceSummary.beginningInventory)}
                                </div>
                            </div>
                        </section>

                        {/* Controls */}
                        <div className="wpsi-controls" >
                            <div className="wpsi-search-container" >
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="wpsi-search-input"
                                    style={{ paddingLeft: '2.5rem' }}
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
                        </div>

                        {/* Table */}
                        <div className="transactions-table-container">
                            <table className="transactions-table table corp-inventory-table">
                                <thead>
                                    <tr>
                                        <th style={{fontWeight:'600'}}>Date</th>
                                        <th className="checks-printed-col">Checks Printed</th>
                                    </tr>
                                </thead>
                                <tbody className="odd:bg-gray-50 even:bg-white">
                                    {paginatedRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="transactions-table-empty">
                                                No records found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedRows.map(row => (
                                            <tr key={row.date}>
                                                <td>{formatRowDate(row.date)}</td>
                                                <td className="checks-printed-col checks-printed-value">
                                                    {row.checksPrinted == null ? '-' : row.checksPrinted}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredRows.length > 0 && totalPages > 1 && (
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

                        {filteredRows.length > 0 && (
                            <div className="pagination-info">
                                Showing {startIndex + 1} to {endIndex} of {filteredRows.length} records
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default CorpInventory;