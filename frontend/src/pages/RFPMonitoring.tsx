import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import EditRfpMonitoringModal from '../components/EditRfpMonitoringModal';
import AddRfpMonitoringModal from '../components/AddRfpMonitoringModal';
import '../styles/TransactionTable.css';
import {
    rfpMonitoringData,
    type RfpMonitoringRecord,
    type RfpStatus,
} from '../dummy_data/rfpMonitoringData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RFPMonitoring: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;

    const [records, setRecords] = useState<RfpMonitoringRecord[]>([...rfpMonitoringData]);

    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editableRecord, setEditableRecord] = useState<RfpMonitoringRecord | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isAddModalClosing, setIsAddModalClosing] = useState<boolean>(false);
    const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

    const [newRecord, setNewRecord] = useState<Partial<RfpMonitoringRecord>>({
        cwrProcessed: '',
        cwrUsage: 1,
        payeePerTrampsys: '',
        vessel: '',
        voy: '',
        port: '',
        etaTrampsys: '',
        etdTrampsys: '',
        trampsysStatus: 'DRAFT',
        statusCwr: '',
        remarksCwr: '',
        currencyInCwr: 'PHP',
        amountInCwr: null,
    });

    const statuses = useMemo(() => {
        const unique = Array.from(new Set(records.map(r => r.trampsysStatus))).sort();
        return unique as RfpStatus[];
    }, [records]);

    const [nextSeriesNumber, setNextSeriesNumber] = useState<number>(12511);

    useEffect(() => {
        const numbers = records
            .map(r => Number(r.expectedSeries))
            .filter(n => !Number.isNaN(n));

        if (numbers.length === 0) {
            setNextSeriesNumber(12511);
            return;
        }

        setNextSeriesNumber(Math.max(...numbers) + 1);
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

    const openEditModal = (record: RfpMonitoringRecord) => {
        setEditableRecord({ ...record });
        setIsEditModalOpen(true);
        setIsClosing(false);
    };

    const closeEditModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsEditModalOpen(false);
            setEditableRecord(null);
            setIsClosing(false);
        }, 300);
    };

    const handleEditChange = (field: keyof RfpMonitoringRecord, value: string | number | null) => {
        if (!editableRecord) return;
        setEditableRecord(prev => ({ ...prev!, [field]: value }));
    };

    const saveEditedRecord = () => {
        if (!editableRecord) return;

        setRecords(prev =>
            prev.map(r => (r.expectedSeries === editableRecord.expectedSeries ? { ...editableRecord } : r)),
        );

        toast.success('RFP record updated successfully!');
        closeEditModal();
    };

    const handleAdd = () => {
        setNewRecord({
            cwrProcessed: '',
            cwrUsage: 1,
            payeePerTrampsys: '',
            vessel: '',
            voy: '',
            port: '',
            etaTrampsys: '',
            etdTrampsys: '',
            trampsysStatus: 'DRAFT',
            statusCwr: '',
            remarksCwr: '',
            currencyInCwr: 'PHP',
            amountInCwr: null,
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

    const handleAddChange = (field: keyof RfpMonitoringRecord, value: string | number | null) => {
        setNewRecord(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveNewRecord = () => {
        if (!newRecord.payeePerTrampsys || !newRecord.port || !newRecord.etaTrampsys || !newRecord.currencyInCwr) {
            toast.error('Please fill required fields: Payee, Port, ETA, Currency in CWR');
            return;
        }

        const series = String(nextSeriesNumber);

        const recordToAdd: RfpMonitoringRecord = {
            expectedSeries: series,
            cwrProcessed: String(newRecord.cwrProcessed || `eRFP${series}`),
            cwrUsage: typeof newRecord.cwrUsage === 'number' ? newRecord.cwrUsage : 1,
            trampsysStatus: (newRecord.trampsysStatus as RfpStatus) || 'DRAFT',
            statusCwr: String(newRecord.statusCwr || ''),
            remarksCwr: String(newRecord.remarksCwr || ''),
            etaTrampsys: String(newRecord.etaTrampsys),
            etdTrampsys: String(newRecord.etdTrampsys || ''),
            payeePerTrampsys: String(newRecord.payeePerTrampsys),
            vessel: String(newRecord.vessel || ''),
            voy: String(newRecord.voy || ''),
            port: String(newRecord.port),
            series,
            currencyInCwr: String(newRecord.currencyInCwr || 'PHP'),
            amountInCwr: typeof newRecord.amountInCwr === 'number' ? newRecord.amountInCwr : null,
        };

        setRecords(prev => [recordToAdd, ...prev]);
        toast.success('RFP record added successfully!');
        closeAddModal();
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        const container = document.querySelector('.transactions-table-container');
        if (container) container.scrollTop = 0;
    };

    const getStatusClass = (status: RfpStatus) => {
        if (status === 'APPROVED') return 'rfp-status-approved';
        if (status === 'RELEASED') return 'rfp-status-released';
        if (status === 'VOID') return 'rfp-status-void';
        return 'rfp-status-draft';
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
                                <button onClick={handleAdd} className="wpsi-add-button">+ Add RFP</button>
                            </div>

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
                                    <col style={{ width: isMobile ? '19%' : '13%' }} />
                                    <col style={{ width: isMobile ? '21%' : '13%' }} />
                                    {!isMobile && <col style={{ width: isTablet ? '0%' : '21%' }} />}
                                    <col style={{ width: isMobile ? '31%' : isTablet ? '37%' : '20%' }} />
                                    <col style={{ width: isMobile ? '29%' : isTablet ? '30%' : '14%' }} />
                                    {!isTablet && <col style={{ width: '19%' }} />}
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th className="rfp-series-col">Expected Series</th>
                                        <th>TRAMPSYS Status</th>
                                        {!isMobile && <th>Status (CWR)</th>}
                                        <th>Payee per TRAMPSYS</th>
                                        <th>Vessel / Voy</th>
                                        {!isTablet && <th>Port</th>}
                                    </tr>
                                </thead>
                                <tbody className="odd:bg-gray-50 even:bg-white">
                                    {paginatedRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={isMobile ? 4 : isTablet ? 5 : 6} className="transactions-table-empty">
                                                No RFP records found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedRecords.map(record => (
                                            <tr
                                                key={record.expectedSeries}
                                                onClick={() => openEditModal(record)}
                                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="rfp-series-cell">{record.expectedSeries}</td>
                                                <td>
                                                    <span className={`rfp-status-chip ${getStatusClass(record.trampsysStatus)}`}>
                                                        {record.trampsysStatus}
                                                    </span>
                                                </td>
                                                {!isMobile && <td>{record.statusCwr || '-'}</td>}
                                                <td>{record.payeePerTrampsys || '-'}</td>
                                                <td>
                                                    <div className="rfp-stack">
                                                        <div className="rfp-primary-text">{record.vessel || '-'}</div>
                                                        <div className="rfp-secondary-text">{record.voy || '-'}</div>
                                                    </div>
                                                </td>
                                                {!isTablet && <td>{record.port || '-'}</td>}
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

                    <EditRfpMonitoringModal
                        isOpen={isEditModalOpen}
                        isClosing={isClosing}
                        record={editableRecord}
                        statuses={statuses}
                        onClose={closeEditModal}
                        onChange={handleEditChange}
                        onSave={saveEditedRecord}
                    />

                    <AddRfpMonitoringModal
                        isOpen={isAddModalOpen}
                        isClosing={isAddModalClosing}
                        nextSeriesNumber={nextSeriesNumber}
                        newRecord={newRecord}
                        statuses={statuses}
                        onClose={closeAddModal}
                        onChange={handleAddChange}
                        onSave={handleSaveNewRecord}
                    />
                </main>
            </div>
        </>
    );
};

export default RFPMonitoring;
