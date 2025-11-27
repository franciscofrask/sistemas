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
        
        console.log('Payload del token:', payload);
        
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