import { useEffect, useState } from 'react';
import { API_BASE } from '../config/api';
import { toast } from 'react-toastify';

interface Payee {
  payee_id: string;
  payee_name: string;
}

interface Props {
  value?: string;
  onChange: (payeeId: string) => void;
}

const SelectPayee: React.FC<Props> = ({ value, onChange }) => {
  const [payees, setPayees] = useState<Payee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  });

  useEffect(() => {
    const fetchPayees = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(`${API_BASE}/api/v1/payees/`, {
          headers: getAuthHeader(),
        });

        if (!res.ok) throw new Error();

        const data: Payee[] = await res.json();
        setPayees(data);
      } catch {
        toast.error('Failed to load payees');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayees();
  }, []);

return (
    <select
      className="transaction-form-detail-value transaction-form-select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
      required
    >
      <option value="">
        {isLoading ? 'Loading payees...' : 'Select Payee'}
      </option>

      {payees.map((p) => (
        <option key={p.payee_id} value={p.payee_id}>
          {p.payee_name}
        </option>
      ))}
    </select>
  );
};

export default SelectPayee; 
