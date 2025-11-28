// src/middleware/authMiddleware.js
import * as jwt from 'jose';

export async function validateToken(req) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Token no proporcionado');
        }
        
        const token = authHeader.substring(7); // Remover "Bearer "
        
        if (!token) {
            throw new Error('Token vacío');
        }
        
        // Verificar el JWT personalizado
        const { payload } = await jwt.jwtVerify(
            token, 
            new TextEncoder().encode(process.env.NEXT_PUBLIC_USER_JWT)
        );
        
        return {
            success: true,
            user: payload
        };
        
    } catch (error) {
        console.error('Error validando token:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

export async function requireAuth(req, res, requiredRole = null) {
    const validation = await validateToken(req);
    
    if (!validation.success) {
        return res.status(401).json({
            success: false,
            message: 'No autorizado: ' + validation.error
        });
    }
    
    if (requiredRole && validation.user.role !== requiredRole) {
        return res.status(403).json({
            success: false,
            message: 'No tiene permisos para realizar esta acción'
        });
    }
    
    return validation.user;
}

// Middleware para páginas que acepta métodos HTTP específicos
export function MiddlewarePagina(metodosPermitidos, handler) {
    return async (req, res) => {
        // Verificar si el método HTTP está permitido
        if (!metodosPermitidos.includes(req.method)) {
            return res.status(405).json({
                success: false,
                message: 'Método no permitido'
            });
        }

        try {
            // Ejecutar el handler
            return await handler(req, res);
        } catch (error) {
            console.error('Error en middleware de página:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };
}

// Middleware para usuarios logueados
export function MiddlewareUsuarioLogeado(handler) {
    return async (req, res) => {
        try {
            // Validar token de autenticación
            const user = await requireAuth(req, res);
            if (!user) {
                // requireAuth ya envió la respuesta de error
                return;
            }

            // Agregar usuario a la request
            req.user = user;

            // Ejecutar el handler
            return await handler(req, res);
        } catch (error) {
            console.error('Error en middleware de usuario logueado:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };
}