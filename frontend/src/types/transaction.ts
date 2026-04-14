/**
 * Transaction type definition (frontend contract with backend)
 */

export interface Transaction {
  transactionId: string;
  category: string;
  transactionRef: string;
  dateCreated: string;
  payee: string;
  particulars: string;
  vesselPrincipal: string;
  etd: string;
  currency: string;
  amount: number;
  referenceErfp: string;
  branchToIssueMc: string;
  fundingAccount: string;
  batch: string;
  driveFileLink: string;
  supportingDocs: string;

  // workflow fields
  status: 'pending' | 'rejected' | 'approved';
  pendingApprovalFrom?: 'DAM' | 'Deputy' | 'Approver';
  rejectedBy?: string;
  approvedBy?: string;
}