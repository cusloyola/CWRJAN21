import Sidebar from "./Sidebar";
import '../styles/Dashboard.css';
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <>
      <Sidebar />

      <div className="dashboard-content">
        <header className="dashboard-header" />

        {/* User Profile Card */}
        <div className="dashboard-wrapper px-4 sm:px-6">
          <div className="profile-card">
            <div className="profile-card-inner">
              {/* User Icon */}
              <div className="profile-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" className="profile-icon">
                  <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z" />
                </svg>
              </div>

              {/* User Info */}
              <div>
                <h2 className="profile-name">Juan Dela Cruz</h2>
                <p className="profile-role">{localStorage.userRole}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="dashboard-wrapper px-4 sm:px-6">
          <div className="stats-card">
            <span className="stats-value">22</span>
            <span className="stats-label"><Link to="/wpsi">WPSI</Link></span>
          </div>
        </div>
        <div className="dashboard-wrapper px-4 sm:px-6">
          <div className="stats-card">
            <span className="stats-value">2</span>
            <span className="stats-label"><Link to="/wmsi">WMSI</Link></span>
          </div>
        </div>
        <div className="dashboard-wrapper px-4 sm:px-6">
          <div className="stats-card">
            <span className="stats-value">19</span>
            <span className="stats-label"><Link to="/wlpi">WLPI</Link></span>
          </div>
        </div>
        <div className="dashboard-wrapper px-4 sm:px-6">
          <div className="stats-card">
            <span className="stats-value">9</span>
            <span className="stats-label"><Link to="/cfii">CFII</Link></span>
          </div>
        </div>

        {/* Main Content Area */}
          {/* Add more dashboard content here */}
      </div>
    </>
  );
};

export default Dashboard;
