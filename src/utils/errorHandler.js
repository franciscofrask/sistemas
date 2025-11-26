// Sistema de manejo de errores simplificado

// Función para obtener mensajes amigables según el status code
const getErrorMessage = (status) => {
    switch (status) {
        case 404:
            return 'El recurso solicitado no se encuentra disponible.';
        case 500:
            return 'El servicio no está disponible en este momento. Por favor, intente más tarde.';
        case 503:
            return 'El servidor está temporalmente fuera de servicio. Intente nuevamente en unos minutos.';
        case 401:
            return 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
        case 403:
            return 'No tiene permisos para realizar esta acción.';
        default:
            return 'El servicio presenta dificultades técnicas. Intente más tarde.';
    }
};

// Utilidad para manejo de errores de API
export const handleApiResponse = async (response) => {
    // Si la respuesta no es OK, devolver un objeto de error en lugar de lanzar excepción
    if (!response.ok) {
        console.warn(`API Error ${response.status}:`, response.url);
        
        // Intentar leer el error como JSON
        try {
            const errorData = await response.json();
            return {
                success: false,
                error: true,
                message: errorData.message || errorData.mensaje || getErrorMessage(response.status),
                status: response.status
            };
        } catch (jsonError) {
            // Si no es JSON válido, devolver error genérico
            return {
                success: false,
                error: true,
                message: getErrorMessage(response.status),
                status: response.status
            };
        }
    }

    // Intentar parsear la respuesta como JSON
    try {
        const data = await response.json();
        return { success: true, ...data };
    } catch (parseError) {
        console.warn('Respuesta no es JSON válido');
        return { success: true, data: [] };
    }
};

// Utilidad para llamadas API que nunca rompen la aplicación
export const apiCall = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const result = await handleApiResponse(response);
        
        // Si hay error, mostrar notificación
        if (result.error) {
            showErrorNotification(result.message);
            return { 
                success: false, 
                data: [], 
                message: result.message
            };
        }
        
        return result;
    } catch (error) {
        console.warn(`Error en API call (${url}):`, error.message);
        
        const friendlyMessage = 'No se pudo conectar con el servidor. Verifique su conexión.';
        showErrorNotification(friendlyMessage);
        
        return { 
            success: false, 
            data: [], 
            message: friendlyMessage,
            isNetworkError: true
        };
    }
};

// Utilidad para mostrar notificaciones de error de forma segura
export const showErrorNotification = (message, title = 'Aviso del Sistema') => {
    // Mensaje por defecto si no se proporciona uno
    const finalMessage = message || 'El servicio presenta dificultades técnicas en este momento.';
    
    try {
        // Intentar usar Mantine notifications
        if (typeof window !== 'undefined') {
            import('@mantine/notifications').then(({ notifications }) => {
                // Limpiar notificaciones anteriores y mostrar nueva
                notifications.clean();
                
                notifications.show({
                    title,
                    message: finalMessage,
                    color: 'orange',
                    autoClose: 5000,
                    withCloseButton: true,
                    styles: {
                        root: {
                            borderLeft: '4px solid #fd7e14',
                        },
                    },
                });
            }).catch(() => {
                // Fallback: log en consola
                console.info(`${title}: ${finalMessage}`);
            });
        }
    } catch (error) {
        // Fallback silencioso
        console.info(`Sistema: ${finalMessage}`);
    }
};

// Utilidad para mostrar notificaciones de éxito
export const showSuccessNotification = (message, title = 'Éxito') => {
    try {
        if (typeof window !== 'undefined') {
            import('@mantine/notifications').then(({ notifications }) => {
                notifications.show({
                    title,
                    message,
                    color: 'green',
                    autoClose: 4000,
                    withCloseButton: true,
                    styles: {
                        root: {
                            borderLeft: '4px solid #51cf66',
                        },
                    },
                });
            }).catch(() => {
                console.info(`${title}: ${message}`);
            });
        }
    } catch (error) {
        console.info(`${title}: ${message}`);
    }
};

// Hook React para manejo seguro de operaciones asíncronas
export const useSafeAsync = () => {
    const executeAsync = async (asyncOperation) => {
        try {
            return await asyncOperation();
        } catch (error) {
            console.warn('Error en operación asíncrona:', error.message);
            showErrorNotification('Ocurrió un error inesperado. Intente nuevamente.');
            return { success: false, error: true, message: error.message };
        }
    };

    return { executeAsync };
};