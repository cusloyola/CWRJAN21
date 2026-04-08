// src/components/SelectMCBranchIssuance.tsx
import { useEffect, useState } from 'react';
import { API_BASE, getAuthHeader } from '../config/api';
import { toast } from 'react-toastify';

interface Branch {
  branch_id: string;
  branch_name: string;
}

interface Props {
  value?: string;
  onChange: (branchId: string) => void;
}

const SelectMCBranchIssuance: React.FC<Props> = ({ value, onChange }) => {
  const [items, setItems] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(`${API_BASE}/api/v1/mc-branches/`, {
          headers: getAuthHeader(),
        });

        if (!res.ok) throw new Error();

        const data: Branch[] = await res.json();
        setItems(data);
      } catch {
        toast.error('Failed to load branches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <select
      className="transaction-form-detail-value transaction-form-select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
    >
      <option value="">
        {isLoading ? 'Loading branches...' : 'Select Branch'}
      </option>

      {items.map((item) => (
        <option key={item.branch_id} value={item.branch_id}>
          {item.branch_name}
        </option>
      ))}
    </select>
  );
};

export default SelectMCBranchIssuance;