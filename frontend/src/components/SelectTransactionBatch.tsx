import { useEffect, useState } from 'react';
import { API_BASE, getAuthHeader } from '../config/api';
import { toast } from 'react-toastify';

interface Batch {
  batch_id: string;
  batch_name: string;
}

interface Props {
  value?: string;
  onChange: (batchId: string) => void;
}

const SelectTransactionBatch: React.FC<Props> = ({ value, onChange }) => {
  const [items, setItems] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(`${API_BASE}/api/v1/transaction-batches/`, {
          headers: getAuthHeader(),
        });

        if (!res.ok) throw new Error();

        const data: Batch[] = await res.json();
        setItems(data);
      } catch {
        toast.error('Failed to load batches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, []);

  return (
    <select
      className="transaction-form-detail-value transaction-form-select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
    >
      <option value="">
        {isLoading ? 'Loading batches...' : 'Select Batch'}
      </option>

      {items.map((item) => (
        <option key={item.batch_id} value={item.batch_id}>
          {item.batch_name}
        </option>
      ))}
    </select>
  );
};

export default SelectTransactionBatch;