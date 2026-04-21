import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import EditTransactionForm from '../components/EditTransactionForm';
import { API_BASE, getAuthHeader } from '../config/api';
import { toast } from 'react-toastify';

const EditTransaction: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [supportingDocFile, setSupportingDocFile] = useState<File | null>(null);

    // =========================
    // FETCH TRANSACTION
    // =========================
    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/v1/transactions/${id}/`, {
                    headers: getAuthHeader()
                });
                console.log('Fetch transaction response:', res);
                if (!res.ok) throw new Error();

                const t = await res.json();

                setFormData({
                    company: t.company,
                    transaction_ref: t.transaction_ref,
                    category: t.category,
                    payee: t.payee,
                    particulars: t.particulars,
                    vessel_principal: t.vessel_principal,
                    etd: t.etd,
                    currency: t.currency,
                    transaction_amount: t.transaction_amount,
                    reference_erfp: t.reference_erfp,
                    batch: t.batch,
                    mc_branch_issuance: t.mc_branch_issuance,
                    funding_account: t.funding_account,
                    supporting_docs: t.supporting_docs || '',
                    google_drive_link: t.google_drive_link || '',
                    endorsement_complete: t.endorsement_complete,
                    status: t.status,
                    drive_file_link: t.drive_file_link || ''
                });

            } catch {
                toast.error('Failed to load transaction');
                navigate('/transactions');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransaction();
    }, [id, navigate]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSupportingDocFileSelected = (file: File | null) => {
        if (!file) {
            setSupportingDocFile(null);
            return;
        }

        const maxSizeBytes = 20 * 1024 * 1024;
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (!isPdf) {
            toast.error('Only PDF files are allowed.');
            setSupportingDocFile(null);
            return;
        }

        if (file.size > maxSizeBytes) {
            toast.error('File size must be 20MB or less.');
            setSupportingDocFile(null);
            return;
        }

        setSupportingDocFile(file);
    };

    // =========================
    // UPDATE TRANSACTION
    // =========================
    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value === null || value === undefined) return;
                payload.append(key, String(value));
            });

            if (supportingDocFile) {
                payload.append('supporting_doc_file', supportingDocFile);
            }

            const res = await fetch(`${API_BASE}/api/v1/transactions/${id}/`, {
                method: 'PUT',
                headers: getAuthHeader(false),
                body: payload
            });

            if (!res.ok) throw new Error();

            toast.success('Transaction updated successfully!');
            navigate('/transactions');

        } catch {
            toast.error('Failed to update transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div className="transactions-loading-spinner" />
            </div>
        );
    }
    if (!formData) return null;

    return (
        <>
            <Sidebar />

            <div className="dashboard-content">
                <div className="px-4 sm:px-6">
                    <EditTransactionForm
                        formData={formData}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        supportingDocFile={supportingDocFile}
                        onSupportingDocFileChange={handleSupportingDocFileSelected}
                    />
                </div>
            </div>
        </>
    );
};

export default EditTransaction;