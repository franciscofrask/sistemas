import { useEffect } from 'react';
import { showErrorNotification } from '@/utils/errorHandler';

// Hook para manejo global de errores
export const useErrorHandler = () => {
  useEffect(() => {
    // Manejar errores no capturados de JavaScript
    const handleError = (event) => {
      console.error('Error no capturado:', event.error);
      showErrorNotification(
        'Ha ocurrido un error inesperado. La página se recargará automáticamente.',
        'Error de aplicación'
      );
      
      // Recargar después de 3 segundos
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    };

    // Manejar promesas rechazadas no capturadas
    const handleUnhandledRejection = (event) => {
      console.error('Promesa rechazada no capturada:', event.reason);
      showErrorNotification(
        'Error de conexión con el servidor. Por favor, intente nuevamente.',
        'Error de servicio'
      );
      
      // Prevenir que aparezca en consola
      event.preventDefault();
    };

    // Agregar listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
};

// Hook para manejo de errores específicos de componentes (sin lanzar excepciones)
export const useSafeAsync = () => {
  const executeAsync = async (asyncFunction, customErrorMessage = null) => {
    try {
      const result = await asyncFunction();
      
      // Si el resultado tiene error (del nuevo sistema), manejar silenciosamente
      if (result && result.success === false) {
        // Solo mostrar notificación si tiene la bandera y no hay mensaje personalizado previo
        if (result.shouldNotify && customErrorMessage) {
          showErrorNotification(customErrorMessage);
        } else if (result.shouldNotify && !customErrorMessage) {
          showErrorNotification(result.message);
        }
        
        // Devolver datos seguros
        return result.data || [];
      }
      
      return result;
    } catch (error) {
      // Capturar cualquier error residual y manejarlo silenciosamente
      console.warn('Error capturado en useSafeAsync:', error.message);
      
      // Mostrar mensaje personalizado solo si se proporciona
      if (customErrorMessage) {
        showErrorNotification(customErrorMessage);
      }
      
      // Devolver datos seguros en lugar de romper
      return [];
    }
  };

  return { executeAsync };
};