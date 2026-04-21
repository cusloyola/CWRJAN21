import React from 'react';
import '../styles/AddTransactionForm.css';

import SelectCurrency from './SelectCurrency';
import SelectPayee from './SelectPayee';
import SelectCategory from './SelectCategory';
import SelectVesselPrincipal from './SelectVesselPrincipal';
import SelectTransactionBatch from './SelectTransactionBatch';
import SelectMCBranchIssuance from './SelectMCBranchIssuance';
import SelectFundingAccount from './SelectFundingAccount';
import SupportingDocumentUpload from './SupportingDocumentUpload';

interface Props {
    formData: any;
    onChange: (field: string, value: any) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    supportingDocFile: File | null;
    onSupportingDocFileChange: (file: File | null) => void;
}

const EditTransactionForm: React.FC<Props> = ({
    formData,
    onChange,
    onSubmit,
    isSubmitting,
    supportingDocFile,
    onSupportingDocFileChange
}) => {
    return (
        <div className="transaction-form-container">
            <div className="transaction-form-header">
                <h2 className="transaction-form-title">Edit Transaction</h2>
            </div>

            <div className="transaction-form dashboard-wrapper">
                <div className="transaction-form-content">

                    <div className="transaction-form-details">

                        {/* Category */}
                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Category</label>
                            <SelectCategory
                                value={formData.category}
                                onChange={(v) => onChange('category', v)}
                            />
                        </div>

                        {/* Ref */}
                        <div className="transaction-form-detail-row">
                            <label className = "transaction-form-detail-label">Transaction Ref</label>
                            <input
                                type="text"
                                className="transaction-form-detail-value"
                                value={formData.transaction_ref}
                                onChange={e => onChange('transaction_ref', e.target.value)}
                            />
                        </div>

                        {/* Payee */}
                        <div className="transaction-form-detail-row">
                            <label className = "transaction-form-detail-label">Payee</label>
                            <SelectPayee
                                value={formData.payee}
                                onChange={(v) => onChange('payee', v)}
                            />
                        </div>

                        {/* Particulars */}
                        <div className="transaction-form-detail-row">
                            <label className = "transaction-form-detail-label">Particulars</label>
                            <textarea
                                className="transaction-form-detail-value"
                                value={formData.particulars}
                                onChange={e => onChange('particulars', e.target.value)}
                                rows={3}
                            />
                        </div>

                        {/* Vessel */}
                        <div className="transaction-form-detail-row">
                            <label className = "transaction-form-detail-label">Vessel / Principal</label>
                            <SelectVesselPrincipal
                                value={formData.vessel_principal}
                                onChange={(v) => onChange('vessel_principal', v)}
                            />
                        </div>

                        {/* ETD */}
                        <div className="transaction-form-detail-row">
                            <label className = "transaction-form-detail-label">ETD</label>
                            <input
                                type="date"
                                className="transaction-form-detail-value"
                                value={formData.etd}
                                onChange={e => onChange('etd', e.target.value)}
                            />
                        </div>

                        {/* Currency */}
                        <div className="transaction-form-detail-row">
                            <label className = "transaction-form-detail-label">Currency</label>
                            <SelectCurrency
                                value={formData.currency}
                                onChange={(v) => onChange('currency', v)}
                            />
                        </div>

                        {/* Amount */}
                        <div className="transaction-form-detail-row">
                            <label className = "transaction-form-detail-label">Amount</label>
                            <input
                                type="number"
                                className="transaction-form-detail-value"
                                value={formData.transaction_amount}
                                onChange={e => {
                                    const nextValue = e.target.value;
                                    onChange(
                                        'transaction_amount',
                                        nextValue === '' ? '' : Number(nextValue)
                                    );
                                }}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Reference / eRFP</label>
                            <input
                                type="text"
                                className="transaction-form-detail-value"
                                value={formData.reference_erfp}
                                onChange={e => onChange('reference_erfp', e.target.value)}
                                placeholder="Enter reference or eRFP"
                            />
                        </div>

                        {/* Batch */}
                        <div className="transaction-form-detail-row">
                            <label className = "transaction-form-detail-label">Batch</label>
                            <SelectTransactionBatch
                                value={formData.batch}
                                onChange={(v) => onChange('batch', v)}
                            />
                        </div>

                        {/* MC Branch */}
                        <div className="transaction-form-detail-row">
                            <label className = "transaction-form-detail-label">MC Branch Issuance</label>
                            <SelectMCBranchIssuance
                                value={formData.mc_branch_issuance}
                                onChange={(v) => onChange('mc_branch_issuance', v)}
                            />
                        </div>

                        {/* Funding */}
                        <div className="transaction-form-detail-row">
                            <label className = "transaction-form-detail-label">Funding Account</label>
                            <SelectFundingAccount
                                value={formData.funding_account}
                                onChange={(v) => onChange('funding_account', v)}
                            />
                        </div>

                        {/* EXTRA FIELDS (EDIT ONLY) */}
 {/*                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => onChange('status', e.target.value)}
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div> */}

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Supporting Documents</label>
                            <SupportingDocumentUpload
                                selectedFile={supportingDocFile}
                                currentFileName={formData.supporting_docs || ''}
                                onFileSelected={onSupportingDocFileChange}
                            />
                        </div>

{/*                         <div className="transaction-form-detail-row">
                            <label>Google Drive Link</label>
                            <input
                                value={formData.google_drive_link || ''}
                                readOnly
                            />
                        </div> */}

                    </div>

                    <div className="transaction-form-actions">
                        <button
                            className="transaction-form-save-button"
                            onClick={onSubmit}
                            disabled={isSubmitting}
                        >
                            Update Transaction
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EditTransactionForm;