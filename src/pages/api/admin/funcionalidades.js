// src/pages/api/admin/funcionalidades.js
import { requireAuth } from "@/middleware/authMiddleware";
import { service_DBconn } from "@/services/db";

export default async function handler(req, res) {
    // Verificar autenticación y permisos de administrador
    const user = await requireAuth(req, res, 'admin');
    if (!user) return;

    // Obtener todas las funcionalidades
    if (req.method === 'GET') {
        try {
            const connection = await service_DBconn();
            
            const [funcionalidades] = await connection.execute(
                'CALL listar_funcionalidades()'
            );
            
            await connection.end();
            
            return res.status(200).json({
                success: true,
                data: funcionalidades
            });
            
        } catch (error) {
            console.error('Error al obtener funcionalidades:', error);
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