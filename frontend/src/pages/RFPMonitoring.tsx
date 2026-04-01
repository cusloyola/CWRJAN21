import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/TransactionTable.css';
import {
    rfpMonitoringData,
    type RfpMonitoringRecord,
    type RfpStatus,
} from '../dummy_data/rfpMonitoringData';
import 'react-toastify/dist/ReactToastify.css';

const RFPMonitoring: React.FC = () => {
    const navigate = useNavigate();
    const RFP_STORAGE_KEY = 'rfpMonitoringData';

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;

    const [records] = useState<RfpMonitoringRecord[]>(() => {
        const savedRecords = localStorage.getItem(RFP_STORAGE_KEY);
        if (savedRecords) {
            try {
                return JSON.parse(savedRecords) as RfpMonitoringRecord[];
            } catch {
                return [...rfpMonitoringData];
            }
        }
        return [...rfpMonitoringData];
    });

    const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

    const statuses = useMemo(() => {
        const unique = Array.from(new Set(records.map(r => r.trampsysStatus))).sort();
        return unique as RfpStatus[];
    }, [records]);

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isTablet = screenWidth <= 1024;
    const isMobile = screenWidth <= 768;

    const filteredRecords = useMemo(() => {
        const loweredQuery = searchQuery.toLowerCase();

        return records.filter(record => {
            const matchesSearch =
                searchQuery === '' ||
                [
                    record.expectedSeries,
                    record.cwrProcessed,
                    record.cwrUsage,
                    record.payeePerTrampsys,
                    record.vessel,
                    record.voy,
                    record.port,
                    record.etaTrampsys,
                    record.etdTrampsys,
                    record.trampsysStatus,
                    record.statusCwr,
                    record.remarksCwr,
                ].some(value => String(value).toLowerCase().includes(loweredQuery));

            const matchesStatus = statusFilter === 'All' || record.trampsysStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [records, searchQuery, statusFilter]);

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredRecords.length);
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const openEditPage = (record: RfpMonitoringRecord) => {
        navigate(`/edit-rfp/${record.expectedSeries}`);
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
            <div className="dashboard-content">
                <div className="transaction-form-header">
                    <h2 className="transaction-form-title">RFP Monitoring</h2>
                </div>
                <main style={{ padding: 'min(30px, 7%)', width: '100%', overflowX: 'hidden' }}>
                    <div className="transactions-page-wrapper">


                        <div className="wpsi-controls">
                            <div className="wpsi-search-container">
                                <input
                                    type="text"
                                    placeholder="Search RFP records..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="wpsi-search-input"
                                    style={{ paddingLeft: '2.5rem'/* , maxWidth: '500px' */ }}
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

                            <Link to="/add-rfp" className="wpsi-add-button" style={{ textDecoration: 'none' }}>
                                + Add RFP
                            </Link>

                            <div className="wpsi-dropdown-container">
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="wpsi-dropdown"
                                >
                                    <option value="All">Status</option>
                                    {statuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="transactions-table-container">
                            <table className="transactions-table table rfp-monitoring-table">
                                <colgroup>
                                    <col style={{ width: isMobile ? '24%' : '13%' }} />
                                    {!isMobile && <col style={{ width: isTablet ? '0%' : '21%' }} />}
                                    <col style={{ width: isMobile ? '36%' : isTablet ? '37%' : '20%' }} />
                                    <col style={{ width: isMobile ? '40%' : isTablet ? '30%' : '14%' }} />
                                    {!isTablet && <col style={{ width: '19%' }} />}
                                    {!isMobile && <col style={{ width: '13%' }} />}

                                </colgroup>
                                <thead>
                                    <tr>
                                        <th className="rfp-series-col">Expected Series</th>
                                        {!isMobile && <th>Status (CWR)</th>}
                                        <th>Payee per TRAMPSYS</th>
                                        <th>Vessel / Voy</th>
                                        {!isTablet && <th>Port</th>}
                                        {!isMobile && <th>TRAMPSYS Status</th>}

                                    </tr>
                                </thead>
                                <tbody className="odd:bg-gray-50 even:bg-white">
                                    {paginatedRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={isMobile ? 3 : isTablet ? 5 : 6} className="transactions-table-empty">
                                                No RFP records found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedRecords.map(record => (
                                            <tr
                                                key={record.expectedSeries}
                                                onClick={() => openEditPage(record)}
                                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                                                title={record.trampsysStatus === 'RELEASED' ? 'Released records are view-only.' : 'Open record for editing'}
                                                aria-label={record.trampsysStatus === 'RELEASED' ? 'Open released record in view-only mode' : 'Open record for editing'}
                                            >
                                                <td className="rfp-series-cell">{record.expectedSeries}</td>
                                                {!isMobile && <td>{record.statusCwr || '-'}</td>}
                                                <td className="rfp-payee-cell">
                                                    <div className="rfp-payee-text">{record.payeePerTrampsys || '-'}</div>
                                                </td>
                                                <td className="rfp-vessel-cell">
                                                    <div className="rfp-stack">
                                                        <div className="rfp-primary-text">{record.vessel || '-'}</div>
                                                        <div className="rfp-secondary-text">{record.voy || '-'}</div>
                                                    </div>
                                                </td>
                                                {!isTablet && <td className="rfp-port-cell">{record.port || '-'}</td>}
                                                {!isMobile && (
                                                    <td className="rfp-status-cell">
                                                        <div
                                                            className={`status-badge ${record.trampsysStatus === 'APPROVED' || record.trampsysStatus === 'RELEASED' ? 'completed' :
                                                                record.trampsysStatus === 'DRAFT' ? 'pending' :
                                                                    'failed'
                                                                }`}
                                                            title={record.trampsysStatus}
                                                            aria-label={record.trampsysStatus}
                                                        >
                                                            {record.trampsysStatus}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {filteredRecords.length > 0 && totalPages > 1 && (
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

                        {filteredRecords.length > 0 && (
                            <div className="pagination-info">
                                Showing {startIndex + 1} to {endIndex} of {filteredRecords.length} records
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </>
    );
};

export default RFPMonitoring;
