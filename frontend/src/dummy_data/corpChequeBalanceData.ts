/**
 * Corp. cheque balance / checks printed dummy data.
 * Replace with API fetch when backend is ready.
 */

export interface CorpChequeBalanceSummary {
  corpChequeBalance: number;
  beginningInventory: number;
  beginningInventoryAsOf: string; // e.g. "2026-07-25"
}

export interface CorpChequeBalanceRow {
  date: string; // ISO date (YYYY-MM-DD)
  checksPrinted: number | null; // null represents "-" / no entry
}

export const corpChequeBalanceSummary: CorpChequeBalanceSummary = {
  corpChequeBalance: 4305,
  beginningInventory: 7516,
  beginningInventoryAsOf: "2026-02-06",
};

export const corpChequeBalanceRows: CorpChequeBalanceRow[] = [
  { date: "2026-02-06", checksPrinted: 11 },
  { date: "2026-02-07", checksPrinted: null },
  { date: "2026-02-08", checksPrinted: null },
  { date: "2026-02-09", checksPrinted: 10 },
  { date: "2026-02-10", checksPrinted: 12 },
  { date: "2026-02-11", checksPrinted: 2 },
  { date: "2026-02-12", checksPrinted: 4 },
  { date: "2026-02-13", checksPrinted: 5 },
  { date: "2026-02-14", checksPrinted: null },
  { date: "2026-02-15", checksPrinted: null },
  { date: "2026-02-16", checksPrinted: 21 },
  { date: "2026-02-17", checksPrinted: null },
  { date: "2026-02-18", checksPrinted: 1 },
  { date: "2026-02-19", checksPrinted: 15 },
  { date: "2026-02-20", checksPrinted: 1 },
  { date: "2026-02-21", checksPrinted: null },
  { date: "2026-02-22", checksPrinted: null },
  { date: "2026-02-23", checksPrinted: 25 },
  { date: "2026-02-24", checksPrinted: 6 },
  { date: "2026-02-25", checksPrinted: 32 },
  { date: "2026-02-26", checksPrinted: 29 },
  { date: "2026-02-27", checksPrinted: 24 },
  { date: "2026-02-28", checksPrinted: null },
];
