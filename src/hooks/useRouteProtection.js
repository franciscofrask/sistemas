// src/hooks/useRouteProtection.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export function useRouteProtection() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isChecking, setIsChecking] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        const verificarPermiso = async () => {
            if (status === 'loading') return;
            
            if (status === 'unauthenticated') {
                router.push('/autenticacion/ingresar');
                return;
            }

            if (!session?.user?.token) {
                setIsChecking(false);
                setHasPermission(false);
                return;
            }

            try {
                setIsChecking(true);
                
                const response = await fetch('/api/permisos/verificar-ruta', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.token}`
                    },
                    body: JSON.stringify({
                        ruta: router.asPath
                    })
                });

                const data = await response.json();

                if (data.success && data.tiene_permiso) {
                    setHasPermission(true);
                } else {
                    console.warn('Acceso denegado:', data.motivo);
                    setHasPermission(false);
                    
                    // Obtener una ruta permitida para redireccionar
                    try {
                        const rutaResponse = await fetch('/api/permisos/primera-ruta', {
                            headers: {
                                'Authorization': `Bearer ${session.user.token}`
                            }
                        });
                        
                        const rutaData = await rutaResponse.json();
                        
                        if (rutaData.success && rutaData.ruta) {
                            router.push(rutaData.ruta);
                        } else {
                            router.push('/stock/inventario'); // Fallback
                        }
                    } catch (error) {
                        console.error('Error obteniendo ruta permitida:', error);
                        router.push('/stock/inventario');
                    }
                }
            } catch (error) {
                console.error('Error verificando permisos:', error);
                setHasPermission(false);
                router.push('/stock/inventario');
            } finally {
                setIsChecking(false);
            }
        };

        verificarPermiso();
    }, [router.asPath, session, status]);

    return { isChecking, hasPermission };
}

export function ProtectedRoute({ children }) {
    const { isChecking, hasPermission } = useRouteProtection();

    if (isChecking) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <div>Verificando permisos...</div>
            </div>
        );
    }

    if (!hasPermission) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <div>Redirigiendo...</div>
            </div>
        );
    }

    return children;
}