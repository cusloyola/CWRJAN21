import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import AddTransactionForm from '../components/AddTransactionForm';

const AddTransaction: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // After successful save → go back to list
    navigate('/transactions');
  };

  return (
    <>
      <Sidebar />

      <div className="dashboard-content">
        <div className="px-4 sm:px-6">
          <AddTransactionForm onSuccess={handleSuccess} />
        </div>
      </div>
    </>
  );
};

export default AddTransaction;