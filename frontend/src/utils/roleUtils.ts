export const ROLES = {
    DAM_WPSI: 'DAM WPSI',
    DAM_WMSI: 'DAM WMSI',
    DAM_WLPI: 'DAM WLPI',
    DAM_CFII: 'DAM CFII',
    APPROVER: 'Approver',
    DEPUTY: 'Deputy',
    MKR: 'Maker'
} as const;

export const DAM_COMPANY_TABS = [
    { role: ROLES.DAM_WPSI, path: '/wpsi', label: 'WPSI' },
    { role: ROLES.DAM_WMSI, path: '/wmsi', label: 'WMSI' },
    { role: ROLES.DAM_WLPI, path: '/wlpi', label: 'WLPI' },
    { role: ROLES.DAM_CFII, path: '/cfii', label: 'CFII' }
] as const;

export const parseStoredRoles = (storedRole: string | null): string[] => {
    if (!storedRole) {
        return [];
    }

    const normalizedRole = storedRole.trim();
    if (!normalizedRole) {
        return [];
    }

    // Support JSON arrays, e.g. ["DAM WPSI", "DAM WMSI"]
    if (normalizedRole.startsWith('[')) {
        try {
            const parsed = JSON.parse(normalizedRole);
            if (Array.isArray(parsed)) {
                return parsed
                    .map((role) => String(role).trim())
                    .filter(Boolean);
            }
        } catch {
            // Fallback to delimiter parsing below.
        }
    }

    // Support comma/pipe/semicolon-delimited values from backend payloads.
    return normalizedRole
        .split(/[|,;]/)
        .map((role) => role.trim())
        .filter(Boolean);
};

export const isApproverOrDeputy = (roles: string[]): boolean => {
    return roles.includes(ROLES.APPROVER) || roles.includes(ROLES.DEPUTY);
};

export const getDamTabsForRoles = (roles: string[]) => {
    return DAM_COMPANY_TABS.filter((tab) => roles.includes(tab.role));
};