// src/pages/api/permisos/verificar-ruta.js
import { validateToken } from "@/middleware/authMiddleware";
import { service_VerificarPermisoRuta } from "@/services/permisos";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Método no permitido'
        });
    }
    
    try {
        // Validar token
        const tokenValidation = await validateToken(req);
        
        if (!tokenValidation.success) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido',
                tiene_permiso: false
            });
        }
        
        const { ruta } = req.body;
        
        if (!ruta) {
            return res.status(400).json({
                success: false,
                message: 'Ruta es requerida',
                tiene_permiso: false
            });
        }
        
        // Verificar permisos
        const resultado = await service_VerificarPermisoRuta(tokenValidation.user.id, ruta);
        
        return res.status(200).json({
            success: true,
            ...resultado
        });
        
    } catch (error) {
        console.error('Error verificando permisos de ruta:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            tiene_permiso: false
        });
    }
}