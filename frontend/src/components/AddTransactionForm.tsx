import React from 'react';
import { type Transaction } from '../dummy_data/transactionsData';
import '../styles/AddTransactionForm.css';
import CurrencySelect from './SelectCurrency';
import SelectPayee from './SelectPayee';
import SelectCategory from './SelectCategory';
import SelectVesselPrincipal from './SelectVesselPrincipal';    


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
    newTransaction,
    mode = 'add',
    formTitle,
    submitLabel,
    isSubmitting = false,
    onChange,
    onSave,
    onCancel
}) => {
    const heading = formTitle || (mode === 'edit' ? 'Edit Transaction' : 'Add New Transaction');
    const primaryButtonLabel = submitLabel || (mode === 'edit' ? 'Save Changes' : 'Add Transaction');

    return (
        <div className="transaction-form-container">
            <div className="transaction-form-header">
                <h2 className="transaction-form-title">{heading}</h2>
            </div>

            <form className="transaction-form dashboard-wrapper" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
                <div className="transaction-form-content">
                    

                    <div className="transaction-form-details">
                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Category</label>
                             <SelectCategory
                                value={newTransaction.category}
                                onChange={(value) => {
                                    console.log('Selected Category ID:', value);
                                    onChange('category', value)
                                }}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Transaction Ref</label>
                            <input
                                type="text"
                                className="transaction-form-detail-value"
                                value={newTransaction.transactionRef || ''}
                                onChange={e => onChange('transactionRef', e.target.value)}
                                placeholder="Enter Transaction Ref"
                                required
                            />
                        </div>
                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Payee</label>
                            <SelectPayee
                                value={newTransaction.payee}
                                onChange={(value) => {
                                    console.log('Selected Payee ID:', value);
                                    onChange('payee', value);
                                }}
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
                            <SelectVesselPrincipal
                                value={newTransaction.vesselPrincipal}
                                onChange={(value) => {
                                    console.log('Selected Vessel/Principal ID:', value);
                                    onChange('vesselPrincipal', value)
                                }}
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
                            <CurrencySelect
                                value={newTransaction.currency}
                                onChange={(value) => {
                                    console.log('Selected Currency ID:', value);
                                    onChange('currency', value)
                                }}
                            />
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
                            <label className="transaction-form-detail-label">Batch</label>
                            <input
                                type="text"
                                className="transaction-form-detail-value"
                                value={newTransaction.batch || ''}
                                onChange={e => onChange('batch', e.target.value)}
                                placeholder="Enter batch number"
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