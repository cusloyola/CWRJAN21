import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/AddTransactionForm.css';
import {
  rfpMonitoringData,
  type RfpMonitoringRecord,
  type RfpStatus,
} from '../dummy_data/rfpMonitoringData';

const AddRfpMonitoring = () => {
  const navigate = useNavigate();
  const { expectedSeries } = useParams<{ expectedSeries?: string }>();
  const isEditMode = Boolean(expectedSeries);

  const RFP_STORAGE_KEY = 'rfpMonitoringData';
  const RFP_DRAFT_KEY = 'pendingRfpRecord';
  const getEditDraftKey = (series: string) => `pendingRfpEditDraft:${series}`;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<'rfp' | 'back'>('rfp');
  const [record, setRecord] = useState<Partial<RfpMonitoringRecord>>({});
  const [initialRecord, setInitialRecord] = useState<Partial<RfpMonitoringRecord>>({});

  const [records, setRecords] = useState<RfpMonitoringRecord[]>(() => {
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

  const statuses = useMemo(() => {
    const baseStatuses: RfpStatus[] = ['APPROVED', 'RELEASED', 'DRAFT', 'VOID'];
    const dynamic = Array.from(new Set(records.map(item => item.trampsysStatus))).filter(Boolean) as RfpStatus[];
    return Array.from(new Set([...baseStatuses, ...dynamic]));
  }, [records]);

  const nextSeriesNumber = useMemo(() => {
    const numbers = records
      .map(item => Number(item.expectedSeries))
      .filter(item => !Number.isNaN(item));

    if (numbers.length === 0) {
      return 12511;
    }

    return Math.max(...numbers) + 1;
  }, [records]);

  const isReadOnlyMode = isEditMode && initialRecord.trampsysStatus === 'RELEASED';

  useEffect(() => {
    if (isEditMode) {
      const existingRecord = records.find(item => item.expectedSeries === expectedSeries);

      if (!existingRecord) {
        toast.error('RFP record not found.');
        navigate('/rfp-monitoring');
        return;
      }

      const editDraftKey = getEditDraftKey(expectedSeries!);
      if (existingRecord.trampsysStatus === 'RELEASED') {
        localStorage.removeItem(editDraftKey);
        setRecord(existingRecord);
        setInitialRecord(existingRecord);
        return;
      }

      const savedEditDraft = localStorage.getItem(editDraftKey);

      if (savedEditDraft) {
        try {
          setRecord(JSON.parse(savedEditDraft) as Partial<RfpMonitoringRecord>);
          setInitialRecord(existingRecord);
          return;
        } catch {
          localStorage.removeItem(editDraftKey);
        }
      }

      setRecord(existingRecord);
      setInitialRecord(existingRecord);
      return;
    }

    const draft = localStorage.getItem(RFP_DRAFT_KEY);
    if (draft) {
      try {
        setRecord(JSON.parse(draft) as Partial<RfpMonitoringRecord>);
      } catch {
        localStorage.removeItem(RFP_DRAFT_KEY);
        setRecord({});
      }
    } else {
      setRecord({});
      setInitialRecord({});
    }
  }, [expectedSeries, isEditMode, navigate, records]);

  useEffect(() => {
    localStorage.setItem(RFP_STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    if (!isEditMode && Object.keys(record).length > 0) {
      localStorage.setItem(RFP_DRAFT_KEY, JSON.stringify(record));
    }
  }, [isEditMode, record]);

  useEffect(() => {
    if (isEditMode && expectedSeries && Object.keys(record).length > 0) {
      if (isReadOnlyMode) {
        return;
      }
      localStorage.setItem(getEditDraftKey(expectedSeries), JSON.stringify(record));
    }
  }, [isEditMode, expectedSeries, record, isReadOnlyMode]);

  const toComparableRecord = (value: Partial<RfpMonitoringRecord>) => ({
    cwrProcessed: value.cwrProcessed || '',
    cwrUsage: typeof value.cwrUsage === 'number' ? value.cwrUsage : 1,
    trampsysStatus: (value.trampsysStatus as RfpStatus) || 'DRAFT',
    statusCwr: value.statusCwr || '',
    remarksCwr: value.remarksCwr || '',
    etaTrampsys: value.etaTrampsys || '',
    etdTrampsys: value.etdTrampsys || '',
    payeePerTrampsys: value.payeePerTrampsys || '',
    vessel: value.vessel || '',
    voy: value.voy || '',
    port: value.port || '',
    currencyInCwr: value.currencyInCwr || 'PHP',
    amountInCwr: typeof value.amountInCwr === 'number' ? value.amountInCwr : null,
  });

  const hasUnsavedEditChanges = isEditMode
    && !isReadOnlyMode
    && Object.keys(initialRecord).length > 0
    && JSON.stringify(toComparableRecord(initialRecord)) !== JSON.stringify(toComparableRecord(record));

  const hasUnsavedChanges = isEditMode
    ? hasUnsavedEditChanges
    : Object.keys(record).length > 0;

  useEffect(() => {
    if (hasUnsavedChanges) {
      window.history.pushState({ guard: 'rfp-form' }, '', window.location.href);
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    const handlePopState = () => {
      if (!hasUnsavedChanges) {
        return;
      }

      setLeaveTarget('back');
      setShowConfirmModal(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  const handleChange = (field: keyof RfpMonitoringRecord, value: string | number | null) => {
    if (isReadOnlyMode) {
      return;
    }
    setRecord(prev => ({ ...prev, [field]: value }));
  };

  const validateRecord = () => {
    if (!record.payeePerTrampsys || !record.port || !record.etaTrampsys || !record.currencyInCwr) {
      toast.error('Please fill required fields: Payee, Port, ETA, Currency in CWR');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (isReadOnlyMode) {
      toast.info('This RFP is already RELEASED and can only be viewed.');
      return;
    }

    if (!validateRecord()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      if (isEditMode && expectedSeries) {
        setRecords(prev =>
          prev.map(item =>
            item.expectedSeries === expectedSeries
              ? {
                ...item,
                ...record,
                expectedSeries: item.expectedSeries,
                series: item.series,
              } as RfpMonitoringRecord
              : item,
          ),
        );
      } else {
        const series = String(nextSeriesNumber);
        const newRecord: RfpMonitoringRecord = {
          expectedSeries: series,
          cwrProcessed: String(record.cwrProcessed || `eRFP${series}`),
          cwrUsage: typeof record.cwrUsage === 'number' ? record.cwrUsage : 1,
          trampsysStatus: (record.trampsysStatus as RfpStatus) || 'DRAFT',
          statusCwr: String(record.statusCwr || ''),
          remarksCwr: String(record.remarksCwr || ''),
          etaTrampsys: String(record.etaTrampsys || ''),
          etdTrampsys: String(record.etdTrampsys || ''),
          payeePerTrampsys: String(record.payeePerTrampsys || ''),
          vessel: String(record.vessel || ''),
          voy: String(record.voy || ''),
          port: String(record.port || ''),
          series,
          currencyInCwr: String(record.currencyInCwr || 'PHP'),
          amountInCwr: typeof record.amountInCwr === 'number' ? record.amountInCwr : null,
        };

        setRecords(prev => [newRecord, ...prev]);
      }

      localStorage.removeItem(RFP_DRAFT_KEY);
      if (isEditMode && expectedSeries) {
        localStorage.removeItem(getEditDraftKey(expectedSeries));
      }
      toast.success(isEditMode ? 'RFP record updated successfully!' : 'RFP record added successfully!');
      navigate('/rfp-monitoring');
    } catch {
      toast.error('Failed to save record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isReadOnlyMode) {
      navigate('/rfp-monitoring');
      return;
    }

    if (isEditMode && hasUnsavedEditChanges) {
      setLeaveTarget('rfp');
      setShowConfirmModal(true);
      return;
    }

    if (!isEditMode) {
      localStorage.removeItem(RFP_DRAFT_KEY);
    } else if (expectedSeries) {
      localStorage.removeItem(getEditDraftKey(expectedSeries));
    }
    navigate('/rfp-monitoring');
  };

  const handleKeepDraft = () => {
    setShowConfirmModal(false);
    if (leaveTarget === 'back') {
      navigate(-1);
      return;
    }
    navigate('/rfp-monitoring');
  };

  const handleDiscardDraft = () => {
    if (isEditMode && expectedSeries) {
      localStorage.removeItem(getEditDraftKey(expectedSeries));
    }
    setShowConfirmModal(false);
    if (leaveTarget === 'back') {
      navigate(-1);
      return;
    }
    navigate('/rfp-monitoring');
  };

  const handleCancelModal = () => {
    setShowConfirmModal(false);
    if (leaveTarget === 'back' && hasUnsavedChanges) {
      window.history.pushState({ guard: 'rfp-form' }, '', window.location.href);
    }
  };

  const title = isReadOnlyMode ? 'View RFP Record' : isEditMode ? 'Edit RFP Record' : 'Add New RFP Record';
  const displaySeries = isEditMode ? expectedSeries : String(nextSeriesNumber);

  return (
    <>
      <Sidebar />
      <div className="dashboard-content">
        <div className="px-4 sm:px-6">
          <div className="transaction-form-container">
            <div className="transaction-form-header">
              <h2 className="transaction-form-title">{title}</h2>
            </div>

            <form className="transaction-form dashboard-wrapper" onSubmit={e => { e.preventDefault(); handleSave(); }}>
              <div className="transaction-form-content">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="transaction-form-detail-label" style={{ textAlign: 'center' }}>
                    Expected Series
                  </span>
                  <h3 className="transaction-form-ref-title" style={{ textAlign: 'center', margin: 0 }}>
                    {displaySeries}
                  </h3>
                </div>
                {isReadOnlyMode && (
                  <div className="transaction-form-readonly-note" role="status" aria-live="polite">
                    This RFP is already RELEASED. Editing is no longer allowed and the form is view-only.
                  </div>
                )}



                <div className="transaction-form-details">
                  <div className="transaction-form-detail-row">
                    <label className="transaction-form-detail-label">CWR Processed</label>
                    <input
                      type="text"
                      className="transaction-form-detail-value"
                      value={record.cwrProcessed || (!isEditMode ? `eRFP${displaySeries}` : '')}
                      onChange={e => handleChange('cwrProcessed', e.target.value)}
                      placeholder={`eRFP${displaySeries}`}
                      disabled={isReadOnlyMode}
                    />
                  </div>

                  <div className="transaction-form-detail-row">
                    <label className="transaction-form-detail-label">CWR Usage</label>
                    <input
                      type="number"
                      min="1"
                      className="transaction-form-detail-value"
                      value={record.cwrUsage ?? 1}
                      onChange={e => handleChange('cwrUsage', e.target.value ? Number(e.target.value) : 1)}
                      disabled={isReadOnlyMode}
                    />
                  </div>

                  <div className="transaction-form-detail-row">
                    <label className="transaction-form-detail-label">TRAMPSYS Status</label>
                    <select
                      className="transaction-form-detail-value transaction-form-select"
                      value={record.trampsysStatus || 'DRAFT'}
                      onChange={e => handleChange('trampsysStatus', e.target.value as RfpStatus)}
                      disabled={isReadOnlyMode}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="transaction-form-detail-row">
                    <label className="transaction-form-detail-label">Status (CWR)</label>
                    <input
                      type="text"
                      className="transaction-form-detail-value"
                      value={record.statusCwr || ''}
                      onChange={e => handleChange('statusCwr', e.target.value)}
                      placeholder="e.g. PRINTED 03/02/2026 9:37am"
                      disabled={isReadOnlyMode}
                    />
                  </div>

                  <div className="transaction-form-detail-row">
                    <label className="transaction-form-detail-label">Remarks (CWR)</label>
                    <input
                      type="text"
                      className="transaction-form-detail-value"
                      value={record.remarksCwr || ''}
                      onChange={e => handleChange('remarksCwr', e.target.value)}
                      disabled={isReadOnlyMode}
                    />
                  </div>

                  <div className="transaction-form-detail-row">
                    <label className="transaction-form-detail-label">ETA TRAMPSYS</label>
                    <input
                      type="date"
                      className="transaction-form-detail-value"
                      value={record.etaTrampsys || ''}
                      onChange={e => handleChange('etaTrampsys', e.target.value)}
                      required
                      disabled={isReadOnlyMode}
                    />
                  </div>

                  <div className="transaction-form-detail-row">
                    <label className="transaction-form-detail-label">ETD TRAMPSYS</label>
                    <input
                      type="date"
                      className="transaction-form-detail-value"
                      value={record.etdTrampsys || ''}
                      onChange={e => handleChange('etdTrampsys', e.target.value)}
                      disabled={isReadOnlyMode}
                    />
                  </div>

                  <div className="transaction-form-detail-row">
                    <label className="transaction-form-detail-label">Payee per TRAMPSYS</label>
                    <input
                      type="text"
                      className="transaction-form-detail-value"
                      value={record.payeePerTrampsys || ''}
                      onChange={e => handleChange('payeePerTrampsys', e.target.value)}
                      required
                      disabled={isReadOnlyMode}
                    />
                  </div>

                  <div className="transaction-form-detail-row">
                    <label className="transaction-form-detail-label">Vessel</label>
                    <input
                      type="text"
                      className="transaction-form-detail-value"
                      value={record.vessel || ''}
                      onChange={e => handleChange('vessel', e.target.value)}
                      disabled={isReadOnlyMode}
                    />
                  </div>

                  <div className="transaction-form-detail-row">
                    <label className="transaction-form-detail-label">Voy</label>
                    <input
                      type="text"
                      className="transaction-form-detail-value"
                      value={record.voy || ''}
                      onChange={e => handleChange('voy', e.target.value)}
                      disabled={isReadOnlyMode}
                    />
                  </div>

                  <div className="transaction-form-detail-row">
                    <label className="transaction-form-detail-label">Port</label>
                    <input
                      type="text"
                      className="transaction-form-detail-value"
                      value={record.port || ''}
                      onChange={e => handleChange('port', e.target.value)}
                      required
                      disabled={isReadOnlyMode}
                    />
                  </div>

                  <div className="transaction-form-detail-row">
                    <label className="transaction-form-detail-label">Currency in CWR</label>
                    <input
                      type="text"
                      className="transaction-form-detail-value"
                      value={record.currencyInCwr || 'PHP'}
                      onChange={e => handleChange('currencyInCwr', e.target.value)}
                      required
                      disabled={isReadOnlyMode}
                    />
                  </div>

                  <div className="transaction-form-detail-row">
                    <label className="transaction-form-detail-label">Amount in CWR</label>
                    <input
                      type="number"
                      step="0.01"
                      className="transaction-form-detail-value"
                      value={record.amountInCwr ?? ''}
                      onChange={e => handleChange('amountInCwr', e.target.value ? Number(e.target.value) : null)}
                      disabled={isReadOnlyMode}
                    />
                  </div>
                </div>

                <div className="transaction-form-actions">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="transaction-form-cancel-button"
                    disabled={isSubmitting}
                  >
                    {isReadOnlyMode ? 'Back' : 'Cancel'}
                  </button>
                  {!isReadOnlyMode && (
                    <button
                      type="submit"
                      className="transaction-form-save-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : isEditMode ? 'Save RFP Changes' : 'Add RFP Record'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {isEditMode && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          title="Save Draft?"
          message="You have unsaved changes. Do you want to keep your draft for later?"
          confirmText="Keep Draft"
          cancelText="Don't Save"
          onConfirm={handleKeepDraft}
          onCancel={handleDiscardDraft}
          onBackdropClick={handleCancelModal}
        />
      )}
    </>
  );
};

export default AddRfpMonitoring;
