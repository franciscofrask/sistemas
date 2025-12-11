import { getConnection } from '../../../../lib/db';
import { service_ListarUnidadesMedida } from '../../../../services/productos';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const connection = await getConnection();

    try {
        const unidades = await service_ListarUnidadesMedida(connection);

        res.status(200).json({
            success: true,
            data: unidades || [],
            message: 'Unidades de medida obtenidas correctamente'
        });

    } catch (error) {
        console.error('Error obteniendo unidades de medida:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    } finally {
        await connection.end();
    }
}