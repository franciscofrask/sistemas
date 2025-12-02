// src/pages/api/stock/almacenes/index.js
import { service_DBconn } from "@/services/db";
import { service_ListarAlmacenes } from "@/services/almacenes";

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
        
        // Obtener el parámetro solo_activos de la query string
        // Por defecto es 1 (solo activos) para el caso más común (combos/selects)
        const solo_activos = req.query.solo_activos ? parseInt(req.query.solo_activos) : 1;
        
        const almacenes = await service_ListarAlmacenes(connection, solo_activos);
        
        return res.status(200).json({
            success: true,
            data: almacenes
        });
        
    } catch (error) {
        console.error('Error en API almacenes:', error);
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