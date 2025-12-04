// src/pages/api/stock/productos/almacenes-stock.js
import { service_DBconn } from "@/services/db";
import { service_ObtenerAlmacenesConStockProducto } from "@/services/productos";

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
        
        // Obtener el parámetro producto_id de la query string
        const productoId = req.query.producto_id ? parseInt(req.query.producto_id) : null;
        
        const almacenesConStock = await service_ObtenerAlmacenesConStockProducto(connection, productoId);
        
        return res.status(200).json({
            success: true,
            data: almacenesConStock
        });
        
    } catch (error) {
        console.error('Error en API almacenes con stock producto:', error);
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