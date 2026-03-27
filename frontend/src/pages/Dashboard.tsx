import Sidebar from "./Sidebar";
import '../styles/Dashboard.css';
import { Link } from "react-router-dom";
import { getDamTabsForRoles, isApproverOrDeputy, parseStoredRoles, ROLES } from '../utils/roleUtils';

const Dashboard = () => {
  const storedRole = localStorage.getItem('userRole');
  const userRoles = parseStoredRoles(storedRole);
  const canViewAllCompanies = isApproverOrDeputy(userRoles);
  const assignedDamTabs = getDamTabsForRoles(userRoles);
  const isWorker = userRoles.includes(ROLES.WORKER);

  const companyStats = [
    { path: '/wpsi', label: 'WPSI', value: '22' },
    { path: '/wmsi', label: 'WMSI', value: '2' },
    { path: '/wlpi', label: 'WLPI', value: '19' },
    { path: '/cfii', label: 'CFII', value: '9' }
  ];

  const visibleCompanyStats = canViewAllCompanies
    ? companyStats
    : companyStats.filter((companyStat) => assignedDamTabs.some((tab) => tab.path === companyStat.path));

  let statsContent;
  if (visibleCompanyStats.length > 0) {
    statsContent = (
      <>
        {visibleCompanyStats.map((companyStat) => (
          <div className="dashboard-wrapper px-4 sm:px-6" key={companyStat.path}>
            <div className="stats-card">
              <span className="stats-value">{companyStat.value}</span>
              <span className="stats-label"><Link to={companyStat.path}>{companyStat.label}</Link></span>
            </div>
          </div>
        ))}
      </>
    );
  } else if (isWorker) {
    statsContent = (
      <>
{/*         <div className="dashboard-wrapper px-4 sm:px-6" style={{ marginBottom: '1rem', marginTop: '1rem'  }}>
          <div className="wpsi-add-button-container" style={{ justifyContent: 'flex-end', textAlign: 'right', fontSize: '1.125rem' }}>
            <Link to="/add-transaction" className="wpsi-add-button" style={{ textDecoration: 'none' }}>
              + Add
            </Link>
          </div>
        </div> */}
        <div className="dashboard-wrapper px-4 sm:px-6">
          <div className="stats-card">
            <span className="stats-value">22</span>
            <span className="stats-label">Approved</span>
          </div>
        </div>
        <div className="dashboard-wrapper px-4 sm:px-6">
          <div className="stats-card">
            <span className="stats-value">2</span>
            <span className="stats-label">Pending</span>
          </div>
        </div>
        <div className="dashboard-wrapper px-4 sm:px-6">
          <div className="stats-card">
            <span className="stats-value">12</span>
            <span className="stats-label">Disapproved</span>
          </div>
        </div>
      </>
    );
  } else {
    statsContent = <p>No stats available</p>;
  };

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
                <h2 className="profile-name">{localStorage.getItem('userName')}</h2>
                <p className="profile-role">{userRoles.length > 0 ? userRoles.join(' / ') : storedRole}</p>
              </div>
            </div>
          </div>
        </div>
        {statsContent}
      </div>
    </>
  );
};

export default Dashboard;
