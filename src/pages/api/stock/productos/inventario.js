// src/pages/api/stock/productos/inventario.js
import { service_DBconn } from "@/services/db";
import { service_ObtenerProductosConStock } from "@/services/productos";

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
        
        // Obtener el parámetro almacen_id de la query string
        const almacenId = req.query.almacen_id ? parseInt(req.query.almacen_id) : null;
        
        const productos = await service_ObtenerProductosConStock(connection, almacenId);
        
        return res.status(200).json({
            success: true,
            data: productos
        });
        
    } catch (error) {
        console.error('Error en API inventario productos:', error);
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