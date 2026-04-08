// src/components/CurrencySelect.tsx
import { useEffect, useState } from 'react';
import { API_BASE, getAuthHeader } from '../config/api';
import { toast } from 'react-toastify';

interface Currency {
  currency_id : string;  
  currency_code: string;
  currency_description: string;
  date_created: string;
}

interface Props {
  value?: string;
  onChange: (CurrencyId: string) => void;
}

const SelectCurrency: React.FC<Props> = ({ value,onChange }:Props) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/api/v1/currencies/`, {
          headers: getAuthHeader(),
        });

        if (!res.ok) throw new Error();

        const data: Currency[] = await res.json();
        setCurrencies(data);
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
      className="transaction-form-detail-value transaction-form-select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
      required
    >
      <option value="">
        {isLoading ? 'Loading currencies...' : 'Currencies'}
      </option>
      {currencies.map((cur) => (
        <option key={cur.currency_id} value={cur.currency_id}>
          {cur.currency_code}
        </option>
      ))}
    </select>
  );
};

export default SelectCurrency;