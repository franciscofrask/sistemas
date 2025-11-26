// src/components/ProtectedRoute.js
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { usePermisos } from '@/hooks/usePermisos';

export function ProtectedRoute({ children, requiredSystem }) {
    const { data: session, status } = useSession();
    const { puedeAcceder, loading } = usePermisos();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/autenticacion/ingresar');
        }
        
        if (!loading && requiredSystem && !puedeAcceder(requiredSystem)) {
            router.push('/acceso-denegado');
        }
    }, [status, loading, requiredSystem, puedeAcceder, router]);

    if (status === 'loading' || loading) {
        return <div>Cargando...</div>;
    }

    if (status === 'unauthenticated') {
        return null;
    }

    if (requiredSystem && !puedeAcceder(requiredSystem)) {
        return null;
    }

    return children;
}