import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../pages/Sidebar';
import '../styles/style.css';
import { RfpApi } from '../services/rfpApi';
import { toast } from 'react-toastify';

import SelectVesselPrincipal from './SelectVesselPrincipal';   

interface FormState {
  expected_series: string;
  payee: string;
  vessel_principal: string;
  port: string;
  voy: string;
  eta: string;
  etd: string;
  remarks_cwr: string;
  trampsys_status: string;
}

const initialState: FormState = {
  expected_series: '',
  payee: '',
  vessel_principal: '',
  port: '',
  voy: '',
  eta: '',
  etd: '',
  remarks_cwr: '',
  trampsys_status: 'Draft',
};

const RFPForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // used for edit mode

  const isEditMode = Boolean(id);

  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ===============================
  // LOAD DATA (EDIT MODE ONLY)
  // ===============================
  useEffect(() => {
    if (!isEditMode) return;

    const loadRecord = async () => {
      try {
        setLoading(true);

        const res = await RfpApi.getRfpById(id as string);

        if (!res.success) {
          throw new Error(res.error || 'Failed to load RFP');
        }

        const data = res.data;

        setForm({
          expected_series: data.expected_series || '',
          payee: data.payee?.payee_id || data.payee || '',
          vessel_principal: data.vessel_principal?.vessel_principal_id || data.vessel_principal || '',
          port: data.port?.port_id || data.port || '',
          voy: data.voy || '',
          eta: data.eta || '',
          etd: data.etd || '',
          remarks_cwr: data.remarks_cwr || '',
          trampsys_status: data.trampsys_status || 'Draft',
        });
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, [id, isEditMode]);

  // ===============================
  // HANDLERS
  // ===============================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        expected_series: form.expected_series,
        payee: form.payee,
        vessel_principal: form.vessel_principal,
        port: form.port,
        voy: form.voy,
        eta: form.eta,
        etd: form.etd,
        remarks_cwr: form.remarks_cwr,
        trampsys_status: form.trampsys_status,
      };

      let res;

      if (isEditMode) {
        res = await RfpApi.updateRfp(id as string, payload);
      } else {
        res = await RfpApi.createRfp(payload);
      }

      if (!res.success) {
        throw new Error(res.error || 'Save failed');
      }

      toast.success(isEditMode ? 'RFP updated successfully' : 'RFP created successfully');

      navigate('/rfp-monitoring');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <>
      <Sidebar />

      <div className="dashboard-content">
        <div className="transaction-form-header">
          <h2>
            {isEditMode ? 'Edit RFP' : 'Create RFP'}
          </h2>
        </div>

        <main style={{ padding: 'min(30px, 7%)' }}>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <form onSubmit={handleSubmit} className="rfp-form">

              {/* EXPECTED SERIES */}
              <div className="form-group">
                <label>Expected Series</label>
                <input
                  name="expected_series"
                  value={form.expected_series}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* PAYEE */}
              <div className="form-group">
                <label>Payee</label>
                <input
                  name="payee"
                  value={form.payee}
                  onChange={handleChange}
                />
              </div>

              {/* VESSEL */}
              <div className="form-group">
                <label>Vessel Principal</label>
               <SelectVesselPrincipal
                                value={formData.vessel_principal}
                                onChange={(value) => handleChange('vessel_principal', value)}
                            />
              </div>

              {/* PORT */}
              <div className="form-group">
                <label>Port</label>
                <input
                  name="port"
                  value={form.port}
                  onChange={handleChange}
                />
              </div>

              {/* VOY */}
              <div className="form-group">
                <label>Voy</label>
                <input
                  name="voy"
                  value={form.voy}
                  onChange={handleChange}
                />
              </div>

              {/* ETA */}
              <div className="form-group">
                <label>ETA</label>
                <input
                  type="date"
                  name="eta"
                  value={form.eta}
                  onChange={handleChange}
                />
              </div>

              {/* ETD */}
              <div className="form-group">
                <label>ETD</label>
                <input
                  type="date"
                  name="etd"
                  value={form.etd}
                  onChange={handleChange}
                />
              </div>

              {/* REMARKS */}
              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  name="remarks_cwr"
                  value={form.remarks_cwr}
                  onChange={handleChange}
                />
              </div>

              {/* STATUS */}
              <div className="form-group">
                <label>Status</label>
                <select
                  name="trampsys_status"
                  value={form.trampsys_status}
                  onChange={handleChange}
                >
                  <option value="Draft">Draft</option>
                  <option value="Approved">Approved</option>
                  <option value="Released">Released</option>
                </select>
              </div>

              {/* ACTIONS */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/rfp-monitoring')}
                >
                  Cancel
                </button>

                <button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
                </button>
              </div>

            </form>
          )}

        </main>
      </div>
    </>
  );
};

export default RFPForm;