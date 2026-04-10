import { useEffect, useState } from 'react';
import { API_BASE, getAuthHeader } from '../config/api';
import { toast } from 'react-toastify';

interface VesselPrincipal {
  vessel_principal_id: string;
  vessel_principal_name: string;
}

interface Props {
  value?: string;
  onChange: (vesselPrincipalId: string) => void;
}

const SelectVesselPrincipal: React.FC<Props> = ({ value, onChange }) => {
  const [items, setItems] = useState<VesselPrincipal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(`${API_BASE}/api/v1/vessel-principals/`, {
          headers: getAuthHeader(),
        });

        if (!res.ok) throw new Error();

        const data: VesselPrincipal[] = await res.json();
        setItems(data);
      } catch {
        toast.error('Failed to load vessel/principal');
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
        {isLoading ? 'Loading vessel/principal...' : 'Select Vessel / Principal'}
      </option>

      {items.map((item) => (
        <option key={item.vessel_principal_id} value={item.vessel_principal_id}>
          {item.vessel_principal_name}
        </option>
      ))}
    </select>
  );
};

export default SelectVesselPrincipal;