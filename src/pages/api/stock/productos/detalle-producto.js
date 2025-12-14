import { getConnection } from '../../../../lib/db';
import { service_ObtenerStockProductoAlmacen } from '../../../../services/productos';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const connection = await getConnection();

    try {
        const { producto_id, almacen_id } = req.query;
console.log('Cargando detalle para producto ID:', producto_id, 'en almacén ID:', almacen_id);
        // Validaciones básicas
        if (!producto_id || !almacen_id) {
            return res.status(400).json({
                error: 'Faltan parámetros requeridos',
                message: 'Se requieren los parámetros producto_id y almacen_id'
            });
        }

        // Validar que sean números válidos
        const productoIdNum = parseInt(producto_id);
        const almacenIdNum = parseInt(almacen_id);

        if (isNaN(productoIdNum) || isNaN(almacenIdNum)) {
            return res.status(400).json({
                error: 'Parámetros inválidos',
                message: 'Los parámetros producto_id y almacen_id deben ser números válidos'
            });
        }

        // Obtener stock del producto en el almacén específico
        const stockData = await service_ObtenerStockProductoAlmacen(connection, productoIdNum, almacenIdNum);

        res.status(200).json({
            success: true,
            data: stockData || [],
            message: `Stock obtenido para producto ${productoIdNum} en almacén ${almacenIdNum}`
        });

    } catch (error) {
        console.error('Error obteniendo stock producto-almacén:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    } finally {
        await connection.end();
    }
}