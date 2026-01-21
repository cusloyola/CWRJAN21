import React from 'react';
import '../styles/AddTransactionForm.css';
import { type Transaction } from '../dummy_data/transactionsData';

interface AddTransactionFormProps {
    isOpen: boolean;
    isClosing: boolean;
    transaction: Transaction | null;
    onChange: (field: keyof Transaction, value: any) => void;
    onCancel: () => void;
    onSave: () => void;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
    isOpen,
    isClosing,
    transaction,
    onChange,
    onCancel,
    onSave
}) => {
    if (!isOpen || !transaction) return null;
    

    return (
        <>
            <div className={`add-transaction-modal-backdrop${isClosing ? ' closing' : ''}`} onClick={onCancel}></div>
            <div className={`add-transaction-form-modal${isClosing ? ' closing' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="add-transaction-form-header">
                    <span className="add-transaction-form-title">Add Transaction</span>
                    <button className="add-transaction-form-close" onClick={onCancel} aria-label="Close">&times;</button>
                </div>
                <form className="add-transaction-form-fields" onSubmit={e => { e.preventDefault(); onSave(); }}>
                    <div className="add-transaction-form-row">
                        <label className="add-transaction-form-label">Archives Ref</label>
                        <input
                            type="text"
                            className="add-transaction-form-input"
                            value={transaction.transactionRef}
                            onChange={e => onChange('transactionRef', e.target.value)}
                            required
                        />
                    </div>
                    <div className="add-transaction-form-row">
                        <label className="add-transaction-form-label">Category</label>
                        <input
                            type="text"
                            className="add-transaction-form-input"
                            value={transaction.category}
                            onChange={e => onChange('category', e.target.value)}
                        />
                    </div>
                    <div className="add-transaction-form-row">
                        <label className="add-transaction-form-label">Date</label>
                        <input
                            type="text"
                            className="add-transaction-form-input"
                            value={transaction.date}
                            onChange={e => onChange('date', e.target.value)}
                        />
                    </div>
                    <div className="add-transaction-form-row">
                        <label className="add-transaction-form-label">Payee</label>
                        <input
                            type="text"
                            className="add-transaction-form-input"
                            value={transaction.payee}
                            onChange={e => onChange('payee', e.target.value)}
                        />
                    </div>
                    <div className="add-transaction-form-row">
                        <label className="add-transaction-form-label">Particulars</label>
                        <textarea
                            className="add-transaction-form-textarea"
                            value={transaction.particulars}
                            onChange={e => onChange('particulars', e.target.value)}
                        />
                    </div>
                    <div className="add-transaction-form-row">
                        <label className="add-transaction-form-label">Vessel / Principal</label>
                        <input
                            type="text"
                            className="add-transaction-form-input"
                            value={transaction.vesselPrincipal}
                            onChange={e => onChange('vesselPrincipal', e.target.value)}
                        />
                    </div>
                    <div className="add-transaction-form-row">
                        <label className="add-transaction-form-label">ETD</label>
                        <input
                            type="text"
                            className="add-transaction-form-input"
                            value={transaction.etd}
                            onChange={e => onChange('etd', e.target.value)}
                        />
                    </div>
                    <div className="add-transaction-form-row">
                        <label className="add-transaction-form-label">Currency</label>
                        <input
                            type="text"
                            className="add-transaction-form-input"
                            value={transaction.currency}
                            onChange={e => onChange('currency', e.target.value)}
                        />
                    </div>
                    <div className="add-transaction-form-row">
                        <label className="add-transaction-form-label">Amount</label>
                        <input
                            type="number"
                            className="add-transaction-form-input"
                            value={transaction.amount}
                            onChange={e => onChange('amount', Number(e.target.value))}
                        />
                    </div>
                    <div className="add-transaction-form-row">
                        <label className="add-transaction-form-label">Reference / eRFP</label>
                        <input
                            type="text"
                            className="add-transaction-form-input"
                            value={transaction.referenceErfp}
                            onChange={e => onChange('referenceErfp', e.target.value)}
                        />
                    </div>
                    <div className="add-transaction-form-row">
                        <label className="add-transaction-form-label">Branch to Issue MC</label>
                        <input
                            type="text"
                            className="add-transaction-form-input"
                            value={transaction.branchToIssueMc}
                            onChange={e => onChange('branchToIssueMc', e.target.value)}
                        />
                    </div>
                    <div className="add-transaction-form-row">
                        <label className="add-transaction-form-label">Funding Account</label>
                        <input
                            type="text"
                            className="add-transaction-form-input"
                            value={transaction.fundingAccount}
                            onChange={e => onChange('fundingAccount', e.target.value)}
                        />
                    </div>
                    <div className="add-transaction-form-row">
                        <label className="add-transaction-form-label">Batch</label>
                        <input
                            type="text"
                            className="add-transaction-form-input"
                            value={transaction.batch}
                            onChange={e => onChange('batch', e.target.value)}
                        />
                    </div>
                    <div className="add-transaction-form-row">
                        <label className="add-transaction-form-label">Drive File Link</label>
                        <input
                            type="text"
                            className="add-transaction-form-input"
                            value={transaction.driveFileLink}
                            onChange={e => onChange('driveFileLink', e.target.value)}
                        />
                    </div>
                    <div className="add-transaction-form-row">
                        <label className="add-transaction-form-label">Supporting Docs</label>
                        <input
                            type="text"
                            className="add-transaction-form-input"
                            value={transaction.supportingDocs}
                            onChange={e => onChange('supportingDocs', e.target.value)}
                        />
                    </div>
                    <div className="add-transaction-form-actions">
                        <button type="button" className="add-transaction-form-cancel" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="add-transaction-form-save">Add Transaction</button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AddTransactionForm;