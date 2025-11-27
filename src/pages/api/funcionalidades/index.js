// src/pages/api/funcionalidades/index.js
import { service_DBconn } from "@/services/db";
import { service_ObtenerFuncionalidades, service_ObtenerFuncionalidadesPorRol } from "@/services/funcionalidades";
import { validateToken } from "@/middleware/authMiddleware";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            message: 'Método no permitido' 
        });
    }

    let connection;
    
    try {
        connection = await service_DBconn();
        
        // Obtener rol del usuario desde el token si está presente
        const { query } = req;
        const filtrarPorRol = query.filtrar_por_rol === 'true';
        
        let funcionalidades;
        
        if (filtrarPorRol) {
            // Validar token para obtener rol del usuario
            const tokenValidation = await validateToken(req);
            
            if (!tokenValidation.success) {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido para filtrar por rol'
                });
            }
            
            // Obtener rol_id desde la base de datos
            const [userRol] = await connection.execute(
                'SELECT rol_id FROM usuarios WHERE id = ?',
                [tokenValidation.user.id]
            );
            
            if (userRol.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }
            
            const rolId = userRol[0].rol_id;
            funcionalidades = await service_ObtenerFuncionalidadesPorRol(connection, rolId);
        } else {
            // Obtener todas las funcionalidades sin filtro
            funcionalidades = await service_ObtenerFuncionalidades(connection);
        }
        
        return res.status(200).json({
            success: true,
            data: funcionalidades
        });
        
    } catch (error) {
        console.error('Error en API funcionalidades:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}