import { getConnection } from '../../../../lib/db';
import { service_ListarCategoriasProducto } from '../../../../services/productos';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const connection = await getConnection();

    try {
        const categorias = await service_ListarCategoriasProducto(connection);

        res.status(200).json({
            success: true,
            data: categorias || [],
            message: 'Categorías obtenidas correctamente'
        });

    } catch (error) {
        console.error('Error obteniendo categorías:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    } finally {
        await connection.end();
    }
}