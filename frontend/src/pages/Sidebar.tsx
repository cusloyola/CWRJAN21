import { useState, } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import '../styles/style.css';
import LogoutModal from "./LogoutModal";
import logo from '../assets/wallemrectangle.png';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const userRole = localStorage.getItem('userRole') || '';
  const isDAM = userRole.startsWith('DAM');
  const isWorker = userRole === 'Worker';
  const isApproverOrDeputy = userRole === 'Approver' || userRole === 'Deputy';


  const damCompanyTabs = [
    { role: 'DAM WPSI', path: '/wpsi', label: 'WPSI' },
    { role: 'DAM WMSI', path: '/wmsi', label: 'WMSI' },
    { role: 'DAM WLPI', path: '/wlpi', label: 'WLPI' },
    { role: 'DAM CFII', path: '/cfii', label: 'CFII' }
  ];

  const damTab = damCompanyTabs.find(tab => tab.role === userRole);
  const canSeeTab = (path: string) => {
    if (isApproverOrDeputy) return true;
    if (isDAM && damTab && damTab.path === path) return true;
    if (isWorker && damTab && damTab.path === path) return true;
    return false;
  };

  /*   const openModal = () => setIsLogoutModalOpen(true);
    const closeModal = () => setIsLogoutModalOpen(false); */

  const isActive = (path: string) => location.pathname === path && !mobileMoreOpen;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };


  /*     const toggleSidebar = () => {
        if (window.innerWidth >= 1024) {
          setSidebarCollapsed(!sidebarCollapsed);
          setActivityLogOpen(false);
          setMobileMoreOpen(false);
        }
      }; */

  const toggleActivityLog = () => {
    if (!activityLogOpen) {
      if (window.innerWidth >= 768) {
        setMobileMoreOpen(false);
      }
    }
    setActivityLogOpen(!activityLogOpen);
    if (sidebarCollapsed && window.innerWidth >= 1024) {
      setSidebarCollapsed(false);
    }
  };

  const toggleMobileMore = () => {
    if (!mobileMoreOpen) {
      setActivityLogOpen(false);
    }
    setMobileMoreOpen(!mobileMoreOpen);
  };

  const closeMobileMenus = () => {
    setMobileMoreOpen(false);
    setActivityLogOpen(false);
  };

  const sidebarClass = `${sidebarCollapsed ? "w-16 px-1" : "w-64 px-4"}`;
  return (
    <>
      {mobileMoreOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={closeMobileMenus}
        />
      )}
      <nav id="sidebar" className={sidebarClass}>
        <ul className="list-none">
          <li className="flex justify-between items-center">
            <span className="logo">
              <Link to="/dashboard">
                <img src={logo} alt="Wallem Square Logo" style={{ width: '100%', height: '50px' }} />              </Link>
            </span>
            {isWorker && (<>

              {/*                        <button onClick={toggleSidebar} id="toggle-btn" className={sidebarCollapsed ? "rotate-180" : ""}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="m313-480 155 156q11 11 11.5 27.5T468-268q-11 11-28 11t-28-11L228-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l184-184q11-11 27.5-11.5T468-692q11 11 11 28t-11 28L313-480Zm264 0 155 156q11 11 11.5 27.5T732-268q-11 11-28 11t-28-11L492-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l184-184q11-11 27.5-11.5T732-692q11 11 11 28t-11 28L577-480Z" />
              </svg>
            </button> */}

            </>
            )
            }

          </li>

          <li className={isActive("/dashboard") ? "active" : ""}>
            <Link to="/dashboard" className="flex items-center gap-4 p-3.5 rounded-lg text-blue-600 no-underline transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                {isActive("/dashboard") ? (
                  /* Filled Home Icon Path */
                  <path d="M160-120v-480l320-240 320 240v480H520v-240h-80v240H160Z" />
                ) : (
                  /* Outlined Home Icon Path (Your current one) */
                  <path d="M240-200h120v-200q0-17 11.5-28.5T400-440h160q17 0 28.5 11.5T600-400v200h120v-360L480-740 240-560v360Zm-80 0v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H560q-17 0-28.5-11.5T520-160v-200h-80v200q0 17-11.5 28.5T400-120H240q-33 0-56.5-23.5T160-200Zm320-270Z" />
                )}
              </svg>
              <span>Home</span>
            </Link>
          </li>

          {canSeeTab("/wpsi") && (
            <li className={isActive("/wpsi") ? "active" : ""}>
              <Link to="/wpsi" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                  {isActive("/wpsi") ? (
                    /* Solid / Filled Path */
                    <path d="M480-240q-60 0-105-40l-45-40q-37 37-83.5 56T145-243L50-540l66-17v-123q0-33 23.5-56.5T196-760h124v-80h320v80h124q33 0 56.5 23.5T844-680v123l66 17-95 297q-54-2-101.5-21T730-320l-45 40q-45 40-105 40ZM152-80h-32v-80h32q48 0 91.5-10.5T341-204q38 19 66.5 31.5T480-160q44 0 72.5-12.5T619-204q53 23 97.5 33.5T809-160h31v80h-31q-49 0-95.5-9T622-116q-40 19-73 27t-69 8q-36 0-68.5-8T339-116q-45 18-91.5 27T152-80Z" />
                  ) : (
                    /* Outlined Path (Your Original) */
                    <path d="M152-80h-32v-80h32q48 0 91.5-10.5T341-204q38 19 66.5 31.5T480-160q44 0 72.5-12.5T619-204q53 23 97.5 33.5T809-160h31v80h-31q-49 0-95.5-9T622-116q-40 19-73 27t-69 8q-36 0-68.5-8T339-116q-45 18-91.5 27T152-80Zm328-160q-60 0-105-40l-45-40q-27 27-60.5 46T198-247l-85-273q-5-17 3-31t25-19l59-16v-134q0-33 23.5-56.5T280-800h100v-80h200v80h100q33 0 56.5 23.5T760-720v134l59 16q17 5 25 19t3 31l-85 273q-38-8-71.5-27T630-320l-45 40q-45 40-105 40Zm2-80q31 0 55-20.5t44-43.5l46-53 41 42q11 11 22.5 20.5T713-355l46-149-279-73-278 73 46 149q11-10 22.5-19.5T293-395l41-42 46 53q20 24 45 44t57 20ZM280-607l200-53 200 53v-113H280v113Zm201 158Z" />
                  )}
                </svg>
                <span>WPSI</span>
              </Link>
            </li>
          )}
          {canSeeTab("/wmsi") && (
            <li className={isActive("/wmsi") ? "active" : ""}>
              <Link to="/wmsi" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                  {isActive("/wmsi") ? (
                    /* Solid Path if state is active*/
                    <path d="M40-120v-112q0-33 17-62t47-44q51-26 115-44t141-18q77 0 141 18t115 44q30 15 47 44t17 62v112H40Zm322-320q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm320 160-6-30q-6-2-11.5-4.5T652-322l-28 10-20-36 22-20v-24l-22-20 20-36 28 10q4-4 10-7t12-5l6-30h40l6 30q6 2 12 5t10 7l28-10 20 36-22 20v24l22 20-20 36-28-10q-5 5-10.5 7.5T726-310l-6 30h-40Zm102-210-8-42q-9-3-16.5-7.5T734-540l-42 14-28-48 34-30q-2-5-2-8v-16q0-3 2-8l-34-30 28-48 42 14q6-6 13.5-10.5T764-718l8-42h56l8 42q9 3 16.5 7.5T866-700l42-14 28 48-34 30q2 5 2 8v16q0 3-2 8l34 30-28 48-42-14q-6 6-13.5 10.5T836-522l-8 42h-56Z" />
                  ) : (
                    /* Outlined Path */
                    <path d="M42-120v-112q0-33 17-62t47-44q51-26 115-44t141-18q77 0 141 18t115 44q30 15 47 44t17 62v112H42Zm80-80h480v-32q0-11-5.5-20T582-266q-36-18-92.5-36T362-320q-71 0-127.5 18T142-266q-9 5-14.5 14t-5.5 20v32Zm240-240q-66 0-113-47t-47-113h-10q-9 0-14.5-5.5T172-620q0-9 5.5-14.5T192-640h10q0-45 22-81t58-57v38q0 9 5.5 14.5T302-720q9 0 14.5-5.5T322-740v-54q9-3 19-4.5t21-1.5q11 0 21 1.5t19 4.5v54q0 9 5.5 14.5T422-720q9 0 14.5-5.5T442-740v-38q36 21 58 57t22 81h10q9 0 14.5 5.5T552-620q0 9-5.5 14.5T532-600h-10q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T442-600H282q0 33 23.5 56.5T362-520Zm300 160-6-30q-6-2-11.5-4.5T634-402l-28 10-20-36 22-20v-24l-22-20 20-36 28 10q4-4 10-7t12-5l6-30h40l6 30q6 2 12 5t10 7l28-10 20 36-22 20v24l22 20-20 36-28-10q-5 5-10.5 7.5T708-390l-6 30h-40Zm20-70q12 0 21-9t9-21q0-12-9-21t-21-9q-12 0-21 9t-9 21q0 12 9 21t21 9Zm72-130-8-42q-9-3-16.5-7.5T716-620l-42 14-28-48 34-30q-2-5-2-8v-16q0-3 2-8l-34-30 28-48 42 14q6-6 13.5-10.5T746-798l8-42h56l8 42q9 3 16.5 7.5T848-780l42-14 28 48-34 30q2 5 2 8v16q0 3-2 8l34 30-28 48-42-14q-6 6-13.5 10.5T818-602l-8 42h-56Zm28-90q21 0 35.5-14.5T832-700q0-21-14.5-35.5T782-750q-21 0-35.5 14.5T732-700q0 21 14.5 35.5T782-650ZM362-200Z" />
                  )}
                </svg>
                <span>WMSI</span>
              </Link>
            </li>
          )}

          {canSeeTab("/wlpi") && (
            <li className={isActive("/wlpi") ? "active" : ""}>
              <Link to="/wlpi" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                  {isActive("/wlpi") ? (
                    <path d="M240-160q-50 0-85-35t-35-85H40v-440q0-33 23.5-56.5T120-800h560v240h120l120 160v160h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H360q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T280-280q0-17-11.5-28.5T240-320q-17 0-28.5 11.5T200-280q0 17 11.5 28.5T240-240Zm480 0q17 0 28.5-11.5T760-280q0-17-11.5-28.5T720-320q-17 0-28.5 11.5T680-280q0 17 11.5 28.5T720-240Zm-40-200h170l-90-120h-80v120Z" />
                  ) : (
                    <path d="M280-160q-50 0-85-35t-35-85H60l18-80h113q17-19 40-29.5t49-10.5q26 0 49 10.5t40 29.5h167l84-360H182l4-17q6-28 27.5-45.5T264-800h456l-37 160h117l120 160-40 200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H400q0 50-35 85t-85 35Zm357-280h193l4-21-74-99h-95l-28 120Zm-19-273 2-7-84 360 2-7 34-146 46-200ZM20-427l20-80h220l-20 80H20Zm80-146 20-80h260l-20 80H100Zm180 333q17 0 28.5-11.5T320-280q0-17-11.5-28.5T280-320q-17 0-28.5 11.5T240-280q0 17 11.5 28.5T280-240Zm400 0q17 0 28.5-11.5T720-280q0-17-11.5-28.5T680-320q-17 0-28.5 11.5T640-280q0 17 11.5 28.5T680-240Z" />
                  )}
                </svg>
                <span>WLPI</span>
              </Link>
            </li>
          )}
          {canSeeTab("/cfii") && (
            <li className={isActive("/cfii") ? "active" : ""}>
              <Link to="/cfii" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                  {isActive("/cfii") ? (
                    <path d="M120-520v-320h320v320H120Zm0 400v-320h320v320H120Zm400-400v-320h320v320H520Zm0 400v-320h320v320H520Z" />
                  ) : (
                    <path d="M520-640v-160q0-17 11.5-28.5T560-840h240q17 0 28.5 11.5T840-800v160q0 17-11.5 28.5T800-600H560q-17 0-28.5-11.5T520-640ZM120-480v-320q0-17 11.5-28.5T160-840h240q17 0 28.5 11.5T440-800v320q0 17-11.5 28.5T400-440H160q-17 0-28.5-11.5T120-480Zm400 320v-320q0-17 11.5-28.5T560-520h240q17 0 28.5 11.5T840-480v320q0 17-11.5 28.5T800-120H560q-17 0-28.5-11.5T520-160Zm-400 0v-160q0-17 11.5-28.5T160-360h240q17 0 28.5 11.5T440-320v160q0 17-11.5 28.5T400-120H160q-17 0-28.5-11.5T120-160Zm80-360h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z" />
                  )}
                </svg>
                <span>CFII</span>
              </Link>
            </li>
          )}
          {/* The rest of the tabs: only for Approver/Deputy */}
          {isApproverOrDeputy && (
            <>
              <li className={isActive("/bank-workload") ? "active" : ""}>
                <Link to="/bank-workload" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                    {isActive("/bank-workload") ? (
                      <path d="M80-640v-80l400-200 400 200v80H80Zm120 360v-280h80v280h-80Zm200 0v-280h80v280h-80ZM80-120v-80h480v80H80Zm600-310v-130h80v90l-80 40ZM800 0q-69-17-114.5-79.5T640-218v-102l160-80 160 80v102q0 76-45.5 138.5T800 0Zm-29-120 139-138-42-42-97 95-39-39-42 43 81 81Z" />
                    ) : (
                      <path d="M200-280v-280h80v280h-80Zm240 0v-280h80v280h-80ZM80-640v-80l400-200 400 200v80H80Zm179-80h442L480-830 259-720ZM80-120v-80h482q2 21 5 40.5t9 39.5H80Zm600-310v-130h80v90l-80 40ZM800 0q-69-17-114.5-79.5T640-218v-102l160-80 160 80v102q0 76-45.5 138.5T800 0Zm-29-120 139-138-42-42-97 95-39-39-42 43 81 81ZM259-720h442-442Z" />
                    )}
                  </svg>
                  <span>Bank Workload</span>
                </Link>
              </li>


              <li>
                <button
                  onClick={toggleActivityLog}
                  className={`dropdown-btn w-full text-left bg-transparent border-none cursor-pointer flex items-center gap-4 p-3.5 rounded-lg text-gray-900 transition-colors ${activityLogOpen ? 'rotate' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                    <path d="m221-313 142-142q12-12 28-11.5t28 12.5q11 12 11 28t-11 28L250-228q-12 12-28 12t-28-12l-86-86q-11-11-11-28t11-28q11-11 28-11t28 11l57 57Zm0-320 142-142q12-12 28-11.5t28 12.5q11 12 11 28t-11 28L250-548q-12 12-28 12t-28-12l-86-86q-11-11-11-28t11-28q11-11 28-11t28 11l57 57Zm339 353q-17 0-28.5-11.5T520-320q0-17 11.5-28.5T560-360h280q17 0 28.5 11.5T880-320q0 17-11.5 28.5T840-280H560Zm0-320q-17 0-28.5-11.5T520-640q0-17 11.5-28.5T560-680h280q17 0 28.5 11.5T880-640q0 17-11.5 28.5T840-600H560Z" />
                  </svg>
                  <span>Activity Log</span>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="transition-transform duration-200" style={{ marginLeft: 'auto' }}>
                    <path d="M480-361q-8 0-15-2.5t-13-8.5L268-556q-11-11-11-28t11-28q11-11 28-11t28 11l156 156 156-156q11-11 28-11t28 11q11 11 11 28t-11 28L508-372q-6 6-13 8.5t-15 2.5Z" />
                  </svg>
                </button>
                <ul className={`sub-menu ${activityLogOpen ? 'show' : ''}`}>
                  <div className="overflow-hiddenhttp">
                    <li>
                      <Link to="/activity-log/wpsi-cwr" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors opacity-50 cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                          <path d="M440-278v-394q-41-24-87-36t-93-12q-36 0-71.5 7T120-692v396q35-12 69.5-18t70.5-6q47 0 91.5 10.5T440-278Zm40 118q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q74 0 126 17t112 52q11 6 16.5 14t5.5 21v418q44-21 88.5-31.5T700-320q36 0 70.5 6t69.5 18v-481q15 5 29.5 11t28.5 14q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59Zm140-240v-440l120-40v440l-120 40Zm-340-99Z" />
                        </svg>
                        <span>WPSI-CWR</span>
                      </Link>
                    </li>
                    <li>
                      <a href="/activity-log/wmsi-cwr" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors opacity-50 cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                          <path d="M440-278v-394q-41-24-87-36t-93-12q-36 0-71.5 7T120-692v396q35-12 69.5-18t70.5-6q47 0 91.5 10.5T440-278Zm40 118q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q74 0 126 17t112 52q11 6 16.5 14t5.5 21v418q44-21 88.5-31.5T700-320q36 0 70.5 6t69.5 18v-481q15 5 29.5 11t28.5 14q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59Zm140-240v-440l120-40v440l-120 40Zm-340-99Z" />
                        </svg>
                        <span>WMSI-CWR</span>
                      </a>
                    </li>
                    <li>
                      <a href="/activity-log/wlpi-cwr" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors opacity-50 cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                          <path d="M440-278v-394q-41-24-87-36t-93-12q-36 0-71.5 7T120-692v396q35-12 69.5-18t70.5-6q47 0 91.5 10.5T440-278Zm40 118q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q74 0 126 17t112 52q11 6 16.5 14t5.5 21v418q44-21 88.5-31.5T700-320q36 0 70.5 6t69.5 18v-481q15 5 29.5 11t28.5 14q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59Zm140-240v-440l120-40v440l-120 40Zm-340-99Z" />
                        </svg>
                        <span>WLPI-CWR</span>
                      </a>
                    </li>
                    <li>
                      <a href="/activity-log/cfii-cwr" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors opacity-50 cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                          <path d="M440-278v-394q-41-24-87-36t-93-12q-36 0-71.5 7T120-692v396q35-12 69.5-18t70.5-6q47 0 91.5 10.5T440-278Zm40 118q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q74 0 126 17t112 52q11 6 16.5 14t5.5 21v418q44-21 88.5-31.5T700-320q36 0 70.5 6t69.5 18v-481q15 5 29.5 11t28.5 14q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59Zm140-240v-440l120-40v440l-120 40Zm-340-99Z" />
                        </svg>
                        <span>CFII-CWR</span>
                      </a>
                    </li>
                  </div>
                </ul>
              </li>

            </>
          )}

          {isWorker && (
            <>
              <li className={isActive("/transactions") ? "active" : ""}>
                <Link to="/transactions" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor" className="flex-shrink-0">
                    {isActive("/transactions") ? (
                      <path d="M14 2H6c-1.1 0-1.99.89-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.89 2-2V6l-6-4zm0 2.5L18.5 6H14V4.5zM6 20V4h8v4h4v12H6z" />
                    ) : (
                      <path d="M14 2H6c-1.1 0-1.99.89-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.89 2-2V6l-6-4zm0 2.5L18.5 6H14V4.5zM6 20V4h8v4h4v12H6z" />
                    )}
                  </svg>
                  <span>Transactions</span>
                </Link>
              </li>


            </>
          )}
          <li className={isActive("/profile") ? "active" : ""}>
            <Link to="/profile" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                {isActive("/profile") ? (
                  <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z" />
                ) : (
                  <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-240v-32q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v32q0 33-23.5 56.5T720-160H240q-33 0-56.5-23.5T160-240Zm80 0h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
                )}
              </svg>
              <span>Profile</span>
            </Link>
          </li>
          <li>
            <a
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full text-left bg-transparent border-none cursor-pointer flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
              </svg>
              <span>Logout</span>
            </a>
          </li>

          {isApproverOrDeputy && (
            <>
              <li className={`mobile-more-menu ${mobileMoreOpen ? 'active' : ''}`}>
                <button
                  onClick={toggleMobileMore}
                  className={`dropdown-btn more-btn w-full text-left bg-transparent border-none cursor-pointer flex items-center gap-4 p-3.5 rounded-lg text-gray-900 transition-colors ${mobileMoreOpen ? 'rotate' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                    <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" />
                  </svg>
                  <span>More</span>
                </button>
                <ul className={`mobile-more-submenu ${mobileMoreOpen ? 'show' : ''}`}>
                  <div className="overflow-hidden">
                    <li>
                      <Link to="/bank-workload" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                          <path d="M200-280v-280h80v280h-80Zm240 0v-280h80v280h-80ZM80-640v-80l400-200 400 200v80H80Zm179-80h442L480-830 259-720ZM80-120v-80h482q2 21 5 40.5t9 39.5H80Zm600-310v-130h80v90l-80 40ZM800 0q-69-17-114.5-79.5T640-218v-102l160-80 160 80v102q0 76-45.5 138.5T800 0Zm-29-120 139-138-42-42-97 95-39-39-42 43 81 81ZM259-720h442-442Z" />
                        </svg>
                        <span>Bank Workload</span>
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={toggleActivityLog}
                        className={`dropdown-btn w-full text-left bg-transparent border-none cursor-pointer flex items-center gap-4 p-3.5 rounded-lg text-gray-900 transition-colors ${activityLogOpen ? 'rotate' : ''}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                          <path d="m221-313 142-142q12-12 28-11.5t28 12.5q11 12 11 28t-11 28L250-228q-12 12-28 12t-28-12l-86-86q-11-11-11-28t11-28q11-11 28-11t28 11l57 57Zm0-320 142-142q12-12 28-11.5t28 12.5q11 12 11 28t-11 28L250-548q-12 12-28 12t-28-12l-86-86q-11-11-11-28t11-28q11-11 28-11t28 11l57 57Zm339 353q-17 0-28.5-11.5T520-320q0-17 11.5-28.5T560-360h280q17 0 28.5 11.5T880-320q0 17-11.5 28.5T840-280H560Zm0-320q-17 0-28.5-11.5T520-640q0-17 11.5-28.5T560-680h280q17 0 28.5 11.5T880-640q0 17-11.5 28.5T840-600H560Z" />
                        </svg>
                        <span>Activity Log</span>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="transition-transform duration-200">
                          <path d="M480-361q-8 0-15-2.5t-13-8.5L268-556q-11-11-11-28t11-28q11-11 28-11t28 11l156 156 156-156q11-11 28-11t28 11q11 11 11 28t-11 28L508-372q-6 6-13 8.5t-15 2.5Z" />
                        </svg>
                      </button>
                      <ul className={`sub-menu ${activityLogOpen ? 'show' : ''}`}>
                        <div className="overflow-hidden">
                          <li>
                            <Link to="/activity-log/wpsi-cwr" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors opacity-50 cursor-not-allowed">
                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                                <path d="M440-278v-394q-41-24-87-36t-93-12q-36 0-71.5 7T120-692v396q35-12 69.5-18t70.5-6q47 0 91.5 10.5T440-278Zm40 118q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q74 0 126 17t112 52q11 6 16.5 14t5.5 21v418q44-21 88.5-31.5T700-320q36 0 70.5 6t69.5 18v-481q15 5 29.5 11t28.5 14q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59Zm140-240v-440l120-40v440l-120 40Zm-340-99Z" />
                              </svg>
                              <span>WPSI-CWR</span>
                            </Link>
                          </li>
                          <li>
                            <Link to="/activity-log/wmsi-cwr" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors opacity-50 cursor-not-allowed">
                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                                <path d="M440-278v-394q-41-24-87-36t-93-12q-36 0-71.5 7T120-692v396q35-12 69.5-18t70.5-6q47 0 91.5 10.5T440-278Zm40 118q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q74 0 126 17t112 52q11 6 16.5 14t5.5 21v418q44-21 88.5-31.5T700-320q36 0 70.5 6t69.5 18v-481q15 5 29.5 11t28.5 14q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59Zm140-240v-440l120-40v440l-120 40Zm-340-99Z" />
                              </svg>
                              <span>WMSI-CWR</span>
                            </Link>
                          </li>
                          <li>
                            <Link to="/activity-log/wlpi-cwr" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors opacity-50 cursor-not-allowed">
                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                                <path d="M440-278v-394q-41-24-87-36t-93-12q-36 0-71.5 7T120-692v396q35-12 69.5-18t70.5-6q47 0 91.5 10.5T440-278Zm40 118q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q74 0 126 17t112 52q11 6 16.5 14t5.5 21v418q44-21 88.5-31.5T700-320q36 0 70.5 6t69.5 18v-481q15 5 29.5 11t28.5 14q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59Zm140-240v-440l120-40v440l-120 40Zm-340-99Z" />
                              </svg>
                              <span>WLPI-CWR</span>
                            </Link>
                          </li>
                          <li>
                            <Link to="/activity-log/cfii-cwr" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors opacity-50 cursor-not-allowed">
                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                                <path d="M440-278v-394q-41-24-87-36t-93-12q-36 0-71.5 7T120-692v396q35-12 69.5-18t70.5-6q47 0 91.5 10.5T440-278Zm40 118q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q74 0 126 17t112 52q11 6 16.5 14t5.5 21v418q44-21 88.5-31.5T700-320q36 0 70.5 6t69.5 18v-481q15 5 29.5 11t28.5 14q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59Zm140-240v-440l120-40v440l-120 40Zm-340-99Z" />
                              </svg>
                              <span>CFII-CWR</span>
                            </Link>
                          </li>
                        </div>
                      </ul>
                    </li>
                    <li>
                      <Link to="/profile" className="flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                          <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-240v-32q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v32q0 33-23.5 56.5T720-160H240q-33 0-56.5-23.5T160-240Zm80 0h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
                        </svg>
                        <span>Profile</span>
                      </Link>
                    </li>
                    <li>
                      <a
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="w-full text-left bg-transparent border-none cursor-pointer flex items-center gap-4 p-3.5 rounded-lg text-gray-900 no-underline transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="flex-shrink-0">
                          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
                        </svg>
                        <span>Logout</span>
                      </a>
                    </li>
                  </div>
                </ul>
              </li>

            </>
          )}

        </ul>
      </nav>
      <LogoutModal isOpen={isLogoutModalOpen} onConfirm={handleLogout} onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;