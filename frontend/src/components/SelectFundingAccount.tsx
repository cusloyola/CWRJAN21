import { useEffect, useState } from 'react';
import { API_BASE, getAuthHeader } from '../config/api';
import { toast } from 'react-toastify';

interface FundingAccount {
  funding_acct_id: string;
  funding_acct_name: string;
}

interface Props {
  value?: string;
  onChange: (fundingAccountId: string) => void;
}

const SelectFundingAccount: React.FC<Props> = ({ value, onChange }) => {
  const [items, setItems] = useState<FundingAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(`${API_BASE}/api/v1/funding-accounts/`, {
          headers: getAuthHeader(),
        });

        if (!res.ok) throw new Error();

        const data: FundingAccount[] = await res.json();
        setItems(data);
      } catch {
        toast.error('Failed to load funding accounts');
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
        {isLoading ? 'Loading accounts...' : 'Select Funding Account'}
      </option>

      {items.map((item) => (
        <option key={item.funding_acct_id} value={item.funding_acct_id}>
          {item.funding_acct_name}
        </option>
      ))}
    </select>
  );
};

export default SelectFundingAccount;