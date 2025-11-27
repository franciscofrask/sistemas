// src/middleware/routeProtection.js
import { validateToken } from "@/middleware/authMiddleware";
import { service_VerificarPermisoRuta } from "@/services/permisos";

export async function protegerRuta(req, res, next) {
    try {
        // Validar token
        const tokenValidation = await validateToken(req);
        
        if (!tokenValidation.success) {
            return res.status(401).json({
                success: false,
                message: 'Acceso no autorizado',
                redirect: '/autenticacion/ingresar'
            });
        }
        
        // Obtener la ruta actual
        const ruta = req.url || req.nextUrl?.pathname;
        
        if (!ruta) {
            return res.status(400).json({
                success: false,
                message: 'Ruta no válida'
            });
        }
        
        // Verificar permisos para la ruta
        const permisoResult = await service_VerificarPermisoRuta(tokenValidation.user.id, ruta);
        
        if (!permisoResult.tiene_permiso) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado: ${permisoResult.motivo}`,
                funcionalidad: permisoResult.funcionalidad,
                redirect: '/stock/dashboard'
            });
        }
        
        // Si llegamos aquí, el usuario tiene permisos
        req.usuario = tokenValidation.user;
        req.permisos = permisoResult;
        
        if (next) {
            return next();
        }
        
        return true;
        
    } catch (error) {
        console.error('Error en protección de ruta:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

export function crearMiddlewareProteccion() {
    return async (req, res, next) => {
        return await protegerRuta(req, res, next);
    };
}