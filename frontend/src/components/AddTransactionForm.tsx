import React,{useState} from 'react';
// import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/AddTransactionForm.css';
import CurrencySelect from './SelectCurrency';
import SelectPayee from './SelectPayee';
import SelectCategory from './SelectCategory';
import SelectVesselPrincipal from './SelectVesselPrincipal';    
import SelectTransactionBatch from './SelectTransactionBatch';
import SelectMCBranchIssuance from './SelectMCBranchIssuance';
import SelectFundingAccount from './SelectFundingAccount';
// import { API_BASE, getAuthHeader } from '../config/api';


const AddTransactionForm: React.FC = () => {
    const [formData, setFormData] = useState({
            categoryId: '',
            transactionRef: '',
            payeeId: '',
            particulars: '',
            vesselPrincipalId: '',
            etd: '',
            currencyId: '',
            amount: 0,
            referenceErfp: '',
            batchId: '',
            branchToIssueMcId: '',
            fundingAccountId: '',
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

        // try {
        // const res = await fetch(`${API_BASE}/api/v1/transactions/`, {
        //     method: 'POST',
        //     headers: getAuthHeader(),
        //     body: JSON.stringify(formData),
        // });

        // if (!res.ok) throw new Error('Failed to save transaction');

        // toast.success('Transaction saved successfully!');
        // setFormData({
        //     categoryId: '',
        //     transactionRef: '',
        //     payeeId: '',
        //     particulars: '',
        //     vesselPrincipalId: '',
        //     etd: '',
        //     currencyId: '',
        //     amount: 0,
        //     referenceErfp: '',
        //     batchId: '',
        //     branchToIssueMcId: '',
        //     fundingAccountId: '',
        // });
        // } catch (err: any) {
        // toast.error(err.message || 'Error saving transaction');
        // } finally {
        // setIsSubmitting(false);
        // }
        return;
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
                                value={formData.categoryId}
                                onChange={(value) => handleChange('categoryId', value)}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Transaction Ref</label>
                            <input
                                type="text"
                                className="transaction-form-detail-value"
                                value={formData.transactionRef}
                                onChange={e => handleChange('transactionRef', e.target.value)}
                                placeholder="Enter Transaction Ref"
                                required
                            />
                        </div>
                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Payee</label>
                            <SelectPayee
                                value={formData.payeeId}
                                onChange={(value) => handleChange('payeeId', value)}
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
                                value={formData.vesselPrincipalId}
                                onChange={(value) => handleChange('vesselPrincipalId', value)}
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
                            <CurrencySelect
                                value={formData.currencyId}
                                onChange={(value) => handleChange('currencyId', value)}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Amount</label>
                            <input
                                type="number"
                                step="1"
                                className="transaction-form-detail-value"
                                value={formData.amount}
                                onChange={e => handleChange('amount', e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Reference / eRFP</label>
                            <input
                                type="text"
                                className="transaction-form-detail-value"
                                value={formData.referenceErfp}
                                onChange={e => handleChange('referenceErfp', e.target.value)}
                                placeholder="Enter reference or eRFP"
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Batch</label>
                            <SelectTransactionBatch
                                value={formData.batchId}
                                onChange={(value) => handleChange('batchId', value)}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Branch to Issue MC</label>
                            <SelectMCBranchIssuance
                                value={formData.branchToIssueMcId}
                                onChange={(value) => handleChange('branchToIssueMcId', value)}
                            />
                        </div>

                        <div className="transaction-form-detail-row">
                            <label className="transaction-form-detail-label">Funding Account</label>
                            <SelectFundingAccount
                                value={formData.fundingAccountId}
                                onChange={(value) => handleChange('fundingAccountId', value)}
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