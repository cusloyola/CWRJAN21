import React from 'react';
import { type Transaction } from '../dummy_data/transactionsData';
import '../styles/AddTransactionForm.css';

interface AddTransactionFormProps {
    nextTrxNumber: number;
    newTransaction: Partial<Transaction>;
    categories: string[];
    currencies: string[];
    mode?: 'add' | 'edit';
    formTitle?: string;
    submitLabel?: string;
    displayRef?: string;
    isSubmitting?: boolean;
    onChange: (field: keyof Partial<Transaction>, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
    nextTrxNumber,
    newTransaction,
    categories,
    currencies,
    mode = 'add',
    formTitle,
    submitLabel,
    displayRef,
    isSubmitting = false,
    onChange,
    onSave,
    onCancel
}) => {
    const referenceDisplay = displayRef || `TRX${String(nextTrxNumber).padStart(3, '0')}`;
    const heading = formTitle || (mode === 'edit' ? 'Edit Transaction' : 'Add New Transaction');
    const primaryButtonLabel = submitLabel || (mode === 'edit' ? 'Save Changes' : 'Add Transaction');

    return (
        <div className="transaction-form-container">
            <div className="transaction-form-header">
                <h2 className="transaction-form-title">{heading}</h2>
            </div>

            <form className="transaction-form dashboard-wrapper" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
                <div className="transaction-form-content">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                        <span className="transaction-form-detail-label" style={{ textAlign: 'center' }}>
                            Transaction Ref
                        </span>
                        <h3 className="transaction-form-ref-title" style={{ textAlign: 'center', margin: 0 }}>
                            {referenceDisplay}
                        </h3>
                    </div>

                    <div className="transaction-form-details">
                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Category</label>
                            <select
                                className="transaction-form-detail-value transaction-form-select"
                                value={newTransaction.category || ''}
                                onChange={e => onChange('category', e.target.value)}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Date</label>
                            <input
                                type="date"
                                className="transaction-form-detail-value"
                                value={newTransaction.date || ''}
                                onChange={e => onChange('date', e.target.value)}
                                required
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Payee</label>
                            <input
                                type="text"
                                className="transaction-form-detail-value"
                                value={newTransaction.payee || ''}
                                onChange={e => onChange('payee', e.target.value)}
                                placeholder="Enter payee name"
                                required
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Particulars</label>
                            <textarea
                                className="transaction-form-detail-value"
                                value={newTransaction.particulars || ''}
                                onChange={e => onChange('particulars', e.target.value)}
                                placeholder="Enter transaction details..."
                                rows={3}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Vessel / Principal</label>
                            <input
                                type="text"
                                className="transaction-form-detail-value"
                                value={newTransaction.vesselPrincipal || ''}
                                onChange={e => onChange('vesselPrincipal', e.target.value)}
                                placeholder="Enter vessel or principal"
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">ETD</label>
                            <input
                                type="date"
                                className="transaction-form-detail-value"
                                value={newTransaction.etd || ''}
                                onChange={e => onChange('etd', e.target.value)}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Currency</label>
                            <select
                                className="transaction-form-detail-value transaction-form-select"
                                value={newTransaction.currency || ''}
                                onChange={e => onChange('currency', e.target.value)}
                                required
                            >
                                <option value="">Select Currency</option>
                                {currencies.map(cur => (
                                    <option key={cur} value={cur}>{cur}</option>
                                ))}
                            </select>
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Amount</label>
                            <input
                                type="number"
                                step="1"
                                className="transaction-form-detail-value"
                                value={newTransaction.amount ?? ''}
                                onChange={e => onChange('amount', e.target.value ? Number(e.target.value) : null)}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Reference / eRFP</label>
                            <input
                                type="text"
                                className="transaction-form-detail-value"
                                value={newTransaction.referenceErfp || ''}
                                onChange={e => onChange('referenceErfp', e.target.value)}
                                placeholder="Enter reference or eRFP"
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Branch to Issue MC</label>
                            <input
                                type="text"
                                className="transaction-form-detail-value"
                                value={newTransaction.branchToIssueMc || ''}
                                onChange={e => onChange('branchToIssueMc', e.target.value)}
                                placeholder="Enter branch"
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Funding Account</label>
                            <input
                                type="text"
                                className="transaction-form-detail-value"
                                value={newTransaction.fundingAccount || ''}
                                onChange={e => onChange('fundingAccount', e.target.value)}
                                placeholder="Enter funding account"
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Batch</label>
                            <input
                                type="text"
                                className="transaction-form-detail-value"
                                value={newTransaction.batch || ''}
                                onChange={e => onChange('batch', e.target.value)}
                                placeholder="Enter batch number"
                            />
                        </div>

{/*                         <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Drive File Link</label>
                            <input
                                type="url"
                                className="transaction-form-detail-value"
                                value={newTransaction.driveFileLink || ''}
                                onChange={e => onChange('driveFileLink', e.target.value)}
                                placeholder="https://drive.google.com/..."
                            />
                        </div> */}

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Supporting Docs</label>
                            <input
                                type="url"
                                className="transaction-form-detail-value"
                                value={newTransaction.supportingDocs || ''}
                                onChange={e => onChange('supportingDocs', e.target.value)}
                                placeholder="https://drive.google.com/..."
                            />
                        </div>
                    </div>

                    <div className="transaction-form-actions">
                        <button 
                            type="button" 
                            onClick={onCancel} 
                            className="transaction-form-cancel-button"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="transaction-form-save-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : primaryButtonLabel}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddTransactionForm;