import { type Transaction } from '../types/Transaction';

export const mapTransactionFromAPI = (t: any): Transaction => ({
  transactionId: t.transaction_id,
  transactionRef: t.transaction_ref,
  category: t.category_name,
  dateCreated: t.date_created,
  payee: t.payee_name,
  particulars: t.particulars,
  vesselPrincipal: t.vessel_principal_name,
  etd: t.etd,
  currency: t.currency_code,
  amount: t.transaction_amount,
  referenceErfp: t.reference_erfp,
  branchToIssueMc: t.branch_to_issue_mc,
  fundingAccount: t.funding_acct_name,
  batch: t.batch_name,
  driveFileLink: t.drive_file_link,
  supportingDocs: t.supporting_docs,
  status: t.status,
  pendingApprovalFrom: t.pending_approval_from,
  rejectedBy: t.rejected_by,
  approvedBy: t.approved_by,
});