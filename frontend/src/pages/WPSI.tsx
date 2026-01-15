import Sidebar from "./Sidebar";
import "./WPSI.css";

const WPSI = () => {
  // Sample data - replace with your actual data
  const transactions = [
    { id: 1, label: "LIQUIDATION", title: "RAUL GALOPE", amount: "PHP 31,529.94" },
    { id: 2, label: "LIQUIDATION", title: "RAUL GALOPE", amount: "PHP 68,342.15" },
    { id: 3, label: "LIQUIDATION", title: "RAUL GALOPE", amount: "PHP 13,418.12" },
    { id: 4, label: "LIQUIDATION", title: "RAUL GALOPE", amount: "PHP 46,304.57" },
  ];

  return (
    <>
      <Sidebar />
      <div className="wpsi-content">
        <main className="wpsi-main">
          <div className="wpsi-inner">
            {/* For Review Section */}
            <div className="wpsi-card wpsi-card-review">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>For Review</span>
            </div>

            {/* Count Box */}
            <div className="wpsi-count-box">
              <div className="wpsi-count">22</div>
              <div className="wpsi-count-label">transaction/s</div>
            </div>

            {/* List of Transactions Section */}
            <div className="wpsi-card wpsi-card-transactions">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>List of Transactions</span>
            </div>
            
            {/* Search Box */}
            <div className="wpsi-search-filter-container">
              <div className="wpsi-search-box">
                <svg className="wpsi-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search" className="wpsi-search-input" />
              </div>
              <div className="wpsi-filter-box">
                <svg className="wpsi-filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M6 12h12M8 18h8" />
                </svg>
              </div>
            </div>

            {/* Section Header */}
            <div className="wpsi-section-header">WPSI-ACA</div>

            {/* Transaction Items */}
            {transactions.map((transaction) => (
              <div key={transaction.id} className="wpsi-transaction-item">
                <div className="wpsi-transaction-label">{transaction.label}</div>
                <div className="wpsi-transaction-row">
                  <div>
                    <div className="wpsi-transaction-title">{transaction.title}</div>
                    <div className="wpsi-transaction-amount">{transaction.amount}</div>
                  </div>
                  <svg className="wpsi-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default WPSI;