import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/TransactionTable.css';
import { OrbitProgress } from 'react-loading-indicators';
import {
    type RfpMonitoringRecord,
    type RfpStatus,
} from '../types/rfp';
import { RfpApi } from '../services/rfpApi';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const RFPMonitoring: React.FC = () => {
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;

    const [records, setRecords] = useState<RfpMonitoringRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

    // Load RFP records and foreign key data from backend
    useEffect(() => {
        const loadAllData = async () => {
            try {
                setLoading(true);
                
                // Load all data in parallel
                const [rfpResponse, payeesResponse, vesselResponse, portsResponse] = await Promise.all([
                    RfpApi.getAllRfpRecords(),
                    RfpApi.getPayees(),
                    RfpApi.getVesselPrincipals(), 
                    RfpApi.getPorts()
                ]);
                
                console.log('All API Responses:', {
                    rfp: rfpResponse.data,
                    payees: payeesResponse.data,
                    vessels: vesselResponse.data,
                    ports: portsResponse.data
                });
                
                if (rfpResponse.success) {
                    // Resolve foreign key relationships
                    const enrichedRecords = rfpResponse.data.map((record: any) => {
                        const payeeId = typeof record.payee === 'string' ? record.payee : record.payee?.payee_id;
                        const vesselId = typeof record.vessel_principal === 'string' ? record.vessel_principal : record.vessel_principal?.vessel_principal_id;
                        const portId = typeof record.port === 'string' ? record.port : record.port?.port_id;
                        
                        return {
                            ...record,
                            payee_data: payeesResponse.success ? payeesResponse.data.find((p: any) => p.payee_id === payeeId) : null,
                            vessel_principal_data: vesselResponse.success ? vesselResponse.data.find((v: any) => v.vessel_principal_id === vesselId) : null,
                            port_data: portsResponse.success ? portsResponse.data.find((p: any) => p.port_id === portId) : null,
                        };
                    });
                    
                    setRecords(enrichedRecords);
                } else {
                    setError(rfpResponse.error || 'Failed to load RFP records');
                    toast.error('Failed to load RFP records');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, []);

    const statuses = useMemo(() => {
        const unique = Array.from(new Set(records.map(r => r.trampsys_status))).sort();
        return unique as RfpStatus[];
    }, [records]);

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isTablet = screenWidth <= 1024;
    const isMobile = screenWidth <= 768;

    // Helper functions to safely get display names
    const getPayeeName = (record: RfpMonitoringRecord) => {
        return record.payee_data?.payee_name || 
               (typeof record.payee === 'object' ? record.payee?.payee_name : null) || 
               '-';
    };
    
    const getVesselName = (record: RfpMonitoringRecord) => {
        return record.vessel_principal_data?.vessel_principal_name || 
               (typeof record.vessel_principal === 'object' ? record.vessel_principal?.vessel_principal_name : null) || 
               '-';
    };
    
    const getPortName = (record: RfpMonitoringRecord) => {
        return record.port_data?.port_name || 
               (typeof record.port === 'object' ? record.port?.port_name : null) || 
               '-';
    };

    const filteredRecords = useMemo(() => {
        const loweredQuery = searchQuery.toLowerCase();

        return records.filter(record => {
            const matchesSearch =
                searchQuery === '' ||
                [
                    record.expected_series,
                    record.cwr_processed,
                    record.cwr_usage,
                    getPayeeName(record),
                    getVesselName(record),
                    record.voy,
                    getPortName(record),
                    record.eta,
                    record.etd,
                    record.trampsys_status,
                    record.status_cwr,
                    record.remarks_cwr,
                ].some(value => String(value).toLowerCase().includes(loweredQuery));

            const matchesStatus = statusFilter === 'All' || record.trampsys_status === statusFilter;

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
        navigate(`/edit-rfp/${record.expected_series}`);
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
                        {loading && (
                            <div
                                role="status"
                                aria-live="polite"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '100%',
                                    padding: '1.5rem 0',
                                }}
                            >
                                <OrbitProgress variant="disc" dense color="#32cd32" size="small" text="" textColor="" />
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                Error: {error}
                            </div>
                        )}

                        {!loading && !error && (
                            <>
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
                                                key={record.expected_series}
                                                onClick={() => openEditPage(record)}
                                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                                                title={record.trampsys_status === 'Released' ? 'Released records are view-only.' : 'Open record for editing'}
                                                aria-label={record.trampsys_status === 'Released' ? 'Open released record in view-only mode' : 'Open record for editing'}
                                            >
                                                <td className="rfp-series-cell">{record.expected_series}</td>
                                                {!isMobile && <td>{record.status_cwr ? new Date(record.status_cwr).toLocaleString() : '-'}</td>}
                                                <td className="rfp-payee-cell">
                                                    <div className="rfp-payee-text">{getPayeeName(record)}</div>
                                                </td>
                                                <td className="rfp-vessel-cell">
                                                    <div className="rfp-stack">
                                                        <div className="rfp-primary-text">{getVesselName(record)}</div>
                                                        <div className="rfp-secondary-text">{record.voy || '-'}</div>
                                                    </div>
                                                </td>
                                                {!isTablet && <td className="rfp-port-cell">{getPortName(record)}</td>}
                                                {!isMobile && (
                                                    <td className="rfp-status-cell">
                                                        <div
                                                            className={`status-badge ${record.trampsys_status === 'Approved' || record.trampsys_status === 'Released' ? 'completed' :
                                                                record.trampsys_status === 'Draft' ? 'pending' :
                                                                    'failed'
                                                                }`}
                                                            title={record.trampsys_status}
                                                            aria-label={record.trampsys_status}
                                                        >
                                                            {record.trampsys_status}
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
                            </>
                        )}
                    </div>

                </main>
            </div>
        </>
    );
};

export default RFPMonitoring;
