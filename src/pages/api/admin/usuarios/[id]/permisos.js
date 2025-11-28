// src/pages/api/admin/usuarios/[id]/permisos.js
import { requireAuth } from "@/middleware/authMiddleware";
import { service_ObtenerPermisosUsuario } from "@/services/permisos";

export default async function handler(req, res) {
    // Verificar autenticación y permisos de administrador
    const user = await requireAuth(req, res, 'admin');
    if (!user) return;

    const { id: userId } = req.query;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'ID de usuario requerido'
        });
    }

    // Obtener permisos del usuario
    if (req.method === 'GET') {
        try {
            const resultado = await service_ObtenerPermisosUsuario(userId);
            
            if (resultado.success) {
                return res.status(200).json({
                    success: true,
                    data: resultado.data
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
            
        } catch (error) {
            console.error('Error al obtener permisos:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    return res.status(405).json({ 
        success: false, 
        message: 'Método no permitido' 
    });
}