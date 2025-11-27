// src/hooks/usePermissions.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const usePermissions = () => {
    const { data: session } = useSession();
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPermissions = async () => {
            if (!session?.user?.token) {
                setPermissions([]);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/permisos/primera-ruta', {
                    headers: {
                        'Authorization': `Bearer ${session.user.token}`
                    }
                });

                if (response.ok) {
                    // Si necesitamos más funcionalidades, podemos crear una API específica
                    // Por ahora, simplemente marcamos como cargado
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error cargando permisos:', error);
                setLoading(false);
            }
        };

        loadPermissions();
    }, [session]);

    const hasPermission = async (ruta) => {
        if (!session?.user?.token) return false;

        try {
            const response = await fetch('/api/permisos/verificar-ruta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.token}`
                },
                body: JSON.stringify({ ruta })
            });

            const data = await response.json();
            return data.success && data.tiene_permiso;
        } catch (error) {
            console.error('Error verificando permiso:', error);
            return false;
        }
    };

    const hasRole = (roleName) => {
        return session?.user?.rol === roleName;
    };

    const canAccess = {
        dashboard: () => hasPermission('/stock/dashboard'),
        admin: () => hasPermission('/admin'),
        ventas: () => hasPermission('/stock/ventas'),
        inventario: () => hasPermission('/stock/inventario'),
        clientes: () => hasPermission('/stock/clientes'),
        proveedores: () => hasPermission('/stock/proveedores'),
        almacenes: () => hasPermission('/stock/almacenes'),
        presupuestos: () => hasPermission('/stock/presupuestos')
    };

    return {
        loading,
        hasPermission,
        hasRole,
        canAccess,
        userRole: session?.user?.rol,
        userName: session?.user?.nombre
    };
};

export default usePermissions;