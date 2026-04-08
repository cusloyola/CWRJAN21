import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/AddTransactionForm.css';
import {
  type RfpMonitoringRecord,
  type RfpStatus,
  type RfpFormData,
} from '../types/rfp';
import { RfpApi } from '../services/rfpApi';
import { useRfpForeignKeyData } from '../hooks/useRfpData';
import { OrbitProgress } from 'react-loading-indicators';

const SPINNER_DELAY_MS = 1000;

const AddRfpMonitoring = () => {
  const navigate = useNavigate();
  const { expectedSeries } = useParams<{ expectedSeries?: string }>();
  const isEditMode = Boolean(expectedSeries);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<'rfp' | 'back'>('rfp');
  const [record, setRecord] = useState<Partial<RfpMonitoringRecord>>({});
  const [initialRecord, setInitialRecord] = useState<Partial<RfpMonitoringRecord>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextSeriesNumber, setNextSeriesNumber] = useState<number>(12936);

  // Load foreign key data
  const { payees, vesselPrincipals, ports, loading: fkLoading } = useRfpForeignKeyData();

  const statuses = useMemo(() => {
    const baseStatuses: RfpStatus[] = ['Approved', 'Released', 'Draft', 'For AGM Approval', 'For OM Approval'];
    return baseStatuses;
  }, []);

  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const isBusy = loading || fkLoading;

  useEffect(() => {
    if (!isBusy) {
      setShowLoadingSpinner(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowLoadingSpinner(true);
    }, SPINNER_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isBusy]);

  // Load record data and next series number
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isEditMode && expectedSeries) {
          // Wait for foreign key data to be loaded first
          if (fkLoading || payees.length === 0) {
            return; // Wait for foreign key data
          }

          // Load existing record
          const recordResponse = await RfpApi.getRfpRecord(Number(expectedSeries));
          if (recordResponse.success) {
            console.log('Loaded RFP record:', recordResponse.data);
            console.log('Available payees:', payees);
            console.log('Available vessels:', vesselPrincipals);
            console.log('Available ports:', ports);
            setRecord(recordResponse.data);
            setInitialRecord(recordResponse.data);
          } else {
            toast.error('RFP record not found.');
            navigate('/rfp-monitoring');
            return;
          }
        } else {
          // Get next series number for new record
          const allRecordsResponse = await RfpApi.getAllRfpRecords();
          if (allRecordsResponse.success) {
            const records = allRecordsResponse.data;
            const numbers = records
              .map(item => Number(item.expected_series))
              .filter(item => !Number.isNaN(item));

            const nextSeries = numbers.length > 0 ? Math.max(...numbers) + 1 : 12936;
            setNextSeriesNumber(nextSeries);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [expectedSeries, isEditMode, navigate, fkLoading, payees.length, vesselPrincipals.length, ports.length]);

  const isReadOnlyMode = isEditMode && initialRecord.trampsys_status === 'Released';

  // Remove all the old useEffect hooks that dealt with localStorage

  const toComparableRecord = (value: Partial<RfpMonitoringRecord>) => ({
    cwr_processed: value.cwr_processed || 0,
    cwr_usage: typeof value.cwr_usage === 'number' ? value.cwr_usage : 1,
    trampsys_status: (value.trampsys_status as RfpStatus) || 'Draft',
    status_cwr: value.status_cwr || null,
    remarks_cwr: value.remarks_cwr || null,
    eta: value.eta || '',
    etd: value.etd || '',
    payee: value.payee || null,
    vessel_principal: value.vessel_principal || null,
    voy: value.voy || null,
    port: value.port || null,
  });

  const hasUnsavedEditChanges = isEditMode
    && !isReadOnlyMode
    && Object.keys(initialRecord).length > 0
    && JSON.stringify(toComparableRecord(initialRecord)) !== JSON.stringify(toComparableRecord(record));

  const hasUnsavedChanges = isEditMode
    ? hasUnsavedEditChanges
    : Object.keys(record).length > 0;

  // Remove the localStorage handling useEffect since we're using API now

  // Helper functions to get selected IDs for form display
  const getSelectedPayeeId = () => {
    // Handle UUID string from backend
    if (typeof record.payee === 'string') {
      // Check if it's a UUID that matches a payee's payee_id
      const matchingPayee = payees.find(p => p.payee_id === record.payee);
      return matchingPayee ? matchingPayee.payee_id : record.payee;
    }
    if (typeof record.payee === 'object' && record.payee?.payee_id) return record.payee.payee_id;
    if (record.payee_data?.payee_id) return record.payee_data.payee_id;
    console.log('No payee ID found, record.payee:', record.payee);
    return '';
  };

  const getSelectedVesselId = () => {
    // Handle UUID string from backend
    if (typeof record.vessel_principal === 'string') {
      // Check if it's a UUID that matches a vessel's vessel_principal_id
      const matchingVessel = vesselPrincipals.find(v => v.vessel_principal_id === record.vessel_principal);
      return matchingVessel ? matchingVessel.vessel_principal_id : record.vessel_principal;
    }
    if (typeof record.vessel_principal === 'object' && record.vessel_principal?.vessel_principal_id) return record.vessel_principal.vessel_principal_id;
    if (record.vessel_principal_data?.vessel_principal_id) return record.vessel_principal_data.vessel_principal_id;
    console.log('No vessel ID found, record.vessel_principal:', record.vessel_principal);
    return '';
  };

  const getSelectedPortId = () => {
    // Handle UUID string from backend
    if (typeof record.port === 'string') {
      // Check if it's a UUID that matches a port's port_id
      const matchingPort = ports.find(p => p.port_id === record.port);
      return matchingPort ? matchingPort.port_id : record.port;
    }
    if (typeof record.port === 'object' && record.port?.port_id) return record.port.port_id;
    if (record.port_data?.port_id) return record.port_data.port_id;
    console.log('No port ID found, record.port:', record.port);
    return '';
  };

  const handleChange = (field: keyof RfpMonitoringRecord, value: string | number | null) => {
    if (isReadOnlyMode) {
      return;
    }
    setRecord(prev => ({ ...prev, [field]: value }));
  };

  const handlePayeeChange = (payeeId: string) => {
    const selectedPayee = payees.find(p => p.payee_id === payeeId);
    setRecord(prev => ({
      ...prev,
      payee: payeeId, // Store the ID directly for API
      payee_data: selectedPayee || undefined  // Keep object for display
    }));
  };

  const handleVesselPrincipalChange = (vesselId: string) => {
    const selectedVessel = vesselPrincipals.find(v => v.vessel_principal_id === vesselId);
    setRecord(prev => ({
      ...prev,
      vessel_principal: vesselId, // Store the ID directly for API
      vessel_principal_data: selectedVessel || undefined  // Keep object for display
    }));
  };

  const handlePortChange = (portId: string) => {
    const selectedPort = ports.find(p => p.port_id === portId);
    setRecord(prev => ({
      ...prev,
      port: portId, // Store the ID directly for API
      port_data: selectedPort || undefined  // Keep object for display
    }));
  };

  const validateRecord = () => {
    // For both new and edit mode, check if values are selected in the form
    const selectedPayeeId = getSelectedPayeeId();
    const selectedVesselId = getSelectedVesselId();
    // Port is optional in Django model (null=True, blank=True)

    console.log('Validation check:', {
      selectedPayeeId,
      selectedVesselId,
      eta: record.eta,
      etd: record.etd,
      isEditMode,
      record_payee: record.payee,
      record_vessel_principal: record.vessel_principal
    });

    if (!selectedPayeeId || !selectedVesselId || !record.eta || !record.etd) {
      toast.error('Please fill required fields: Payee, Vessel/Principal, ETA, ETD');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (isReadOnlyMode) {
      toast.info('This RFP is already Released and can only be viewed.');
      return;
    }

    if (!validateRecord()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && expectedSeries) {
        // Update existing record
        const formData: Partial<RfpFormData> = {
          cwr_usage: typeof record.cwr_usage === 'number' ? record.cwr_usage : 1,
          trampsys_status: (record.trampsys_status as RfpStatus) || 'Draft',
          status_cwr: record.status_cwr || undefined,
          remarks_cwr: record.remarks_cwr || undefined,
          eta: record.eta || '',
          etd: record.etd || '',
          voy: record.voy || undefined,
        };

        // Add foreign keys using the selected IDs
        const selectedPayeeId = getSelectedPayeeId();
        const selectedVesselId = getSelectedVesselId();
        const selectedPortId = getSelectedPortId();

        if (selectedPayeeId) formData.payee = selectedPayeeId;
        if (selectedVesselId) formData.vessel_principal = selectedVesselId;
        if (selectedPortId) formData.port = selectedPortId;

        console.log('Sending update data:', formData);
        const response = await RfpApi.updateRfpRecord(Number(expectedSeries), formData);

        if (response.success) {
          toast.success('RFP record updated successfully!');
          navigate('/rfp-monitoring');
        } else {
          toast.error(response.error || 'Failed to update RFP record');
        }
      } else {
        // Create new record
        const selectedPayeeId = getSelectedPayeeId();
        const selectedVesselId = getSelectedVesselId();
        const selectedPortId = getSelectedPortId();

        console.log('Selected IDs for create:', {
          payee: selectedPayeeId,
          vessel: selectedVesselId,
          port: selectedPortId
        });

        // Ensure we have valid UUIDs or don't send the fields
        const formData: RfpFormData = {
          cwr_usage: typeof record.cwr_usage === 'number' ? record.cwr_usage : 1,
          trampsys_status: (record.trampsys_status as RfpStatus) || 'Draft',
          status_cwr: record.status_cwr || undefined,
          remarks_cwr: record.remarks_cwr || undefined,
          eta: record.eta || '',
          etd: record.etd || '',
          voy: record.voy || undefined,
        };

        // Only add foreign keys if they have valid values
        // Add required foreign keys (payee and vessel_principal are required in Django model)
        if (selectedPayeeId) {
          formData.payee = selectedPayeeId;
        } else {
          toast.error('Please select a payee');
          setIsSubmitting(false);
          return;
        }

        if (selectedVesselId) {
          formData.vessel_principal = selectedVesselId;
        } else {
          toast.error('Please select a vessel/principal');
          setIsSubmitting(false);
          return;
        }

        // Port is optional
        if (selectedPortId) formData.port = selectedPortId;

        console.log('Sending create data:', formData);
        const response = await RfpApi.createRfpRecord(formData);

        if (response.success) {
          toast.success('RFP record added successfully!');
          navigate('/rfp-monitoring');
        } else {
          toast.error(response.error || 'Failed to create RFP record');
        }
      }
    } catch (error) {
      toast.error('Failed to save record. Please try again.');
      console.error('Save error:', error);
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

            {isBusy && showLoadingSpinner && !error && (
              <div className="rfp-state-screen" role="status" aria-live="polite">
                <div className="rfp-state-card">
                  <OrbitProgress variant="disc" dense color="#32cd32" size="medium" text="" textColor="" />
                  <p className="rfp-state-title">Loading RFP form data</p>
                  <p className="rfp-state-subtitle">Please wait while we fetch record details and lookups.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="rfp-state-screen" role="alert" aria-live="assertive">
                <div className="rfp-state-card rfp-state-card-error">
                  <p className="rfp-state-title">Unable to load RFP form</p>
                  <p className="rfp-state-subtitle">{error}</p>
                </div>
              </div>
            )}

            {!isBusy && !error && (

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
                      This RFP is already Released. Editing is no longer allowed and the form is view-only.
                    </div>
                  )}

                  <div className="transaction-form-details">
                    <div className="transaction-form-detail-row">
                      <label className="transaction-form-detail-label">CWR Processed</label>
                      <input
                        type="text"
                        className="transaction-form-detail-value"
                        value={record.cwr_processed || (!isEditMode ? `eRFP${displaySeries}` : '')}
                        onChange={e => handleChange('cwr_processed', Number(e.target.value) || nextSeriesNumber)}
                        placeholder={`eRFP${displaySeries}`}
                        disabled={true} // Auto-generated field
                      />
                    </div>

                    <div className="transaction-form-detail-row">
                      <label className="transaction-form-detail-label">CWR Usage</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        className="transaction-form-detail-value"
                        value={record.cwr_usage ?? 1}
                        onChange={e => handleChange('cwr_usage', e.target.value ? Number(e.target.value) : 1)}
                        disabled={isReadOnlyMode}
                      />
                    </div>

                    <div className="transaction-form-detail-row">
                      <label className="transaction-form-detail-label">TRAMPSYS Status</label>
                      <select
                        className="transaction-form-detail-value transaction-form-select"
                        value={record.trampsys_status || 'Draft'}
                        onChange={e => handleChange('trampsys_status', e.target.value as RfpStatus)}
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
                        type="datetime-local"
                        className="transaction-form-detail-value"
                        value={record.status_cwr ? new Date(record.status_cwr).toISOString().slice(0, 16) : ''}
                        onChange={e => handleChange('status_cwr', e.target.value ? new Date(e.target.value).toISOString() : null)}
                        disabled={isReadOnlyMode}
                      />
                    </div>

                    <div className="transaction-form-detail-row">
                      <label className="transaction-form-detail-label">Remarks (CWR)</label>
                      <input
                        type="text"
                        className="transaction-form-detail-value"
                        value={record.remarks_cwr || ''}
                        onChange={e => handleChange('remarks_cwr', e.target.value)}
                        disabled={isReadOnlyMode}
                      />
                    </div>

                    <div className="transaction-form-detail-row">
                      <label className="transaction-form-detail-label">ETA</label>
                      <input
                        type="date"
                        className="transaction-form-detail-value"
                        value={record.eta || ''}
                        onChange={e => handleChange('eta', e.target.value)}
                        required
                        disabled={isReadOnlyMode}
                      />
                    </div>

                    <div className="transaction-form-detail-row">
                      <label className="transaction-form-detail-label">ETD</label>
                      <input
                        type="date"
                        className="transaction-form-detail-value"
                        value={record.etd || ''}
                        onChange={e => handleChange('etd', e.target.value)}
                        disabled={isReadOnlyMode}
                      />
                    </div>

                    <div className="transaction-form-detail-row">
                      <label className="transaction-form-detail-label">Payee</label>
                      <select
                        className="transaction-form-detail-value transaction-form-select"
                        value={getSelectedPayeeId()}
                        onChange={e => {
                          handlePayeeChange(e.target.value);
                        }}
                        required
                        disabled={isReadOnlyMode}
                      >
                        <option value="">Select Payee</option>
                        {payees.map(payee => (
                          <option key={payee.payee_id} value={payee.payee_id}>{payee.payee_name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="transaction-form-detail-row">
                      <label className="transaction-form-detail-label">Vessel/Principal</label>
                      <select
                        className="transaction-form-detail-value transaction-form-select"
                        value={getSelectedVesselId()}
                        onChange={e => {
                          handleVesselPrincipalChange(e.target.value);
                        }}
                        disabled={isReadOnlyMode}
                      >
                        <option value="">Select Vessel/Principal</option>
                        {vesselPrincipals.map(vessel => (
                          <option key={vessel.vessel_principal_id} value={vessel.vessel_principal_id}>{vessel.vessel_principal_name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="transaction-form-detail-row">
                      <label className="transaction-form-detail-label">Voyage</label>
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
                      <select
                        className="transaction-form-detail-value transaction-form-select"
                        value={getSelectedPortId()}
                        onChange={e => {
                          handlePortChange(e.target.value);
                        }}
                        required
                        disabled={isReadOnlyMode}
                      >
                        <option value="">Select Port</option>
                        {ports.map(port => (
                          <option key={port.port_id} value={port.port_id}>{port.port_name}</option>
                        ))}
                      </select>
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
            )}
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
