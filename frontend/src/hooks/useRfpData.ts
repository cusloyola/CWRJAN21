import { useState, useEffect } from 'react';
import { type Payee, type VesselPrincipal, type Port } from '../types/rfp';
import { RfpApi } from '../services/rfpApi';

interface ForeignKeyData {
  payees: Payee[];
  vesselPrincipals: VesselPrincipal[];
  ports: Port[];
  loading: boolean;
  error: string | null;
}

export const useRfpForeignKeyData = (): ForeignKeyData => {
  const [payees, setPayees] = useState<Payee[]>([]);
  const [vesselPrincipals, setVesselPrincipals] = useState<VesselPrincipal[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadForeignKeyData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [payeesRes, vesselsRes, portsRes] = await Promise.all([
          RfpApi.getPayees(),
          RfpApi.getVesselPrincipals(),
          RfpApi.getPorts()
        ]);

        if (!payeesRes.success || !vesselsRes.success || !portsRes.success) {
          throw new Error('Failed to load foreign key data');
        }

        setPayees(payeesRes.data);
        setVesselPrincipals(vesselsRes.data);
        setPorts(portsRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadForeignKeyData();
  }, []);

  return {
    payees,
    vesselPrincipals,
    ports,
    loading,
    error,
  };
};

// Helper hooks for individual entities
export const usePayees = () => {
  const { payees, loading, error } = useRfpForeignKeyData();
  return { payees, loading, error };
};

export const useVesselPrincipals = () => {
  const { vesselPrincipals, loading, error } = useRfpForeignKeyData();
  return { vesselPrincipals, loading, error };
};

export const usePorts = () => {
  const { ports, loading, error } = useRfpForeignKeyData();
  return { ports, loading, error };
};