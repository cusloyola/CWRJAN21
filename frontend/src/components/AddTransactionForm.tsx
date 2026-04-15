import React,{useState} from 'react';
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

    const [isSubmitting, setIsSubmitting] = useState(false); 

    const handleChange = (field: string, value: any) => {
            setFormData(prev => ({ ...prev, [field]: value }));
        };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // 🔍 LOG ONLY (NO POST)
        console.log('=== DEBUG: Transaction Payload ===');
        console.log(JSON.stringify(formData, null, 2));
        console.table(formData);

        try {
        const res = await fetch(`${API_BASE}/api/v1/transactions/`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error('Failed to save transaction');

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