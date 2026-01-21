import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import WPSI from './pages/WPSI'
import WMSI from './pages/WMSI'
import WLPI from './pages/WLPI'
import CFII from './pages/CFII'
import BankWorkload from './pages/BankWorkload'
import NotFound from './pages/NotFound'
import WPSICWR from './pages/WPSI-CWR'
import WMSICWR from './pages/WMSI-CWR'
import WLPICWR from './pages/WLPI-CWR'
import CFIICWR from './pages/CFII-CWR'
import TransactionTable from './pages/Transactions'
import ArchivesTable from './pages/Archives'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const location = useLocation()
  const dashboardRoutes = ['/dashboard', '/profile', '/wpsi', '/wmsi', '/wlpi',
    '/cfii', '/bank-workload', '/activity-log/wpsi-cwr', '/activity-log/wmsi-cwr', '/activity-log/wlpi-cwr',
    '/activity-log/cfii-cwr', '/transactions', '/archives']
  const isDashboardLayout = dashboardRoutes.includes(location.pathname)

  return (
    <div className={isDashboardLayout ? 'dashboard-layout' : ''}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/wpsi" element={<ProtectedRoute><WPSI /></ProtectedRoute>} />
        <Route path="/wmsi" element={<ProtectedRoute><WMSI /></ProtectedRoute>} />
        <Route path="/wlpi" element={<ProtectedRoute><WLPI /></ProtectedRoute>} />
        <Route path="/cfii" element={<ProtectedRoute><CFII /></ProtectedRoute>} />
        <Route path="/bank-workload" element={<ProtectedRoute><BankWorkload /></ProtectedRoute>} />
        <Route path="/activity-log/wpsi-cwr" element={<ProtectedRoute><WPSICWR /></ProtectedRoute>} />
        <Route path="/activity-log/wmsi-cwr" element={<ProtectedRoute><WMSICWR /></ProtectedRoute>} />
        <Route path="/activity-log/wlpi-cwr" element={<ProtectedRoute><WLPICWR /></ProtectedRoute>} />
        <Route path="/activity-log/cfii-cwr" element={<ProtectedRoute><CFIICWR /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><TransactionTable /></ProtectedRoute>} />
        <Route path="/archives" element={<ProtectedRoute><ArchivesTable /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer />
    </div>
  )
}

export default App
