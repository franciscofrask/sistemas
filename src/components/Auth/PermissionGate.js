// src/components/Auth/PermissionGate.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const PermissionGate = ({ 
    route, 
    role, 
    fallback = null, 
    children, 
    require = 'any' // 'any' | 'all'
}) => {
    const { data: session } = useSession();
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkPermissions = async () => {
            if (!session?.user?.token) {
                setHasAccess(false);
                setLoading(false);
                return;
            }

            try {
                let routePermission = true;
                let rolePermission = true;

                // Verificar permiso de ruta si se especifica
                if (route) {
                    const response = await fetch('/api/permisos/verificar-ruta', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.user.token}`
                        },
                        body: JSON.stringify({ ruta: route })
                    });

                    const data = await response.json();
                    routePermission = data.success && data.tiene_permiso;
                }

                // Verificar rol si se especifica
                if (role) {
                    const userRole = session.user.rol;
                    if (Array.isArray(role)) {
                        rolePermission = role.includes(userRole);
                    } else {
                        rolePermission = userRole === role;
                    }
                }

                // Determinar acceso basado en el criterio require
                let access = false;
                if (require === 'all') {
                    access = routePermission && rolePermission;
                } else { // 'any'
                    access = routePermission || rolePermission;
                }

                setHasAccess(access);
            } catch (error) {
                console.error('Error verificando permisos:', error);
                setHasAccess(false);
            } finally {
                setLoading(false);
            }
        };

        checkPermissions();
    }, [route, role, require, session]);

    if (loading) {
        return null; // O un skeleton loader si prefieres
    }

    if (!hasAccess) {
        return fallback;
    }

    return children;
};

// Componentes específicos para casos comunes
export const AdminOnly = ({ children, fallback = null }) => (
    <PermissionGate role="admin" fallback={fallback}>
        {children}
    </PermissionGate>
);

export const ManagerOrAdmin = ({ children, fallback = null }) => (
    <PermissionGate role={['admin', 'manager']} fallback={fallback}>
        {children}
    </PermissionGate>
);

export const DashboardAccess = ({ children, fallback = null }) => (
    <PermissionGate route="/stock/dashboard" fallback={fallback}>
        {children}
    </PermissionGate>
);

export default PermissionGate;