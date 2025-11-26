// Middleware global para manejo de errores en APIs
export function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('Error en API:', error);
      
      // Determinar el status code apropiado
      let statusCode = 500;
      let message = 'Error interno del servidor';
      
      if (error.message) {
        // Si el error tiene un mensaje específico, usarlo
        message = error.message;
        
        // Detectar errores específicos por el mensaje
        if (error.message.includes('not found') || error.message.includes('no encontrado')) {
          statusCode = 404;
        } else if (error.message.includes('unauthorized') || error.message.includes('no autorizado')) {
          statusCode = 401;
        } else if (error.message.includes('forbidden') || error.message.includes('prohibido')) {
          statusCode = 403;
        } else if (error.message.includes('validation') || error.message.includes('validación')) {
          statusCode = 400;
        }
      }
      
      // Si ya se envió una respuesta, no enviar otra
      if (res.headersSent) {
        return;
      }
      
      res.status(statusCode).json({
        success: false,
        mensaje: message,
        ...(process.env.NODE_ENV === 'development' && { 
          stack: error.stack,
          error: error.toString() 
        })
      });
    }
  };
}

// Validador de métodos HTTP
export function validateMethod(allowedMethods) {
  return (req, res, next) => {
    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json({
        success: false,
        mensaje: `Método ${req.method} no permitido. Métodos válidos: ${allowedMethods.join(', ')}`
      });
    }
    next();
  };
}

// Validador de parámetros requeridos
export function validateRequiredFields(fields) {
  return (req, res, next) => {
    const missingFields = [];
    
    for (const field of fields) {
      if (!req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        mensaje: `Campos requeridos faltantes: ${missingFields.join(', ')}`
      });
    }
    
    next();
  };
}