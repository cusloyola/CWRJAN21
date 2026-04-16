import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/AddTransactionForm.css';
import SelectCurrency from './SelectCurrency';
import SelectPayee from './SelectPayee';
import SelectCategory from './SelectCategory';
import SelectVesselPrincipal from './SelectVesselPrincipal';    
import SelectTransactionBatch from './SelectTransactionBatch';
import SelectMCBranchIssuance from './SelectMCBranchIssuance';
import SelectFundingAccount from './SelectFundingAccount';
import { API_BASE, getAuthHeader } from '../config/api';


const AddTransactionForm: React.FC = () => {
    const [formData, setFormData] = useState({
            company: Number(localStorage.getItem('company_id')),
            transaction_ref: '',
            category: '',
            payee: '',
            particulars: '',
            vessel_principal: '',
            etd: '',
            currency: '',
            transaction_amount:'',            
            reference_erfp: '',
            batch: '',
            mc_branch_issuance: '',
            funding_account: '',
            supporting_docs: '',       // default empty string
            endorsement_complete: false // default false
        });
    const [supportingDocFile, setSupportingDocFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false); 

    const getErrorMessageFromResponse = async (res: Response) => {
        try {
            const errorData = await res.json();

            if (typeof errorData?.detail === 'string') {
                return errorData.detail;
            }

            if (Array.isArray(errorData?.non_field_errors) && errorData.non_field_errors.length > 0) {
                return errorData.non_field_errors[0];
            }

            if (errorData && typeof errorData === 'object') {
                const firstFieldError = Object.values(errorData).find((value) => (
                    Array.isArray(value) && value.length > 0
                ));
                if (Array.isArray(firstFieldError)) {
                    return String(firstFieldError[0]);
                }
            }
        } catch {
            // Response body may not be JSON.
        }

        return `Request failed with status ${res.status}`;
    };

    const handleChange = (field: string, value: any) => {
            setFormData(prev => ({ ...prev, [field]: value }));
        };

    const handleFileSelected = (file: File | null) => {
        if (!file) {
            setSupportingDocFile(null);
            return;
        }

        setSupportingDocFile(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0] || null;
        handleFileSelected(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };
    
    const resetForm = () => {
        setFormData({
            company: Number(localStorage.getItem('company_id')),
            transaction_ref: '',
            category: '',
            payee: '',
            particulars: '',
            vessel_principal: '',
            etd: '',
            currency: '',
            transaction_amount: '',
            reference_erfp: '',
            batch: '',
            mc_branch_issuance: '',
            funding_account: '',
            supporting_docs: '',
            endorsement_complete: false
        });
        setSupportingDocFile(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            toast.error('Session expired. Please login again.');
            return;
        }

        setIsSubmitting(true);

        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value === null || value === undefined) return;
            payload.append(key, String(value));
        });

        if (supportingDocFile) {
            payload.append('supporting_doc_file', supportingDocFile);
        }

        try {
        const res = await fetch(`${API_BASE}/api/v1/transactions/`, {
            method: 'POST',
            headers: getAuthHeader(false),
            body: payload,
        });

        if (!res.ok) {
            const message = await getErrorMessageFromResponse(res);
            throw new Error(message);
        }

        toast.success('Transaction saved successfully!');

        setFormData({
            company: Number(localStorage.getItem('company_id')),
            category: '',
            transaction_ref: '',
            payee: '',
            particulars: '',
            vessel_principal: '',
            etd: '',
            currency: '',
            transaction_amount: '',
            reference_erfp: '',
            batch: '',
            mc_branch_issuance: '',
            funding_account: '',
            supporting_docs: '',
            endorsement_complete: false
        });
        } catch (err: any) {
        toast.error(err.message || 'Error saving transaction');
        } finally {
        setIsSubmitting(false);
        }
        
    }; 

    return (
        <div className="transaction-form-container">
            <div className="transaction-form-header">
                <h2 className="transaction-form-title">Add New Transaction</h2>
            </div>

            <form className="transaction-form dashboard-wrapper" onSubmit={handleSubmit}>
                <div className="transaction-form-content">
            
                    <div className="transaction-form-details">
                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Category</label>
                             <SelectCategory
                                value={formData.category}
                                onChange={(value) => handleChange('category', value)}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Transaction Ref</label>
                            <input
                                type="text"
                                className="transaction-form-detail-value"
                                value={formData.transaction_ref}
                                onChange={e => handleChange('transaction_ref', e.target.value)}
                                placeholder="Enter Transaction Ref"
                                required
                            />
                        </div>
                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Payee</label>
                            <SelectPayee
                                value={formData.payee}
                                onChange={(value) => handleChange('payee', value)}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Particulars</label>
                            <textarea
                                className="transaction-form-detail-value"
                                value={formData.particulars}
                                onChange={e => handleChange('particulars', e.target.value)}
                                placeholder="Enter transaction details..."
                                rows={3}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Vessel / Principal</label>
                            <SelectVesselPrincipal
                                value={formData.vessel_principal}
                                onChange={(value) => handleChange('vessel_principal', value)}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">ETD</label>
                            <input
                                type="date"
                                className="transaction-form-detail-value"
                                value={formData.etd}
                                onChange={e => handleChange('etd', e.target.value)}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Currency</label>
                            <SelectCurrency
                                value={formData.currency}
                                onChange={(value) => handleChange('currency', value)}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Amount</label>
                            <input
                                type="number"
                                step="1"
                                className="transaction-form-detail-value"
                                value={formData.transaction_amount}
                                onChange={e => handleChange('transaction_amount', Number(e.target.value))}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Reference / eRFP</label>
                            <input
                                type="text"
                                className="transaction-form-detail-value"
                                value={formData.reference_erfp}
                                onChange={e => handleChange('reference_erfp', e.target.value)}
                                placeholder="Enter reference or eRFP"
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Batch</label>
                            <SelectTransactionBatch
                                value={formData.batch}
                                onChange={(value) => handleChange('batch', value)}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Branch to Issue MC</label>
                            <SelectMCBranchIssuance
                                value={formData.mc_branch_issuance}
                                onChange={(value) => handleChange('mc_branch_issuance', value)}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Funding Account</label>
                            <SelectFundingAccount
                                value={formData.funding_account}
                                onChange={(value) => handleChange('funding_account', value)}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Supporting Document</label>
                            <div
                                className={`transaction-upload-dropzone ${isDragOver ? 'is-drag-over' : ''}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        fileInputRef.current?.click();
                                    }
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="transaction-upload-file-input"
                                    onChange={e => handleFileSelected(e.target.files?.[0] || null)}
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                />
                                <svg
                                    className="transaction-upload-icon"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M7 18a4 4 0 0 1-.7-7.94A5.5 5.5 0 0 1 17 9.5h.5a3.5 3.5 0 1 1 0 7H15"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M12 18V11"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M9.5 13.5 12 11l2.5 2.5"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <p className="transaction-upload-title">Drag and drop file here</p>
                                <p className="transaction-upload-subtitle">or click to browse</p>
                                {supportingDocFile && (
                                    <p className="transaction-upload-filename">
                                        Selected: {supportingDocFile.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="transaction-form-actions">
                        <button 
                            type="submit" 
                            className="transaction-form-save-button"
                            disabled={isSubmitting}
                        >
                           Add Transaction
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddTransactionForm;