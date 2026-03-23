import React from 'react';
import { type RfpMonitoringRecord, type RfpStatus } from '../dummy_data/rfpMonitoringData';

interface EditRfpMonitoringModalProps {
  isOpen: boolean;
  isClosing: boolean;
  record: RfpMonitoringRecord | null;
  statuses: RfpStatus[];
  onClose: () => void;
  onChange: (field: keyof RfpMonitoringRecord, value: string | number | null) => void;
  onSave: () => void;
}

const EditRfpMonitoringModal: React.FC<EditRfpMonitoringModalProps> = ({
  isOpen,
  isClosing,
  record,
  statuses,
  onClose,
  onChange,
  onSave,
}) => {
  if (!isOpen || !record) return null;

  return (
    <>
      <div className={`transaction-modal-backdrop ${isClosing ? 'closing' : ''}`} onClick={onClose} />
      <div className={`transaction-detail-modal ${isClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="transaction-modal-header">
          <span className="transaction-modal-title">Edit RFP Record</span>
          <button className="transaction-modal-close" onClick={onClose}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="transaction-modal-content">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="transaction-modal-detail-label" style={{ textAlign: 'center' }}>
              Expected Series
            </span>
            <h2 className="transaction-modal-ref-title" style={{ textAlign: 'center', margin: 0 }}>
              {record.expectedSeries}
            </h2>
          </div>

          <div className="transaction-modal-details">
            <div className="transaction-modal-detail-row">
              <span className="transaction-modal-detail-label">CWR Processed</span>
              <input
                type="text"
                className="transaction-modal-detail-value"
                value={record.cwrProcessed}
                onChange={e => onChange('cwrProcessed', e.target.value)}
              />
            </div>

            <div className="transaction-modal-detail-row">
              <span className="transaction-modal-detail-label">CWR Usage</span>
              <input
                type="number"
                min="1"
                className="transaction-modal-detail-value"
                value={record.cwrUsage}
                onChange={e => onChange('cwrUsage', e.target.value ? Number(e.target.value) : 1)}
              />
            </div>

            <div className="transaction-modal-detail-row">
              <span className="transaction-modal-detail-label">TRAMPSYS Status</span>
              <select
                className="transaction-modal-detail-value"
                value={record.trampsysStatus}
                onChange={e => onChange('trampsysStatus', e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="transaction-modal-detail-row">
              <span className="transaction-modal-detail-label">Status (CWR)</span>
              <input
                type="text"
                className="transaction-modal-detail-value"
                value={record.statusCwr}
                onChange={e => onChange('statusCwr', e.target.value)}
              />
            </div>

            <div className="transaction-modal-detail-row">
              <span className="transaction-modal-detail-label">Remarks (CWR)</span>
              <input
                type="text"
                className="transaction-modal-detail-value"
                value={record.remarksCwr}
                onChange={e => onChange('remarksCwr', e.target.value)}
              />
            </div>

            <div className="transaction-modal-detail-row">
              <span className="transaction-modal-detail-label">ETA TRAMPSYS</span>
              <input
                type="date"
                className="transaction-modal-detail-value"
                value={record.etaTrampsys}
                onChange={e => onChange('etaTrampsys', e.target.value)}
              />
            </div>

            <div className="transaction-modal-detail-row">
              <span className="transaction-modal-detail-label">ETD TRAMPSYS</span>
              <input
                type="date"
                className="transaction-modal-detail-value"
                value={record.etdTrampsys}
                onChange={e => onChange('etdTrampsys', e.target.value)}
              />
            </div>

            <div className="transaction-modal-detail-row">
              <span className="transaction-modal-detail-label">Payee per TRAMPSYS</span>
              <input
                type="text"
                className="transaction-modal-detail-value"
                value={record.payeePerTrampsys}
                onChange={e => onChange('payeePerTrampsys', e.target.value)}
              />
            </div>

            <div className="transaction-modal-detail-row">
              <span className="transaction-modal-detail-label">Vessel</span>
              <input
                type="text"
                className="transaction-modal-detail-value"
                value={record.vessel}
                onChange={e => onChange('vessel', e.target.value)}
              />
            </div>

            <div className="transaction-modal-detail-row">
              <span className="transaction-modal-detail-label">Voy</span>
              <input
                type="text"
                className="transaction-modal-detail-value"
                value={record.voy}
                onChange={e => onChange('voy', e.target.value)}
              />
            </div>

            <div className="transaction-modal-detail-row">
              <span className="transaction-modal-detail-label">Port</span>
              <input
                type="text"
                className="transaction-modal-detail-value"
                value={record.port}
                onChange={e => onChange('port', e.target.value)}
              />
            </div>

            <div className="transaction-modal-detail-row">
              <span className="transaction-modal-detail-label">Currency in CWR</span>
              <input
                type="text"
                className="transaction-modal-detail-value"
                value={record.currencyInCwr}
                onChange={e => onChange('currencyInCwr', e.target.value)}
              />
            </div>

            <div className="transaction-modal-detail-row">
              <span className="transaction-modal-detail-label">Amount in CWR</span>
              <input
                type="number"
                step="0.01"
                className="transaction-modal-detail-value"
                value={record.amountInCwr ?? ''}
                onChange={e => onChange('amountInCwr', e.target.value ? Number(e.target.value) : null)}
                placeholder="Optional amount"
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="transaction-edit-cancel-button">Cancel</button>
            <button onClick={onSave} className="transaction-edit-save-button">Save RFP Changes</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditRfpMonitoringModal;
