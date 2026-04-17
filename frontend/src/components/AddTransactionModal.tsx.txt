import React from 'react';
import { type Transaction } from '../dummy_data/transactionsData';

interface AddTransactionModalProps {
    isOpen: boolean;
    isClosing: boolean;
    nextTrxNumber: number;
    newTransaction: Partial<Transaction>;
    categories: string[];
    currencies: string[];
    onClose: () => void;
    onChange: (field: keyof Partial<Transaction>, value: any) => void;
    onSave: () => void;
    modalTitle?: string;
    referenceLabel?: string;
    referencePrefix?: string;
    saveButtonLabel?: string;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
    isOpen,
    isClosing,
    nextTrxNumber,
    newTransaction,
    categories,
    currencies,
    onClose,
    onChange,
    onSave,
    modalTitle = 'Add New Transaction',
    referenceLabel = 'Transaction Ref',
    referencePrefix = 'TRX',
    saveButtonLabel = 'Add Transaction'
}) => {
    if (!isOpen) return null;

    return (
        <>
            <div
                className={`transaction-modal-backdrop ${isClosing ? 'closing' : ''}`}
                onClick={onClose}
            />
            <div
                className={`transaction-detail-modal ${isClosing ? 'closing' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="transaction-modal-header">
                    <span className="transaction-modal-title">{modalTitle}</span>
                    <button className="transaction-modal-close" onClick={onClose}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="transaction-modal-content">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                        <span className="transaction-modal-detail-label" style={{ textAlign: 'center' }}>
                            {referenceLabel}
                        </span>
                        <h2 className="transaction-modal-ref-title" style={{ textAlign: 'center', margin: 0 }}>
                            {referencePrefix}{String(nextTrxNumber).padStart(3, '0')}
                        </h2>
                    </div>

                    <div className="transaction-modal-details">
                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Category</span>
                            <select
                                className="transaction-modal-detail-value"
                                value={newTransaction.category || ''}
                                onChange={e => onChange('category', e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Date</span>
                            <input
                                type="date"
                                className="transaction-modal-detail-value"
                                value={newTransaction.date || ''}
                                onChange={e => onChange('date', e.target.value)}
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Payee</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={newTransaction.payee || ''}
                                onChange={e => onChange('payee', e.target.value)}
                                placeholder="Enter payee name"
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Particulars</span>
                            <textarea
                                className="transaction-modal-detail-value"
                                value={newTransaction.particulars || ''}
                                onChange={e => onChange('particulars', e.target.value)}
                                placeholder="Enter transaction details..."
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Vessel / Principal</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={newTransaction.vesselPrincipal || ''}
                                onChange={e => onChange('vesselPrincipal', e.target.value)}
                                placeholder="Enter vessel or principal"
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">ETD</span>
                            <input
                                type="date"
                                className="transaction-modal-detail-value"
                                value={newTransaction.etd || ''}
                                onChange={e => onChange('etd', e.target.value)}
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Currency</span>
                            <select
                                className="transaction-modal-detail-value"
                                value={newTransaction.currency || ''}
                                onChange={e => onChange('currency', e.target.value)}
                            >
                                <option value="">Select Currency</option>
                                {currencies.map(cur => (
                                    <option key={cur} value={cur}>{cur}</option>
                                ))}
                            </select>
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Amount</span>
                            <input
                                type="number"
                                step="0.01"
                                className="transaction-modal-detail-value"
                                value={newTransaction.amount ?? ''}
                                onChange={e => onChange('amount', e.target.value ? Number(e.target.value) : null)}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Reference / eRFP</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={newTransaction.referenceErfp || ''}
                                onChange={e => onChange('referenceErfp', e.target.value)}
                                placeholder="Enter reference or eRFP"
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Branch to Issue MC</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={newTransaction.branchToIssueMc || ''}
                                onChange={e => onChange('branchToIssueMc', e.target.value)}
                                placeholder="Enter branch"
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Funding Account</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={newTransaction.fundingAccount || ''}
                                onChange={e => onChange('fundingAccount', e.target.value)}
                                placeholder="Enter funding account"
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Batch</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={newTransaction.batch || ''}
                                onChange={e => onChange('batch', e.target.value)}
                                placeholder="Enter batch number"
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Drive File Link</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={newTransaction.driveFileLink || ''}
                                onChange={e => onChange('driveFileLink', e.target.value)}
                                placeholder="https://drive.google.com/..."
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Supporting Docs</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={newTransaction.supportingDocs || ''}
                                onChange={e => onChange('supportingDocs', e.target.value)}
                                placeholder="List supporting documents"
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={onClose} className="transaction-edit-cancel-button">
                            Cancel
                        </button>
                        <button onClick={onSave} className="transaction-edit-save-button">
                            {saveButtonLabel}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddTransactionModal;