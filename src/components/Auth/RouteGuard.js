// src/components/Auth/RouteGuard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { Center, Loader, Stack, Text, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

const RouteGuard = ({ children }) => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Función para verificar autorización
        const authCheck = async () => {
            setLoading(true);
            setError(null);

            // Si está cargando la sesión, esperar
            if (status === 'loading') {
                return;
            }

            // Si no está autenticado, redirigir al login
            if (status === 'unauthenticated') {
                setAuthorized(false);
                router.push('/autenticacion/ingresar');
                return;
            }

            // Si no hay token en la sesión, no autorizar
            if (!session?.user?.token) {
                setAuthorized(false);
                setError('Sesión inválida. Inicie sesión nuevamente.');
                setTimeout(() => {
                    router.push('/autenticacion/ingresar');
                }, 2000);
                return;
            }

            // Rutas que no necesitan verificación de permisos (públicas dentro del sistema)
            const publicSystemRoutes = [
                '/',
                '/stock/inventario', // Ruta por defecto para todos
            ];

            if (publicSystemRoutes.includes(router.asPath)) {
                setAuthorized(true);
                setLoading(false);
                return;
            }

            try {
                // Verificar permisos para la ruta actual
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

                if (!response.ok) {
                    // Manejo específico para token inválido
                    if (response.status === 401 || (data.message && data.message.includes('Token inválido'))) {
                        console.error('Token inválido, redirigiendo al login');
                        setError('Su sesión ha expirado. Será redirigido al login.');
                        setTimeout(() => {
                            signOut({ callbackUrl: '/autenticacion/ingresar' });
                        }, 2000);
                        return;
                    }
                    throw new Error(data.message || 'Error verificando permisos');
                }

                if (data.success && data.tiene_permiso) {
                    setAuthorized(true);
                } else {
                    setAuthorized(false);
                    
                    // Obtener la primera ruta permitida para redireccionar
                    try {
                        const redirectResponse = await fetch('/api/permisos/primera-ruta', {
                            headers: {
                                'Authorization': `Bearer ${session.user.token}`
                            }
                        });

                        const redirectData = await redirectResponse.json();

                        if (!redirectResponse.ok) {
                            // Manejo específico para token inválido en primera-ruta
                            if (redirectResponse.status === 401 || (redirectData.message && redirectData.message.includes('Token inválido'))) {
                                console.error('Token inválido en primera-ruta, redirigiendo al login');
                                setError('Su sesión ha expirado. Será redirigido al login.');
                                setTimeout(() => {
                                    signOut({ callbackUrl: '/autenticacion/ingresar' });
                                }, 2000);
                                return;
                            }
                        }

                        if (redirectData.success && redirectData.ruta) {
                            setError(`No tiene permisos para acceder a esta página. Será redirigido a ${redirectData.funcionalidad}.`);
                            setTimeout(() => {
                                router.push(redirectData.ruta);
                            }, 3000);
                        } else {
                            setError('No tiene permisos para acceder a esta página.');
                            setTimeout(() => {
                                router.push('/stock/inventario');
                            }, 3000);
                        }
                    } catch (redirectError) {
                        console.error('Error obteniendo ruta de redirección:', redirectError);
                        setError('No tiene permisos para acceder a esta página.');
                        setTimeout(() => {
                            router.push('/stock/inventario');
                        }, 3000);
                    }
                }

            } catch (error) {
                console.error('Error verificando autorización:', error);
                
                // Manejo específico para errores de token inválido
                if (error.message && error.message.includes('Token inválido')) {
                    setError('Su sesión ha expirado. Será redirigido al login.');
                    setTimeout(() => {
                        signOut({ callbackUrl: '/autenticacion/ingresar' });
                    }, 2000);
                } else {
                    setError('Error verificando permisos. Intente nuevamente.');
                }
                setAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        authCheck();
    }, [router.asPath, router, session, status]);

    // Mostrar loading mientras verifica
    if (loading) {
        return (
            <Center style={{ height: '100vh' }}>
                <Stack align="center" spacing="md">
                    <Loader size="xl" />
                    <Text size="lg">Verificando permisos...</Text>
                    <Text size="sm" c="dimmed">
                        Comprobando acceso a {router.pathname}
                    </Text>
                </Stack>
            </Center>
        );
    }

    // Mostrar error si no está autorizado
    if (!authorized) {
        return (
            <Center style={{ height: '100vh' }}>
                <Stack align="center" spacing="md" style={{ maxWidth: 400 }}>
                    <Alert 
                        icon={<IconAlertCircle size={16} />} 
                        title="Acceso Denegado" 
                        color="red"
                        variant="filled"
                    >
                        {error || 'No tiene permisos para acceder a esta página.'}
                    </Alert>
                    <Loader size="sm" />
                    <Text size="sm" c="dimmed" ta="center">
                        Redirigiendo a una página autorizada...
                    </Text>
                </Stack>
            </Center>
        );
    }

    // Si está autorizado, mostrar el contenido
    return children;
};

export default RouteGuard;