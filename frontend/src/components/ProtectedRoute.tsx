import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ROLES, parseStoredRoles } from '../utils/roleUtils';

interface ProtectedRouteProps {
    children: ReactNode;
}

// 2. Configuration: Define which paths each role is allowed to visit.
const ROLE_PERMISSIONS: Record<string, string[]> = {
    [ROLES.DAM_WPSI]: ['/wpsi', '/dashboard', '/profile'],
    [ROLES.DAM_WMSI]: ['/wmsi', '/dashboard', '/profile'],
    [ROLES.DAM_WLPI]: ['/wlpi', '/dashboard', '/profile'],
    [ROLES.DAM_CFII]: ['/cfii', '/dashboard', '/profile'],
    
    [ROLES.WORKER]: ['/dashboard', '/profile', '/transactions', '/archives', '/add-transaction', '/edit-transaction', '/corp-inventory', '/rfp-monitoring', '/add-rfp', '/edit-rfp'], 

    [ROLES.APPROVER]: [
        '/dashboard', 
        '/bank-workload', 
        '/activity-log', // Covers all sub-routes like /activity-log/wpsi-cwr
        '/wpsi', '/wmsi', '/wlpi', '/cfii', '/profile' // Assuming they can view company pages too
    ],
    [ROLES.DEPUTY]: [
        '/dashboard', 
        '/bank-workload', 
        '/activity-log',
        '/wpsi', '/wmsi', '/wlpi', '/cfii', '/profile'

    ],
};

// 3. Configuration: Define where a role should be redirected if they hit a forbidden page
const DEFAULT_REDIRECTS: Record<string, string> = {
    [ROLES.DAM_WPSI]: '/dashboard',
    [ROLES.DAM_WMSI]: '/dashboard',
    [ROLES.DAM_WLPI]: '/dashboard',
    [ROLES.DAM_CFII]: '/dashboard',
    [ROLES.WORKER]: '/dashboard',
    [ROLES.APPROVER]: '/dashboard',
    [ROLES.DEPUTY]: '/dashboard',
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const authToken = localStorage.getItem('authToken');
    const storedRole = localStorage.getItem('userRole');
    const userRoles = parseStoredRoles(storedRole);
    const location = useLocation();

    // 1. Authentication Check
    if (!authToken) {
        return <Navigate to="/login" replace state={{ message: 'Please login first to access this page' }} />;
    }

    // 2. Identify User Permissions
    const allowedRoutes = [...new Set(userRoles.flatMap((role) => ROLE_PERMISSIONS[role] || []))];
    const defaultRedirect = userRoles
        .map((role) => DEFAULT_REDIRECTS[role])
        .find(Boolean) || '/login';

    // 3. Check Authorization
    // We check if the current pathname starts with any of the allowed paths
    // This allows sub-routing (e.g., access to '/wpsi' grants access to '/wpsi/edit/1')
    const isAllowed = allowedRoutes.some((route) => (
        location.pathname === route || location.pathname.startsWith(`${route}/`)
    ));

    if (!isAllowed) {
        console.warn(`Access Denied: Roles "${storedRole || ''}" attempted to access "${location.pathname}". Redirecting to "${defaultRedirect}".`);
        
        return <Navigate 
            to={defaultRedirect} 
            replace 
            state={{ message: 'Access denied: You do not have permission to view this page' }} 
        />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;