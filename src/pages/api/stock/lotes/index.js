import { getConnection } from '../../../../lib/db';
import { service_ListarLotesProducto } from '../../../../services/productos';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { producto_id } = req.query;

    if (!producto_id) {
        return res.status(400).json({ error: 'producto_id es requerido' });
    }

    const connection = await getConnection();

    try {
        const lotes = await service_ListarLotesProducto(connection, producto_id);

        res.status(200).json({
            success: true,
            data: lotes || [],
            message: 'Lotes obtenidos correctamente'
        });

    } catch (error) {
        console.error('Error obteniendo lotes:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    } finally {
        await connection.end();
    }
}