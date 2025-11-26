// src/hooks/usePermisos.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function usePermisos() {
    const [permisos, setPermisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.usuario?.token) {
            obtenerPermisos();
        }
    }, [session]);

    const obtenerPermisos = async () => {
        try {
            const response = await fetch('/api/usuarios/permisos', {
                headers: {
                    'Authorization': `Bearer ${session.usuario.token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                setPermisos(data.data);
            }
        } catch (error) {
            console.error('Error obteniendo permisos:', error);
        } finally {
            setLoading(false);
        }
    };

    const puedeAcceder = (sistemaRuta) => {
        const permiso = permisos.find(p => p.ruta === sistemaRuta);
        return permiso?.puede_acceder === 1;
    };

    return { permisos, loading, puedeAcceder };
}