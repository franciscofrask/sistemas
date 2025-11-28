// src/pages/api/admin/roles/[id]/permisos.js
import { requireAuth } from "@/middleware/authMiddleware";
import { service_ObtenerPermisosRol, service_AsignarPermisoFuncionalidad } from "@/services/permisos";

export default async function handler(req, res) {
    // Verificar autenticación y permisos de administrador
    const user = await requireAuth(req, res, 'admin');
    if (!user) return;

    const { id: rolId } = req.query;

    if (!rolId) {
        return res.status(400).json({
            success: false,
            message: 'ID de rol requerido'
        });
    }

    // Obtener permisos del rol
    if (req.method === 'GET') {
        try {
            const resultado = await service_ObtenerPermisosRol(rolId);
            
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
            console.error('Error al obtener permisos del rol:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Actualizar permisos del rol
    if (req.method === 'PUT') {
        try {
            const { funcionalidad_id, puede_acceder } = req.body;
            
            if (funcionalidad_id === undefined || puede_acceder === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'funcionalidad_id y puede_acceder son requeridos'
                });
            }

            const resultado = await service_AsignarPermisoFuncionalidad(
                rolId, 
                funcionalidad_id, 
                puede_acceder
            );
            
            if (resultado.success) {
                return res.status(200).json({
                    success: true,
                    message: resultado.message
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
            
        } catch (error) {
            console.error('Error al actualizar permiso:', error);
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