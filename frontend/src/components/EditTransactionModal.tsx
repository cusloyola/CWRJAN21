import React from 'react';
import { type Transaction } from '../dummy_data/transactionsData';

interface EditTransactionModalProps {
    isOpen: boolean;
    isClosing: boolean;
    transaction: Transaction | null;
    categories: string[];
    currencies: string[];
    onClose: () => void;
    onChange: (field: keyof Transaction, value: any) => void;
    onSave: () => void;
    modalTitle?: string;
    referenceLabel?: string;
    saveButtonLabel?: string;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
    isOpen,
    isClosing,
    transaction,
    categories,
    currencies,
    onClose,
    onChange,
    onSave,
    modalTitle = 'Edit Transaction',
    referenceLabel = 'Transaction Ref',
    saveButtonLabel = 'Save Changes'
}) => {
    if (!isOpen || !transaction) return null;

    return (
        <>
            <div className={`transaction-modal-backdrop ${isClosing ? 'closing' : ''}`} onClick={onClose} />
            <div className={`transaction-detail-modal ${isClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
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
                            {transaction.transactionRef}
                        </h2>
                    </div>

                    <div className="transaction-modal-details">
                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Category</span>
                            <select
                                className="transaction-modal-detail-value"
                                value={transaction.category}
                                onChange={e => onChange('category', e.target.value)}
                            >
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
                                value={transaction.date}
                                onChange={e => onChange('date', e.target.value)}
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Payee</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={transaction.payee}
                                onChange={e => onChange('payee', e.target.value)}
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Particulars</span>
                            <textarea
                                className="transaction-modal-detail-value"
                                value={transaction.particulars}
                                onChange={e => onChange('particulars', e.target.value)}
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Vessel / Principal</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={transaction.vesselPrincipal}
                                onChange={e => onChange('vesselPrincipal', e.target.value)}
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">ETD</span>
                            <input
                                type="date"
                                className="transaction-modal-detail-value"
                                value={transaction.etd}
                                onChange={e => onChange('etd', e.target.value)}
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Currency</span>
                            <select
                                className="transaction-modal-detail-value"
                                value={transaction.currency}
                                onChange={e => onChange('currency', e.target.value)}
                            >
                                {currencies.map(cur => (
                                    <option key={cur} value={cur}>{cur}</option>
                                ))}
                            </select>
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Amount</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                pattern="^\\d*(\\.\\d{0,2})?$"
                                className="transaction-modal-detail-value"
                                value={
                                    transaction.amount === null || transaction.amount === undefined
                                        ? ''
                                        : (typeof transaction.amount === 'string'
                                            ? transaction.amount
                                            : Number(transaction.amount).toFixed(2))
                                }
                                onChange={e => {
                                    // Allow only digits and dot, and allow empty string for backspace
                                    let val = e.target.value.replace(/[^\d.]/g, '');
                                    val = val.replace(/(\..*)\./, '$1');
                                    onChange('amount', val);
                                }}
                                onBlur={e => {
                                    let val = e.target.value;
                                    if (val !== '' && !isNaN(Number(val))) {
                                        onChange('amount', Number(val).toFixed(2));
                                    } else if (val === '') {
                                        onChange('amount', '');
                                    }
                                }}
                                style={{ MozAppearance: 'textfield' }}
                                onWheel={e => e.currentTarget.blur()}
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Reference / eRFP</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={transaction.referenceErfp}
                                onChange={e => onChange('referenceErfp', e.target.value)}
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Branch to Issue MC</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={transaction.branchToIssueMc}
                                onChange={e => onChange('branchToIssueMc', e.target.value)}
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Funding Account</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={transaction.fundingAccount}
                                onChange={e => onChange('fundingAccount', e.target.value)}
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Batch</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={transaction.batch}
                                onChange={e => onChange('batch', e.target.value)}
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Drive File Link</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={transaction.driveFileLink}
                                onChange={e => onChange('driveFileLink', e.target.value)}
                            />
                        </div>

                        <div className="transaction-modal-detail-row">
                            <span className="transaction-modal-detail-label">Supporting Docs</span>
                            <input
                                type="text"
                                className="transaction-modal-detail-value"
                                value={transaction.supportingDocs}
                                onChange={e => onChange('supportingDocs', e.target.value)}
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

export default EditTransactionModal;