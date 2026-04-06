import React, { useMemo, useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import '../styles/TransactionTable.css';
import { toast } from 'react-toastify';
import { OrbitProgress } from 'react-loading-indicators';
import ConfirmationModal from '../components/ConfirmationModal';
import {
    CorpChequeApiClient,
    type CorpInventory as CorpInventoryRecord,
    type DailyChequeUsage,
} from '../services/corpChequeApi';

interface CorpChequeBalanceRow {
    date: string;
    checksPrinted: number | null;
}

interface PendingEditConfirmation {
    date: string;
    previousValue: number;
    nextValue: number | null;
}

const MAX_DAILY_CHEQUES = 99;

const CorpInventory: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [rows, setRows] = useState<CorpChequeBalanceRow[]>([]);
    const [inventory, setInventory] = useState<CorpInventoryRecord | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [saveInProgressDate, setSaveInProgressDate] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [pendingEditConfirmation, setPendingEditConfirmation] = useState<PendingEditConfirmation | null>(null);
    const persistedValuesRef = useRef<Map<string, number | null>>(new Map());
    const itemsPerPage = 12;

    const toIsoDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isWeekend = (isoDate: string) => {
        const d = new Date(isoDate);
        if (Number.isNaN(d.getTime())) return false;
        const day = d.getDay();
        return day === 0 || day === 6;
    };

    const buildRowsFromUsages = (
        startDateIso: string,
        usages: DailyChequeUsage[],
        currentBalance: number,
    ): CorpChequeBalanceRow[] => {
        const usageMap = new Map<string, number>();
        usages.forEach(usage => {
            usageMap.set(usage.date, usage.cheques_used);
        });

        const start = new Date(startDateIso);
        const today = new Date();

        if (Number.isNaN(start.getTime())) {
            return Array.from(usageMap.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, chequesUsed]) => ({ date, checksPrinted: chequesUsed }));
        }

        const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const latestUsageDate = usages.length > 0
            ? usages.reduce((latest, usage) => {
                const d = new Date(usage.date);
                return d > latest ? d : latest;
            }, new Date(usages[0].date))
            : null;

        const effectiveEndDate = currentBalance > 0
            ? endDate
            : (latestUsageDate && latestUsageDate < endDate ? latestUsageDate : endDate);

        const rowsAccumulator: CorpChequeBalanceRow[] = [];
        const cursor = new Date(effectiveEndDate);

        while (cursor >= start) {
            const dateKey = toIsoDate(cursor);
            rowsAccumulator.push({
                date: dateKey,
                checksPrinted: usageMap.has(dateKey) ? usageMap.get(dateKey)! : null,
            });
            cursor.setDate(cursor.getDate() - 1);
        }

        return rowsAccumulator;
    };

    const loadInventoryData = async (preferredInventoryId?: number) => {
        const inventoryResponse = await CorpChequeApiClient.getCorpInventories();
        if (!inventoryResponse.success || inventoryResponse.data.length === 0) {
            setInventory(null);
            setRows([]);
            setErrorMessage(inventoryResponse.error || 'No inventory record found.');
            return;
        }

        const activeInventory = preferredInventoryId
            ? inventoryResponse.data.find((item: CorpInventoryRecord) => item.id === preferredInventoryId) || inventoryResponse.data[0]
            : inventoryResponse.data[0];

        const usagesResponse = await CorpChequeApiClient.getDailyChequeUsages(activeInventory.id);
        if (!usagesResponse.success) {
            setInventory(activeInventory);
            setRows([]);
            setErrorMessage(usagesResponse.error || 'Failed to load daily usage records.');
            return;
        }

        const nextRows = buildRowsFromUsages(activeInventory.start_date, usagesResponse.data, activeInventory.current_balance);
        persistedValuesRef.current = new Map(nextRows.map(row => [row.date, row.checksPrinted]));
        setPendingEditConfirmation(null);

        setInventory(activeInventory);
        setRows(nextRows);
        setErrorMessage('');
    };

    useEffect(() => {
        const initialize = async () => {
            setIsLoading(true);
            await loadInventoryData();
            setIsLoading(false);
        };

        void initialize();
    }, []);

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

    const formatBegInventoryAsOf = (isoDate?: string) => {
        if (!isoDate) return '-';
        const d = new Date(isoDate);
        if (Number.isNaN(d.getTime())) return isoDate;
        return d.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const isLowBalance = (inventory?.current_balance ?? 0) <= 2000;

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        const container = document.querySelector('.transactions-table-container');
        if (container) container.scrollTop = 0;
    };

    const handleChecksPrintedChange = (date: string, value: string) => {
        const nextValue = value.trim() === '' ? null : Number(value);
        const normalizedValue =
            nextValue != null && Number.isFinite(nextValue)
                ? Math.min(MAX_DAILY_CHEQUES, Math.max(0, nextValue))
                : null;

        setRows(previousRows =>
            previousRows.map(row =>
                row.date === date
                    ? {
                          ...row,
                          checksPrinted: normalizedValue,
                      }
                    : row,
            ),
        );
    };

    const restoreRowToPersistedValue = (date: string, value: number | null) => {
        setRows(previousRows =>
            previousRows.map(row =>
                row.date === date
                    ? {
                          ...row,
                          checksPrinted: value,
                      }
                    : row,
            ),
        );
    };

    const executeChecksPrintedCommit = async (date: string, nextValue: number | null) => {
        if (!inventory || isWeekend(date) || saveInProgressDate === date) return;

        setSaveInProgressDate(date);
        setErrorMessage('');


        if (nextValue === null) {
            const deleteResponse = await CorpChequeApiClient.deleteDailyChequeUsageByDate(inventory.id, date);
            if (!deleteResponse.success) {
                const message = deleteResponse.error || 'Failed to clear daily usage.';
                setErrorMessage(message);
                toast.error(message);
                setSaveInProgressDate(null);
                return;
            }

            toast.success(`Cleared checks printed for ${formatRowDate(date)}.`);
        } else {
            const saveResponse = await CorpChequeApiClient.saveDailyChequeUsage(inventory.id, {
                date,
                cheques_used: nextValue,
            });

            if (!saveResponse.success) {
                const message = saveResponse.error || 'Failed to save daily usage.';
                setErrorMessage(message);
                toast.error(message);

                setSaveInProgressDate(null);
                return;
            }

            toast.success(`Saved ${nextValue} checks for ${formatRowDate(date)}.`);
        }

        await loadInventoryData(inventory.id);
        setSaveInProgressDate(null);
    };

    const handleChecksPrintedCommit = async (date: string, value: string) => {
        if (!inventory || isWeekend(date) || saveInProgressDate === date) return;

        const trimmedValue = value.trim();
        const nextValue = trimmedValue === '' ? null : Number(trimmedValue);
        if (nextValue !== null && (!Number.isFinite(nextValue) || nextValue < 0 || nextValue > MAX_DAILY_CHEQUES)) {
            setErrorMessage(`Checks printed must be between 0 and ${MAX_DAILY_CHEQUES}.`);
            return;
        }

        const previousValue = persistedValuesRef.current.has(date)
            ? persistedValuesRef.current.get(date) ?? null
            : null;
        if (previousValue === nextValue) return;

        if (previousValue !== null) {
            setPendingEditConfirmation({
                date,
                previousValue,
                nextValue,
            });
            return;
        }

        await executeChecksPrintedCommit(date, nextValue);
    };

    const handleConfirmEditChange = async () => {
        if (!pendingEditConfirmation) return;

        const confirmation = pendingEditConfirmation;
        setPendingEditConfirmation(null);
        await executeChecksPrintedCommit(
            confirmation.date,
            confirmation.nextValue,
        );
    };

    const handleCancelEditChange = () => {
        if (!pendingEditConfirmation) return;

        restoreRowToPersistedValue(pendingEditConfirmation.date, pendingEditConfirmation.previousValue);
        setPendingEditConfirmation(null);
    };

    const handleChecksPrintedKeyDown = (date: string, value: string, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;

        event.preventDefault();
        void handleChecksPrintedCommit(date, value);
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
                                    {new Intl.NumberFormat('en-US').format(inventory?.current_balance ?? 0)}
                                </div>
                            </div>

                            <div className="corp-summary-row">
                                <div className="corp-summary-subtext">
                                    Beg. Inventory ({formatBegInventoryAsOf(inventory?.start_date)})
                                </div>
                                <div className="corp-summary-value">
                                    {new Intl.NumberFormat('en-US').format(inventory?.beginning_balance ?? 0)}
                                </div>
                            </div>
                        </section>

                        {inventory && isLowBalance && (
                            <div className="corp-low-balance-warning" role="alert" aria-live="polite">
                                Corp cheque balance is low already. Please contact the bank.
                            </div>
                        )}

                        {isLoading && (
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
                        {!isLoading && errorMessage && <div className="pagination-info">{errorMessage}</div>}

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
                                        paginatedRows.map(row => {
                                            const weekend = isWeekend(row.date);

                                            return (
                                            <tr key={row.date} className={weekend ? 'corp-weekend-row' : ''}>
                                                <td className={weekend ? 'corp-weekend-date-cell' : ''}>
                                                    {formatRowDate(row.date)}
{/*                                                     {weekend && <span className="corp-weekend-pill">Weekend</span>}
 */}                                                </td>
                                                <td className="checks-printed-col checks-printed-value">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={MAX_DAILY_CHEQUES}
                                                        step="1"
                                                        inputMode="numeric"
                                                        aria-label={`Checks printed for ${formatRowDate(row.date)}`}
                                                        className={`corp-checks-printed-input ${weekend ? 'corp-checks-printed-input-disabled' : ''}`}
                                                        value={row.checksPrinted ?? ''}
                                                        onChange={e => handleChecksPrintedChange(row.date, e.target.value)}
                                                        onBlur={e => {
                                                            void handleChecksPrintedCommit(row.date, e.target.value);
                                                        }}
                                                        onKeyDown={e => handleChecksPrintedKeyDown(row.date, e.currentTarget.value, e)}
                                                        placeholder="0"
                                                        disabled={weekend || saveInProgressDate === row.date}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                        })
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

            <ConfirmationModal
                isOpen={pendingEditConfirmation !== null}
                title="Confirm Edit"
                message={
                    pendingEditConfirmation
                        ? `Update checks printed for ${formatRowDate(pendingEditConfirmation.date)} from ${pendingEditConfirmation.previousValue} to ${pendingEditConfirmation.nextValue ?? 0}?`
                        : ''
                }
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={() => {
                    void handleConfirmEditChange();
                }}
                onCancel={handleCancelEditChange}
                onBackdropClick={handleCancelEditChange}
            />
        </>
    );
};

export default CorpInventory;