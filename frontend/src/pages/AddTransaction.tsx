import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';
import AddTransactionForm from '../components/AddTransactionForm';
import ConfirmationModal from '../components/ConfirmationModal';
import { type Transaction, transactionsData } from '../dummy_data/transactionsData';

const AddTransaction = () => {
  const navigate = useNavigate();
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const STORAGE_KEY = 'pendingTransaction';

  // Sample data - in real app, these would come from API
  const categories = ['Category 1', 'Category 2', 'Category 3'];
  const currencies = ['USD', 'PHP'];

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setNewTransaction(parsedData);
      } catch (error) {
        console.error('Error loading saved transaction data:', error);
        // Clear corrupted data
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save data to localStorage whenever transaction data changes
  useEffect(() => {
    if (Object.keys(newTransaction).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTransaction));
    }
  }, [newTransaction]);

  // Calculate next transaction number
  const nextTrxNumber = transactionsData.length + 1;

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
      
      // TODO: Save transaction to backend/state management
      console.log('Saving transaction:', newTransaction);
      
      // Clear the saved draft data since transaction is being saved
      localStorage.removeItem(STORAGE_KEY);
      
      // Show success toast and store its ID
      const toastId = toast.success('Transaction saved successfully!');
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        toast.dismiss(toastId); // Dismiss the toast before navigating
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    // Check if user has any unsaved data
    const hasData = Object.keys(newTransaction).length > 0;
    if (hasData) {
      setShowConfirmModal(true);
    } else {
      navigate('/transactions');
    }
  };

  const handleKeepDraft = () => {
    // Keep draft and navigate away
    setShowConfirmModal(false);
    navigate('/transactions');
  };

  const handleDiscardDraft = () => {
    // Clear draft and navigate away
    localStorage.removeItem(STORAGE_KEY);
    setShowConfirmModal(false);
    navigate('/transactions');
  };

  const handleCancelModal = () => {
    // Close modal and stay on the page
    setShowConfirmModal(false);
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