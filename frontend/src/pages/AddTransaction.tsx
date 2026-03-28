import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';
import AddTransactionForm from '../components/AddTransactionForm';
import ConfirmationModal from '../components/ConfirmationModal';
import { type Transaction, transactionsData } from '../dummy_data/transactionsData';
import {
  type CompanyCode,
  transactionCategories,
  transactionCategoriesByCompany,
} from '../dummy_data/transactionCategoriesData';

const AddTransaction = () => {
  const navigate = useNavigate();
  const { transactionRef } = useParams<{ transactionRef?: string }>();
  const isEditMode = Boolean(transactionRef);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({});
  const [initialTransaction, setInitialTransaction] = useState<Partial<Transaction>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<'transactions' | 'back'>('transactions');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const STORAGE_KEY = 'pendingTransaction';
  const TRANSACTIONS_STORAGE_KEY = 'transactionsData';
  const getEditDraftKey = (ref: string) => `pendingTransactionEditDraft:${ref}`;

  const isCompanyCode = (value: string): value is CompanyCode => (
    Object.prototype.hasOwnProperty.call(transactionCategoriesByCompany, value)
  );

  // Sample data - in real app, these would come from API
  const categories = useMemo(() => {
    const storedAlias = localStorage.getItem('userCompanyAlias') || '';
    const aliases = storedAlias
      .split(/[|,;]/)
      .map(alias => alias.trim().toUpperCase())
      .filter(Boolean);

    if (aliases.length === 0 || aliases.includes('ALL')) {
      return transactionCategories;
    }

    const matchedCompanies = aliases.filter(isCompanyCode);
    if (matchedCompanies.length === 0) {
      return transactionCategories;
    }

    return Array.from(
      new Set(matchedCompanies.flatMap(company => transactionCategoriesByCompany[company])),
    );
  }, []);
  const currencies = ['USD', 'PHP'];

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (savedTransactions) {
      try {
        return JSON.parse(savedTransactions) as Transaction[];
      } catch {
        return [...transactionsData];
      }
    }
    return [...transactionsData];
  });

  // Load saved data from localStorage on component mount
  useEffect(() => {
    if (isEditMode) {
      const existingTransaction = transactions.find(t => t.transactionRef === transactionRef);
      if (!existingTransaction) {
        toast.error('Transaction not found.');
        navigate('/transactions');
        return;
      }

      const editDraftKey = getEditDraftKey(transactionRef!);
      const savedEditDraft = localStorage.getItem(editDraftKey);

      if (savedEditDraft) {
        try {
          setNewTransaction(JSON.parse(savedEditDraft) as Partial<Transaction>);
          setInitialTransaction(existingTransaction);
          return;
        } catch {
          localStorage.removeItem(editDraftKey);
        }
      }

      setNewTransaction(existingTransaction);
      setInitialTransaction(existingTransaction);
      return;
    }

    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setNewTransaction(parsedData);
      } catch (error) {
        console.error('Error loading saved transaction data:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    } else {
      setNewTransaction({});
      setInitialTransaction({});
    }
  }, [isEditMode, navigate, transactionRef, transactions]);

  // Save data to localStorage whenever transaction data changes
  useEffect(() => {
    if (!isEditMode && Object.keys(newTransaction).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTransaction));
    }
  }, [isEditMode, newTransaction]);

  useEffect(() => {
    if (isEditMode && transactionRef && Object.keys(newTransaction).length > 0) {
      localStorage.setItem(getEditDraftKey(transactionRef), JSON.stringify(newTransaction));
    }
  }, [isEditMode, newTransaction, transactionRef]);

  useEffect(() => {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Calculate next transaction number
  const nextTrxNumber = transactions.length + 1;

  const toComparableTransaction = (value: Partial<Transaction>) => ({
    category: value.category || '',
    date: value.date || '',
    payee: value.payee || '',
    particulars: value.particulars || '',
    vesselPrincipal: value.vesselPrincipal || '',
    etd: value.etd || '',
    currency: value.currency || '',
    amount: typeof value.amount === 'number' ? value.amount : Number(value.amount || 0),
    referenceErfp: value.referenceErfp || '',
    branchToIssueMc: value.branchToIssueMc || '',
    fundingAccount: value.fundingAccount || '',
    batch: value.batch || '',
    driveFileLink: value.driveFileLink || '',
    supportingDocs: value.supportingDocs || '',
    status: value.status || 'pending',
  });

  const hasUnsavedEditChanges = isEditMode
    && Object.keys(initialTransaction).length > 0
    && JSON.stringify(toComparableTransaction(initialTransaction)) !== JSON.stringify(toComparableTransaction(newTransaction));

  const hasUnsavedChanges = isEditMode
    ? hasUnsavedEditChanges
    : Object.keys(newTransaction).length > 0;

  useEffect(() => {
    if (hasUnsavedChanges) {
      window.history.pushState({ guard: 'transaction-form' }, '', window.location.href);
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    const handlePopState = () => {
      if (!hasUnsavedChanges) {
        return;
      }

      setLeaveTarget('back');
      setShowConfirmModal(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  // Form validation function
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!newTransaction.category?.trim()) {
      errors.push('Category is required');
    }

    if (!newTransaction.date) {
      errors.push('Date is required');
    }

    if (!newTransaction.payee?.trim()) {
      errors.push('Payee is required');
    }

    if (!newTransaction.currency) {
      errors.push('Currency is required');
    }

    if (!newTransaction.amount || newTransaction.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (errors.length > 0) {
      toast.error(`Please fix the following: ${errors.join(', ')}`);
      return false;
    }

    return true;
  };

  // Form handlers
  const handleFormChange = (field: keyof Partial<Transaction>, value: any) => {
    setNewTransaction(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSave = async () => {
    // Validate form before saving
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isEditMode && transactionRef) {
        setTransactions(prev =>
          prev.map(t =>
            t.transactionRef === transactionRef
              ? {
                ...t,
                ...newTransaction,
                transactionRef: t.transactionRef,
              } as Transaction
              : t,
          ),
        );
      } else {
        const paddedNumber = String(nextTrxNumber).padStart(3, '0');
        const newRef = `TRX${paddedNumber}`;
        const transactionToAdd: Transaction = {
          transactionRef: newRef,
          category: String(newTransaction.category || ''),
          date: String(newTransaction.date || ''),
          payee: String(newTransaction.payee || ''),
          particulars: String(newTransaction.particulars || ''),
          vesselPrincipal: String(newTransaction.vesselPrincipal || ''),
          etd: String(newTransaction.etd || ''),
          currency: String(newTransaction.currency || ''),
          amount: typeof newTransaction.amount === 'number' ? newTransaction.amount : Number(newTransaction.amount || 0),
          referenceErfp: String(newTransaction.referenceErfp || ''),
          branchToIssueMc: String(newTransaction.branchToIssueMc || ''),
          fundingAccount: String(newTransaction.fundingAccount || ''),
          batch: String(newTransaction.batch || ''),
          driveFileLink: String(newTransaction.driveFileLink || ''),
          supportingDocs: String(newTransaction.supportingDocs || ''),
          status: 'pending',
          pendingApprovalFrom: 'DAM',
        };
        setTransactions(prev => [transactionToAdd, ...prev]);
      }

      localStorage.removeItem(STORAGE_KEY);
      if (isEditMode && transactionRef) {
        localStorage.removeItem(getEditDraftKey(transactionRef));
      }

      // Show success toast and store its ID
      const toastId = toast.success(isEditMode ? 'Transaction updated successfully!' : 'Transaction saved successfully!');

      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        toast.dismiss(toastId); // Dismiss the toast before navigating
        navigate('/transactions');
      }, 1000);

    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    if (isEditMode) {
      if (hasUnsavedEditChanges) {
        setLeaveTarget('transactions');
        setShowConfirmModal(true);
        return;
      }

      if (transactionRef) {
        localStorage.removeItem(getEditDraftKey(transactionRef));
      }
      navigate('/transactions');
      return;
    }

    // Check if user has any unsaved data
    const hasData = Object.keys(newTransaction).length > 0;
    if (hasData) {
      setLeaveTarget('transactions');
      setShowConfirmModal(true);
    } else {
      navigate('/transactions');
    }
  };

  const handleKeepDraft = () => {
    // Keep draft and navigate away
    setShowConfirmModal(false);
    if (leaveTarget === 'back') {
      navigate(-1);
      return;
    }
    navigate('/transactions');
  };

  const handleDiscardDraft = () => {
    // Clear draft and navigate away
    if (isEditMode && transactionRef) {
      localStorage.removeItem(getEditDraftKey(transactionRef));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setShowConfirmModal(false);
    if (leaveTarget === 'back') {
      navigate(-1);
      return;
    }
    navigate('/transactions');
  };

  const handleCancelModal = () => {
    // Close modal and stay on the page
    setShowConfirmModal(false);
    if (leaveTarget === 'back' && hasUnsavedChanges) {
      window.history.pushState({ guard: 'transaction-form' }, '', window.location.href);
    }
  };

  return (
    <>
      <Sidebar />

      <div className="dashboard-content">

        <div className="px-4 sm:px-6">
          <AddTransactionForm
            nextTrxNumber={nextTrxNumber}
            newTransaction={newTransaction}
            categories={categories}
            currencies={currencies}
            mode={isEditMode ? 'edit' : 'add'}
            displayRef={isEditMode ? transactionRef : undefined}
            isSubmitting={isSubmitting}
            onChange={handleFormChange}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Save Draft?"
        message="You have unsaved changes. Do you want to keep your draft for later?"
        confirmText="Keep Draft"
        cancelText="Don't Save"
        onConfirm={handleKeepDraft}
        onCancel={handleDiscardDraft}
        onBackdropClick={handleCancelModal}
      />
    </>
  );
};

export default AddTransaction;