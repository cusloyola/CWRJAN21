// RFP Monitoring Data Types and Interfaces
export type RfpStatus = 'Released' | 'Approved' | 'Draft' | 'Printed' | 'For AGM Approval' | 'For OM Approval';

// Updated interfaces to match Django backend model
export interface Payee {
  payee_id: string;
  payee_name: string;
}

export interface VesselPrincipal {
  vessel_principal_id: string;
  vessel_principal_name: string;
}

export interface Port {
  port_id: string;
  port_name: string;
}

export interface RfpMonitoringRecord {
  rfp_id?: string;
  expected_series: number;
  cwr_processed?: number;
  cwr_usage: 0 | 1;
  trampsys_status: RfpStatus;
  status_cwr?: string;
  remarks_cwr?: string;
  eta: string;
  etd: string;
  // Handle both nested objects and IDs
  payee?: Payee | string;
  vessel_principal?: VesselPrincipal | string;
  port?: Port | string;
  // Store resolved foreign key data
  payee_data?: Payee;
  vessel_principal_data?: VesselPrincipal;
  port_data?: Port;
  voy?: string;
}

// API form data interface for submissions
export interface RfpFormData {
  expected_series?: number;
  cwr_processed?: number;
  cwr_usage: number;
  trampsys_status: RfpStatus;
  status_cwr?: string;  
  remarks_cwr?: string;
  eta: string;
  etd: string;
  payee?: string;
  vessel_principal?: string;
  port?: string;
  voy?: string;
}