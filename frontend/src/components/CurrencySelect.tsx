// src/components/CurrencySelect.tsx
import { useEffect, useState } from 'react';
import { API_BASE } from '../config/api';
import { toast } from 'react-toastify';

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CurrencySelect: React.FC<Props> = ({ value, onChange, disabled }) => {
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  });

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(`${API_BASE}/api/v1/currencies/`, {
          headers: getAuthHeader(),
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setCurrencies(data.map((c: any) => c.currency_code));
      } catch {
        toast.error('Failed to load currencies');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  return (
    <select
      className="wpsi-dropdown"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || isLoading}
    >
      <option value="">
        {isLoading ? 'Loading currencies...' : 'Currencies'}
      </option>
      {currencies.map((cur) => (
        <option key={cur} value={cur}>
          {cur}
        </option>
      ))}
    </select>
  );
};

export default CurrencySelect;